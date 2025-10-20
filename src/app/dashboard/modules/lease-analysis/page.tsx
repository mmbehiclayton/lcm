'use client';

import { useState, useEffect } from 'react';
import { FileText, Calendar, DollarSign, TrendingUp, AlertTriangle, CheckCircle, Building2, Upload, X, Download } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { UploadModal } from '@/components/modals/UploadModal';
import { SearchFilter } from '@/components/common/SearchFilter';
import { LeaseAnalyticsCharts } from '@/components/charts/LeaseAnalyticsCharts';

export default function LeaseAnalysisPage() {
  const [selectedProperty, setSelectedProperty] = useState<string | null>(null);
  const [leaseData, setLeaseData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showUpload, setShowUpload] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [filteredLeases, setFilteredLeases] = useState<any[]>([]);
  const [uploading, setUploading] = useState(false);

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
      // For now, we'll use mock data since we don't have lease-specific data in our schema
      // In a real implementation, you'd fetch from a leases table
      const mockData = [
        {
          id: 'lease-001',
          propertyId: 'prop-001',
          propertyName: 'Downtown Office Tower',
          tenant: 'TechCorp Inc.',
          leaseStart: '2020-01-01',
          leaseEnd: '2025-12-31',
          rent: 45000,
          escalation: 3.5,
          renewalOption: true,
          breakClause: false,
          status: 'Active',
          riskScore: 75
        },
        {
          id: 'lease-002',
          propertyId: 'prop-002',
          propertyName: 'Retail Plaza Center',
          tenant: 'Fashion Store LLC',
          leaseStart: '2019-06-01',
          leaseEnd: '2024-05-31',
          rent: 28000,
          escalation: 2.5,
          renewalOption: true,
          breakClause: true,
          status: 'Active',
          riskScore: 60
        },
        {
          id: 'lease-003',
          propertyId: 'prop-003',
          propertyName: 'Industrial Warehouse Complex',
          tenant: 'Logistics Pro',
          leaseStart: '2021-03-01',
          leaseEnd: '2026-02-28',
          rent: 35000,
          escalation: 4.0,
          renewalOption: false,
          breakClause: false,
          status: 'Active',
          riskScore: 85
        }
      ];
      
      setLeaseData(mockData);
    } catch (error) {
      console.error('Error fetching lease data:', error);
    } finally {
      setIsLoading(false);
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


  return (
    <DashboardLayout>
      <div>
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">LCM Lease Analysis</h1>
              <p className="mt-2 text-gray-600">Analyze lease terms, renewal risks, and tenant performance across your portfolio</p>
            </div>
                  <div className="flex space-x-3">
                    <Button
                      onClick={() => setShowUpload(!showUpload)}
                      className="inline-flex items-center px-4 py-2"
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Upload Lease Data
                    </Button>
                  </div>
          </div>
        </div>

        {/* Upload Modal */}
        <UploadModal
          isOpen={showUpload}
          onClose={() => setShowUpload(false)}
          module={{
            id: 'lease-analysis',
            name: 'Lease Analysis',
            color: 'green',
            templateUrl: '/api/templates/lease-analysis',
            templateName: 'lease_analysis_template.csv',
            requiredFields: [
              'Lease ID (unique identifier)',
              'Property ID (reference to property)',
              'Tenant Name',
              'Lease Start Date',
              'Lease End Date',
              'Monthly Rent',
              'Annual Escalation Rate (%)',
              'Security Deposit',
              'Renewal Option (Yes/No)',
              'Break Clause (Yes/No)',
              'Tenant Credit Rating',
              'Lease Status (Active/Expired/Pending)'
            ]
          }}
          onUploadSuccess={() => fetchLeaseData()}
        />

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <FileText className="h-8 w-8 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Leases</p>
                <p className="text-2xl font-semibold text-gray-900">{leaseData.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Calendar className="h-8 w-8 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Expiring Soon</p>
                <p className="text-2xl font-semibold text-gray-900">2</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <DollarSign className="h-8 w-8 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Rent</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {formatCurrency(leaseData.reduce((sum, lease) => sum + lease.rent, 0))}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <TrendingUp className="h-8 w-8 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Avg Risk Score</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {Math.round(leaseData.reduce((sum, lease) => sum + lease.riskScore, 0) / leaseData.length)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filter */}
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

        {/* Lease Analytics Charts */}
        <LeaseAnalyticsCharts 
          leases={leaseData} 
          analysis={null} 
        />

        {/* Lease Analysis Table */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Lease Portfolio Analysis</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Property
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tenant
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Lease Term
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Monthly Rent
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Escalation
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Risk Score
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredLeases.map((lease) => (
                  <tr key={lease.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Building2 className="h-5 w-5 text-gray-400 mr-3" />
                        <div>
                          <div className="text-sm font-medium text-gray-900">{lease.propertyName}</div>
                          <div className="text-sm text-gray-500">ID: {lease.propertyId}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {lease.tenant}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div>
                        <div className="text-sm">{new Date(lease.leaseStart).toLocaleDateString()}</div>
                        <div className="text-sm text-gray-500">to {new Date(lease.leaseEnd).toLocaleDateString()}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatCurrency(lease.rent)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {lease.escalation}%
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRiskColor(lease.riskScore)}`}>
                        {lease.riskScore}/100
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(lease.status)}`}>
                        {lease.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Risk Analysis */}
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Lease Risk Factors</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Renewal Options</span>
                <div className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  <span className="text-sm text-gray-900">2/3 leases</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Break Clauses</span>
                <div className="flex items-center">
                  <AlertTriangle className="h-4 w-4 text-yellow-500 mr-2" />
                  <span className="text-sm text-gray-900">1/3 leases</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">High Escalation</span>
                <div className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  <span className="text-sm text-gray-900">1/3 leases</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Recommendations</h3>
            <div className="space-y-3">
              <div className="flex items-start">
                <AlertTriangle className="h-5 w-5 text-yellow-500 mr-3 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Retail Plaza Center</p>
                  <p className="text-sm text-gray-600">Consider lease renewal negotiations 6 months before expiry</p>
                </div>
              </div>
              <div className="flex items-start">
                <CheckCircle className="h-5 w-5 text-green-500 mr-3 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Industrial Warehouse</p>
                  <p className="text-sm text-gray-600">Strong lease terms with good renewal potential</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
