'use client';

import { useState, useEffect, Suspense, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { PortfolioHealthChart } from '@/components/charts/PortfolioHealthChart';
import { RiskDistributionChart } from '@/components/charts/RiskDistributionChart';
import { PropertyTable } from '@/components/tables/PropertyTable';
import { BarChart3, AlertTriangle, CheckCircle, Download } from 'lucide-react';
import { getRiskColor, getPerformanceColor } from '@/lib/utils';
import { DashboardLayout } from '@/components/layout/DashboardLayout';

function AnalysisContent() {
  const searchParams = useSearchParams();
  const uploadId = searchParams.get('uploadId');
  const analysisId = searchParams.get('analysisId');

  const [analysis, setAnalysis] = useState<any>(null);
  const [properties, setProperties] = useState<any[]>([]);
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
      <DashboardLayout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Analyzing your portfolio...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <AlertTriangle className="h-12 w-12 text-red-600 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Analysis Failed</h2>
            <p className="text-gray-600">{error}</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!uploadId && !analysisId) {
    return (
      <DashboardLayout>
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
      </DashboardLayout>
    );
  }

  if (!analysis) {
    return (
      <DashboardLayout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading analysis...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div>
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Portfolio Analysis</h1>
              <p className="mt-2 text-gray-600">Comprehensive analysis of your real estate portfolio</p>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => handleExport('pdf')}
                className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                <Download className="h-4 w-4 mr-2" />
                Export PDF
              </button>
              <button
                onClick={() => handleExport('excel')}
                className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                <Download className="h-4 w-4 mr-2" />
                Export Excel
              </button>
            </div>
          </div>
        </div>

        {/* Strategy Selector */}
        <div className="mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Investment Strategy</h3>
            <div className="flex space-x-4">
              {[
                { value: 'growth', label: 'Growth', description: 'Focus on capital appreciation' },
                { value: 'hold', label: 'Hold', description: 'Maintain current portfolio' },
                { value: 'divest', label: 'Divest', description: 'Optimize for liquidity' }
              ].map((strategy) => (
                <button
                  key={strategy.value}
                  onClick={() => handleStrategyChange(strategy.value as any)}
                  className={`px-4 py-2 rounded-md text-sm font-medium ${
                    selectedStrategy === strategy.value
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {strategy.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Portfolio Health Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <BarChart3 className="h-8 w-8 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Portfolio Health</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {analysis.portfolioHealth?.toFixed(1) || 'N/A'}%
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <AlertTriangle className={`h-8 w-8 ${getRiskColor(analysis.riskLevel)}`} />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Risk Level</p>
                <p className="text-2xl font-semibold text-gray-900">{analysis.riskLevel || 'N/A'}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <CheckCircle className={`h-8 w-8 ${getPerformanceColor(analysis.performanceGrade)}`} />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Performance Grade</p>
                <p className="text-2xl font-semibold text-gray-900">{analysis.performanceGrade || 'N/A'}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Portfolio Health Distribution</h3>
            <PortfolioHealthChart data={analysis.metrics || []} />
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Risk Distribution</h3>
            <RiskDistributionChart data={analysis.metrics || []} />
          </div>
        </div>

        {/* Recommendations */}
        {analysis.recommendations && analysis.recommendations.length > 0 && (
          <div className="bg-white rounded-lg shadow p-6 mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Recommendations</h3>
            <ul className="space-y-3">
              {analysis.recommendations.map((recommendation: string, index: number) => (
                <li key={index} className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">{recommendation}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Properties Table */}
        {properties.length > 0 && (
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Property Details</h3>
            </div>
            <PropertyTable properties={properties} />
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

export default function DashboardAnalysisPage() {
  return (
    <Suspense fallback={
      <DashboardLayout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading...</p>
          </div>
        </div>
      </DashboardLayout>
    }>
      <AnalysisContent />
    </Suspense>
  );
}
