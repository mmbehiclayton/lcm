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

interface LeaseAnalyticsChartsProps {
  leases: any[];
  analysis?: any;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

export function LeaseAnalyticsCharts({ leases, analysis }: LeaseAnalyticsChartsProps) {
  // Prepare data for charts
  const leaseStatusData = leases.reduce((acc, lease) => {
    const status = lease.status || 'Unknown';
    const existing = acc.find(item => item.name === status);
    if (existing) {
      existing.value += 1;
      existing.rent += lease.rent || 0;
    } else {
      acc.push({
        name: status,
        value: 1,
        rent: lease.rent || 0
      });
    }
    return acc;
  }, []);

  const riskDistributionData = leases.reduce((acc, lease) => {
    const risk = lease.riskLevel || 'Medium';
    const existing = acc.find(item => item.name === risk);
    if (existing) {
      existing.value += 1;
      existing.rent += lease.rent || 0;
    } else {
      acc.push({
        name: risk,
        value: 1,
        rent: lease.rent || 0
      });
    }
    return acc;
  }, []);

  const rentByPropertyData = leases.map(lease => ({
    name: lease.propertyName?.substring(0, 15) + '...' || 'Property',
    rent: lease.rent || 0,
    riskScore: lease.riskScore || 0,
    tenant: lease.tenant?.substring(0, 10) + '...' || 'Tenant'
  }));

  const leaseExpiryData = leases.map(lease => {
    const endDate = new Date(lease.endDate);
    const now = new Date();
    const monthsToExpiry = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24 * 30));
    
    return {
      name: lease.tenant?.substring(0, 10) + '...' || 'Tenant',
      monthsToExpiry: Math.max(0, monthsToExpiry),
      rent: lease.rent || 0,
      riskScore: lease.riskScore || 0
    };
  });

  const rentTrendData = leases.map((lease, index) => ({
    name: `Lease ${index + 1}`,
    currentRent: lease.rent || 0,
    riskScore: lease.riskScore || 0,
    monthsRemaining: Math.max(0, Math.ceil((new Date(lease.endDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24 * 30)))
  }));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
      {/* Lease Status Distribution */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Lease Status Distribution</h3>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={leaseStatusData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={80}
              fill="#8884d8"
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
            >
              {leaseStatusData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip formatter={(value, name) => [`${value} leases`, name]} />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Risk Level Distribution */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Risk Level Distribution</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={riskDistributionData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip formatter={(value, name) => [`${value} leases`, name]} />
            <Bar dataKey="value" fill="#FF8042" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Rent by Property */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Rent Analysis by Property</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={rentByPropertyData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis tickFormatter={(value) => `$${(value / 1000).toFixed(0)}K`} />
            <Tooltip formatter={(value) => [`$${value.toLocaleString()}`, 'Monthly Rent']} />
            <Bar dataKey="rent" fill="#00C49F" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Lease Expiry Timeline */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Lease Expiry Timeline</h3>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={leaseExpiryData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip formatter={(value, name) => [
              name === 'monthsToExpiry' ? `${value} months` : `$${value.toLocaleString()}`,
              name === 'monthsToExpiry' ? 'Months to Expiry' : 'Monthly Rent'
            ]} />
            <Area 
              type="monotone" 
              dataKey="monthsToExpiry" 
              stroke="#FF8042" 
              fill="#FF8042" 
              fillOpacity={0.6}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Risk Score vs Rent */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Risk Score vs Rent Analysis</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={rentTrendData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="currentRent" 
              stroke="#0088FE" 
              strokeWidth={2}
              name="Monthly Rent"
            />
            <Line 
              type="monotone" 
              dataKey="riskScore" 
              stroke="#FF8042" 
              strokeWidth={2}
              name="Risk Score"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
