'use client';

import { useState, useEffect, Suspense, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { PortfolioHealthChart } from '@/components/charts/PortfolioHealthChart';
import { RiskDistributionChart } from '@/components/charts/RiskDistributionChart';
import { PropertyTable } from '@/components/tables/PropertyTable';
import { BarChart3, TrendingUp, AlertTriangle, CheckCircle, Download } from 'lucide-react';
import { getRiskColor, getPerformanceColor } from '@/lib/utils';
import { Property } from '@/types';

interface AnalysisResult {
  portfolioHealth: number;
  riskLevel: string;
  performanceGrade: string;
  recommendations: string[];
  metrics: Array<{
    property_id: string;
    leaseScore: number;
    occupancyScore: number;
    noiScore: number;
    energyScore: number;
    capexScore: number;
  }>;
  riskFactors: {
    concentrationRisk: number;
    leaseRisk: number;
    marketRisk: number;
    operationalRisk: number;
    financialRisk: number;
  };
  summary: {
    totalProperties: number;
    averageHealthScore: number;
    highRiskProperties: number;
    lowRiskProperties: number;
  };
}

function AnalysisContent() {
  const searchParams = useSearchParams();
  const uploadId = searchParams.get('uploadId');
  const analysisId = searchParams.get('analysisId');
  
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [properties, setProperties] = useState<Property[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedStrategy, setSelectedStrategy] = useState<'growth' | 'hold' | 'divest'>('hold');

  const fetchAnalysis = useCallback(async () => {
    try {
      setIsLoading(true);
      
      // First, perform analysis
      const analysisResponse = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          uploadId,
          strategy: selectedStrategy,
        }),
      });

      if (!analysisResponse.ok) {
        throw new Error('Analysis failed');
      }

      const analysisData = await analysisResponse.json();
      setAnalysis(analysisData.results);

      // Fetch properties
      const propertiesResponse = await fetch(`/api/upload?uploadId=${uploadId}`);
      if (propertiesResponse.ok) {
        const uploadData = await propertiesResponse.json();
        setProperties(uploadData.uploads[0]?.properties || []);
      }

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load analysis');
    } finally {
      setIsLoading(false);
    }
  }, [uploadId, selectedStrategy]);

  useEffect(() => {
    if (uploadId) {
      fetchAnalysis();
    } else {
      // If no uploadId, show empty state
      setIsLoading(false);
    }
  }, [uploadId, fetchAnalysis]);

  const handleStrategyChange = (strategy: 'growth' | 'hold' | 'divest') => {
    setSelectedStrategy(strategy);
    // Re-run analysis with new strategy
    fetchAnalysis();
  };

  const handleExport = (format: 'pdf' | 'excel' | 'csv') => {
    // Implement export functionality
    console.log(`Exporting as ${format}`);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Analyzing your portfolio...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-red-600 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Analysis Failed</h2>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  if (!uploadId && !analysisId) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-6">
              <div className="flex items-center">
                <BarChart3 className="h-8 w-8 text-blue-600" />
                <span className="ml-2 text-2xl font-bold text-gray-900">LCM Analytics</span>
              </div>
              <nav className="hidden md:flex space-x-8">
                <Link href="/dashboard/upload" className="text-gray-600 hover:text-gray-900">
                  Upload
                </Link>
                <Link href="/dashboard" className="text-gray-600 hover:text-gray-900">
                  Dashboard
                </Link>
              </nav>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <BarChart3 className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-gray-900 mb-4">No Analysis Data</h1>
            <p className="text-lg text-gray-600 mb-8">
              Upload your real estate data to start analyzing your portfolio.
            </p>
            <div className="space-x-4">
              <Link
                href="/dashboard/upload"
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
              >
                Upload Data
              </Link>
              <Link
                href="/dashboard"
                className="inline-flex items-center px-6 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                View Dashboard
              </Link>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (!analysis) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">No analysis data available</p>
        </div>
      </div>
    );
  }

  // Prepare chart data
  const chartData = analysis.metrics.map(metric => ({
    property: properties.find(p => p.property_id === metric.property_id)?.name || metric.property_id,
    healthScore: Math.round(
      metric.leaseScore * 0.25 +
      metric.occupancyScore * 0.25 +
      metric.noiScore * 0.2 +
      metric.energyScore * 0.15 +
      metric.capexScore * 0.15
    ),
    riskLevel: 'Medium' // Simplified
  }));

  const riskDistributionData = [
    { name: 'Low Risk', value: analysis.summary.lowRiskProperties, color: '#10B981' },
    { name: 'Medium Risk', value: analysis.summary.totalProperties - analysis.summary.lowRiskProperties - analysis.summary.highRiskProperties, color: '#F59E0B' },
    { name: 'High Risk', value: analysis.summary.highRiskProperties, color: '#EF4444' }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <BarChart3 className="h-8 w-8 text-blue-600" />
              <span className="ml-2 text-2xl font-bold text-gray-900">Portfolio Analysis</span>
            </div>
            <div className="flex items-center space-x-4">
              <select
                value={selectedStrategy}
                onChange={(e) => handleStrategyChange(e.target.value as 'growth' | 'hold' | 'divest')}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm"
              >
                <option value="growth">Growth Strategy</option>
                <option value="hold">Hold Strategy</option>
                <option value="divest">Divest Strategy</option>
              </select>
              <button
                onClick={() => handleExport('pdf')}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                <Download className="h-4 w-4 mr-2" />
                Export
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <BarChart3 className="h-8 w-8 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Portfolio Health</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {analysis.portfolioHealth.toFixed(1)}%
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <TrendingUp className="h-8 w-8 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Performance Grade</p>
                <p className={`text-2xl font-semibold ${getPerformanceColor(analysis.performanceGrade)}`}>
                  {analysis.performanceGrade}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <AlertTriangle className="h-8 w-8 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Risk Level</p>
                <p className={`text-2xl font-semibold ${getRiskColor(analysis.riskLevel)}`}>
                  {analysis.riskLevel}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <CheckCircle className="h-8 w-8 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Properties</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {analysis.summary.totalProperties}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <PortfolioHealthChart data={chartData} />
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <RiskDistributionChart data={riskDistributionData} />
          </div>
        </div>

        {/* Recommendations */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recommendations</h3>
          <div className="space-y-3">
            {analysis.recommendations.map((recommendation, index) => (
              <div key={index} className="flex items-start">
                <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 mr-3 flex-shrink-0" />
                <p className="text-gray-700">{recommendation}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Properties Table */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Property Details</h3>
          </div>
          <PropertyTable properties={properties} />
        </div>
      </main>
    </div>
  );
}

export default function AnalysisPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AnalysisContent />
    </Suspense>
  );
}
