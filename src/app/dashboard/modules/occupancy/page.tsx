'use client';

import { useState, useEffect } from 'react';
import { Building2, Users, TrendingUp, AlertTriangle, Calendar, DollarSign, MapPin, Upload, X, Download } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { UploadModal } from '@/components/modals/UploadModal';
import { SearchFilter } from '@/components/common/SearchFilter';
import { OccupancyAnalyticsCharts } from '@/components/charts/OccupancyAnalyticsCharts';

export default function OccupancyPage() {
  const [selectedPeriod, setSelectedPeriod] = useState('12m');
  const [occupancyData, setOccupancyData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showUpload, setShowUpload] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [filteredOccupancy, setFilteredOccupancy] = useState<any[]>([]);

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
      
      // Fetch real property data from database
      const response = await fetch('/api/occupancy/data');
      if (response.ok) {
        const data = await response.json();
        setOccupancyData(data);
      } else {
        // Fallback to mock data
        const mockData = [
          {
            propertyId: 'prop-001',
            propertyName: 'Downtown Office Tower',
            location: 'New York, NY',
            type: 'Office',
            totalUnits: 120,
            occupiedUnits: 114,
            occupancyRate: 95.0,
            avgRent: 4500,
            totalRevenue: 513000,
            vacantUnits: 6,
            leaseExpirations: 8,
            riskLevel: 'Low'
          },
          {
            propertyId: 'prop-002',
            propertyName: 'Retail Plaza Center',
            location: 'Los Angeles, CA',
            type: 'Retail',
            totalUnits: 45,
            occupiedUnits: 40,
            occupancyRate: 88.9,
            avgRent: 3200,
            totalRevenue: 128000,
            vacantUnits: 5,
            leaseExpirations: 3,
            riskLevel: 'Medium'
          },
          {
            propertyId: 'prop-003',
            propertyName: 'Industrial Warehouse Complex',
            location: 'Chicago, IL',
            type: 'Industrial',
            totalUnits: 8,
            occupiedUnits: 8,
            occupancyRate: 100.0,
            avgRent: 15000,
            totalRevenue: 120000,
            vacantUnits: 0,
            leaseExpirations: 1,
            riskLevel: 'Low'
          },
          {
            propertyId: 'prop-004',
            propertyName: 'Luxury Apartment Building',
            location: 'Miami, FL',
            type: 'Residential',
            totalUnits: 200,
            occupiedUnits: 184,
            occupancyRate: 92.0,
            avgRent: 2800,
            totalRevenue: 515200,
            vacantUnits: 16,
            leaseExpirations: 12,
            riskLevel: 'Medium'
          }
        ];
        setOccupancyData(mockData);
      }
    } catch (error) {
      console.error('Error fetching occupancy data:', error);
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

  const getOccupancyColor = (rate: number) => {
    if (rate >= 95) return 'text-green-600';
    if (rate >= 85) return 'text-yellow-600';
    return 'text-red-600';
  };

  const totalUnits = occupancyData.reduce((sum, prop) => sum + prop.totalUnits, 0);
  const occupiedUnits = occupancyData.reduce((sum, prop) => sum + prop.occupiedUnits, 0);
  const overallOccupancy = (occupiedUnits / totalUnits) * 100;
  const totalRevenue = occupancyData.reduce((sum, prop) => sum + prop.totalRevenue, 0);

  const handleOccupancyUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('module', 'occupancy');

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        toast.success('Occupancy data uploaded successfully!');
        setShowUpload(false);
        // Refresh the page data
        fetchOccupancyData();
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || 'Upload failed');
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const handleFilter = (newFilters: Record<string, string>) => {
    setFilters(newFilters);
  };
  const vacantUnits = occupancyData.reduce((sum, prop) => sum + prop.vacantUnits, 0);

  return (
    <DashboardLayout>
      <div>
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">LCM Occupancy</h1>
              <p className="mt-2 text-gray-600">Monitor occupancy rates, tenant retention, and revenue optimization across your portfolio</p>
            </div>
                  <div className="flex space-x-3">
                    <Button
                      onClick={() => setShowUpload(!showUpload)}
                      className="inline-flex items-center px-4 py-2"
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Upload Occupancy Data
                    </Button>
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="3m">Last 3 months</option>
                <option value="6m">Last 6 months</option>
                <option value="12m">Last 12 months</option>
                <option value="24m">Last 24 months</option>
              </select>
            </div>
          </div>
        </div>

        {/* Upload Modal */}
        <UploadModal
          isOpen={showUpload}
          onClose={() => setShowUpload(false)}
          module={{
            id: 'occupancy',
            name: 'Occupancy',
            color: 'orange',
            templateUrl: '/api/templates/occupancy',
            templateName: 'occupancy_template.csv',
            requiredFields: [
              'Property ID (unique identifier)',
              'Property Name',
              'Property Type (Office/Retail/Industrial/Residential)',
              'Location',
              'Total Units',
              'Occupied Units',
              'Occupancy Rate (%)',
              'Average Rent per Unit',
              'Total Monthly Revenue',
              'Vacant Units',
              'Lease Expirations (next 12 months)',
              'Risk Level (Low/Medium/High)'
            ]
          }}
          onUploadSuccess={() => fetchOccupancyData()}
        />

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Building2 className="h-8 w-8 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Overall Occupancy</p>
                <p className={`text-2xl font-semibold ${getOccupancyColor(overallOccupancy)}`}>
                  {overallOccupancy.toFixed(1)}%
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Users className="h-8 w-8 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Units</p>
                <p className="text-2xl font-semibold text-gray-900">{totalUnits}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <AlertTriangle className="h-8 w-8 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Vacant Units</p>
                <p className="text-2xl font-semibold text-gray-900">{vacantUnits}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <DollarSign className="h-8 w-8 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Monthly Revenue</p>
                <p className="text-2xl font-semibold text-gray-900">{formatCurrency(totalRevenue)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Occupancy Analysis */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Occupancy by Property Type</h3>
            <div className="space-y-4">
              {['Office', 'Retail', 'Industrial', 'Residential'].map((type) => {
                const typeData = occupancyData.filter(prop => prop.type === type);
                const typeOccupancy = typeData.length > 0 
                  ? (typeData.reduce((sum, prop) => sum + prop.occupiedUnits, 0) / typeData.reduce((sum, prop) => sum + prop.totalUnits, 0)) * 100
                  : 0;
                return (
                  <div key={type}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600">{type}</span>
                      <span className={`font-medium ${getOccupancyColor(typeOccupancy)}`}>
                        {typeOccupancy.toFixed(1)}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${
                          typeOccupancy >= 95 ? 'bg-green-600' :
                          typeOccupancy >= 85 ? 'bg-yellow-600' : 'bg-red-600'
                        }`}
                        style={{ width: `${typeOccupancy}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Risk Assessment</h3>
            <div className="space-y-4">
              {occupancyData.map((property) => (
                <div key={property.propertyId} className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{property.propertyName}</p>
                    <p className="text-xs text-gray-500">{property.type} • {property.location}</p>
                  </div>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRiskColor(property.riskLevel)}`}>
                    {property.riskLevel}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Lease Expirations</h3>
            <div className="space-y-4">
              {occupancyData.map((property) => (
                <div key={property.propertyId} className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{property.propertyName}</p>
                    <p className="text-xs text-gray-500">{property.leaseExpirations} expiring soon</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">{property.occupancyRate.toFixed(1)}%</p>
                    <p className="text-xs text-gray-500">occupancy</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
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
            },
            location: {
              label: 'Location',
              options: [
                { value: 'New York', label: 'New York' },
                { value: 'Los Angeles', label: 'Los Angeles' },
                { value: 'Chicago', label: 'Chicago' },
                { value: 'Miami', label: 'Miami' },
                { value: 'Boston', label: 'Boston' }
              ]
            }
          }}
        />

        {/* Occupancy Analytics Charts */}
        <OccupancyAnalyticsCharts 
          occupancyData={occupancyData} 
          analysis={null} 
        />

        {/* Properties Table */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Property Occupancy Details</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Property
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Units
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Occupancy Rate
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Avg Rent
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Monthly Revenue
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Risk Level
                  </th>
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
