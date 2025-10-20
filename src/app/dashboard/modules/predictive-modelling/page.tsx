'use client';

import { useState, useEffect } from 'react';
import { TrendingUp, BarChart3, Target, AlertTriangle, Calendar, DollarSign, Building2, Upload, FileText, CheckCircle, Activity, RefreshCw, Trash2 } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { UploadModal } from '@/components/modals/UploadModal';
import { SearchFilter } from '@/components/common/SearchFilter';
import { PredictiveAnalyticsCharts } from '@/components/charts/PredictiveAnalyticsCharts';

export default function PredictiveModellingPage() {
  const [predictions, setPredictions] = useState<any[]>([]);
  const [analysisResults, setAnalysisResults] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showUpload, setShowUpload] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [filteredPredictions, setFilteredPredictions] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'predictions' | 'scoring' | 'insights'>('predictions');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [isClearing, setIsClearing] = useState(false);

  // Module configuration for upload modal
  const predictiveModule = {
    id: 'predictive-modelling',
    name: 'Predictive Modelling',
    color: 'indigo',
    templateUrl: '/api/templates/predictive-modelling',
    templateName: 'predictive_modelling_template.csv',
    requiredFields: ['property_id', 'property_name', 'property_type', 'location', 'current_value', 'occupancy_rate']
  };

  useEffect(() => {
    fetchPredictiveData();
  }, []);

  // Filter predictions based on search and filters
  useEffect(() => {
    let filtered = predictions;

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(prediction =>
        (prediction.property_name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (prediction.property_id || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (prediction.property_type || '').toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply filters
    if (filters.classification) {
      filtered = filtered.filter(prediction => prediction.asset_classification === filters.classification);
    }
    if (filters.epc_risk) {
      filtered = filtered.filter(prediction => prediction.predicted_epc_risk === filters.epc_risk);
    }
    if (filters.propertyType) {
      filtered = filtered.filter(prediction => prediction.property_type === filters.propertyType);
    }

    setFilteredPredictions(filtered);
  }, [predictions, searchQuery, filters]);

  const fetchPredictiveData = async () => {
    try {
      setIsLoading(true);
      
      // Always try to perform fresh analysis when loading
      await performAnalysis();
    } catch (error) {
      console.error('Error fetching predictive data:', error);
      toast.info('No property data found. Please upload property data to begin analysis.');
      setPredictions([]);
      setAnalysisResults(null);
    } finally {
      setIsLoading(false);
    }
  };

  const performAnalysis = async () => {
    try {
      const response = await fetch('/api/predictive/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (response.ok) {
        const result = await response.json();
        console.log('Analysis result:', result);
        
        // The API returns { message: '...', data: { predictions: [...], ... } }
        const analysisData = result.data;
        
        if (analysisData && analysisData.predictions && analysisData.predictions.length > 0) {
          console.log('Setting predictions:', analysisData.predictions.length, 'items');
          console.log('First prediction:', analysisData.predictions[0]);
          
          setPredictions(analysisData.predictions);
          setAnalysisResults(analysisData);
          
          // Only show success message if it's a manual analysis
          if (predictions.length > 0) {
            toast.success(`Predictive analysis completed! ${analysisData.predictions.length} properties analyzed.`);
          }
        } else {
          console.warn('No predictions in analysis data:', analysisData);
          setPredictions([]);
          setAnalysisResults(null);
        }
      } else {
        const errorData = await response.json();
        console.error('Analysis failed:', errorData);
        toast.error(errorData.error || 'Analysis failed');
        throw new Error(errorData.error || 'Analysis failed');
      }
    } catch (error) {
      console.error('Error performing analysis:', error);
      toast.error('Failed to perform analysis');
      throw error;
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

  const getClassificationColor = (classification: string) => {
    switch (classification) {
      case 'Stable':
        return 'text-green-600 bg-green-100 border-green-200';
      case 'Moderate':
        return 'text-yellow-600 bg-yellow-100 border-yellow-200';
      case 'High Risk':
        return 'text-red-600 bg-red-100 border-red-200';
      default:
        return 'text-gray-600 bg-gray-100 border-gray-200';
    }
  };

  const getEPCRiskColor = (risk: string) => {
    switch (risk) {
      case 'Low':
        return 'text-green-600 bg-green-100';
      case 'Med':
        return 'text-yellow-600 bg-yellow-100';
      case 'High':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await performAnalysis();
      toast.success('Data refreshed successfully!');
    } catch (error) {
      console.error('Error refreshing data:', error);
      toast.error('Failed to refresh data');
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleClearData = async () => {
    setIsClearing(true);
    try {
      const response = await fetch('/api/predictive/clear?clearProperties=true', {
        method: 'DELETE'
      });

      if (response.ok) {
        const result = await response.json();
        console.log('Clear result:', result);
        
        // Clear local state
        setPredictions([]);
        setAnalysisResults(null);
        setShowClearConfirm(false);
        
        toast.success(`All predictive data cleared! (${result.deleted.analyses} analyses, ${result.deleted.properties} properties)`);
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || 'Failed to clear data');
      }
    } catch (error) {
      console.error('Error clearing data:', error);
      toast.error('Failed to clear data');
    } finally {
      setIsClearing(false);
    }
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const handleFilter = (newFilters: Record<string, string>) => {
    setFilters(newFilters);
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-[calc(100vh-200px)]">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mb-4"></div>
            <p className="text-gray-600 font-medium">Loading predictive models...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6 pb-8">
        {/* Page Header */}
        <div className="bg-gradient-to-r from-indigo-600 via-purple-700 to-blue-700 rounded-xl shadow-lg p-6 text-white">
          <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4">
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-2">
                <Target className="h-8 w-8 flex-shrink-0" />
                <h1 className="text-2xl lg:text-3xl font-bold">LCM Predictive Modelling</h1>
              </div>
              <p className="text-indigo-100 text-sm">
                AI-powered forecasting with explainable ML scoring
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {predictions.length > 0 && (
                <>
                  <button
                    onClick={handleRefresh}
                    disabled={isRefreshing}
                    className="inline-flex items-center px-3 py-2 bg-white/10 hover:bg-white/20 text-white text-sm font-medium rounded-lg backdrop-blur-sm border border-white/20 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <RefreshCw className={`h-4 w-4 mr-1.5 ${isRefreshing ? 'animate-spin' : ''}`} />
                    Refresh
                  </button>
                  <button
                    onClick={performAnalysis}
                    className="inline-flex items-center px-3 py-2 bg-white/10 hover:bg-white/20 text-white text-sm font-medium rounded-lg backdrop-blur-sm border border-white/20 transition-all duration-200"
                  >
                    <BarChart3 className="h-4 w-4 mr-1.5" />
                    Analyze
                  </button>
                  <button
                    onClick={() => setShowClearConfirm(true)}
                    className="inline-flex items-center px-3 py-2 bg-red-500/20 hover:bg-red-500/30 text-white text-sm font-medium rounded-lg backdrop-blur-sm border border-red-400/30 transition-all duration-200"
                  >
                    <Trash2 className="h-4 w-4 mr-1.5" />
                    Clear
                  </button>
                </>
              )}
              <button
                onClick={() => setShowUpload(!showUpload)}
                className="inline-flex items-center px-3 py-2 bg-white text-indigo-600 text-sm font-medium rounded-lg hover:bg-indigo-50 transition-all duration-200 shadow-lg"
              >
                <Upload className="h-4 w-4 mr-1.5" />
                Upload
              </button>
            </div>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl shadow-md hover:shadow-lg transition-shadow duration-200 p-6 border border-blue-200">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-xs font-semibold text-blue-600 uppercase tracking-wide mb-1">Total Properties</p>
                <p className="text-3xl font-bold text-blue-900">{predictions.length}</p>
              </div>
              <div className="bg-blue-200 p-3 rounded-xl">
                <Building2 className="h-7 w-7 text-blue-700" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl shadow-md hover:shadow-lg transition-shadow duration-200 p-6 border border-green-200">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-xs font-semibold text-green-600 uppercase tracking-wide mb-1">Stable Assets</p>
                <p className="text-3xl font-bold text-green-900">
                  {predictions.filter(p => p.asset_classification === 'Stable').length}
                </p>
              </div>
              <div className="bg-green-200 p-3 rounded-xl">
                <CheckCircle className="h-7 w-7 text-green-700" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-xl shadow-md hover:shadow-lg transition-shadow duration-200 p-6 border border-yellow-200">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-xs font-semibold text-yellow-600 uppercase tracking-wide mb-1">Moderate Risk</p>
                <p className="text-3xl font-bold text-yellow-900">
                  {predictions.filter(p => p.asset_classification === 'Moderate').length}
                </p>
              </div>
              <div className="bg-yellow-200 p-3 rounded-xl">
                <AlertTriangle className="h-7 w-7 text-yellow-700" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl shadow-md hover:shadow-lg transition-shadow duration-200 p-6 border border-purple-200">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-xs font-semibold text-purple-600 uppercase tracking-wide mb-1">Avg Score</p>
                <p className="text-3xl font-bold text-purple-900">
                  {predictions.length > 0 ? 
                    (predictions.reduce((sum, p) => sum + (p.total_score || 0), 0) / predictions.length).toFixed(1) : 
                    '--'
                  }
                </p>
              </div>
              <div className="bg-purple-200 p-3 rounded-xl">
                <Activity className="h-7 w-7 text-purple-700" />
              </div>
            </div>
          </div>
        </div>

        {/* Compact Charts Section */}
        {predictions.length > 0 && (
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 relative z-10">
            <div className="flex items-center space-x-2 mb-4">
              <BarChart3 className="h-5 w-5 text-indigo-600" />
              <h3 className="text-lg font-bold text-gray-900">Predictive Analytics Overview</h3>
            </div>
            <div className="w-full">
              <PredictiveAnalyticsCharts 
                predictions={predictions} 
                analysis={analysisResults} 
              />
            </div>
          </div>
        )}

        {/* Consolidated Tabbed Data Section */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 relative z-10">
          {/* Tab Navigation */}
          <div className="border-b border-gray-200">
            <div className="flex space-x-1 p-2">
              <button
                onClick={() => setActiveTab('predictions')}
                className={`flex-1 px-4 py-3 text-sm font-semibold rounded-lg transition-all ${
                  activeTab === 'predictions'
                    ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <div className="flex items-center justify-center space-x-2">
                  <FileText className="h-4 w-4" />
                  <span>Predictions</span>
                  <span className="ml-1 text-xs bg-white/20 px-2 py-0.5 rounded-full">
                    {filteredPredictions.length}
                  </span>
                </div>
              </button>
              
              {predictions.length > 0 && (
                <button
                  onClick={() => setActiveTab('scoring')}
                  className={`flex-1 px-4 py-3 text-sm font-semibold rounded-lg transition-all ${
                    activeTab === 'scoring'
                      ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <div className="flex items-center justify-center space-x-2">
                    <Target className="h-4 w-4" />
                    <span>Scoring Details</span>
                  </div>
                </button>
              )}
              
              {predictions.length > 0 && (
                <button
                  onClick={() => setActiveTab('insights')}
                  className={`flex-1 px-4 py-3 text-sm font-semibold rounded-lg transition-all ${
                    activeTab === 'insights'
                      ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <div className="flex items-center justify-center space-x-2">
                    <TrendingUp className="h-4 w-4" />
                    <span>Key Insights</span>
                  </div>
                </button>
              )}
            </div>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {/* Predictions Tab */}
            {activeTab === 'predictions' && (
              <div>
        {/* Search and Filter */}
                <div className="mb-4">
        <SearchFilter
          onSearch={handleSearch}
          onFilter={handleFilter}
                    searchPlaceholder="Search predictions by property name, ID, or type..."
          filters={{
                      classification: {
                        label: 'Asset Classification',
              options: [
                          { value: 'Stable', label: 'Stable' },
                          { value: 'Moderate', label: 'Moderate' },
                          { value: 'High Risk', label: 'High Risk' }
                        ]
                      },
                      epc_risk: {
                        label: 'EPC Risk Level',
              options: [
                          { value: 'Low', label: 'Low' },
                          { value: 'Med', label: 'Medium' },
                          { value: 'High', label: 'High' }
                        ]
                      },
                      propertyType: {
                        label: 'Property Type',
              options: [
                          { value: 'office', label: 'Office' },
                          { value: 'retail', label: 'Retail' },
                          { value: 'industrial', label: 'Industrial' },
                          { value: 'residential', label: 'Residential' }
              ]
            }
          }}
        />
                </div>

        {/* Predictions Table */}
                <div className="overflow-x-auto">
                  {filteredPredictions.length === 0 ? (
                    <div className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center justify-center">
                        <div className="bg-gray-100 rounded-full p-4 mb-4">
                          <Target className="h-12 w-12 text-gray-400" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">No Predictions Found</h3>
                        <p className="text-sm text-gray-500 mb-4">
                          {searchQuery || Object.keys(filters).length > 0 
                            ? 'Try adjusting your search or filters' 
                            : 'Upload property data to generate predictions'}
                        </p>
                        {!searchQuery && Object.keys(filters).length === 0 && (
                          <button
                            onClick={() => setShowUpload(true)}
                            className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors"
                          >
                            <Upload className="h-4 w-4 mr-2" />
                            Upload Property Data
                          </button>
                        )}
                      </div>
          </div>
                  ) : (
            <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                        <tr>
                          <th className="px-5 py-3 text-left text-xs font-bold text-gray-600 uppercase">Property</th>
                          <th className="px-5 py-3 text-left text-xs font-bold text-gray-600 uppercase">Total Score</th>
                          <th className="px-5 py-3 text-left text-xs font-bold text-gray-600 uppercase">Classification</th>
                          <th className="px-5 py-3 text-left text-xs font-bold text-gray-600 uppercase">Renewal Prob</th>
                          <th className="px-5 py-3 text-left text-xs font-bold text-gray-600 uppercase">EPC Risk</th>
                          <th className="px-5 py-3 text-left text-xs font-bold text-gray-600 uppercase">Occupancy</th>
                          <th className="px-5 py-3 text-left text-xs font-bold text-gray-600 uppercase">Confidence</th>
                </tr>
              </thead>
                      <tbody className="bg-white divide-y divide-gray-100">
                        {filteredPredictions.map((prediction, idx) => (
                          <tr key={idx} className="hover:bg-gray-50 transition-colors">
                            <td className="px-5 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Building2 className="h-5 w-5 text-gray-400 mr-3" />
                        <div>
                                  <div className="text-sm font-semibold text-gray-900">
                                    {prediction.property_name || 'Unknown Property'}
                                  </div>
                                  <div className="text-xs text-gray-500">
                                    {prediction.property_id} • {prediction.property_type}
                                  </div>
                        </div>
                      </div>
                    </td>
                            <td className="px-5 py-4 whitespace-nowrap">
                              <div className="flex items-center space-x-2">
                                <span className="text-lg font-bold text-gray-900">
                                  {prediction.total_score?.toFixed(1) || '--'}
                                </span>
                                <span className="text-xs text-gray-500">/100</span>
                              </div>
                            </td>
                            <td className="px-5 py-4 whitespace-nowrap">
                              <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border ${getClassificationColor(prediction.asset_classification)}`}>
                                {prediction.asset_classification || 'Unknown'}
                              </span>
                            </td>
                            <td className="px-5 py-4 whitespace-nowrap">
                              <span className="text-sm font-medium text-gray-900">
                                {prediction.lease_renewal_probability?.toFixed(1) || '--'}%
                              </span>
                    </td>
                            <td className="px-5 py-4 whitespace-nowrap">
                              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-bold ${getEPCRiskColor(prediction.predicted_epc_risk)}`}>
                                {prediction.predicted_epc_risk || 'N/A'}
                              </span>
                    </td>
                            <td className="px-5 py-4 whitespace-nowrap">
                              <span className="text-sm font-medium text-gray-900">
                                {prediction.forecasted_occupancy_rate?.toFixed(1) || '--'}%
                      </span>
                    </td>
                            <td className="px-5 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                                  <div
                                    className="bg-indigo-600 h-2 rounded-full"
                                    style={{ width: `${prediction.confidence || 0}%` }}
                                  ></div>
                                </div>
                                <span className="text-xs text-gray-600">{prediction.confidence || 0}%</span>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>
            )}

            {/* Scoring Details Tab */}
            {activeTab === 'scoring' && (
              <div>
                <div className="mb-4">
                  <h3 className="text-lg font-bold text-gray-900 mb-2">Weighted Scoring System</h3>
                  <p className="text-sm text-gray-600">Score = 40% EPC Risk + 30% Occupancy Forecast + 30% Rent Stability Index</p>
                </div>
                
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase">Property</th>
                        <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase">EPC Component</th>
                        <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase">Occupancy Component</th>
                        <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase">Rent Stability</th>
                        <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase">Total Score</th>
                        <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase">Location Risk</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-100">
                      {predictions.map((prediction, idx) => (
                        <tr key={idx} className="hover:bg-gray-50">
                          <td className="px-4 py-3 whitespace-nowrap text-sm font-semibold text-gray-900">
                            {prediction.property_name || prediction.property_id}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                            {prediction.epc_risk_component?.toFixed(1) || '--'} (40%)
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                            {prediction.occupancy_component?.toFixed(1) || '--'} (30%)
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                            {prediction.rent_stability_component?.toFixed(1) || '--'} (30%)
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <span className="text-lg font-bold text-indigo-600">
                              {prediction.total_score?.toFixed(1) || '--'}
                      </span>
                    </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                            {prediction.location_risk_index?.toFixed(2) || '--'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
            )}

            {/* Key Insights Tab */}
            {activeTab === 'insights' && (
              <div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Risk Distribution */}
                  <div className="bg-gradient-to-br from-white to-gray-50 rounded-xl border border-gray-200 p-6">
                    <div className="flex items-center space-x-2 mb-4">
                      <AlertTriangle className="h-5 w-5 text-indigo-600" />
                      <h3 className="text-lg font-bold text-gray-900">Risk Distribution</h3>
              </div>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200">
                        <span className="text-sm font-medium text-gray-700">High Risk Assets</span>
                        <span className="text-lg font-bold text-red-600">
                          {predictions.filter(p => p.asset_classification === 'High Risk').length}
                        </span>
              </div>
                      <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200">
                        <span className="text-sm font-medium text-gray-700">Moderate Risk Assets</span>
                        <span className="text-lg font-bold text-yellow-600">
                          {predictions.filter(p => p.asset_classification === 'Moderate').length}
                        </span>
              </div>
                      <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200">
                        <span className="text-sm font-medium text-gray-700">Stable Assets</span>
                        <span className="text-lg font-bold text-green-600">
                          {predictions.filter(p => p.asset_classification === 'Stable').length}
                </span>
              </div>
            </div>
          </div>

                  {/* Key Recommendations */}
                  <div className="bg-gradient-to-br from-white to-indigo-50 rounded-xl border border-indigo-200 p-6">
                    <div className="flex items-center space-x-2 mb-4">
                      <CheckCircle className="h-5 w-5 text-indigo-600" />
                      <h3 className="text-lg font-bold text-gray-900">Key Recommendations</h3>
                    </div>
            <div className="space-y-3">
                      {analysisResults && analysisResults.recommendations && analysisResults.recommendations.length > 0 ? (
                        analysisResults.recommendations.map((rec: string, idx: number) => (
                          <div key={idx} className="flex items-start p-3 bg-white rounded-lg border border-indigo-200">
                            <CheckCircle className="h-4 w-4 text-indigo-500 mr-2 mt-0.5 flex-shrink-0" />
                            <p className="text-sm text-gray-700">{rec}</p>
                          </div>
                        ))
                      ) : (
                        <div className="flex items-start p-3 bg-white rounded-lg border border-gray-200">
                          <TrendingUp className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                <div>
                            <p className="text-sm font-semibold text-gray-900">Portfolio Analysis Complete</p>
                            <p className="text-xs text-gray-600 mt-1">
                              Run detailed analysis to get specific recommendations
                            </p>
                </div>
              </div>
                      )}
                </div>
              </div>
                </div>

                {/* Economic Context */}
                {predictions.length > 0 && predictions[0].economic_factors && (
                  <div className="mt-6 bg-gradient-to-br from-white to-blue-50 rounded-xl border border-blue-200 p-6">
                    <div className="flex items-center space-x-2 mb-4">
                      <Activity className="h-5 w-5 text-blue-600" />
                      <h3 className="text-lg font-bold text-gray-900">Economic Context</h3>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="text-center p-3 bg-white rounded-lg border border-blue-200">
                        <p className="text-xs text-gray-600 mb-1">GDP Growth</p>
                        <p className="text-lg font-bold text-blue-600">
                          {predictions[0].economic_factors.gdp_growth}%
                        </p>
                      </div>
                      <div className="text-center p-3 bg-white rounded-lg border border-blue-200">
                        <p className="text-xs text-gray-600 mb-1">Inflation Rate</p>
                        <p className="text-lg font-bold text-blue-600">
                          {predictions[0].economic_factors.inflation_rate}%
                        </p>
                      </div>
                      <div className="text-center p-3 bg-white rounded-lg border border-blue-200">
                        <p className="text-xs text-gray-600 mb-1">Interest Rate</p>
                        <p className="text-lg font-bold text-blue-600">
                          {predictions[0].economic_factors.interest_rate}%
                        </p>
                      </div>
                      <div className="text-center p-3 bg-white rounded-lg border border-blue-200">
                        <p className="text-xs text-gray-600 mb-1">Market Demand</p>
                        <p className="text-lg font-bold text-blue-600">
                          {predictions[0].economic_factors.market_demand}%
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Upload Modal */}
      {showUpload && (
        <UploadModal
          isOpen={showUpload}
          onClose={() => setShowUpload(false)}
          onUploadSuccess={fetchPredictiveData}
          module={predictiveModule}
        />
      )}

      {/* Clear Data Confirmation Modal */}
      {showClearConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full mx-4 overflow-hidden">
            <div className="bg-gradient-to-r from-red-500 to-red-600 px-6 py-4">
              <div className="flex items-center space-x-3">
                <AlertTriangle className="h-6 w-6 text-white" />
                <h3 className="text-xl font-bold text-white">Clear All Data?</h3>
              </div>
            </div>
            
            <div className="p-6">
              <p className="text-gray-700 mb-4">
                This will permanently delete:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-600 mb-6">
                <li>All analysis results and predictions</li>
                <li>All property records</li>
                <li>All calculated scores and classifications</li>
              </ul>
              <p className="text-sm text-red-600 font-semibold mb-6">
                ⚠️ This action cannot be undone!
              </p>
              
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowClearConfirm(false)}
                  disabled={isClearing}
                  className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 font-medium rounded-lg hover:bg-gray-300 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleClearData}
                  disabled={isClearing}
                  className="flex-1 px-4 py-2 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 inline-flex items-center justify-center"
                >
                  {isClearing ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Clearing...
                    </>
                  ) : (
                    <>
                      <Trash2 className="h-4 w-4 mr-2" />
                      Yes, Clear All
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
