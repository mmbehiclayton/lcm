'use client';

import { useState, useEffect } from 'react';
import { FileText, Calendar, DollarSign, TrendingUp, AlertTriangle, CheckCircle, Building2, Upload, X, Download, BarChart3 } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { UploadModal } from '@/components/modals/UploadModal';
import { SearchFilter } from '@/components/common/SearchFilter';
import { LeaseAnalyticsCharts } from '@/components/charts/LeaseAnalyticsCharts';

export default function LeaseAnalysisPage() {
  const [selectedProperty, setSelectedProperty] = useState<string | null>(null);
  const [leaseData, setLeaseData] = useState<any[]>([]);
  const [analysisResults, setAnalysisResults] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showUpload, setShowUpload] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [filteredLeases, setFilteredLeases] = useState<any[]>([]);
  const [uploading, setUploading] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'risk-scores' | 'recommendations'>('overview');

  // Module configuration for upload modal
  const leaseModule = {
    id: 'lease-analysis',
    name: 'Lease Analysis',
    color: 'green',
    templateUrl: '/api/templates/lease-analysis',
    templateName: 'lease_analysis_template.csv',
    requiredFields: ['lease_id', 'property_id', 'tenant_name', 'lease_start', 'lease_end', 'monthly_rent']
  };

  useEffect(() => {
    fetchLeaseData();
  }, []);

  // Filter leases based on search and filters
  useEffect(() => {
    let filtered = leaseData;

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(lease =>
        lease.tenantName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        lease.propertyId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        lease.leaseId.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply filters
    if (filters.status) {
      filtered = filtered.filter(lease => lease.status === filters.status);
    }
    if (filters.propertyType) {
      filtered = filtered.filter(lease => lease.propertyType === filters.propertyType);
    }
    if (filters.riskLevel) {
      filtered = filtered.filter(lease => lease.riskLevel === filters.riskLevel);
    }

    setFilteredLeases(filtered);
  }, [leaseData, searchQuery, filters]);

  const fetchLeaseData = async () => {
    try {
      setIsLoading(true);
      
      // Fetch lease data and analysis from API
      const response = await fetch('/api/lease-analysis/analyze');
      
      if (response.ok) {
        const data = await response.json();
        setLeaseData(data.leases || []);
        setAnalysisResults(data.analysis);
        
        // If we have leases but no analysis, trigger analysis automatically
        if (data.leases && data.leases.length > 0 && !data.analysis) {
          await performAnalysis();
        }
      } else {
        // If no data available, set empty arrays
        setLeaseData([]);
        setAnalysisResults(null);
        toast.info('No lease data found. Please upload lease data to begin analysis.');
      }
    } catch (error) {
      console.error('Error fetching lease data:', error);
      toast.error('Failed to load lease data');
    } finally {
      setIsLoading(false);
    }
  };

  const performAnalysis = async () => {
    try {
      const response = await fetch('/api/lease-analysis/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (response.ok) {
        const data = await response.json();
        setAnalysisResults(data.data);
        toast.success('Lease risk analysis completed successfully!');
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || 'Analysis failed');
      }
    } catch (error) {
      console.error('Error performing analysis:', error);
      toast.error('Failed to perform analysis');
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getRiskColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-100';
    if (score >= 60) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };


  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const handleFilter = (newFilters: Record<string, string>) => {
    setFilters(newFilters);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active':
        return 'text-green-600 bg-green-100';
      case 'Expiring':
        return 'text-yellow-600 bg-yellow-100';
      case 'Expired':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };


  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-[calc(100vh-200px)]">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mb-4"></div>
            <p className="text-gray-600 font-medium">Loading lease data...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6 pb-8">
        {/* Page Header */}
        <div className="bg-gradient-to-r from-green-600 via-teal-700 to-emerald-700 rounded-xl shadow-lg p-8 text-white">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-3">
                <FileText className="h-10 w-10" />
                <h1 className="text-4xl font-bold">LCM Lease Analysis</h1>
              </div>
              <p className="text-green-100 text-base max-w-2xl">
                Predictive lease risk scoring with early warnings and intelligent intervention recommendations
              </p>
            </div>
            <div className="flex items-center space-x-2">
              {leaseData.length > 0 && (
                <button
                  onClick={performAnalysis}
                  className="inline-flex items-center px-5 py-3 bg-white/10 hover:bg-white/20 text-white font-medium rounded-lg backdrop-blur-sm border border-white/20 transition-all duration-200"
                >
                  <BarChart3 className="h-5 w-5 mr-2" />
                  Analyze Risk
                </button>
              )}
              <button
                onClick={() => setShowUpload(!showUpload)}
                className="inline-flex items-center px-6 py-3 bg-white text-green-700 font-semibold rounded-lg shadow-md hover:shadow-xl transition-all duration-200 transform hover:scale-105 hover:bg-green-50"
              >
                <Upload className="h-5 w-5 mr-2" />
                Upload Data
              </button>
            </div>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl shadow-md hover:shadow-lg transition-shadow duration-200 p-6 border border-blue-200">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-xs font-semibold text-blue-600 uppercase tracking-wide mb-1">Total Leases</p>
                <p className="text-3xl font-bold text-blue-900">{leaseData.length}</p>
              </div>
              <div className="bg-blue-200 p-3 rounded-xl">
                <FileText className="h-7 w-7 text-blue-700" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl shadow-md hover:shadow-lg transition-shadow duration-200 p-6 border border-orange-200">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-xs font-semibold text-orange-600 uppercase tracking-wide mb-1">Expiring Soon</p>
                <p className="text-3xl font-bold text-orange-900">
                  {leaseData.filter(lease => {
                    const endDate = new Date(lease.endDate || lease.leaseEnd || lease.lease_end);
                    const monthsToExpiry = (endDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24 * 30);
                    return monthsToExpiry < 12 && monthsToExpiry > 0;
                  }).length}
                </p>
              </div>
              <div className="bg-orange-200 p-3 rounded-xl">
                <Calendar className="h-7 w-7 text-orange-700" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl shadow-md hover:shadow-lg transition-shadow duration-200 p-6 border border-green-200">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-xs font-semibold text-green-600 uppercase tracking-wide mb-1">Monthly Rent</p>
                <p className="text-3xl font-bold text-green-900">
                  {formatCurrency(leaseData.reduce((sum, lease) => sum + (lease.monthlyRent || lease.rent || lease.monthly_rent || 0), 0))}
                </p>
              </div>
              <div className="bg-green-200 p-3 rounded-xl">
                <DollarSign className="h-7 w-7 text-green-700" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl shadow-md hover:shadow-lg transition-shadow duration-200 p-6 border border-purple-200">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-xs font-semibold text-purple-600 uppercase tracking-wide mb-1">Avg Risk Score</p>
                <div className="flex items-baseline space-x-2">
                  <p className="text-3xl font-bold text-purple-900">
                    {analysisResults && analysisResults.risk_scores && analysisResults.risk_scores.length > 0 ? 
                      (analysisResults.risk_scores.reduce((sum: number, r: any) => sum + (r.lease_risk_score || 0), 0) / analysisResults.risk_scores.length).toFixed(1) : 
                      '--'
                    }
                  </p>
                  {(!analysisResults || !analysisResults.risk_scores) && leaseData.length > 0 && (
                    <span className="text-xs text-purple-600">Not analyzed</span>
                  )}
                </div>
              </div>
              <div className="bg-purple-200 p-3 rounded-xl">
                <TrendingUp className="h-7 w-7 text-purple-700" />
              </div>
            </div>
          </div>
        </div>

        {/* Compact Charts Section */}
        {leaseData.length > 0 && (
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 relative z-10">
            <div className="flex items-center space-x-2 mb-4">
              <BarChart3 className="h-5 w-5 text-green-600" />
              <h3 className="text-lg font-bold text-gray-900">Lease Analytics Overview</h3>
            </div>
            <div className="w-full">
              <LeaseAnalyticsCharts 
                leases={leaseData} 
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
                onClick={() => setActiveTab('overview')}
                className={`flex-1 px-4 py-3 text-sm font-semibold rounded-lg transition-all ${
                  activeTab === 'overview'
                    ? 'bg-gradient-to-r from-green-600 to-teal-600 text-white shadow-md'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <div className="flex items-center justify-center space-x-2">
                  <FileText className="h-4 w-4" />
                  <span>Lease Overview</span>
                  <span className="ml-1 text-xs bg-white/20 px-2 py-0.5 rounded-full">
                    {filteredLeases.length}
                  </span>
                </div>
              </button>
              
              {analysisResults && analysisResults.risk_scores && (
                <button
                  onClick={() => setActiveTab('risk-scores')}
                  className={`flex-1 px-4 py-3 text-sm font-semibold rounded-lg transition-all ${
                    activeTab === 'risk-scores'
                      ? 'bg-gradient-to-r from-green-600 to-teal-600 text-white shadow-md'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <div className="flex items-center justify-center space-x-2">
                    <AlertTriangle className="h-4 w-4" />
                    <span>Risk Scores</span>
                    <span className="ml-1 text-xs bg-white/20 px-2 py-0.5 rounded-full">
                      {analysisResults.risk_scores.length}
                    </span>
                  </div>
                </button>
              )}
              
              {analysisResults && analysisResults.recommended_actions && (
                <button
                  onClick={() => setActiveTab('recommendations')}
                  className={`flex-1 px-4 py-3 text-sm font-semibold rounded-lg transition-all ${
                    activeTab === 'recommendations'
                      ? 'bg-gradient-to-r from-green-600 to-teal-600 text-white shadow-md'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <div className="flex items-center justify-center space-x-2">
                    <CheckCircle className="h-4 w-4" />
                    <span>Recommendations</span>
                  </div>
                </button>
              )}
            </div>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div>
                {/* Search and Filter */}
                <div className="mb-4">
                  <SearchFilter
                    onSearch={handleSearch}
                    onFilter={handleFilter}
                    searchPlaceholder="Search leases by tenant, property, or lease ID..."
                    filters={{
                      status: {
                        label: 'Lease Status',
                        options: [
                          { value: 'Active', label: 'Active' },
                          { value: 'Expiring', label: 'Expiring' },
                          { value: 'Expired', label: 'Expired' }
                        ]
                      },
                      propertyType: {
                        label: 'Property Type',
                        options: [
                          { value: 'Office', label: 'Office' },
                          { value: 'Retail', label: 'Retail' },
                          { value: 'Industrial', label: 'Industrial' },
                          { value: 'Residential', label: 'Residential' }
                        ]
                      }
                    }}
                  />
                </div>

                {/* Analysis Summary Cards */}
                {analysisResults && analysisResults.risk_scores && analysisResults.risk_scores.length > 0 && (
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
                    <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                      <div className="text-xl font-bold text-red-600">
                        {analysisResults.risk_scores.filter((r: any) => r.risk_level === 'High').length}
                      </div>
                      <div className="text-xs text-red-700 font-medium">High Risk</div>
                    </div>
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                      <div className="text-xl font-bold text-yellow-600">
                        {analysisResults.risk_scores.filter((r: any) => r.risk_level === 'Medium').length}
                      </div>
                      <div className="text-xs text-yellow-700 font-medium">Medium Risk</div>
                    </div>
                    <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                      <div className="text-xl font-bold text-green-600">
                        {analysisResults.risk_scores.filter((r: any) => r.risk_level === 'Low').length}
                      </div>
                      <div className="text-xs text-green-700 font-medium">Low Risk</div>
                    </div>
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                      <div className="text-xl font-bold text-blue-600">
                        {(analysisResults.risk_scores.reduce((sum: number, r: any) => sum + (r.lease_risk_score || 0), 0) / analysisResults.risk_scores.length).toFixed(1)}
                      </div>
                      <div className="text-xs text-blue-700 font-medium">Avg Risk Score</div>
                    </div>
                  </div>
                )}

                {/* Lease Overview Table */}
                <div className="overflow-x-auto">
            {filteredLeases.length === 0 ? (
              <div className="px-6 py-12 text-center">
                <div className="flex flex-col items-center justify-center">
                  <div className="bg-gray-100 rounded-full p-4 mb-4">
                    <FileText className="h-12 w-12 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No Leases Found</h3>
                  <p className="text-sm text-gray-500 mb-4">
                    {searchQuery || Object.keys(filters).length > 0 
                      ? 'Try adjusting your search or filters' 
                      : 'Upload lease data to get started'}
                  </p>
                  {!searchQuery && Object.keys(filters).length === 0 && (
                    <button
                      onClick={() => setShowUpload(true)}
                      className="inline-flex items-center px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors"
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Upload Lease Data
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-5 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                      Property
                    </th>
                    <th className="px-5 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                      Tenant
                    </th>
                    <th className="px-5 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                      Lease Term
                    </th>
                    <th className="px-5 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                      Monthly Rent
                    </th>
                    <th className="px-5 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                      Escalation
                    </th>
                    <th className="px-5 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                      Options
                    </th>
                    <th className="px-5 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                  {filteredLeases.map((lease) => {
                    // Map database fields to display fields
                    const startDate = new Date(lease.startDate || lease.leaseStart || lease.lease_start);
                    const endDate = new Date(lease.endDate || lease.leaseEnd || lease.lease_end);
                    const rent = lease.monthlyRent || lease.rent || lease.monthly_rent || 0;
                    const tenantName = lease.tenantName || lease.tenant || lease.tenant_name || 'N/A';
                    const propertyName = lease.propertyName || lease.property_name || `Property ${lease.propertyId}`;
                    const escalation = lease.escalationRate || lease.escalation || lease.escalation_rate || 0;
                    const status = lease.leaseStatus || lease.status || lease.lease_status || 'Active';
                    
                    const monthsToExpiry = (endDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24 * 30);
                    const isExpiringSoon = monthsToExpiry < 12 && monthsToExpiry > 0;
                    
                    return (
                      <tr key={lease.id} className={`hover:bg-green-50 transition-colors duration-150 ${isExpiringSoon ? 'bg-orange-50' : ''}`}>
                        <td className="px-5 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <Building2 className="h-5 w-5 text-gray-400 mr-3" />
                            <div>
                              <div className="text-sm font-semibold text-gray-900">{propertyName}</div>
                              <div className="text-xs text-gray-500">ID: {lease.propertyId}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-4 whitespace-nowrap text-sm font-medium text-gray-700">
                          {tenantName}
                        </td>
                        <td className="px-5 py-4 whitespace-nowrap text-sm text-gray-700">
                          <div>
                            <div className="text-sm font-medium">
                              {isNaN(startDate.getTime()) ? 'N/A' : startDate.toLocaleDateString()}
                            </div>
                            <div className="text-xs text-gray-500">
                              to {isNaN(endDate.getTime()) ? 'N/A' : endDate.toLocaleDateString()}
                            </div>
                            {isExpiringSoon && !isNaN(monthsToExpiry) && (
                              <div className="text-xs text-orange-600 font-semibold mt-1">
                                <AlertTriangle className="h-3 w-3 inline mr-1" />
                                Expires in {Math.round(monthsToExpiry)} mo
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-5 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                          {formatCurrency(rent)}
                        </td>
                        <td className="px-5 py-4 whitespace-nowrap text-sm text-gray-700">
                          <span className="inline-flex items-center px-2 py-1 rounded-md bg-blue-50 text-blue-700 text-xs font-medium">
                            {escalation}%
                          </span>
                        </td>
                        <td className="px-5 py-4 whitespace-nowrap text-xs">
                          <div className="flex flex-col space-y-1">
                            {lease.renewalOption && (
                              <span className="inline-flex items-center text-green-600">
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Renewal
                              </span>
                            )}
                            {lease.breakClause && (
                              <span className="inline-flex items-center text-orange-600">
                                <AlertTriangle className="h-3 w-3 mr-1" />
                                Break
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-5 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border ${getStatusColor(status)}`}>
                            {status}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
                </div>
              </div>
            )}

            {/* Risk Scores Tab */}
            {activeTab === 'risk-scores' && analysisResults && analysisResults.risk_scores && (
              <div>
                <div className="mb-4">
                  <h3 className="text-lg font-bold text-gray-900 mb-3">Detailed Risk Scores</h3>
                </div>
                
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase">Property</th>
                        <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase">Risk Score</th>
                        <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase">Risk Level</th>
                        <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase">Action</th>
                        <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase">EPC</th>
                        <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase">Void</th>
                        <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase">Rent</th>
                        <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase">Demand</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-100">
                      {analysisResults.risk_scores.map((risk: any, idx: number) => (
                        <tr key={idx} className={`hover:bg-gray-50 ${
                          risk.risk_level === 'High' ? 'bg-red-50' : 
                          risk.risk_level === 'Medium' ? 'bg-yellow-50' : 
                          'bg-green-50'
                        }`}>
                          <td className="px-4 py-3 whitespace-nowrap text-sm font-semibold text-gray-900">
                            {risk.property_id}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <div className="flex items-center space-x-2">
                              <span className="text-lg font-bold text-gray-900">
                                {(risk.lease_risk_score || 0).toFixed(1)}
                              </span>
                              <span className="text-xs text-gray-500">/100</span>
                            </div>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-bold border ${
                              risk.risk_level === 'High' ? 'bg-red-100 text-red-700 border-red-200' :
                              risk.risk_level === 'Medium' ? 'bg-yellow-100 text-yellow-700 border-yellow-200' :
                              'bg-green-100 text-green-700 border-green-200'
                            }`}>
                              {risk.risk_level}
                            </span>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-700">
                            {risk.recommended_action}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                            {risk.epc_score.toFixed(0)}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                            {risk.void_score.toFixed(1)}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                            {risk.rent_score.toFixed(1)}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                            {risk.local_demand_index.toFixed(0)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Recommendations Tab */}
            {activeTab === 'recommendations' && analysisResults && (
              <div>
                <div className="mb-4">
                  <h3 className="text-lg font-bold text-gray-900 mb-3">Smart Recommendations</h3>
                </div>
                
                {/* Intervention Priorities */}
                {analysisResults.intervention_priorities && analysisResults.intervention_priorities.length > 0 && (
                  <div className="mb-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="text-md font-bold text-gray-900 mb-3 flex items-center">
                      <AlertTriangle className="h-5 w-5 text-blue-600 mr-2" />
                      Top Intervention Priorities
                    </h4>
                    <ul className="space-y-2">
                      {analysisResults.intervention_priorities.map((priority: string, idx: number) => (
                        <li key={idx} className="text-sm text-gray-700">{priority}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Risk Analysis Cards */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="bg-gradient-to-br from-white to-gray-50 rounded-xl shadow-lg p-6 border border-gray-200">
            <div className="flex items-center space-x-2 mb-5">
              <TrendingUp className="h-5 w-5 text-green-600" />
              <h3 className="text-lg font-bold text-gray-900">Lease Risk Factors</h3>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200">
                <span className="text-sm font-medium text-gray-700">Renewal Options</span>
                <div className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                  <span className="text-sm font-bold text-gray-900">
                    {leaseData.filter(l => l.renewalOption).length}/{leaseData.length} leases
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200">
                <span className="text-sm font-medium text-gray-700">Break Clauses</span>
                <div className="flex items-center">
                  <AlertTriangle className="h-5 w-5 text-orange-500 mr-2" />
                  <span className="text-sm font-bold text-gray-900">
                    {leaseData.filter(l => l.breakClause).length}/{leaseData.length} leases
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200">
                <span className="text-sm font-medium text-gray-700">High Escalation (&gt;4%)</span>
                <div className="flex items-center">
                  <TrendingUp className="h-5 w-5 text-blue-500 mr-2" />
                  <span className="text-sm font-bold text-gray-900">
                    {leaseData.filter(l => (l.escalationRate || l.escalation || l.escalation_rate || 0) > 4).length}/{leaseData.length} leases
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200">
                <span className="text-sm font-medium text-gray-700">Expiring Soon (&lt;12mo)</span>
                <div className="flex items-center">
                  <Calendar className="h-5 w-5 text-red-500 mr-2" />
                  <span className="text-sm font-bold text-gray-900">
                    {leaseData.filter(lease => {
                      const endDate = new Date(lease.endDate || lease.leaseEnd || lease.lease_end);
                      const monthsToExpiry = (endDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24 * 30);
                      return monthsToExpiry < 12 && monthsToExpiry > 0;
                    }).length}/{leaseData.length} leases
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-white to-blue-50 rounded-xl shadow-lg p-6 border border-blue-200">
            <div className="flex items-center space-x-2 mb-5">
              <CheckCircle className="h-5 w-5 text-blue-600" />
              <h3 className="text-lg font-bold text-gray-900">Smart Recommendations</h3>
            </div>
            <div className="space-y-3">
              {leaseData.filter(lease => {
                const endDate = new Date(lease.endDate || lease.leaseEnd || lease.lease_end);
                const monthsToExpiry = (endDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24 * 30);
                return monthsToExpiry < 12 && monthsToExpiry > 0;
              }).slice(0, 3).map((lease, idx) => {
                const propertyName = lease.propertyName || lease.property_name || `Property ${lease.propertyId}`;
                const endDate = new Date(lease.endDate || lease.leaseEnd || lease.lease_end);
                return (
                  <div key={idx} className="flex items-start p-3 bg-white rounded-lg border border-orange-200 hover:border-orange-300 transition-colors">
                    <AlertTriangle className="h-5 w-5 text-orange-500 mr-3 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{propertyName}</p>
                      <p className="text-xs text-gray-600 mt-1">
                        Lease expires {isNaN(endDate.getTime()) ? 'soon' : endDate.toLocaleDateString()}. 
                        Start renewal negotiations now.
                      </p>
                    </div>
                  </div>
                );
              })}
              {analysisResults && analysisResults.recommended_actions && analysisResults.recommended_actions
                .filter((action: any) => action.priority === 'High')
                .slice(0, 2).map((action: any, idx: number) => (
                <div key={idx} className="flex items-start p-3 bg-white rounded-lg border border-red-200 hover:border-red-300 transition-colors">
                  <AlertTriangle className="h-5 w-5 text-red-500 mr-3 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{action.property_id}</p>
                    <p className="text-xs text-gray-600 mt-1">
                      {action.recommended_action} - {action.timeline}
                    </p>
                  </div>
                </div>
              ))}
              {(!leaseData.length || (leaseData.filter(lease => {
                const endDate = new Date(lease.endDate || lease.leaseEnd || lease.lease_end);
                const monthsToExpiry = (endDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24 * 30);
                return monthsToExpiry < 12 && monthsToExpiry > 0;
              }).length === 0 && (!analysisResults || !analysisResults.recommended_actions || analysisResults.recommended_actions.filter((a: any) => a.priority === 'High').length === 0))) && (
                <div className="flex items-start p-3 bg-white rounded-lg border border-green-200">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-semibold text-gray-900">Portfolio Healthy</p>
                    <p className="text-xs text-gray-600 mt-1">
                      No immediate actions required. Continue monitoring lease performance.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
                </div>
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
          onUploadSuccess={fetchLeaseData}
          module={leaseModule}
        />
      )}
    </DashboardLayout>
  );
}
