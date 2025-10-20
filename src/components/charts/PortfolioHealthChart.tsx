'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { ChartData } from '@/types';

interface PortfolioHealthChartProps {
  data: ChartData[];
  className?: string;
}

export function PortfolioHealthChart({ data, className }: PortfolioHealthChartProps) {
  const getBarColor = (score: number) => {
    if (score >= 80) return '#10B981'; // green-500
    if (score >= 60) return '#F59E0B'; // yellow-500
    return '#EF4444'; // red-500
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium text-gray-900">{`Property: ${label}`}</p>
          <p className="text-sm text-gray-600">
            <span className="font-medium">Health Score:</span> {payload[0].value}%
          </p>
          <p className="text-sm text-gray-600">
            <span className="font-medium">Risk Level:</span> {payload[0].payload.riskLevel}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className={`w-full h-96 ${className}`}>
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Portfolio Health Scores</h3>
        <p className="text-sm text-gray-600">Individual property health scores and risk levels</p>
      </div>
      
      <ResponsiveContainer width="100%" height="100%">
        <BarChart 
          data={data} 
          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
          <XAxis 
            dataKey="property" 
            tick={{ fontSize: 12 }}
            angle={-45}
            textAnchor="end"
            height={80}
          />
          <YAxis 
            domain={[0, 100]} 
            tick={{ fontSize: 12 }}
            label={{ value: 'Health Score (%)', angle: -90, position: 'insideLeft' }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Bar 
            dataKey="healthScore" 
            radius={[4, 4, 0, 0]}
            maxBarSize={60}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={getBarColor(entry.healthScore)} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      
      <div className="mt-4 flex items-center justify-center space-x-6 text-sm">
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-green-500 rounded"></div>
          <span className="text-gray-600">High (80-100%)</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-yellow-500 rounded"></div>
          <span className="text-gray-600">Medium (60-79%)</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-red-500 rounded"></div>
          <span className="text-gray-600">Low (0-59%)</span>
        </div>
      </div>
    </div>
  );
}
