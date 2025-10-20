'use client';

import { useState } from 'react';
import { Property, TableColumn } from '@/types';
import { formatCurrency, formatPercentage, formatDate, getRiskColor } from '@/lib/utils';

interface PropertyTableProps {
  properties: Property[];
  className?: string;
}

const columns: TableColumn[] = [
  { key: 'property_id', label: 'Property ID', sortable: true },
  { key: 'name', label: 'Property Name', sortable: true },
  { key: 'type', label: 'Type', sortable: true },
  { key: 'location', label: 'Location', sortable: true },
  { key: 'current_value', label: 'Current Value', sortable: true },
  { key: 'noi', label: 'NOI', sortable: true },
  { key: 'occupancy_rate', label: 'Occupancy', sortable: true },
  { key: 'lease_expiry_date', label: 'Lease Expiry', sortable: true },
];

export function PropertyTable({ properties, className }: PropertyTableProps) {
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);
  const [filterConfig, setFilterConfig] = useState<{ key: string; value: string } | null>(null);

  const handleSort = (key: string) => {
    setSortConfig(prev => ({
      key,
      direction: prev?.key === key && prev?.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const handleFilter = (key: string, value: string) => {
    setFilterConfig({ key, value });
  };

  const sortedAndFilteredProperties = properties
    .filter(property => {
      if (!filterConfig) return true;
      const propertyValue = property[filterConfig.key as keyof Property];
      return String(propertyValue).toLowerCase().includes(filterConfig.value.toLowerCase());
    })
    .sort((a, b) => {
      if (!sortConfig) return 0;
      
      const aValue = a[sortConfig.key as keyof Property];
      const bValue = b[sortConfig.key as keyof Property];
      
      if ((aValue || 0) < (bValue || 0)) return sortConfig.direction === 'asc' ? -1 : 1;
      if ((aValue || 0) > (bValue || 0)) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });

  const renderCell = (property: Property, column: TableColumn) => {
    const value = property[column.key as keyof Property];
    
    switch (column.key) {
      case 'current_value':
        return formatCurrency(Number(value));
      case 'noi':
        return formatCurrency(Number(value));
      case 'occupancy_rate':
        return formatPercentage(Number(value));
      case 'lease_expiry_date':
        return value ? formatDate(String(value)) : 'N/A';
      default:
        return String(value);
    }
  };

  return (
    <div className={`overflow-hidden ${className}`}>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key}
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  <button
                    onClick={() => column.sortable && handleSort(column.key)}
                    className={`flex items-center space-x-1 ${
                      column.sortable ? 'hover:text-gray-700' : ''
                    }`}
                    disabled={!column.sortable}
                  >
                    <span>{column.label}</span>
                    {column.sortable && sortConfig?.key === column.key && (
                      <span className="text-gray-400">
                        {sortConfig.direction === 'asc' ? '↑' : '↓'}
                      </span>
                    )}
                  </button>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {sortedAndFilteredProperties.map((property, index) => (
              <tr key={property.property_id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                {columns.map((column) => (
                  <td key={column.key} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {renderCell(property, column)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {properties.length === 0 && (
        <div className="text-center py-8">
          <p className="text-gray-500">No properties found</p>
        </div>
      )}
      
      <div className="px-6 py-3 bg-gray-50 border-t border-gray-200">
        <p className="text-sm text-gray-700">
          Showing {sortedAndFilteredProperties.length} of {properties.length} properties
        </p>
      </div>
    </div>
  );
}
