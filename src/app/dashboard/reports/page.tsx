'use client';

import { useState } from 'react';
import { FileText, Download, Calendar, TrendingUp, BarChart3, PieChart } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';

export default function DashboardReportsPage() {
  const [selectedReport, setSelectedReport] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState('last-30-days');

  const reports = [
    {
      id: 'portfolio-summary',
      name: 'Portfolio Summary Report',
      description: 'Comprehensive overview of your entire real estate portfolio',
      type: 'Summary',
      lastGenerated: '2024-01-15',
      icon: BarChart3
    },
    {
      id: 'financial-analysis',
      name: 'Financial Analysis Report',
      description: 'Detailed financial performance and ROI analysis',
      type: 'Financial',
      lastGenerated: '2024-01-14',
      icon: TrendingUp
    },
    {
      id: 'occupancy-report',
      name: 'Occupancy Analysis Report',
      description: 'Occupancy rates and tenant analysis across properties',
      type: 'Operational',
      lastGenerated: '2024-01-13',
      icon: PieChart
    },
    {
      id: 'market-comparison',
      name: 'Market Comparison Report',
      description: 'Benchmark your portfolio against market standards',
      type: 'Market',
      lastGenerated: '2024-01-12',
      icon: BarChart3
    },
    {
      id: 'risk-assessment',
      name: 'Risk Assessment Report',
      description: 'Portfolio risk analysis and mitigation strategies',
      type: 'Risk',
      lastGenerated: '2024-01-11',
      icon: FileText
    },
    {
      id: 'performance-trends',
      name: 'Performance Trends Report',
      description: 'Historical performance trends and forecasting',
      type: 'Analytics',
      lastGenerated: '2024-01-10',
      icon: TrendingUp
    }
  ];

  const handleGenerateReport = (reportId: string) => {
    setSelectedReport(reportId);
    // Simulate report generation
    setTimeout(() => {
      setSelectedReport(null);
    }, 3000);
  };

  const handleDownloadReport = (reportId: string) => {
    // Simulate download
    console.log(`Downloading report: ${reportId}`);
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'Summary':
        return 'bg-blue-100 text-blue-800';
      case 'Financial':
        return 'bg-green-100 text-green-800';
      case 'Operational':
        return 'bg-purple-100 text-purple-800';
      case 'Market':
        return 'bg-orange-100 text-orange-800';
      case 'Risk':
        return 'bg-red-100 text-red-800';
      case 'Analytics':
        return 'bg-indigo-100 text-indigo-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <DashboardLayout>
      <div>
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Reports</h1>
              <p className="mt-2 text-gray-600">Generate and download comprehensive portfolio reports</p>
            </div>
            <div className="flex items-center space-x-4">
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="last-7-days">Last 7 days</option>
                <option value="last-30-days">Last 30 days</option>
                <option value="last-90-days">Last 90 days</option>
                <option value="last-year">Last year</option>
              </select>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <FileText className="h-8 w-8 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Reports</p>
                <p className="text-2xl font-semibold text-gray-900">{reports.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Download className="h-8 w-8 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Downloads This Month</p>
                <p className="text-2xl font-semibold text-gray-900">24</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Calendar className="h-8 w-8 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Last Generated</p>
                <p className="text-2xl font-semibold text-gray-900">Jan 15</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <TrendingUp className="h-8 w-8 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Avg. Generation Time</p>
                <p className="text-2xl font-semibold text-gray-900">2.3s</p>
              </div>
            </div>
          </div>
        </div>

        {/* Reports Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reports.map((report) => {
            const Icon = report.icon;
            return (
              <div key={report.id} className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow">
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center">
                      <Icon className="h-8 w-8 text-blue-600 mr-3" />
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{report.name}</h3>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTypeColor(report.type)}`}>
                          {report.type}
                        </span>
                      </div>
                    </div>
                  </div>

                  <p className="text-gray-600 text-sm mb-4">{report.description}</p>

                  <div className="space-y-2 mb-6">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Last Generated:</span>
                      <span className="text-gray-900">{new Date(report.lastGenerated).toLocaleDateString()}</span>
                    </div>
                  </div>

                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleGenerateReport(report.id)}
                      disabled={selectedReport === report.id}
                      className="flex-1 inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {selectedReport === report.id ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Generating...
                        </>
                      ) : (
                        <>
                          <BarChart3 className="h-4 w-4 mr-2" />
                          Generate
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => handleDownloadReport(report.id)}
                      className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                    >
                      <Download className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
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
                  <p className="text-sm text-gray-900">Portfolio Summary Report generated</p>
                  <p className="text-xs text-gray-500">2 hours ago</p>
                </div>
              </div>
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="h-2 w-2 bg-blue-400 rounded-full"></div>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-gray-900">Financial Analysis Report downloaded</p>
                  <p className="text-xs text-gray-500">1 day ago</p>
                </div>
              </div>
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="h-2 w-2 bg-purple-400 rounded-full"></div>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-gray-900">Occupancy Analysis Report generated</p>
                  <p className="text-xs text-gray-500">3 days ago</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
