'use client';

import React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  AreaChart,
  Area,
} from 'recharts';

interface OccupancyAnalyticsChartsProps {
  occupancyData: any[];
  analysis?: any;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

export function OccupancyAnalyticsCharts({ occupancyData, analysis }: OccupancyAnalyticsChartsProps) {
  // Prepare data for charts
  const occupancyRateData = occupancyData.map(property => ({
    name: property.propertyName?.substring(0, 15) + '...' || 'Property',
    occupancyRate: (property.occupancyRate || 0) * 100,
    totalUnits: property.totalUnits || 0,
    occupiedUnits: property.occupiedUnits || 0,
    vacantUnits: property.vacantUnits || 0
  }));

  const riskLevelData = occupancyData.reduce((acc, property) => {
    const risk = property.riskLevel || 'Medium';
    const existing = acc.find(item => item.name === risk);
    if (existing) {
      existing.value += 1;
      existing.totalRevenue += property.totalRevenue || 0;
    } else {
      acc.push({
        name: risk,
        value: 1,
        totalRevenue: property.totalRevenue || 0
      });
    }
    return acc;
  }, []);

  const revenueByPropertyData = occupancyData.map(property => ({
    name: property.propertyName?.substring(0, 15) + '...' || 'Property',
    totalRevenue: property.totalRevenue || 0,
    averageRent: property.averageRent || 0,
    occupiedUnits: property.occupiedUnits || 0,
    occupancyRate: (property.occupancyRate || 0) * 100
  }));

  const unitDistributionData = occupancyData.map(property => ({
    name: property.propertyName?.substring(0, 10) + '...' || 'Property',
    occupied: property.occupiedUnits || 0,
    vacant: property.vacantUnits || 0,
    total: property.totalUnits || 0
  }));

  const locationOccupancyData = occupancyData.reduce((acc, property) => {
    const location = property.location || 'Unknown';
    const existing = acc.find(item => item.name === location);
    if (existing) {
      existing.occupancyRate += (property.occupancyRate || 0) * 100;
      existing.count += 1;
      existing.totalRevenue += property.totalRevenue || 0;
    } else {
      acc.push({
        name: location,
        occupancyRate: (property.occupancyRate || 0) * 100,
        count: 1,
        totalRevenue: property.totalRevenue || 0
      });
    }
    return acc;
  }, []).map(item => ({
    ...item,
    occupancyRate: item.occupancyRate / item.count
  }));

  const leaseExpirationData = occupancyData.map(property => ({
    name: property.propertyName?.substring(0, 10) + '...' || 'Property',
    leaseExpirations: property.leaseExpirations || 0,
    occupiedUnits: property.occupiedUnits || 0,
    riskLevel: property.riskLevel || 'Medium'
  }));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
      {/* Occupancy Rate by Property */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Occupancy Rate by Property</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={occupancyRateData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis tickFormatter={(value) => `${value}%`} />
            <Tooltip formatter={(value) => [`${value.toFixed(1)}%`, 'Occupancy Rate']} />
            <Bar dataKey="occupancyRate" fill="#00C49F" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Risk Level Distribution */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Risk Level Distribution</h3>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={riskLevelData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={80}
              fill="#8884d8"
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
            >
              {riskLevelData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip formatter={(value, name) => [`${value} properties`, name]} />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Revenue Analysis by Property */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue Analysis by Property</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={revenueByPropertyData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis tickFormatter={(value) => `$${(value / 1000).toFixed(0)}K`} />
            <Tooltip formatter={(value) => [`$${value.toLocaleString()}`, 'Total Revenue']} />
            <Bar dataKey="totalRevenue" fill="#0088FE" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Unit Distribution */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Unit Distribution (Occupied vs Vacant)</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={unitDistributionData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="occupied" stackId="a" fill="#00C49F" name="Occupied Units" />
            <Bar dataKey="vacant" stackId="a" fill="#FF8042" name="Vacant Units" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Occupancy by Location */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Average Occupancy by Location</h3>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={locationOccupancyData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis tickFormatter={(value) => `${value}%`} />
            <Tooltip formatter={(value) => [`${value.toFixed(1)}%`, 'Average Occupancy']} />
            <Area 
              type="monotone" 
              dataKey="occupancyRate" 
              stroke="#8884d8" 
              fill="#8884d8" 
              fillOpacity={0.6}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Lease Expiration Analysis */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Lease Expiration Analysis</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={leaseExpirationData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="leaseExpirations" 
              stroke="#FF8042" 
              strokeWidth={2}
              name="Lease Expirations"
            />
            <Line 
              type="monotone" 
              dataKey="occupiedUnits" 
              stroke="#00C49F" 
              strokeWidth={2}
              name="Occupied Units"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
