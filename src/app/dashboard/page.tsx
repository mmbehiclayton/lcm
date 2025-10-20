'use client';

import { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, AlertTriangle, Building2, DollarSign, Activity, FileText, PieChart, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { DashboardLayout } from '@/components/layout/DashboardLayout';

interface DashboardStats {
  totalProperties: number;
  totalValue: number;
  averageOccupancy: number;
  highRiskProperties: number;
  portfolioHealth?: number;
  riskLevel?: string;
}

interface ModuleSnapshot {
  name: string;
  icon: any;
  color: string;
  href: string;
  stats: {
    primary: { label: string; value: string | number };
    secondary: { label: string; value: string | number };
    tertiary: { label: string; value: string | number };
  };
  status: 'active' | 'empty';
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    totalProperties: 0,
    totalValue: 0,
    averageOccupancy: 0,
    highRiskProperties: 0,
    portfolioHealth: 0,
    riskLevel: 'Unknown'
  });
  const [moduleSnapshots, setModuleSnapshots] = useState<ModuleSnapshot[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    console.log('Dashboard loading...');
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setIsLoading(true);
      
      // Fetch basic stats
      const statsResponse = await fetch('/api/dashboard/stats');
      let basicStats = {
        totalProperties: 0,
        totalValue: 0,
        averageOccupancy: 0,
        highRiskProperties: 0
      };
      
      if (statsResponse.ok) {
        basicStats = await statsResponse.json();
      }

      // Fetch enhanced analytics if properties exist
      if (basicStats.totalProperties > 0) {
        try {
          const portfolioResponse = await fetch('/api/analyze', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ strategy: 'hold' })
          });
          
          if (portfolioResponse.ok) {
            const portfolioResult = await portfolioResponse.json();
            setStats({
              ...basicStats,
              portfolioHealth: portfolioResult.data?.portfolio_health,
              riskLevel: portfolioResult.data?.risk_level
            });
          } else {
            setStats(basicStats);
          }
        } catch (error) {
          setStats(basicStats);
        }
      } else {
        setStats(basicStats);
      }

      // Load module snapshots
      await loadModuleSnapshots();
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadModuleSnapshots = async () => {
    try {
      // Load all module data in parallel with proper error handling
      const [portfolioRes, transactionsRes, occupancyRes, leaseRes, predictiveRes] = await Promise.allSettled([
        fetch('/api/properties/data'),
        fetch('/api/transactions/data'),
        fetch('/api/occupancy/data'),
        fetch('/api/lease-analysis/analyze'),
        fetch('/api/predictive/data')
      ]);

      // Portfolio snapshot
      let portfolioData: any[] = [];
      if (portfolioRes.status === 'fulfilled' && portfolioRes.value.ok) {
        portfolioData = await portfolioRes.value.json();
      }
      const avgValue = portfolioData.length > 0 
        ? portfolioData.reduce((sum: number, p: any) => sum + (p.currentValue || 0), 0) / portfolioData.length 
        : 0;
      const highPerforming = portfolioData.filter((p: any) => (p.noi || 0) > 100000).length;

      // Transactions snapshot
      let transactionsData: any[] = [];
      if (transactionsRes.status === 'fulfilled' && transactionsRes.value.ok) {
        transactionsData = await transactionsRes.value.json();
      }
      const totalVolume = transactionsData.reduce((sum: number, t: any) => sum + (t.amount || 0), 0);
      const completedCount = transactionsData.filter((t: any) => t.status?.toLowerCase() === 'completed').length;

      // Occupancy snapshot
      let occupancyData: any[] = [];
      if (occupancyRes.status === 'fulfilled' && occupancyRes.value.ok) {
        occupancyData = await occupancyRes.value.json();
      }
      const avgOccupancy = occupancyData.length > 0
        ? occupancyData.reduce((sum: number, o: any) => sum + (o.occupancyRate || 0), 0) / occupancyData.length
        : 0;
      const totalUnits = occupancyData.reduce((sum: number, o: any) => sum + (o.totalUnits || 0), 0);

      // Lease snapshot
      let leaseData: any = { leases: [] };
      if (leaseRes.status === 'fulfilled' && leaseRes.value.ok) {
        leaseData = await leaseRes.value.json();
      }
      const totalLeases = leaseData.leases?.length || 0;
      const expiringCount = leaseData.analysis?.summary?.expiring_leases || 0;

      // Predictive snapshot
      let predictiveData: any = { predictions: [] };
      if (predictiveRes.status === 'fulfilled' && predictiveRes.value.ok) {
        predictiveData = await predictiveRes.value.json();
      }
      const predictions = predictiveData.predictions || [];
      const highRiskCount = predictions.filter((p: any) => p.asset_classification === 'High Risk').length;
      const avgScore = predictions.length > 0
        ? predictions.reduce((sum: number, p: any) => sum + (p.total_score || 0), 0) / predictions.length
        : 0;

      const snapshots: ModuleSnapshot[] = [
        {
          name: 'Portfolio Analysis',
          icon: Building2,
          color: 'from-blue-600 to-indigo-600',
          href: '/dashboard/portfolio',
          stats: {
            primary: { label: 'Properties', value: portfolioData.length },
            secondary: { label: 'Avg Value', value: formatCurrency(avgValue) },
            tertiary: { label: 'High Performing', value: highPerforming }
          },
          status: portfolioData.length > 0 ? 'active' : 'empty'
        },
        {
          name: 'Transactions',
          icon: DollarSign,
          color: 'from-green-600 to-emerald-600',
          href: '/dashboard/modules/transactions',
          stats: {
            primary: { label: 'Total Transactions', value: transactionsData.length },
            secondary: { label: 'Total Volume', value: formatCurrency(totalVolume) },
            tertiary: { label: 'Completed', value: completedCount }
          },
          status: transactionsData.length > 0 ? 'active' : 'empty'
        },
        {
          name: 'Occupancy',
          icon: Activity,
          color: 'from-orange-600 to-amber-600',
          href: '/dashboard/modules/occupancy',
          stats: {
            primary: { label: 'Properties Monitored', value: occupancyData.length },
            secondary: { label: 'Avg Occupancy', value: `${avgOccupancy.toFixed(1)}%` },
            tertiary: { label: 'Total Units', value: totalUnits }
          },
          status: occupancyData.length > 0 ? 'active' : 'empty'
        },
        {
          name: 'Lease Analysis',
          icon: FileText,
          color: 'from-teal-600 to-cyan-600',
          href: '/dashboard/modules/lease-analysis',
          stats: {
            primary: { label: 'Active Leases', value: totalLeases },
            secondary: { label: 'Expiring Soon', value: expiringCount },
            tertiary: { label: 'Avg Rent', value: formatCurrency(leaseData.analysis?.summary?.avg_monthly_rent || 0) }
          },
          status: totalLeases > 0 ? 'active' : 'empty'
        },
        {
          name: 'Predictive Modelling',
          icon: PieChart,
          color: 'from-purple-600 to-pink-600',
          href: '/dashboard/modules/predictive-modelling',
          stats: {
            primary: { label: 'Predictions', value: predictions.length },
            secondary: { label: 'Avg Score', value: `${avgScore.toFixed(1)}/100` },
            tertiary: { label: 'High Risk', value: highRiskCount }
          },
          status: predictions.length > 0 ? 'active' : 'empty'
        }
      ];

      console.log('Module snapshots loaded:', snapshots.length);
      setModuleSnapshots(snapshots);
    } catch (error) {
      console.error('Error loading module snapshots:', error);
      // Still set snapshots with empty data to show all modules
      setModuleSnapshots([
        {
          name: 'Portfolio Analysis',
          icon: Building2,
          color: 'from-blue-600 to-indigo-600',
          href: '/dashboard/portfolio',
          stats: {
            primary: { label: 'Properties', value: 0 },
            secondary: { label: 'Avg Value', value: '£0' },
            tertiary: { label: 'High Performing', value: 0 }
          },
          status: 'empty'
        },
        {
          name: 'Transactions',
          icon: DollarSign,
          color: 'from-green-600 to-emerald-600',
          href: '/dashboard/modules/transactions',
          stats: {
            primary: { label: 'Total Transactions', value: 0 },
            secondary: { label: 'Total Volume', value: '£0' },
            tertiary: { label: 'Completed', value: 0 }
          },
          status: 'empty'
        },
        {
          name: 'Occupancy',
          icon: Activity,
          color: 'from-orange-600 to-amber-600',
          href: '/dashboard/modules/occupancy',
          stats: {
            primary: { label: 'Properties Monitored', value: 0 },
            secondary: { label: 'Avg Occupancy', value: '0%' },
            tertiary: { label: 'Total Units', value: 0 }
          },
          status: 'empty'
        },
        {
          name: 'Lease Analysis',
          icon: FileText,
          color: 'from-teal-600 to-cyan-600',
          href: '/dashboard/modules/lease-analysis',
          stats: {
            primary: { label: 'Active Leases', value: 0 },
            secondary: { label: 'Expiring Soon', value: 0 },
            tertiary: { label: 'Avg Rent', value: '£0' }
          },
          status: 'empty'
        },
        {
          name: 'Predictive Modelling',
          icon: PieChart,
          color: 'from-purple-600 to-pink-600',
          href: '/dashboard/modules/predictive-modelling',
          stats: {
            primary: { label: 'Predictions', value: 0 },
            secondary: { label: 'Avg Score', value: '0/100' },
            tertiary: { label: 'High Risk', value: 0 }
          },
          status: 'empty'
        }
      ]);
    }
  };

  const formatCurrency = (amount: number) => {
    if (amount >= 1000000) {
      return `$${(amount / 1000000).toFixed(1)}M`;
    } else if (amount >= 1000) {
      return `$${(amount / 1000).toFixed(0)}K`;
    }
    return `$${amount.toFixed(0)}`;
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
      <div className="space-y-8">
        {/* Page Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">LCM Analytics Dashboard</h1>
          <p className="mt-2 text-gray-600">Overview of your real estate portfolio and analytics modules</p>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Total Properties */}
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl shadow-md hover:shadow-lg transition-shadow p-6 border border-blue-200">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm font-semibold text-blue-600 uppercase tracking-wide mb-1">Properties</p>
                <p className="text-3xl font-bold text-blue-900">{stats.totalProperties}</p>
              </div>
              <div className="bg-blue-200 p-3 rounded-lg">
                <Building2 className="h-8 w-8 text-blue-700" />
              </div>
            </div>
          </div>

          {/* Total Value */}
          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl shadow-md hover:shadow-lg transition-shadow p-6 border border-green-200">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm font-semibold text-green-600 uppercase tracking-wide mb-1">Total Value</p>
                <p className="text-3xl font-bold text-green-900">{formatCurrency(stats.totalValue)}</p>
              </div>
              <div className="bg-green-200 p-3 rounded-lg">
                <TrendingUp className="h-8 w-8 text-green-700" />
              </div>
            </div>
          </div>

          {/* Portfolio Health */}
          <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl shadow-md hover:shadow-lg transition-shadow p-6 border border-purple-200">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm font-semibold text-purple-600 uppercase tracking-wide mb-1">Health Score</p>
                <p className="text-3xl font-bold text-purple-900">
                  {stats.portfolioHealth ? `${stats.portfolioHealth.toFixed(1)}` : 'N/A'}
                </p>
              </div>
              <div className="bg-purple-200 p-3 rounded-lg">
                <BarChart3 className="h-8 w-8 text-purple-700" />
              </div>
            </div>
          </div>

          {/* High Risk */}
          <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-xl shadow-md hover:shadow-lg transition-shadow p-6 border border-red-200">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm font-semibold text-red-600 uppercase tracking-wide mb-1">High Risk</p>
                <p className="text-3xl font-bold text-red-900">{stats.highRiskProperties}</p>
              </div>
              <div className="bg-red-200 p-3 rounded-lg">
                <AlertTriangle className="h-8 w-8 text-red-700" />
              </div>
            </div>
          </div>
        </div>

        {/* Analytics Modules - Updated Layout */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Analytics Modules</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {moduleSnapshots.map((module, index) => (
              <Link 
                key={index} 
                href={module.href}
                className="group"
              >
                <div className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-200 overflow-hidden border border-gray-200 hover:border-gray-300">
                  {/* Module Header */}
                  <div className={`bg-gradient-to-r ${module.color} px-6 py-4 flex items-center justify-between`}>
                    <div className="flex items-center">
                      <module.icon className="h-6 w-6 text-white mr-3" />
                      <h3 className="text-base font-bold text-white">{module.name}</h3>
                    </div>
                    <ArrowRight className="h-5 w-5 text-white opacity-0 group-hover:opacity-100 transform group-hover:translate-x-1 transition-all" />
                  </div>

                  {/* Module Content */}
                  {module.status === 'active' ? (
                    <div className="p-5">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <p className="text-xs text-gray-500">{module.stats.primary.label}</p>
                          <p className="text-sm font-bold text-gray-900">{module.stats.primary.value}</p>
                        </div>
                        <div className="flex items-center justify-between border-t border-gray-100 pt-3">
                          <p className="text-xs text-gray-500">{module.stats.secondary.label}</p>
                          <p className="text-sm font-bold text-gray-900">{module.stats.secondary.value}</p>
                        </div>
                        <div className="flex items-center justify-between border-t border-gray-100 pt-3">
                          <p className="text-xs text-gray-500">{module.stats.tertiary.label}</p>
                          <p className="text-sm font-bold text-gray-900">{module.stats.tertiary.value}</p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="p-5 text-center">
                      <module.icon className="h-10 w-10 mx-auto mb-2 text-gray-300" />
                      <p className="text-xs text-gray-500">No data available</p>
                    </div>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200 p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Quick Start</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Link
              href="/dashboard/upload"
              className="flex items-center justify-between p-4 bg-white rounded-lg shadow hover:shadow-md transition-shadow border border-gray-200"
            >
              <div>
                <p className="font-semibold text-gray-900">Upload Data</p>
                <p className="text-sm text-gray-600">Import CSV files to start analyzing</p>
              </div>
              <ArrowRight className="h-5 w-5 text-blue-600" />
            </Link>
            <Link
              href="/dashboard/portfolio"
              className="flex items-center justify-between p-4 bg-white rounded-lg shadow hover:shadow-md transition-shadow border border-gray-200"
            >
              <div>
                <p className="font-semibold text-gray-900">View Portfolio</p>
                <p className="text-sm text-gray-600">Analyze your complete portfolio</p>
              </div>
              <ArrowRight className="h-5 w-5 text-blue-600" />
            </Link>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
