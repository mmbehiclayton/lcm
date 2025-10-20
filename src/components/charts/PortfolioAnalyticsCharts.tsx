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

interface PortfolioAnalyticsChartsProps {
  properties: any[];
  analysis?: any;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

export function PortfolioAnalyticsCharts({ properties, analysis }: PortfolioAnalyticsChartsProps) {
  // Prepare data for charts
  const propertyTypeData = properties.reduce((acc, property) => {
    const type = property.type || 'Unknown';
    const existing = acc.find(item => item.name === type);
    if (existing) {
      existing.value += 1;
      existing.totalValue += property.currentValue || 0;
    } else {
      acc.push({
        name: type,
        value: 1,
        totalValue: property.currentValue || 0,
        count: 1
      });
    }
    return acc;
  }, []);

  const performanceData = properties.map(property => ({
    name: property.name?.substring(0, 15) + '...' || 'Property',
    performance: property.performance || 'B',
    value: property.currentValue || 0,
    noi: property.noi || 0,
    occupancy: (property.occupancyRate || 0) * 100
  }));

  const locationData = properties.reduce((acc, property) => {
    const location = property.location || 'Unknown';
    const existing = acc.find(item => item.name === location);
    if (existing) {
      existing.value += property.currentValue || 0;
      existing.count += 1;
    } else {
      acc.push({
        name: location,
        value: property.currentValue || 0,
        count: 1
      });
    }
    return acc;
  }, []);

  const valueTrendData = properties.map((property, index) => ({
    name: `Property ${index + 1}`,
    currentValue: property.currentValue || 0,
    purchasePrice: property.purchasePrice || 0,
    appreciation: ((property.currentValue || 0) - (property.purchasePrice || 0)) / (property.purchasePrice || 1) * 100
  }));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
      {/* Property Type Distribution */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Property Type Distribution</h3>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={propertyTypeData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={80}
              fill="#8884d8"
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
            >
              {propertyTypeData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip formatter={(value, name) => [`${value} properties`, name]} />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Property Values by Location */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Property Values by Location</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={locationData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis tickFormatter={(value) => `$${(value / 1000000).toFixed(1)}M`} />
            <Tooltip formatter={(value) => [`$${value.toLocaleString()}`, 'Total Value']} />
            <Bar dataKey="value" fill="#0088FE" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Performance vs Value */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Property Performance Analysis</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={performanceData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="value" fill="#0088FE" name="Current Value" />
            <Bar dataKey="noi" fill="#00C49F" name="NOI" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Value Appreciation Trend */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Value Appreciation Trend</h3>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={valueTrendData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis tickFormatter={(value) => `${value}%`} />
            <Tooltip formatter={(value) => [`${value.toFixed(1)}%`, 'Appreciation']} />
            <Area 
              type="monotone" 
              dataKey="appreciation" 
              stroke="#8884d8" 
              fill="#8884d8" 
              fillOpacity={0.6}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
