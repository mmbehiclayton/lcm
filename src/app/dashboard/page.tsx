'use client';

import { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, AlertTriangle, CheckCircle, Upload, FileText, DollarSign, Building2 } from 'lucide-react';
import Link from 'next/link';
import { DashboardLayout } from '@/components/layout/DashboardLayout';

interface DashboardStats {
  totalProperties: number;
  totalValue: number;
  averageOccupancy: number;
  highRiskProperties: number;
  recentUploads: number;
  lastAnalysis: string | null;
  portfolioHealth?: number;
  riskLevel?: string;
  performanceGrade?: string;
  recommendations?: string[];
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    totalProperties: 0,
    totalValue: 0,
    averageOccupancy: 0,
    highRiskProperties: 0,
    recentUploads: 0,
    lastAnalysis: null,
    portfolioHealth: 0,
    riskLevel: 'Unknown',
    performanceGrade: 'N/A',
    recommendations: []
  });
  const [isLoading, setIsLoading] = useState(true);
  const [analysisData, setAnalysisData] = useState<any>(null);

  useEffect(() => {
    // Load real dashboard data from API
    const loadDashboardData = async () => {
      try {
        setIsLoading(true);
        
        // Fetch basic stats
        const statsResponse = await fetch('/api/dashboard/stats');
        let basicStats = {
          totalProperties: 0,
          totalValue: 0,
          averageOccupancy: 0,
          highRiskProperties: 0,
          recentUploads: 0,
          lastAnalysis: null
        };
        
        if (statsResponse.ok) {
          basicStats = await statsResponse.json();
        }

        // Fetch enhanced analytics if properties exist
        if (basicStats.totalProperties > 0) {
          try {
            const analysisResponse = await fetch('/api/analyze', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ 
                userId: 'current-user', // This would be the actual user ID
                strategy: 'hold' 
              })
            });
            
            if (analysisResponse.ok) {
              const analysisResult = await analysisResponse.json();
              setAnalysisData(analysisResult.data);
              
              // Update stats with enhanced analytics
              setStats({
                ...basicStats,
                portfolioHealth: analysisResult.data?.portfolio_health,
                riskLevel: analysisResult.data?.risk_level,
                performanceGrade: analysisResult.data?.performance_grade,
                recommendations: analysisResult.data?.recommendations || []
              });
            } else {
              setStats(basicStats);
            }
          } catch (analysisError) {
            console.error('Error loading enhanced analytics:', analysisError);
            setStats(basicStats);
          }
        } else {
          setStats(basicStats);
        }
      } catch (error) {
        console.error('Error loading dashboard data:', error);
        // Fallback to empty state
        setStats({
          totalProperties: 0,
          totalValue: 0,
          averageOccupancy: 0,
          highRiskProperties: 0,
          recentUploads: 0,
          lastAnalysis: null
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatPercentage = (value: number) => {
    return `${(value * 100).toFixed(1)}%`;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <DashboardLayout>
      <div>
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="mt-2 text-gray-600">Overview of your real estate portfolio</p>
        </div>

        {/* Enhanced Analytics Section */}
        {stats.portfolioHealth && (
          <div className="mb-8 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 border border-blue-200">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Portfolio Health Analysis</h2>
              <div className="flex items-center space-x-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{stats.portfolioHealth?.toFixed(1)}</div>
                  <div className="text-sm text-gray-600">Health Score</div>
                </div>
                <div className="text-center">
                  <div className={`text-lg font-semibold ${
                    stats.riskLevel === 'Low' ? 'text-green-600' : 
                    stats.riskLevel === 'Medium' ? 'text-yellow-600' : 'text-red-600'
                  }`}>
                    {stats.riskLevel}
                  </div>
                  <div className="text-sm text-gray-600">Risk Level</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-semibold text-purple-600">{stats.performanceGrade}</div>
                  <div className="text-sm text-gray-600">Performance</div>
                </div>
              </div>
            </div>
            
            {stats.recommendations && stats.recommendations.length > 0 && (
              <div className="mt-4">
                <h3 className="text-sm font-medium text-gray-900 mb-2">Key Recommendations:</h3>
                <ul className="space-y-1">
                  {stats.recommendations.slice(0, 3).map((rec, index) => (
                    <li key={index} className="text-sm text-gray-700 flex items-start">
                      <span className="text-blue-500 mr-2">•</span>
                      {rec}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Properties */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <BarChart3 className="h-8 w-8 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Properties</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.totalProperties}</p>
              </div>
            </div>
          </div>

          {/* Total Value */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <TrendingUp className="h-8 w-8 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Value</p>
                <p className="text-2xl font-semibold text-gray-900">{formatCurrency(stats.totalValue)}</p>
              </div>
            </div>
          </div>

          {/* Average Occupancy */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <CheckCircle className="h-8 w-8 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Avg Occupancy</p>
                <p className="text-2xl font-semibold text-gray-900">{formatPercentage(stats.averageOccupancy)}</p>
              </div>
            </div>
          </div>

          {/* High Risk Properties */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <AlertTriangle className="h-8 w-8 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">High Risk</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.highRiskProperties}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Upload Section */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center mb-4">
              <Upload className="h-6 w-6 text-blue-600 mr-2" />
              <h3 className="text-lg font-semibold text-gray-900">Upload Data</h3>
            </div>
            <p className="text-gray-600 mb-4">
              Upload your real estate data to start analyzing your portfolio.
            </p>
            <Link
              href="/dashboard/upload"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              Upload Data
            </Link>
          </div>

          {/* Analysis Section */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center mb-4">
              <FileText className="h-6 w-6 text-green-600 mr-2" />
              <h3 className="text-lg font-semibold text-gray-900">View Analysis</h3>
            </div>
            <p className="text-gray-600 mb-4">
              Review detailed analysis and insights from your portfolio data.
            </p>
            <Link
              href="/dashboard/portfolio"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
            >
              View Portfolio & Analysis
            </Link>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="mt-8 bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
          </div>
          <div className="px-6 py-4">
            <div className="space-y-4">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="h-2 w-2 bg-green-400 rounded-full"></div>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-gray-900">Data uploaded successfully</p>
                  <p className="text-xs text-gray-500">2 minutes ago</p>
                </div>
              </div>
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="h-2 w-2 bg-blue-400 rounded-full"></div>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-gray-900">Portfolio analysis completed</p>
                  <p className="text-xs text-gray-500">5 minutes ago</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
