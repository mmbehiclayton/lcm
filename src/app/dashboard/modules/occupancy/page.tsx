'use client';

import { useState, useEffect } from 'react';
import { Building2, Users, TrendingUp, AlertTriangle, Calendar, DollarSign, MapPin, Upload, RefreshCw, Activity, CheckCircle, AlertCircle } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { UploadModal } from '@/components/modals/UploadModal';
import { SearchFilter } from '@/components/common/SearchFilter';
import { OccupancyAnalyticsCharts } from '@/components/charts/OccupancyAnalyticsCharts';

export default function OccupancyPage() {
  const [selectedPeriod, setSelectedPeriod] = useState('12m');
  const [occupancyData, setOccupancyData] = useState<any[]>([]);
  const [analysisResults, setAnalysisResults] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showUpload, setShowUpload] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [filteredOccupancy, setFilteredOccupancy] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchOccupancyData();
  }, []);

  // Filter occupancy data based on search and filters
  useEffect(() => {
    let filtered = occupancyData;

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(property =>
        property.propertyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        property.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
        property.propertyId.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply filters
    if (filters.propertyType) {
      filtered = filtered.filter(property => property.propertyType === filters.propertyType);
    }
    if (filters.riskLevel) {
      filtered = filtered.filter(property => property.riskLevel === filters.riskLevel);
    }
    if (filters.location) {
      filtered = filtered.filter(property => property.location === filters.location);
    }

    setFilteredOccupancy(filtered);
  }, [occupancyData, searchQuery, filters]);

  const fetchOccupancyData = async () => {
    try {
      setIsLoading(true);
      
      // Fetch occupancy data
      const response = await fetch('/api/occupancy/data');
      if (response.ok) {
        const data = await response.json();
        setOccupancyData(data);
        
        // If we have data, trigger analysis
        if (data && data.length > 0) {
          await performAnalysis();
        }
      }
    } catch (error) {
      console.error('Error fetching occupancy data:', error);
      toast.error('Failed to load occupancy data');
    } finally {
      setIsLoading(false);
    }
  };

  const performAnalysis = async () => {
    try {
      const response = await fetch('/api/occupancy/analyze', {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Failed to analyze occupancy data');
      }

      const result = await response.json();
      console.log('Analysis result:', result);
      
      if (result.success && result.data) {
        setAnalysisResults(result.data);
      }
    } catch (error: any) {
      console.error('Error analyzing occupancy:', error);
      toast.error(error.message || 'Failed to analyze occupancy data');
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    toast.info('Refreshing occupancy analysis...');
    
    try {
      await performAnalysis();
      toast.success('Analysis refreshed successfully');
    } catch (error) {
      toast.error('Failed to refresh analysis');
    } finally {
      setIsRefreshing(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'Low':
        return 'text-green-600 bg-green-100';
      case 'Medium':
        return 'text-yellow-600 bg-yellow-100';
      case 'High':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getClassificationColor = (classification: string) => {
    switch (classification) {
      case 'Efficient':
        return 'text-green-700 bg-green-100 border-green-200';
      case 'Underutilised':
        return 'text-yellow-700 bg-yellow-100 border-yellow-200';
      case 'Overcrowded':
        return 'text-red-700 bg-red-100 border-red-200';
      default:
        return 'text-gray-700 bg-gray-100 border-gray-200';
    }
  };

  const getTrendIcon = (trend: string) => {
    if (trend === 'Increasing') return <TrendingUp className="h-4 w-4 text-green-600" />;
    if (trend === 'Decreasing') return <AlertTriangle className="h-4 w-4 text-red-600" />;
    return <Activity className="h-4 w-4 text-gray-600" />;
  };

  const getOccupancyColor = (rate: number) => {
    if (rate >= 95) return 'text-green-600';
    if (rate >= 85) return 'text-yellow-600';
    return 'text-red-600';
  };

  const totalUnits = occupancyData.reduce((sum, prop) => sum + prop.totalUnits, 0);
  const occupiedUnits = occupancyData.reduce((sum, prop) => sum + prop.occupiedUnits, 0);
  const overallOccupancy = totalUnits > 0 ? (occupiedUnits / totalUnits) * 100 : 0;
  const totalRevenue = occupancyData.reduce((sum, prop) => sum + prop.totalRevenue, 0);
  const vacantUnits = occupancyData.reduce((sum, prop) => sum + prop.vacantUnits, 0);

  // Calculate summary from analysis results
  const avgOccupancyScore = analysisResults?.summary?.avg_occupancy_score || overallOccupancy;
  const efficientCount = analysisResults?.summary?.efficient_count || 0;
  const underutilisedCount = analysisResults?.summary?.underutilised_count || 0;
  const overcrowdedCount = analysisResults?.summary?.overcrowded_count || 0;
  const leaseBreaches = analysisResults?.summary?.lease_breaches || 0;

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const handleFilter = (newFilters: Record<string, string>) => {
    setFilters(newFilters);
  };

  const occupancyModule = {
    id: 'occupancy',
    name: 'Occupancy',
    color: 'orange',
    templateUrl: '/api/templates/occupancy',
    templateName: 'occupancy_template.csv',
    requiredFields: [
      'property_id', 'property_name', 'property_type', 'location',
      'total_units', 'occupied_units', 'occupancy_rate', 'average_rent',
      'desk_usage', 'badge_ins', 'meeting_room_usage', 'lighting_usage'
    ]
  };

  // Loading state
  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <Activity className="h-12 w-12 text-orange-600 animate-spin mx-auto mb-4" />
            <p className="text-gray-600 font-medium">Analyzing occupancy data...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="pb-8">
        {/* Page Header */}
        <div className="bg-gradient-to-r from-orange-600 via-amber-700 to-yellow-700 rounded-xl shadow-lg p-6 text-white mb-8">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <Building2 className="h-8 w-8" />
                <h1 className="text-2xl lg:text-3xl font-bold">LCM Occupancy</h1>
              </div>
              <p className="text-orange-100 text-sm">
                Space utilization analysis with IoT sensor data and lease compliance
              </p>
            </div>
            <div className="flex gap-3">
              <Button
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="bg-white/20 hover:bg-white/30 text-white border border-white/30 backdrop-blur-sm"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              <Button
                onClick={() => setShowUpload(true)}
                className="bg-white text-orange-700 hover:bg-orange-50 font-semibold"
              >
                <Upload className="h-4 w-4 mr-2" />
                Upload Data
              </Button>
            </div>
          </div>
        </div>

        {/* Upload Modal */}
        <UploadModal
          isOpen={showUpload}
          onClose={() => setShowUpload(false)}
          module={occupancyModule}
          onUploadSuccess={() => fetchOccupancyData()}
        />

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 p-4 border border-blue-200">
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-blue-600 uppercase tracking-wide mb-1">Overall Occupancy</p>
                <p className={`text-2xl font-bold truncate ${getOccupancyColor(avgOccupancyScore)}`}>
                  {avgOccupancyScore.toFixed(1)}%
                </p>
                <p className="text-xs text-blue-600 mt-1">
                  {occupiedUnits} / {totalUnits} units
                </p>
              </div>
              <div className="bg-blue-200 p-2.5 rounded-lg flex-shrink-0 ml-2">
                <Building2 className="h-6 w-6 text-blue-700" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 p-4 border border-green-200">
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-green-600 uppercase tracking-wide mb-1">Efficient Usage</p>
                <p className="text-2xl font-bold text-green-900 truncate">{efficientCount}</p>
                <p className="text-xs text-green-600 mt-1">
                  Properties optimized
                </p>
              </div>
              <div className="bg-green-200 p-2.5 rounded-lg flex-shrink-0 ml-2">
                <CheckCircle className="h-6 w-6 text-green-700" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 p-4 border border-yellow-200">
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-yellow-600 uppercase tracking-wide mb-1">Underutilised</p>
                <p className="text-2xl font-bold text-yellow-900 truncate">{underutilisedCount}</p>
                <p className="text-xs text-yellow-600 mt-1">
                  Need optimization
                </p>
              </div>
              <div className="bg-yellow-200 p-2.5 rounded-lg flex-shrink-0 ml-2">
                <AlertTriangle className="h-6 w-6 text-yellow-700" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 p-4 border border-red-200">
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-red-600 uppercase tracking-wide mb-1">Lease Breaches</p>
                <p className="text-2xl font-bold text-red-900 truncate">{leaseBreaches}</p>
                <p className="text-xs text-red-600 mt-1">
                  Compliance violations
                </p>
              </div>
              <div className="bg-red-200 p-2.5 rounded-lg flex-shrink-0 ml-2">
                <AlertCircle className="h-6 w-6 text-red-700" />
              </div>
            </div>
          </div>
        </div>

        {/* Analysis Results Section */}
        {analysisResults && analysisResults.analyses && analysisResults.analyses.length > 0 && (
          <div className="bg-white rounded-xl shadow-lg mb-8 overflow-hidden border border-gray-200">
            <div className="bg-gradient-to-r from-orange-50 to-amber-50 px-6 py-4 border-b border-orange-100">
              <h2 className="text-xl font-bold text-gray-900">LCM Occupancy Analysis Results</h2>
              <p className="text-sm text-gray-600 mt-1">Space utilization with IoT sensors and lease compliance</p>
            </div>

            {/* Summary Stats */}
            <div className="p-6 bg-gray-50 border-b border-gray-200">
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-gray-900">{analysisResults.summary.total_properties}</p>
                  <p className="text-xs text-gray-600 mt-1">Total Properties</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-600">{efficientCount}</p>
                  <p className="text-xs text-gray-600 mt-1">Efficient</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-yellow-600">{underutilisedCount}</p>
                  <p className="text-xs text-gray-600 mt-1">Underutilised</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-red-600">{overcrowdedCount}</p>
                  <p className="text-xs text-gray-600 mt-1">Overcrowded</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-orange-600">{leaseBreaches}</p>
                  <p className="text-xs text-gray-600 mt-1">Lease Breaches</p>
                </div>
              </div>
            </div>

            {/* Tabbed Data Section */}
            <div className="relative z-10">
              {/* Tab Navigation */}
              <div className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                <div className="flex space-x-1 px-6">
                  <button
                    onClick={() => setActiveTab('overview')}
                    className={`px-6 py-3 text-sm font-semibold transition-all duration-200 border-b-2 ${
                      activeTab === 'overview'
                        ? 'bg-white text-orange-700 border-orange-600 shadow-sm'
                        : 'bg-transparent text-gray-600 border-transparent hover:text-gray-900 hover:bg-white/50'
                    }`}
                  >
                    Overview
                  </button>
                  <button
                    onClick={() => setActiveTab('analysis')}
                    className={`px-6 py-3 text-sm font-semibold transition-all duration-200 border-b-2 ${
                      activeTab === 'analysis'
                        ? 'bg-white text-orange-700 border-orange-600 shadow-sm'
                        : 'bg-transparent text-gray-600 border-transparent hover:text-gray-900 hover:bg-white/50'
                    }`}
                  >
                    Utilization Analysis
                  </button>
                  <button
                    onClick={() => setActiveTab('recommendations')}
                    className={`px-6 py-3 text-sm font-semibold transition-all duration-200 border-b-2 ${
                      activeTab === 'recommendations'
                        ? 'bg-white text-orange-700 border-orange-600 shadow-sm'
                        : 'bg-transparent text-gray-600 border-transparent hover:text-gray-900 hover:bg-white/50'
                    }`}
                  >
                    Recommendations
                  </button>
                </div>
              </div>

              {/* Tab Content */}
              <div className="p-6">
                {/* Overview Tab */}
                {activeTab === 'overview' && (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead>
                        <tr className="bg-gradient-to-r from-orange-50 to-amber-50">
                          <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Property</th>
                          <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Occupancy Score</th>
                          <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Classification</th>
                          <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Utilization Ratio</th>
                          <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Trend</th>
                          <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Lease Status</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {analysisResults.analyses.map((analysis: any, index: number) => (
                          <tr key={index} className="hover:bg-gray-50/30">
                            <td className="px-4 py-3">
                              <div className="flex items-center">
                                <Building2 className="h-4 w-4 text-gray-400 mr-2" />
                                <div>
                                  <div className="text-sm font-medium text-gray-900">{analysis.property_name}</div>
                                  <div className="text-xs text-gray-500">{analysis.property_type}</div>
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <span className={`text-sm font-bold ${getOccupancyColor(analysis.occupancy_score)}`}>
                                {analysis.occupancy_score.toFixed(1)}%
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${getClassificationColor(analysis.utilization_classification)}`}>
                                {analysis.utilization_classification}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-900">
                              {analysis.utilization_ratio.toFixed(2)}
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-1">
                                {getTrendIcon(analysis.trend_direction)}
                                <span className="text-xs text-gray-600">{analysis.trend_direction}</span>
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              {analysis.lease_breach ? (
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700 border border-red-200">
                                  <AlertCircle className="h-3 w-3 mr-1" />
                                  Breach
                                </span>
                              ) : (
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700 border border-green-200">
                                  <CheckCircle className="h-3 w-3 mr-1" />
                                  Compliant
                                </span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* Analysis Tab */}
                {activeTab === 'analysis' && (
                  <div className="space-y-6">
                    {analysisResults.analyses.map((analysis: any, index: number) => {
                      // Find corresponding property data for additional details
                      const propertyData = occupancyData.find(p => p.propertyId === analysis.property_id);
                      
                      return (
                        <div key={index} className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
                          {/* Header */}
                          <div className="bg-gradient-to-r from-orange-50 to-amber-50 px-6 py-4 border-b border-orange-100">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <h3 className="text-xl font-bold text-gray-900">{analysis.property_name}</h3>
                                <p className="text-sm text-gray-600 mt-1">{analysis.property_type} • {analysis.location}</p>
                              </div>
                              <div className="flex flex-col items-end gap-2">
                                <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-semibold border ${getClassificationColor(analysis.utilization_classification)}`}>
                                  {analysis.utilization_classification}
                                </span>
                                {analysis.lease_breach && (
                                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700 border border-red-200">
                                    <AlertCircle className="h-3 w-3 mr-1" />
                                    Lease Breach
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="p-6">
                            {/* Key Metrics Grid */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
                              <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                                <p className="text-xs font-semibold text-blue-600 uppercase tracking-wide mb-1">Occupancy Score</p>
                                <p className={`text-xl font-bold ${getOccupancyColor(analysis.occupancy_score)}`}>
                                  {analysis.occupancy_score.toFixed(1)}%
                                </p>
                                {propertyData && (
                                  <p className="text-xs text-gray-600 mt-1">
                                    {propertyData.occupiedUnits} / {propertyData.totalUnits} units
                                  </p>
                                )}
                              </div>
                              
                              <div className="bg-green-50 rounded-lg p-3 border border-green-200">
                                <p className="text-xs font-semibold text-green-600 uppercase tracking-wide mb-1">Current Usage</p>
                                <p className="text-xl font-bold text-green-900">{analysis.current_usage.toFixed(1)}%</p>
                                <p className="text-xs text-gray-600 mt-1">Real-time sensors</p>
                              </div>
                              
                              <div className="bg-purple-50 rounded-lg p-3 border border-purple-200">
                                <p className="text-xs font-semibold text-purple-600 uppercase tracking-wide mb-1">Baseline (3mo)</p>
                                <p className="text-xl font-bold text-purple-900">{analysis.baseline_occupancy.toFixed(1)}%</p>
                                <p className="text-xs text-gray-600 mt-1">Historical avg</p>
                              </div>
                              
                              <div className="bg-orange-50 rounded-lg p-3 border border-orange-200">
                                <p className="text-xs font-semibold text-orange-600 uppercase tracking-wide mb-1">Utilization Ratio</p>
                                <p className="text-xl font-bold text-orange-900">{analysis.utilization_ratio.toFixed(2)}</p>
                                <p className="text-xs text-gray-600 mt-1">
                                  {analysis.utilization_ratio > 1.2 ? '⚠️ Overcrowded' : 
                                   analysis.utilization_ratio < 0.5 ? '⚠️ Underused' : 
                                   '✓ Optimal'}
                                </p>
                              </div>
                            </div>

                            {/* Sensor Data (if available) */}
                            {propertyData && (propertyData.deskUsage || propertyData.badgeIns) && (
                              <div className="mb-6">
                                <h4 className="text-sm font-bold text-gray-900 mb-3 flex items-center">
                                  <Activity className="h-4 w-4 mr-2 text-orange-600" />
                                  IoT Sensor Data
                                </h4>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                  {propertyData.deskUsage && (
                                    <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                                      <p className="text-xs text-gray-600 mb-1">Desk Usage</p>
                                      <p className="text-lg font-bold text-gray-900">{propertyData.deskUsage}%</p>
                                    </div>
                                  )}
                                  {propertyData.badgeIns && (
                                    <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                                      <p className="text-xs text-gray-600 mb-1">Badge-Ins</p>
                                      <p className="text-lg font-bold text-gray-900">{propertyData.badgeIns}</p>
                                    </div>
                                  )}
                                  {propertyData.meetingRoomUsage && (
                                    <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                                      <p className="text-xs text-gray-600 mb-1">Meeting Rooms</p>
                                      <p className="text-lg font-bold text-gray-900">{propertyData.meetingRoomUsage}%</p>
                                    </div>
                                  )}
                                  {propertyData.lightingUsage && (
                                    <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                                      <p className="text-xs text-gray-600 mb-1">Lighting</p>
                                      <p className="text-lg font-bold text-gray-900">{propertyData.lightingUsage}%</p>
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}

                            {/* Trend Analysis */}
                            <div className="mb-6">
                              <h4 className="text-sm font-bold text-gray-900 mb-3 flex items-center">
                                <TrendingUp className="h-4 w-4 mr-2 text-orange-600" />
                                Trend Analysis & Future Pattern
                              </h4>
                              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4">
                                <div className="flex items-start gap-3">
                                  {getTrendIcon(analysis.trend_direction)}
                                  <div className="flex-1">
                                    <p className="text-sm font-semibold text-gray-900 mb-1">
                                      Trend: <span className="text-blue-700">{analysis.trend_direction}</span>
                                    </p>
                                    <p className="text-sm text-gray-700">{analysis.predicted_future_pattern}</p>
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* Risk Factors */}
                            {analysis.risk_factors && analysis.risk_factors.length > 0 && (
                              <div>
                                <h4 className="text-sm font-bold text-gray-900 mb-3 flex items-center">
                                  <AlertTriangle className="h-4 w-4 mr-2 text-orange-600" />
                                  Identified Risk Factors
                                </h4>
                                <div className="space-y-2">
                                  {analysis.risk_factors.map((factor: string, idx: number) => (
                                    <div key={idx} className="flex items-start bg-orange-50 border border-orange-200 rounded-lg p-3">
                                      <AlertTriangle className="h-4 w-4 text-orange-600 mr-2 mt-0.5 flex-shrink-0" />
                                      <p className="text-sm text-orange-900">{factor}</p>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Recommendations Tab */}
                {activeTab === 'recommendations' && (
                  <div className="space-y-6">
                    {analysisResults.analyses.map((analysis: any, index: number) => {
                      // Find corresponding property data
                      const propertyData = occupancyData.find(p => p.propertyId === analysis.property_id);
                      
                      return (
                        <div key={index} className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
                          {/* Header with Status */}
                          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-4 border-b border-blue-100">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <h3 className="text-xl font-bold text-gray-900">{analysis.property_name}</h3>
                                <p className="text-sm text-gray-600 mt-1">{analysis.property_type} • {analysis.location}</p>
                              </div>
                              <div className="flex flex-col items-end gap-2">
                                <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-semibold border ${getClassificationColor(analysis.utilization_classification)}`}>
                                  {analysis.utilization_classification}
                                </span>
                                {analysis.lease_breach && (
                                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700 border border-red-200">
                                    <AlertCircle className="h-3 w-3 mr-1" />
                                    Compliance Issue
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="p-6">
                            {/* Quick Stats Summary */}
                            <div className="grid grid-cols-3 gap-4 mb-6">
                              <div className="text-center p-3 bg-gray-50 rounded-lg border border-gray-200">
                                <p className="text-xs text-gray-600 mb-1">Occupancy</p>
                                <p className={`text-xl font-bold ${getOccupancyColor(analysis.occupancy_score)}`}>
                                  {analysis.occupancy_score.toFixed(1)}%
                                </p>
                              </div>
                              <div className="text-center p-3 bg-gray-50 rounded-lg border border-gray-200">
                                <p className="text-xs text-gray-600 mb-1">Utilization</p>
                                <p className="text-xl font-bold text-gray-900">{analysis.utilization_ratio.toFixed(2)}</p>
                              </div>
                              <div className="text-center p-3 bg-gray-50 rounded-lg border border-gray-200">
                                <p className="text-xs text-gray-600 mb-1">Trend</p>
                                <div className="flex items-center justify-center gap-1">
                                  {getTrendIcon(analysis.trend_direction)}
                                  <p className="text-xs font-bold text-gray-900">{analysis.trend_direction}</p>
                                </div>
                              </div>
                            </div>

                            {/* Primary Recommendations */}
                            {analysis.recommendations && analysis.recommendations.length > 0 && (
                              <div className="mb-6">
                                <h4 className="text-sm font-bold text-gray-900 mb-3 flex items-center">
                                  <CheckCircle className="h-5 w-5 mr-2 text-blue-600" />
                                  Actionable Recommendations
                                </h4>
                                <div className="space-y-3">
                                  {analysis.recommendations.map((rec: string, idx: number) => (
                                    <div key={idx} className="flex items-start bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                                      <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-sm mr-3">
                                        {idx + 1}
                                      </div>
                                      <div className="flex-1">
                                        <p className="text-sm font-medium text-blue-900">{rec}</p>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Lease Compliance Section */}
                            {analysis.lease_breach && (
                              <div className="mb-6">
                                <h4 className="text-sm font-bold text-gray-900 mb-3 flex items-center">
                                  <AlertCircle className="h-5 w-5 mr-2 text-red-600" />
                                  Lease Compliance Alert
                                </h4>
                                <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg">
                                  <div className="flex">
                                    <div className="flex-shrink-0">
                                      <AlertCircle className="h-5 w-5 text-red-500" />
                                    </div>
                                    <div className="ml-3">
                                      <h3 className="text-sm font-bold text-red-800 mb-2">Compliance Violation Detected</h3>
                                      <div className="text-sm text-red-700">
                                        <p className="mb-2">This property has violations that require immediate attention:</p>
                                        <ul className="list-disc list-inside space-y-1">
                                          {analysis.utilization_ratio > 1.2 && propertyData && (
                                            <li>Occupancy exceeds lease terms ({propertyData.occupiedUnits} units vs {propertyData.totalUnits} permitted)</li>
                                          )}
                                          {analysis.utilization_ratio > 1.2 && (
                                            <li>Utilization ratio of {analysis.utilization_ratio.toFixed(2)} indicates overcrowding</li>
                                          )}
                                        </ul>
                                        <p className="mt-3 font-semibold">Recommended Action: Review lease terms and implement corrective measures immediately.</p>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            )}

                            {/* Context-Specific Recommendations Based on Classification */}
                            <div className="mb-6">
                              <h4 className="text-sm font-bold text-gray-900 mb-3 flex items-center">
                                <Activity className="h-5 w-5 mr-2 text-orange-600" />
                                Strategic Actions Based on {analysis.utilization_classification} Status
                              </h4>
                              
                              {analysis.utilization_classification === 'Overcrowded' && (
                                <div className="space-y-2">
                                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                                    <p className="text-sm font-semibold text-red-900 mb-2">🔴 Overcrowding Issues</p>
                                    <ul className="text-sm text-red-800 space-y-1 list-disc list-inside">
                                      <li>Implement immediate space expansion or relocation plan</li>
                                      <li>Consider desk-sharing or hot-desking policies</li>
                                      <li>Review building codes and safety regulations compliance</li>
                                      <li>Negotiate lease amendment for increased capacity</li>
                                      <li>Monitor health & safety compliance closely</li>
                                    </ul>
                                  </div>
                                </div>
                              )}

                              {analysis.utilization_classification === 'Underutilised' && (
                                <div className="space-y-2">
                                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                                    <p className="text-sm font-semibold text-yellow-900 mb-2">🟡 Space Optimization Opportunities</p>
                                    <ul className="text-sm text-yellow-800 space-y-1 list-disc list-inside">
                                      <li>Explore space consolidation to reduce overhead costs</li>
                                      <li>Consider subletting unused space (if permitted)</li>
                                      <li>Review hybrid work policies and adjust space allocation</li>
                                      <li>Renegotiate lease terms for smaller footprint</li>
                                      <li>Repurpose vacant areas for amenities or collaboration zones</li>
                                    </ul>
                                  </div>
                                </div>
                              )}

                              {analysis.utilization_classification === 'Efficient' && (
                                <div className="space-y-2">
                                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                                    <p className="text-sm font-semibold text-green-900 mb-2">🟢 Optimal Performance</p>
                                    <ul className="text-sm text-green-800 space-y-1 list-disc list-inside">
                                      <li>Maintain current operational practices</li>
                                      <li>Continue monitoring sensor data for early trend detection</li>
                                      <li>Plan proactively for capacity adjustments based on growth forecasts</li>
                                      <li>Document best practices for replication across portfolio</li>
                                      <li>Consider minor optimizations to improve efficiency further</li>
                                    </ul>
                                  </div>
                                </div>
                              )}
                            </div>

                            {/* Next Steps / Action Items */}
                            <div>
                              <h4 className="text-sm font-bold text-gray-900 mb-3 flex items-center">
                                <Calendar className="h-5 w-5 mr-2 text-purple-600" />
                                Immediate Next Steps
                              </h4>
                              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                                <div className="space-y-3">
                                  <div className="flex items-start">
                                    <span className="flex-shrink-0 w-6 h-6 bg-purple-600 text-white rounded-full flex items-center justify-center text-xs font-bold mr-3">1</span>
                                    <p className="text-sm text-purple-900">
                                      <span className="font-semibold">Review Analysis:</span> Examine detailed utilization metrics and sensor data trends
                                    </p>
                                  </div>
                                  <div className="flex items-start">
                                    <span className="flex-shrink-0 w-6 h-6 bg-purple-600 text-white rounded-full flex items-center justify-center text-xs font-bold mr-3">2</span>
                                    <p className="text-sm text-purple-900">
                                      <span className="font-semibold">Stakeholder Meeting:</span> Discuss findings with property management and tenant representatives
                                    </p>
                                  </div>
                                  <div className="flex items-start">
                                    <span className="flex-shrink-0 w-6 h-6 bg-purple-600 text-white rounded-full flex items-center justify-center text-xs font-bold mr-3">3</span>
                                    <p className="text-sm text-purple-900">
                                      <span className="font-semibold">Action Plan:</span> Develop and document specific interventions with timelines
                                    </p>
                                  </div>
                                  <div className="flex items-start">
                                    <span className="flex-shrink-0 w-6 h-6 bg-purple-600 text-white rounded-full flex items-center justify-center text-xs font-bold mr-3">4</span>
                                    <p className="text-sm text-purple-900">
                                      <span className="font-semibold">Monitor & Review:</span> Schedule follow-up analysis in 30 days to track progress
                                    </p>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Charts */}
        <div className="relative z-10 w-full overflow-hidden mb-8">
          <OccupancyAnalyticsCharts 
            occupancyData={occupancyData} 
            analysis={analysisResults} 
          />
        </div>

        {/* Search and Filter */}
        <SearchFilter
          onSearch={handleSearch}
          onFilter={handleFilter}
          searchPlaceholder="Search properties by name, location, or property ID..."
          filters={{
            propertyType: {
              label: 'Property Type',
              options: [
                { value: 'Office', label: 'Office' },
                { value: 'Retail', label: 'Retail' },
                { value: 'Industrial', label: 'Industrial' },
                { value: 'Residential', label: 'Residential' }
              ]
            },
            riskLevel: {
              label: 'Risk Level',
              options: [
                { value: 'Low', label: 'Low' },
                { value: 'Medium', label: 'Medium' },
                { value: 'High', label: 'High' }
              ]
            }
          }}
        />

        {/* Properties Table */}
        <div className="bg-white rounded-lg shadow">
          <div className="bg-gradient-to-r from-orange-50 to-amber-50 px-6 py-4 border-b border-orange-100">
            <h3 className="text-lg font-bold text-gray-900">Property Occupancy Details</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Property</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Units</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Occupancy Rate</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Avg Rent</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Monthly Revenue</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Risk Level</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredOccupancy.map((property) => (
                  <tr key={property.propertyId} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Building2 className="h-5 w-5 text-gray-400 mr-3" />
                        <div>
                          <div className="text-sm font-medium text-gray-900">{property.propertyName}</div>
                          <div className="text-sm text-gray-500 flex items-center">
                            <MapPin className="h-3 w-3 mr-1" />
                            {property.location}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {property.type}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div>
                        <div className="font-medium">{property.occupiedUnits}/{property.totalUnits}</div>
                        <div className="text-xs text-gray-500">{property.vacantUnits} vacant</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className={`font-medium ${getOccupancyColor(property.occupancyRate)}`}>
                        {property.occupancyRate.toFixed(1)}%
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatCurrency(property.avgRent)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatCurrency(property.totalRevenue)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRiskColor(property.riskLevel)}`}>
                        {property.riskLevel}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
