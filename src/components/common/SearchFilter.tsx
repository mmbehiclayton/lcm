'use client';

import { useState } from 'react';
import { Search, Filter, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface FilterOption {
  value: string;
  label: string;
}

interface SearchFilterProps {
  onSearch: (query: string) => void;
  onFilter: (filters: Record<string, string>) => void;
  searchPlaceholder?: string;
  filters?: {
    [key: string]: {
      label: string;
      options: FilterOption[];
    };
  };
  className?: string;
}

export function SearchFilter({ 
  onSearch, 
  onFilter, 
  searchPlaceholder = "Search...",
  filters = {},
  className = ""
}: SearchFilterProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilters, setActiveFilters] = useState<Record<string, string>>({});
  const [showFilters, setShowFilters] = useState(false);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    onSearch(query);
  };

  const handleFilterChange = (filterKey: string, value: string) => {
    const newFilters = { ...activeFilters, [filterKey]: value };
    setActiveFilters(newFilters);
    onFilter(newFilters);
  };

  const clearFilters = () => {
    setActiveFilters({});
    onFilter({});
  };

  const hasActiveFilters = Object.values(activeFilters).some(value => value !== '');

  return (
    <div className={`bg-white rounded-lg shadow p-4 mb-6 ${className}`}>
      <div className="flex flex-col lg:flex-row gap-4">
        {/* Search Bar */}
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder={searchPlaceholder}
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        {/* Filter Toggle */}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2"
          >
            <Filter className="h-4 w-4" />
            Filters
            {hasActiveFilters && (
              <span className="ml-1 px-1.5 py-0.5 text-xs bg-blue-100 text-blue-800 rounded-full">
                {Object.values(activeFilters).filter(v => v !== '').length}
              </span>
            )}
          </Button>

          {hasActiveFilters && (
            <Button
              variant="outline"
              onClick={clearFilters}
              className="flex items-center gap-2 text-red-600 hover:text-red-700"
            >
              <X className="h-4 w-4" />
              Clear
            </Button>
          )}
        </div>
      </div>

      {/* Filter Options */}
      {showFilters && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(filters).map(([key, filter]) => (
              <div key={key}>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {filter.label}
                </label>
                <select
                  value={activeFilters[key] || ''}
                  onChange={(e) => handleFilterChange(key, e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">All {filter.label}</option>
                  {filter.options.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
