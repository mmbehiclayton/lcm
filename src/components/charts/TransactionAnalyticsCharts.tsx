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

interface TransactionAnalyticsChartsProps {
  transactions: any[];
  analysis?: any;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

export function TransactionAnalyticsCharts({ transactions, analysis }: TransactionAnalyticsChartsProps) {
  // Prepare data for charts
  const transactionTypeData = transactions.reduce((acc, transaction) => {
    const type = transaction.type || 'Unknown';
    const existing = acc.find(item => item.name === type);
    if (existing) {
      existing.value += 1;
      existing.amount += transaction.amount || 0;
    } else {
      acc.push({
        name: type,
        value: 1,
        amount: transaction.amount || 0
      });
    }
    return acc;
  }, []);

  const statusData = transactions.reduce((acc, transaction) => {
    const status = transaction.status || 'Unknown';
    const existing = acc.find(item => item.name === status);
    if (existing) {
      existing.value += 1;
      existing.amount += transaction.amount || 0;
    } else {
      acc.push({
        name: status,
        value: 1,
        amount: transaction.amount || 0
      });
    }
    return acc;
  }, []);

  const monthlyTransactionData = transactions.map(transaction => {
    const date = new Date(transaction.date);
    return {
      name: date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
      amount: transaction.amount || 0,
      fees: transaction.fees || 0,
      netAmount: transaction.netAmount || 0,
      type: transaction.type || 'Unknown'
    };
  });

  const amountByPropertyData = transactions.map(transaction => ({
    name: transaction.propertyName?.substring(0, 15) + '...' || 'Property',
    amount: transaction.amount || 0,
    fees: transaction.fees || 0,
    netAmount: transaction.netAmount || 0,
    type: transaction.type || 'Unknown'
  }));

  const transactionTrendData = transactions.map((transaction, index) => {
    const date = new Date(transaction.date);
    return {
      name: `Txn ${index + 1}`,
      amount: transaction.amount || 0,
      fees: transaction.fees || 0,
      netAmount: transaction.netAmount || 0,
      month: date.getMonth() + 1
    };
  });

  const feesAnalysisData = transactions.map(transaction => ({
    name: transaction.propertyName?.substring(0, 10) + '...' || 'Property',
    totalFees: transaction.fees || 0,
    amount: transaction.amount || 0,
    feePercentage: ((transaction.fees || 0) / (transaction.amount || 1)) * 100
  }));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
      {/* Transaction Type Distribution */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Transaction Type Distribution</h3>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={transactionTypeData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={80}
              fill="#8884d8"
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
            >
              {transactionTypeData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip formatter={(value, name) => [`${value} transactions`, name]} />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Transaction Status */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Transaction Status</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={statusData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip formatter={(value, name) => [`${value} transactions`, name]} />
            <Bar dataKey="value" fill="#00C49F" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Transaction Amounts by Property */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Transaction Amounts by Property</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={amountByPropertyData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis tickFormatter={(value) => `$${(value / 1000000).toFixed(1)}M`} />
            <Tooltip formatter={(value) => [`$${value.toLocaleString()}`, 'Amount']} />
            <Bar dataKey="amount" fill="#0088FE" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Monthly Transaction Trend */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Monthly Transaction Trend</h3>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={monthlyTransactionData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis tickFormatter={(value) => `$${(value / 1000000).toFixed(1)}M`} />
            <Tooltip formatter={(value) => [`$${value.toLocaleString()}`, 'Amount']} />
            <Area 
              type="monotone" 
              dataKey="amount" 
              stroke="#8884d8" 
              fill="#8884d8" 
              fillOpacity={0.6}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Amount vs Fees Analysis */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Amount vs Fees Analysis</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={transactionTrendData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis tickFormatter={(value) => `$${(value / 1000000).toFixed(1)}M`} />
            <Tooltip formatter={(value) => [`$${value.toLocaleString()}`, 'Amount']} />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="amount" 
              stroke="#0088FE" 
              strokeWidth={2}
              name="Transaction Amount"
            />
            <Line 
              type="monotone" 
              dataKey="fees" 
              stroke="#FF8042" 
              strokeWidth={2}
              name="Fees"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Fee Percentage Analysis */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Fee Percentage Analysis</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={feesAnalysisData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis tickFormatter={(value) => `${value.toFixed(1)}%`} />
            <Tooltip formatter={(value) => [`${value.toFixed(2)}%`, 'Fee Percentage']} />
            <Bar dataKey="feePercentage" fill="#FFBB28" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
