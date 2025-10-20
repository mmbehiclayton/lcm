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
  // Helper function to determine lease status
  const getLeaseStatus = (lease: any) => {
    if (lease.status && lease.status !== 'Unknown') {
      return lease.status;
    }
    
    // Calculate status based on lease dates
    const endDate = new Date(lease.endDate || lease.leaseEnd || lease.lease_end);
    const now = new Date();
    
    if (isNaN(endDate.getTime())) {
      return 'Active'; // Default if no valid date
    }
    
    const monthsToExpiry = (endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24 * 30);
    
    if (monthsToExpiry < 0) {
      return 'Expired';
    } else if (monthsToExpiry <= 12) {
      return 'Expiring Soon';
    } else {
      return 'Active';
    }
  };

  // Prepare data for charts
  const leaseStatusData = leases.reduce((acc, lease) => {
    const status = getLeaseStatus(lease);
    const rent = lease.monthlyRent || lease.rent || lease.monthly_rent || 0;
    const existing = acc.find((item: any) => item.name === status);
    if (existing) {
      existing.value += 1;
      existing.rent += rent;
    } else {
      acc.push({
        name: status,
        value: 1,
        rent: rent
      });
    }
    return acc;
  }, []);

  // Get risk level from analysis if available, otherwise default
  const getRiskLevel = (lease: any) => {
    if (analysis && analysis.risk_scores) {
      const riskScore = analysis.risk_scores.find(
        (r: any) => r.property_id === lease.propertyId || r.property_id === lease.property_id
      );
      if (riskScore) {
        return riskScore.risk_level;
      }
    }
    return lease.riskLevel || 'Not Analyzed';
  };

  const riskDistributionData = leases.reduce((acc, lease) => {
    const risk = getRiskLevel(lease);
    const rent = lease.monthlyRent || lease.rent || lease.monthly_rent || 0;
    const existing = acc.find((item: any) => item.name === risk);
    if (existing) {
      existing.value += 1;
      existing.rent += rent;
    } else {
      acc.push({
        name: risk,
        value: 1,
        rent: rent
      });
    }
    return acc;
  }, []);

  const rentByPropertyData = leases.map(lease => {
    const propertyName = lease.propertyName || lease.property_name || `Property ${lease.propertyId || lease.property_id}`;
    const tenantName = lease.tenantName || lease.tenant_name || lease.tenant || 'Tenant';
    const rent = lease.monthlyRent || lease.rent || lease.monthly_rent || 0;
    
    return {
      name: propertyName.length > 15 ? propertyName.substring(0, 15) + '...' : propertyName,
      rent: rent,
      riskScore: lease.riskScore || 0,
      tenant: tenantName.length > 10 ? tenantName.substring(0, 10) + '...' : tenantName
    };
  });

  const leaseExpiryData = leases.map(lease => {
    const endDate = new Date(lease.endDate || lease.leaseEnd || lease.lease_end);
    const now = new Date();
    const monthsToExpiry = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24 * 30));
    const tenantName = lease.tenantName || lease.tenant_name || lease.tenant || 'Tenant';
    const rent = lease.monthlyRent || lease.rent || lease.monthly_rent || 0;
    
    return {
      name: tenantName.length > 10 ? tenantName.substring(0, 10) + '...' : tenantName,
      monthsToExpiry: Math.max(0, monthsToExpiry),
      rent: rent,
      riskScore: lease.riskScore || 0
    };
  });

  const rentTrendData = leases.map((lease, index) => {
    const rent = lease.monthlyRent || lease.rent || lease.monthly_rent || 0;
    const endDate = new Date(lease.endDate || lease.leaseEnd || lease.lease_end);
    const monthsRemaining = Math.max(0, Math.ceil((endDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24 * 30)));
    
    return {
      name: `Lease ${index + 1}`,
      currentRent: rent,
      riskScore: lease.riskScore || 0,
      monthsRemaining: monthsRemaining
    };
  });

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {/* Lease Status Distribution */}
      <div className="bg-gray-50 rounded-lg border border-gray-200 p-4">
        <h3 className="text-sm font-semibold text-gray-900 mb-3">Lease Status Distribution</h3>
        <ResponsiveContainer width="100%" height={200}>
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
              {leaseStatusData.map((entry: any, index: number) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip formatter={(value, name) => [`${value} leases`, name]} />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Risk Level Distribution */}
      <div className="bg-gray-50 rounded-lg border border-gray-200 p-4">
        <h3 className="text-sm font-semibold text-gray-900 mb-3">Risk Level Distribution</h3>
        <ResponsiveContainer width="100%" height={200}>
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
      <div className="bg-gray-50 rounded-lg border border-gray-200 p-4">
        <h3 className="text-sm font-semibold text-gray-900 mb-3">Rent Analysis by Property</h3>
        <ResponsiveContainer width="100%" height={200}>
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
      <div className="bg-gray-50 rounded-lg border border-gray-200 p-4">
        <h3 className="text-sm font-semibold text-gray-900 mb-3">Lease Expiry Timeline</h3>
        <ResponsiveContainer width="100%" height={200}>
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
