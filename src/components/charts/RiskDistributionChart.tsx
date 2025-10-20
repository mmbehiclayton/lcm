'use client';

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

interface RiskDistributionChartProps {
  data: {
    name: string;
    value: number;
    color: string;
  }[];
  className?: string;
}

export function RiskDistributionChart({ data, className }: RiskDistributionChartProps) {
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium text-gray-900">{data.name}</p>
          <p className="text-sm text-gray-600">
            <span className="font-medium">Properties:</span> {data.value}
          </p>
          <p className="text-sm text-gray-600">
            <span className="font-medium">Percentage:</span> {((data.value / data.payload.total) * 100).toFixed(1)}%
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className={`w-full h-80 ${className}`}>
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Risk Distribution</h3>
        <p className="text-sm text-gray-600">Portfolio risk level breakdown</p>
      </div>
      
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={120}
            paddingAngle={5}
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend 
            verticalAlign="bottom" 
            height={36}
            formatter={(value, entry) => (
              <span style={{ color: entry?.color }}>{value}</span>
            )}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
