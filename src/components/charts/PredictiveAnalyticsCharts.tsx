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
    
    const existing = acc.find((item: any) => item.name === level);
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
    const existing = acc.find((item: any) => item.name === location);
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
  }, []).map((item: any) => ({
    ...item,
    averageCurrentValue: item.currentValue / item.count,
    averagePredictedValue: item.predictedValue / item.count
  }));

  const propertyTypeData = predictions.reduce((acc, prediction) => {
    const type = prediction.propertyType || 'Unknown';
    const existing = acc.find((item: any) => item.name === type);
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
  }, []).map((item: any) => ({
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
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {/* Confidence Level Distribution */}
      <div className="bg-gray-50 rounded-lg border border-gray-200 p-4">
        <h3 className="text-sm font-semibold text-gray-900 mb-3">Prediction Confidence Distribution</h3>
        <ResponsiveContainer width="100%" height={200}>
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
              {confidenceDistributionData.map((entry: any, index: number) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip formatter={(value, name) => [`${value} predictions`, name]} />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Value Growth Analysis */}
      <div className="bg-gray-50 rounded-lg border border-gray-200 p-4">
        <h3 className="text-sm font-semibold text-gray-900 mb-3">Value Growth Analysis</h3>
        <ResponsiveContainer width="100%" height={200}>
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

      {/* Asset Classification */}
      <div className="bg-gray-50 rounded-lg border border-gray-200 p-4">
        <h3 className="text-sm font-semibold text-gray-900 mb-3">Asset Classification</h3>
        <ResponsiveContainer width="100%" height={200}>
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

      {/* EPC Risk Distribution */}
      <div className="bg-gray-50 rounded-lg border border-gray-200 p-4">
        <h3 className="text-sm font-semibold text-gray-900 mb-3">EPC Risk Distribution</h3>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={predictions.reduce((acc, pred) => {
            const risk = pred.predicted_epc_risk || 'N/A';
            const existing = acc.find((item: any) => item.name === risk);
            if (existing) {
              existing.value += 1;
            } else {
              acc.push({ name: risk, value: 1 });
            }
            return acc;
          }, [])}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="value" fill="#FF8042" name="Properties" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Occupancy Forecast */}
      <div className="bg-gray-50 rounded-lg border border-gray-200 p-4">
        <h3 className="text-sm font-semibold text-gray-900 mb-3">Forecasted Occupancy Rate</h3>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={predictions.map(pred => ({
            name: pred.property_name?.substring(0, 10) || pred.property_id,
            occupancy: pred.forecasted_occupancy_rate || 0
          })).slice(0, 10)}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis tickFormatter={(value) => `${value}%`} />
            <Tooltip formatter={(value) => [`${value}%`, 'Occupancy']} />
            <Bar dataKey="occupancy" fill="#00C49F" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
