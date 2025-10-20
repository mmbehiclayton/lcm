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

interface PredictiveAnalyticsChartsProps {
  predictions: any[];
  analysis?: any;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

export function PredictiveAnalyticsCharts({ predictions, analysis }: PredictiveAnalyticsChartsProps) {
  // Prepare data for charts
  const confidenceDistributionData = predictions.reduce((acc, prediction) => {
    const confidence = prediction.confidence || 0;
    let level = 'Low';
    if (confidence >= 80) level = 'High';
    else if (confidence >= 60) level = 'Medium';
    
    const existing = acc.find(item => item.name === level);
    if (existing) {
      existing.value += 1;
      existing.totalConfidence += confidence;
    } else {
      acc.push({
        name: level,
        value: 1,
        totalConfidence: confidence
      });
    }
    return acc;
  }, []);

  const valueGrowthData = predictions.map(prediction => ({
    name: prediction.propertyName?.substring(0, 15) + '...' || 'Property',
    currentValue: prediction.currentValue || 0,
    predictedValue: prediction.predictedValue || 0,
    growthRate: prediction.growthRate || 0,
    confidence: prediction.confidence || 0
  }));

  const locationPredictionsData = predictions.reduce((acc, prediction) => {
    const location = prediction.location || 'Unknown';
    const existing = acc.find(item => item.name === location);
    if (existing) {
      existing.currentValue += prediction.currentValue || 0;
      existing.predictedValue += prediction.predictedValue || 0;
      existing.count += 1;
    } else {
      acc.push({
        name: location,
        currentValue: prediction.currentValue || 0,
        predictedValue: prediction.predictedValue || 0,
        count: 1
      });
    }
    return acc;
  }, []).map(item => ({
    ...item,
    averageCurrentValue: item.currentValue / item.count,
    averagePredictedValue: item.predictedValue / item.count
  }));

  const propertyTypeData = predictions.reduce((acc, prediction) => {
    const type = prediction.propertyType || 'Unknown';
    const existing = acc.find(item => item.name === type);
    if (existing) {
      existing.value += 1;
      existing.growthRate += prediction.growthRate || 0;
    } else {
      acc.push({
        name: type,
        value: 1,
        growthRate: prediction.growthRate || 0
      });
    }
    return acc;
  }, []).map(item => ({
    ...item,
    averageGrowthRate: item.growthRate / item.value
  }));

  const timeSeriesData = predictions.map((prediction, index) => ({
    name: `Property ${index + 1}`,
    currentValue: prediction.currentValue || 0,
    predictedValue: prediction.predictedValue || 0,
    confidence: prediction.confidence || 0,
    growthRate: prediction.growthRate || 0
  }));

  const confidenceVsGrowthData = predictions.map(prediction => ({
    name: prediction.propertyName?.substring(0, 10) + '...' || 'Property',
    confidence: prediction.confidence || 0,
    growthRate: prediction.growthRate || 0,
    currentValue: prediction.currentValue || 0,
    predictedValue: prediction.predictedValue || 0
  }));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
      {/* Confidence Level Distribution */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Prediction Confidence Distribution</h3>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={confidenceDistributionData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={80}
              fill="#8884d8"
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
            >
              {confidenceDistributionData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip formatter={(value, name) => [`${value} predictions`, name]} />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Value Growth Analysis */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Value Growth Analysis</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={valueGrowthData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis tickFormatter={(value) => `$${(value / 1000000).toFixed(1)}M`} />
            <Tooltip formatter={(value) => [`$${value.toLocaleString()}`, 'Value']} />
            <Legend />
            <Bar dataKey="currentValue" fill="#0088FE" name="Current Value" />
            <Bar dataKey="predictedValue" fill="#00C49F" name="Predicted Value" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Location-based Predictions */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Average Values by Location</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={locationPredictionsData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis tickFormatter={(value) => `$${(value / 1000000).toFixed(1)}M`} />
            <Tooltip formatter={(value) => [`$${value.toLocaleString()}`, 'Average Value']} />
            <Legend />
            <Bar dataKey="averageCurrentValue" fill="#0088FE" name="Current Value" />
            <Bar dataKey="averagePredictedValue" fill="#00C49F" name="Predicted Value" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Property Type Growth Rates */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Average Growth Rate by Property Type</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={propertyTypeData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis tickFormatter={(value) => `${value.toFixed(1)}%`} />
            <Tooltip formatter={(value) => [`${value.toFixed(2)}%`, 'Average Growth Rate']} />
            <Bar dataKey="averageGrowthRate" fill="#FFBB28" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Prediction Timeline */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Prediction Value Timeline</h3>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={timeSeriesData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis tickFormatter={(value) => `$${(value / 1000000).toFixed(1)}M`} />
            <Tooltip formatter={(value) => [`$${value.toLocaleString()}`, 'Value']} />
            <Legend />
            <Area 
              type="monotone" 
              dataKey="currentValue" 
              stroke="#0088FE" 
              fill="#0088FE" 
              fillOpacity={0.6}
              name="Current Value"
            />
            <Area 
              type="monotone" 
              dataKey="predictedValue" 
              stroke="#00C49F" 
              fill="#00C49F" 
              fillOpacity={0.6}
              name="Predicted Value"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Confidence vs Growth Rate */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Confidence vs Growth Rate Analysis</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={confidenceVsGrowthData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="confidence" 
              stroke="#FF8042" 
              strokeWidth={2}
              name="Confidence %"
            />
            <Line 
              type="monotone" 
              dataKey="growthRate" 
              stroke="#00C49F" 
              strokeWidth={2}
              name="Growth Rate %"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
