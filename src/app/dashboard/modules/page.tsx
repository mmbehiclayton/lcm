'use client';

import { useState } from 'react';
import Link from 'next/link';
import { 
  BarChart3, 
  FileText, 
  TrendingUp, 
  DollarSign, 
  Building2,
  ArrowRight,
  CheckCircle,
  Clock,
  Target
} from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';

export default function ModulesPage() {
  const [selectedModule, setSelectedModule] = useState<string | null>(null);

  const modules = [
    {
      id: 'portfolio-analysis',
      name: 'LCM Portfolio Analysis',
      description: 'Comprehensive portfolio health assessment with risk scoring and performance metrics',
      icon: BarChart3,
      status: 'Active',
      features: ['Portfolio Health Score', 'Risk Assessment', 'Performance Grading', 'Strategic Recommendations'],
      href: '/dashboard/analysis',
      color: 'blue'
    },
    {
      id: 'lease-analysis',
      name: 'LCM Lease Analysis',
      description: 'Analyze lease terms, renewal risks, and tenant performance across your portfolio',
      icon: FileText,
      status: 'Active',
      features: ['Lease Risk Assessment', 'Renewal Analysis', 'Tenant Performance', 'Break Clause Analysis'],
      href: '/dashboard/modules/lease-analysis',
      color: 'green'
    },
    {
      id: 'predictive-modelling',
      name: 'LCM Predictive Modelling',
      description: 'AI-powered forecasting for property values, rental growth, and market trends',
      icon: TrendingUp,
      status: 'Active',
      features: ['Value Forecasting', 'Rental Growth Prediction', 'Market Trend Analysis', 'Risk Modeling'],
      href: '/dashboard/modules/predictive-modelling',
      color: 'purple'
    },
    {
      id: 'transactions',
      name: 'LCM Transactions',
      description: 'Track and analyze all property transactions, acquisitions, and dispositions',
      icon: DollarSign,
      status: 'Active',
      features: ['Transaction Tracking', 'Volume Analysis', 'Fee Management', 'Performance Metrics'],
      href: '/dashboard/modules/transactions',
      color: 'orange'
    },
    {
      id: 'occupancy',
      name: 'LCM Occupancy',
      description: 'Monitor occupancy rates, tenant retention, and revenue optimization',
      icon: Building2,
      status: 'Active',
      features: ['Occupancy Monitoring', 'Tenant Retention', 'Revenue Optimization', 'Risk Assessment'],
      href: '/dashboard/modules/occupancy',
      color: 'indigo'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active':
        return 'text-green-600 bg-green-100';
      case 'In Development':
        return 'text-yellow-600 bg-yellow-100';
      case 'Coming Soon':
        return 'text-blue-600 bg-blue-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getModuleColor = (color: string) => {
    switch (color) {
      case 'blue':
        return 'text-blue-600 bg-blue-100';
      case 'green':
        return 'text-green-600 bg-green-100';
      case 'purple':
        return 'text-purple-600 bg-purple-100';
      case 'orange':
        return 'text-orange-600 bg-orange-100';
      case 'indigo':
        return 'text-indigo-600 bg-indigo-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <DashboardLayout>
      <div>
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">LCM Analytics Modules</h1>
          <p className="mt-2 text-gray-600">Comprehensive real estate intelligence platform with five core analytical modules</p>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Target className="h-8 w-8 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Modules</p>
                <p className="text-2xl font-semibold text-gray-900">{modules.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Active Modules</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {modules.filter(m => m.status === 'Active').length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Clock className="h-8 w-8 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">In Development</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {modules.filter(m => m.status === 'In Development').length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <BarChart3 className="h-8 w-8 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Features</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {modules.reduce((sum, m) => sum + m.features.length, 0)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Modules Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {modules.map((module) => {
            const Icon = module.icon;
            return (
              <div
                key={module.id}
                className={`bg-white rounded-lg shadow-lg border-2 transition-all duration-200 hover:shadow-xl ${
                  selectedModule === module.id ? 'border-blue-500' : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => setSelectedModule(selectedModule === module.id ? null : module.id)}
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center">
                      <div className={`p-3 rounded-lg ${getModuleColor(module.color)}`}>
                        <Icon className="h-6 w-6" />
                      </div>
                      <div className="ml-4">
                        <h3 className="text-lg font-semibold text-gray-900">{module.name}</h3>
                        <p className="text-sm text-gray-600">{module.description}</p>
                      </div>
                    </div>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(module.status)}`}>
                      {module.status}
                    </span>
                  </div>

                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-gray-900 mb-2">Key Features:</h4>
                    <div className="grid grid-cols-2 gap-2">
                      {module.features.map((feature, index) => (
                        <div key={index} className="flex items-center text-sm text-gray-600">
                          <CheckCircle className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                          {feature}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <Link
                      href={module.href}
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors"
                    >
                      Access Module
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                    <div className="text-sm text-gray-500">
                      {module.features.length} features
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Module Integration Info */}
        <div className="mt-12 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Integrated Analytics Platform</h2>
            <p className="text-lg text-gray-600 mb-6 max-w-3xl mx-auto">
              All five LCM modules work together to provide comprehensive real estate intelligence. 
              Data flows seamlessly between modules, enabling cross-functional analysis and insights.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
              <div className="text-center">
                <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Target className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Unified Data</h3>
                <p className="text-sm text-gray-600">All modules share the same property and transaction data for consistent analysis</p>
              </div>
              <div className="text-center">
                <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <BarChart3 className="h-6 w-6 text-green-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Cross-Module Insights</h3>
                <p className="text-sm text-gray-600">Analytics from one module inform decisions in others for comprehensive intelligence</p>
              </div>
              <div className="text-center">
                <div className="h-12 w-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <TrendingUp className="h-6 w-6 text-purple-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Scalable Architecture</h3>
                <p className="text-sm text-gray-600">Modular design allows for easy expansion and integration of new analytical capabilities</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
