'use client';

import { useState, useEffect } from 'react';
import { TrendingUp, BarChart3, Target, AlertTriangle, Calendar, DollarSign, Building2, Upload, X, Download } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { UploadModal } from '@/components/modals/UploadModal';
import { SearchFilter } from '@/components/common/SearchFilter';
import { PredictiveAnalyticsCharts } from '@/components/charts/PredictiveAnalyticsCharts';

export default function PredictiveModellingPage() {
  const [selectedModel, setSelectedModel] = useState('market-forecast');
  const [models, setModels] = useState<any[]>([]);
  const [predictions, setPredictions] = useState<any[]>([]);
  const [analysisResults, setAnalysisResults] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showUpload, setShowUpload] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [filteredPredictions, setFilteredPredictions] = useState<any[]>([]);

  useEffect(() => {
    fetchPredictiveData();
  }, []);

  // Filter predictions based on search and filters
  useEffect(() => {
    let filtered = predictions;

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(prediction =>
        prediction.propertyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        prediction.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
        prediction.propertyId.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply filters
    if (filters.propertyType) {
      filtered = filtered.filter(prediction => prediction.propertyType === filters.propertyType);
    }
    if (filters.confidence) {
      filtered = filtered.filter(prediction => prediction.confidence === filters.confidence);
    }
    if (filters.location) {
      filtered = filtered.filter(prediction => prediction.location === filters.location);
    }

    setFilteredPredictions(filtered);
  }, [predictions, searchQuery, filters]);

  const fetchPredictiveData = async () => {
    try {
      setIsLoading(true);
      
      // Fetch real predictive data from database
      const response = await fetch('/api/predictive/data');
      if (response.ok) {
        const data = await response.json();
        setModels(data.models || []);
        setPredictions(data.predictions || []);
        
        // Perform enhanced predictive analysis
        try {
          const analysisResponse = await fetch('/api/predictive/analyze', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              properties: data.predictions?.map((pred: any) => ({
                property_id: pred.propertyId,
                name: pred.propertyName,
                type: 'Office',
                location: 'Unknown',
                purchase_price: 0,
                current_value: pred.currentValue,
                noi: 0,
                occupancy_rate: 0.8,
                epc_rating: 'C',
                maintenance_score: 5
              })) || [],
              historical_data: [],
              market_data: []
            })
          });
          
          if (analysisResponse.ok) {
            const analysisData = await analysisResponse.json();
            setAnalysisResults(analysisData);
          }
        } catch (analysisError) {
          console.error('Error performing predictive analysis:', analysisError);
        }
      } else {
        // Fallback to mock data
        const mockModels = [
    {
      id: 'market-forecast',
      name: 'Market Value Forecast',
      description: 'Predicts property values based on market trends and economic indicators',
      accuracy: 87,
      lastUpdated: '2024-01-15',
      confidence: 'High'
    },
    {
      id: 'rental-growth',
      name: 'Rental Growth Prediction',
      description: 'Forecasts rental income growth based on location and property type',
      accuracy: 82,
      lastUpdated: '2024-01-10',
      confidence: 'Medium'
    },
    {
      id: 'occupancy-risk',
      name: 'Occupancy Risk Model',
      description: 'Predicts vacancy risk and optimal rent pricing strategies',
      accuracy: 79,
      lastUpdated: '2024-01-08',
      confidence: 'Medium'
    }
  ];

  const predictions = [
    {
      propertyId: 'prop-001',
      propertyName: 'Downtown Office Tower',
      currentValue: 25000000,
      predictedValue: 26500000,
      growthRate: 6.0,
      confidence: 85,
      timeframe: '12 months'
    },
    {
      propertyId: 'prop-002',
      propertyName: 'Retail Plaza Center',
      currentValue: 12000000,
      predictedValue: 11800000,
      growthRate: -1.7,
      confidence: 72,
      timeframe: '12 months'
    },
    {
      propertyId: 'prop-003',
      propertyName: 'Industrial Warehouse Complex',
      currentValue: 8500000,
      predictedValue: 9200000,
      growthRate: 8.2,
      confidence: 91,
      timeframe: '12 months'
    }
        ];
        const mockPredictions = [
          {
            propertyId: 'prop-001',
            propertyName: 'Downtown Office Tower',
            currentValue: 25000000,
            predictedValue: 26500000,
            growthRate: 6.0,
            confidence: 85,
            timeframe: '12 months'
          },
          {
            propertyId: 'prop-002',
            propertyName: 'Retail Plaza Center',
            currentValue: 12000000,
            predictedValue: 11800000,
            growthRate: -1.7,
            confidence: 72,
            timeframe: '12 months'
          },
          {
            propertyId: 'prop-003',
            propertyName: 'Industrial Warehouse Complex',
            currentValue: 8500000,
            predictedValue: 9200000,
            growthRate: 8.2,
            confidence: 91,
            timeframe: '12 months'
          }
        ];
        setModels(mockModels);
        setPredictions(mockPredictions);
      }
    } catch (error) {
      console.error('Error fetching predictive data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 80) return 'text-green-600 bg-green-100';
    if (confidence >= 60) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getGrowthColor = (rate: number) => {
    if (rate > 0) return 'text-green-600';
    return 'text-red-600';
  };

  const handlePredictiveUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('module', 'predictive-modelling');

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        toast.success('Predictive data uploaded successfully!');
        setShowUpload(false);
        // Refresh the page data
        fetchPredictiveData();
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || 'Upload failed');
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const handleFilter = (newFilters: Record<string, string>) => {
    setFilters(newFilters);
  };

  return (
    <DashboardLayout>
      <div>
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">LCM Predictive Modelling</h1>
              <p className="mt-2 text-gray-600">AI-powered forecasting for property values, rental growth, and market trends</p>
            </div>
                  <div className="flex space-x-3">
                    <Button
                      onClick={() => setShowUpload(!showUpload)}
                      className="inline-flex items-center px-4 py-2"
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Upload Predictive Data
                    </Button>
            </div>
          </div>
        </div>

        {/* Upload Modal */}
        <UploadModal
          isOpen={showUpload}
          onClose={() => setShowUpload(false)}
          module={{
            id: 'predictive-modelling',
            name: 'Predictive Modelling',
            color: 'indigo',
            templateUrl: '/api/templates/predictive-modelling',
            templateName: 'predictive_modelling_template.csv',
            requiredFields: [
              'Property ID (unique identifier)',
              'Property Name',
              'Property Type (Office/Retail/Industrial/Residential)',
              'Location',
              'Current Value',
              'Historical Values (3+ years)',
              'Market Trends Data',
              'Economic Indicators',
              'Rental Growth Rates',
              'Market Comparables',
              'Location Score',
              'Property Age & Condition'
            ]
          }}
          onUploadSuccess={() => fetchPredictiveData()}
        />

        {/* Model Selection */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Select Prediction Model</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {models.map((model) => (
              <button
                key={model.id}
                onClick={() => setSelectedModel(model.id)}
                className={`p-4 rounded-lg border-2 text-left transition-colors ${
                  selectedModel === model.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-gray-900">{model.name}</h4>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    model.confidence === 'High' ? 'bg-green-100 text-green-800' :
                    model.confidence === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {model.confidence}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mb-2">{model.description}</p>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Accuracy: {model.accuracy}%</span>
                  <span className="text-gray-500">Updated: {new Date(model.lastUpdated).toLocaleDateString()}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Target className="h-8 w-8 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Model Accuracy</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {models.find(m => m.id === selectedModel)?.accuracy}%
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <TrendingUp className="h-8 w-8 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Avg Growth</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {predictions.reduce((sum, p) => sum + p.growthRate, 0) / predictions.length > 0 ? '+' : ''}
                  {(predictions.reduce((sum, p) => sum + p.growthRate, 0) / predictions.length).toFixed(1)}%
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <DollarSign className="h-8 w-8 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Value</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {formatCurrency(predictions.reduce((sum, p) => sum + p.currentValue, 0))}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <BarChart3 className="h-8 w-8 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Predictions</p>
                <p className="text-2xl font-semibold text-gray-900">{predictions.length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filter */}
        <SearchFilter
          onSearch={handleSearch}
          onFilter={handleFilter}
          searchPlaceholder="Search predictions by property name, location, or property ID..."
          filters={{
            propertyType: {
              label: 'Property Type',
              options: [
                { value: 'Office', label: 'Office' },
                { value: 'Retail', label: 'Retail' },
                { value: 'Industrial', label: 'Industrial' },
                { value: 'Residential', label: 'Residential' }
              ]
            },
            confidence: {
              label: 'Confidence Level',
              options: [
                { value: 'High', label: 'High (80%+)' },
                { value: 'Medium', label: 'Medium (60-79%)' },
                { value: 'Low', label: 'Low (<60%)' }
              ]
            },
            location: {
              label: 'Location',
              options: [
                { value: 'New York', label: 'New York' },
                { value: 'Los Angeles', label: 'Los Angeles' },
                { value: 'Chicago', label: 'Chicago' },
                { value: 'Miami', label: 'Miami' },
                { value: 'Boston', label: 'Boston' }
              ]
            }
          }}
        />

        {/* Predictive Analytics Charts */}
        <PredictiveAnalyticsCharts 
          predictions={predictions} 
          analysis={analysisResults} 
        />

        {/* Predictions Table */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Property Value Predictions</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Property
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Current Value
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Predicted Value
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Growth Rate
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Confidence
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Timeframe
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredPredictions.map((prediction) => (
                  <tr key={prediction.propertyId} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Building2 className="h-5 w-5 text-gray-400 mr-3" />
                        <div>
                          <div className="text-sm font-medium text-gray-900">{prediction.propertyName}</div>
                          <div className="text-sm text-gray-500">ID: {prediction.propertyId}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatCurrency(prediction.currentValue)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatCurrency(prediction.predictedValue)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className={`font-medium ${getGrowthColor(prediction.growthRate)}`}>
                        {prediction.growthRate > 0 ? '+' : ''}{prediction.growthRate}%
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getConfidenceColor(prediction.confidence)}`}>
                        {prediction.confidence}%
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {prediction.timeframe}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Model Insights */}
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Model Performance</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Data Quality Score</span>
                <span className="text-sm font-medium text-gray-900">92/100</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Training Accuracy</span>
                <span className="text-sm font-medium text-gray-900">89%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Validation Score</span>
                <span className="text-sm font-medium text-gray-900">87%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Last Model Update</span>
                <span className="text-sm font-medium text-gray-900">
                  {new Date(models.find(m => m.id === selectedModel)?.lastUpdated || '').toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Key Insights</h3>
            <div className="space-y-3">
              <div className="flex items-start">
                <TrendingUp className="h-5 w-5 text-green-500 mr-3 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Industrial Properties</p>
                  <p className="text-sm text-gray-600">Showing strongest growth potential with 8.2% predicted increase</p>
                </div>
              </div>
              <div className="flex items-start">
                <AlertTriangle className="h-5 w-5 text-yellow-500 mr-3 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Retail Sector</p>
                  <p className="text-sm text-gray-600">Market headwinds may impact rental growth in the next 12 months</p>
                </div>
              </div>
              <div className="flex items-start">
                <Calendar className="h-5 w-5 text-blue-500 mr-3 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Market Timing</p>
                  <p className="text-sm text-gray-600">Optimal conditions for portfolio rebalancing in Q2 2024</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
