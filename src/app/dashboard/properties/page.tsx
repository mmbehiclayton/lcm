'use client';

import { useState } from 'react';
import { Building2, MapPin, DollarSign, TrendingUp, Calendar, Star, Filter, Search } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';

export default function DashboardPropertiesPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [sortBy, setSortBy] = useState('name');

  const properties = [
    {
      id: 'prop-001',
      name: 'Downtown Office Tower',
      type: 'Office',
      location: 'New York, NY',
      value: 25000000,
      noi: 1800000,
      occupancy: 0.85,
      purchaseDate: '2020-03-15',
      performance: 'A+',
      status: 'Active'
    },
    {
      id: 'prop-002',
      name: 'Retail Plaza Center',
      type: 'Retail',
      location: 'Los Angeles, CA',
      value: 12000000,
      noi: 960000,
      occupancy: 0.92,
      purchaseDate: '2019-08-20',
      performance: 'B+',
      status: 'Active'
    },
    {
      id: 'prop-003',
      name: 'Industrial Warehouse Complex',
      type: 'Industrial',
      location: 'Chicago, IL',
      value: 8500000,
      noi: 680000,
      occupancy: 0.78,
      purchaseDate: '2021-01-10',
      performance: 'A',
      status: 'Active'
    },
    {
      id: 'prop-004',
      name: 'Residential Apartment Building',
      type: 'Residential',
      location: 'Miami, FL',
      value: 15000000,
      noi: 1200000,
      occupancy: 0.95,
      purchaseDate: '2018-11-05',
      performance: 'A-',
      status: 'Active'
    },
    {
      id: 'prop-005',
      name: 'Mixed-Use Development',
      type: 'Office',
      location: 'Seattle, WA',
      value: 32000000,
      noi: 2560000,
      occupancy: 0.88,
      purchaseDate: '2020-06-12',
      performance: 'A+',
      status: 'Active'
    }
  ];

  const filteredProperties = properties.filter(property => {
    const matchesSearch = property.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         property.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterType === 'all' || property.type.toLowerCase() === filterType.toLowerCase();
    return matchesSearch && matchesFilter;
  });

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

  const getPerformanceColor = (grade: string) => {
    switch (grade) {
      case 'A+':
      case 'A':
        return 'text-green-600 bg-green-100';
      case 'A-':
      case 'B+':
        return 'text-blue-600 bg-blue-100';
      case 'B':
        return 'text-yellow-600 bg-yellow-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'Office':
        return 'bg-blue-100 text-blue-800';
      case 'Retail':
        return 'bg-green-100 text-green-800';
      case 'Industrial':
        return 'bg-purple-100 text-purple-800';
      case 'Residential':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <DashboardLayout>
      <div>
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Properties</h1>
          <p className="mt-2 text-gray-600">Manage and view all your real estate properties</p>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search properties..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
            <div className="flex gap-4">
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Types</option>
                <option value="office">Office</option>
                <option value="retail">Retail</option>
                <option value="industrial">Industrial</option>
                <option value="residential">Residential</option>
              </select>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="name">Sort by Name</option>
                <option value="value">Sort by Value</option>
                <option value="noi">Sort by NOI</option>
                <option value="occupancy">Sort by Occupancy</option>
              </select>
            </div>
          </div>
        </div>

        {/* Properties Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProperties.map((property) => (
            <div key={property.id} className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow">
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{property.name}</h3>
                    <p className="text-sm text-gray-500">ID: {property.id}</p>
                  </div>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTypeColor(property.type)}`}>
                    {property.type}
                  </span>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center text-sm text-gray-600">
                    <MapPin className="h-4 w-4 mr-2" />
                    {property.location}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-gray-500">Value</p>
                      <p className="text-sm font-medium text-gray-900">{formatCurrency(property.value)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">NOI</p>
                      <p className="text-sm font-medium text-gray-900">{formatCurrency(property.noi)}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-gray-500">Occupancy</p>
                      <div className="flex items-center">
                        <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                          <div 
                            className="bg-green-600 h-2 rounded-full" 
                            style={{ width: `${property.occupancy * 100}%` }}
                          ></div>
                        </div>
                        <span className="text-sm text-gray-900">{formatPercentage(property.occupancy)}</span>
                      </div>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Performance</p>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getPerformanceColor(property.performance)}`}>
                        {property.performance}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center text-sm text-gray-600">
                    <Calendar className="h-4 w-4 mr-2" />
                    Purchased: {new Date(property.purchaseDate).toLocaleDateString()}
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">Status</span>
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      {property.status}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredProperties.length === 0 && (
          <div className="text-center py-12">
            <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No properties found</h3>
            <p className="text-gray-500">Try adjusting your search or filter criteria.</p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
