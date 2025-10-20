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
    occupancyRate: property.occupancyRate || 0,
    totalUnits: property.totalUnits || 0,
    occupiedUnits: property.occupiedUnits || 0,
    vacantUnits: property.vacantUnits || 0
  }));

  // Utilization Classification Data (from analysis if available)
  const utilizationData = analysis?.summary ? [
    { name: 'Efficient', value: analysis.summary.efficient_count || 0, color: '#10B981' },
    { name: 'Underutilised', value: analysis.summary.underutilised_count || 0, color: '#F59E0B' },
    { name: 'Overcrowded', value: analysis.summary.overcrowded_count || 0, color: '#EF4444' }
  ].filter(item => item.value > 0) : [];

  const riskLevelData = occupancyData.reduce((acc, property) => {
    const risk = property.riskLevel || 'Medium';
    const existing = acc.find((item: any) => item.name === risk);
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
    const existing = acc.find((item: any) => item.name === location);
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
  }, []).map((item: any) => ({
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
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-8">
      {/* Utilization Classification (NEW) */}
      {utilizationData.length > 0 && (
        <div className="bg-gray-50 rounded-lg border border-gray-200 p-4">
          <h3 className="text-sm font-semibold text-gray-900 mb-3">Utilization Classification</h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={utilizationData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={60}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                {utilizationData.map((entry: any, index: number) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(value, name) => [`${value} properties`, name]} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Occupancy Rate by Property */}
      <div className="bg-gray-50 rounded-lg border border-gray-200 p-4">
        <h3 className="text-sm font-semibold text-gray-900 mb-3">Occupancy Rate by Property</h3>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={occupancyRateData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis tickFormatter={(value) => `${value}%`} />
            <Tooltip formatter={(value) => [`${Number(value).toFixed(1)}%`, 'Occupancy Rate']} />
            <Bar dataKey="occupancyRate" fill="#00C49F" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Risk Level Distribution */}
      <div className="bg-gray-50 rounded-lg border border-gray-200 p-4">
        <h3 className="text-sm font-semibold text-gray-900 mb-3">Risk Level Distribution</h3>
        <ResponsiveContainer width="100%" height={200}>
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
              {riskLevelData.map((entry: any, index: number) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip formatter={(value, name) => [`${value} properties`, name]} />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Revenue Analysis by Property */}
      <div className="bg-gray-50 rounded-lg border border-gray-200 p-4">
        <h3 className="text-sm font-semibold text-gray-900 mb-3">Revenue Analysis by Property</h3>
        <ResponsiveContainer width="100%" height={200}>
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
      <div className="bg-gray-50 rounded-lg border border-gray-200 p-4">
        <h3 className="text-sm font-semibold text-gray-900 mb-3">Unit Distribution (Occupied vs Vacant)</h3>
        <ResponsiveContainer width="100%" height={200}>
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
      <div className="bg-gray-50 rounded-lg border border-gray-200 p-4">
        <h3 className="text-sm font-semibold text-gray-900 mb-3">Average Occupancy by Location</h3>
        <ResponsiveContainer width="100%" height={200}>
          <AreaChart data={locationOccupancyData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis tickFormatter={(value) => `${value}%`} />
            <Tooltip formatter={(value) => [`${Number(value).toFixed(1)}%`, 'Average Occupancy']} />
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
      <div className="bg-gray-50 rounded-lg border border-gray-200 p-4">
        <h3 className="text-sm font-semibold text-gray-900 mb-3">Lease Expiration Analysis</h3>
        <ResponsiveContainer width="100%" height={200}>
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
