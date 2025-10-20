'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { 
  TrendingUp, 
  Building2, 
  DollarSign, 
  MapPin, 
  Calendar, 
  Star, 
  BarChart3, 
  AlertTriangle, 
  CheckCircle, 
  Download,
  Upload,
  Target,
  X
} from 'lucide-react';
import { UploadModal } from '@/components/modals/UploadModal';
import { PortfolioHealthChart } from '@/components/charts/PortfolioHealthChart';
import { RiskDistributionChart } from '@/components/charts/RiskDistributionChart';
import { PropertyTable } from '@/components/tables/PropertyTable';
import { SearchFilter } from '@/components/common/SearchFilter';
import { PortfolioAnalyticsCharts } from '@/components/charts/PortfolioAnalyticsCharts';
import { formatCurrency, formatPercentage, getRiskColor, getPerformanceColor } from '@/lib/utils';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useSession } from 'next-auth/react';
import { toast } from 'sonner';

interface Property {
  property_id: string;
  name: string;
  type: 'Office' | 'Retail' | 'Industrial' | 'Residential';
  location: string;
  purchase_price: number;
  current_value: number;
  noi: number;
  occupancy_rate: number;
  purchase_date?: string;
  lease_expiry_date?: string;
  epc_rating?: 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G';
  maintenance_score?: number;
}

interface AnalysisResult {
  portfolioHealth: number;
  riskLevel: string;
  performanceGrade: string;
  recommendations: string[];
  metrics: {
    totalValue: number;
    averageNOI: number;
    averageOccupancy: number;
  };
}

function PortfolioContent() {
  const searchParams = useSearchParams();
  const uploadId = searchParams.get('uploadId');
  const analysisId = searchParams.get('analysisId');
  const { data: session } = useSession();

  const [activeTab, setActiveTab] = useState<'overview' | 'analysis'>('overview');
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [properties, setProperties] = useState<Property[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedStrategy, setSelectedStrategy] = useState<'growth' | 'hold' | 'divest'>('hold');
  const [showUpload, setShowUpload] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [filteredProperties, setFilteredProperties] = useState<any[]>([]);

  // Portfolio overview data
  const [portfolioData, setPortfolioData] = useState({
    totalProperties: 0,
    totalValue: 0,
    totalNOI: 0,
    averageOccupancy: 0,
    properties: [] as any[]
  });

  useEffect(() => {
    // Always fetch portfolio data
    fetchPortfolioData();
    
    if (uploadId || analysisId) {
      fetchAnalysis();
    } else {
      setIsLoading(false);
    }
  }, [uploadId, analysisId, session?.user?.id]);

  // Filter properties based on search and filters
  useEffect(() => {
    let filtered = portfolioData.properties;

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(property =>
        property.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        property.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
        property.type.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply filters
    if (filters.propertyType) {
      filtered = filtered.filter(property => property.type === filters.propertyType);
    }
    if (filters.performance) {
      filtered = filtered.filter(property => property.performance === filters.performance);
    }
    if (filters.location) {
      filtered = filtered.filter(property => property.location === filters.location);
    }

    setFilteredProperties(filtered);
  }, [portfolioData.properties, searchQuery, filters]);

  const fetchPortfolioData = async () => {
    if (!session?.user?.id) return;

    try {
      const response = await fetch(`/api/portfolio/data?userId=${session.user.id}`);
      if (response.ok) {
        const data = await response.json();
        setPortfolioData(data);
      }
    } catch (error) {
      console.error('Error fetching portfolio data:', error);
    }
  };

  const fetchAnalysis = async () => {
    if (!session?.user?.id) {
      setError('User not authenticated. Please sign in.');
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      let fetchedAnalysis: AnalysisResult | null = null;
      let fetchedProperties: Property[] = [];

      if (analysisId) {
        // Fetch existing analysis
        const response = await fetch(`/api/analyze?userId=${session.user.id}&analysisId=${analysisId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch existing analysis');
        }
        const data = await response.json();
        if (data.analyses && data.analyses.length > 0) {
          fetchedAnalysis = data.analyses[0].results;
          const uploadResponse = await fetch(`/api/upload?uploadId=${data.analyses[0].uploadId}`);
          if (uploadResponse.ok) {
            const uploadData = await uploadResponse.json();
            fetchedProperties = uploadData.uploads[0]?.properties || [];
          }
        }
      } else if (uploadId) {
        // Perform new analysis with enhanced Python service
        const analysisResponse = await fetch('/api/analyze', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userId: session.user.id,
            strategy: selectedStrategy,
          }),
        });

        if (!analysisResponse.ok) {
          const errorData = await analysisResponse.json();
          throw new Error(errorData.error || 'Analysis failed');
        }

        const analysisData = await analysisResponse.json();
        // Transform Python service response to match frontend interface
        fetchedAnalysis = {
          portfolioHealth: analysisData.data?.portfolio_health || 0,
          riskLevel: analysisData.data?.risk_level || 'Unknown',
          performanceGrade: analysisData.data?.performance_grade || 'N/A',
          recommendations: analysisData.data?.recommendations || [],
          metrics: {
            totalValue: portfolioData.totalValue,
            averageNOI: portfolioData.totalNOI / portfolioData.totalProperties,
            averageOccupancy: portfolioData.averageOccupancy,
          }
        };

        // Fetch properties for the upload
        const propertiesResponse = await fetch(`/api/upload?uploadId=${uploadId}`);
        if (propertiesResponse.ok) {
          const uploadData = await propertiesResponse.json();
          fetchedProperties = uploadData.uploads[0]?.properties || [];
        }
      }

      setAnalysis(fetchedAnalysis);
      setProperties(fetchedProperties);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load analysis');
      toast.error('Analysis Error', {
        description: err instanceof Error ? err.message : 'An unexpected error occurred during analysis.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleStrategyChange = (strategy: 'growth' | 'hold' | 'divest') => {
    setSelectedStrategy(strategy);
    if (uploadId) {
      fetchAnalysis();
    }
  };


  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const handleFilter = (newFilters: Record<string, string>) => {
    setFilters(newFilters);
  };

  const handleExport = (format: 'pdf' | 'excel' | 'csv') => {
    console.log(`Exporting as ${format}`);
    toast.info('Export Feature', {
      description: `Exporting as ${format} is not yet implemented.`,
    });
  };


  const getPerformanceColor = (grade: string) => {
    if (grade.startsWith('A')) return 'text-green-600';
    if (grade.startsWith('B')) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'Low': return 'text-green-600 bg-green-100';
      case 'Medium': return 'text-yellow-600 bg-yellow-100';
      case 'High': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading portfolio data...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Page Header */}
      <div className="mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Portfolio & Analysis</h1>
            <p className="mt-2 text-gray-600">Comprehensive view of your real estate portfolio with advanced analytics</p>
          </div>
                  <div className="flex space-x-3">
                    <button
                      onClick={() => setShowUpload(!showUpload)}
                      className="inline-flex items-center px-4 py-2 border border-blue-300 text-sm font-medium rounded-md text-blue-700 bg-blue-50 hover:bg-blue-100"
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Upload Portfolio Data
                    </button>
                    {analysis && (
                      <button
                        onClick={() => handleExport('pdf')}
                        className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Export Report
                      </button>
                    )}
                  </div>
        </div>
      </div>

      {/* Upload Modal */}
      <UploadModal
        isOpen={showUpload}
        onClose={() => setShowUpload(false)}
        module={{
          id: 'portfolio',
          name: 'Portfolio Analysis',
          color: 'blue',
          templateUrl: '/api/templates/portfolio',
          templateName: 'portfolio_template.csv',
          requiredFields: [
            'Property ID (unique identifier)',
            'Property Name',
            'Property Type (Office/Retail/Industrial/Residential)',
            'Location',
            'Purchase Price',
            'Current Value',
            'NOI (Net Operating Income)',
            'Occupancy Rate (0-1)',
            'Purchase Date',
            'Lease Expiry Date',
            'EPC Rating (A-G)',
            'Maintenance Score (1-10)'
          ]
        }}
        onUploadSuccess={() => window.location.reload()}
      />

      {/* Tab Navigation */}
      <div className="mb-8">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('overview')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'overview'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Portfolio Overview
            </button>
            <button
              onClick={() => setActiveTab('analysis')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'analysis'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Advanced Analysis
            </button>
          </nav>
        </div>
      </div>

      {/* Portfolio Overview Tab */}
      {activeTab === 'overview' && (
        <div>
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Building2 className="h-8 w-8 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Total Properties</p>
                  <p className="text-2xl font-semibold text-gray-900">{portfolioData.totalProperties}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <DollarSign className="h-8 w-8 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Total Value</p>
                  <p className="text-2xl font-semibold text-gray-900">{formatCurrency(portfolioData.totalValue)}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <TrendingUp className="h-8 w-8 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Total NOI</p>
                  <p className="text-2xl font-semibold text-gray-900">{formatCurrency(portfolioData.totalNOI)}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Target className="h-8 w-8 text-orange-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Avg Occupancy</p>
                  <p className="text-2xl font-semibold text-gray-900">{(portfolioData.averageOccupancy * 100).toFixed(1)}%</p>
                </div>
              </div>
            </div>
          </div>

          {/* Search and Filter */}
          <SearchFilter
            onSearch={handleSearch}
            onFilter={handleFilter}
            searchPlaceholder="Search properties by name, location, or type..."
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
              performance: {
                label: 'Performance',
                options: [
                  { value: 'A+', label: 'A+' },
                  { value: 'A', label: 'A' },
                  { value: 'B+', label: 'B+' },
                  { value: 'B', label: 'B' },
                  { value: 'C', label: 'C' }
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

          {/* Portfolio Analytics Charts */}
          <PortfolioAnalyticsCharts 
            properties={portfolioData.properties} 
            analysis={analysis} 
          />

          {/* Properties Table */}
          <div className="bg-white shadow rounded-lg overflow-hidden mb-8">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Portfolio Properties</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Property
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Location
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Value
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      NOI
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Occupancy
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Performance
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Purchase Date
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredProperties.map((property) => (
                    <tr key={property.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{property.name}</div>
                          <div className="text-sm text-gray-500">ID: {property.id}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center text-sm text-gray-900">
                          <MapPin className="h-4 w-4 mr-1 text-gray-400" />
                          {property.location}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {property.type}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatCurrency(property.value)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatCurrency(property.noi)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{(property.occupancy * 100).toFixed(1)}%</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          property.performance.startsWith('A') ? 'bg-green-100 text-green-800' :
                          property.performance.startsWith('B') ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {property.performance}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-1" />
                          {new Date(property.purchaseDate).toLocaleDateString()}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Advanced Analysis Tab */}
      {activeTab === 'analysis' && (
        <div>
          {!uploadId && !analysisId ? (
            <div className="text-center py-12">
              <BarChart3 className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-4">No Analysis Data</h2>
              <p className="text-lg text-gray-600 mb-8">
                Upload your real estate data to start analyzing your portfolio.
              </p>
              <Link
                href="/dashboard/upload"
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
              >
                Upload Data
              </Link>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <AlertTriangle className="h-16 w-16 text-red-600 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Analysis Failed</h2>
              <p className="text-lg text-gray-600">{error}</p>
            </div>
          ) : !analysis ? (
            <div className="text-center py-12">
              <AlertTriangle className="h-16 w-16 text-yellow-600 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-4">No Analysis Results</h2>
              <p className="text-lg text-gray-600">
                It seems there are no analysis results for the provided data.
              </p>
            </div>
          ) : (
            <div>
              {/* Strategy Selector */}
              <div className="mb-8 bg-white shadow rounded-lg p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Select Analysis Strategy</h2>
                <div className="flex space-x-4">
                  <button
                    onClick={() => handleStrategyChange('growth')}
                    className={`px-4 py-2 rounded-md text-sm font-medium ${selectedStrategy === 'growth' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                  >
                    Growth
                  </button>
                  <button
                    onClick={() => handleStrategyChange('hold')}
                    className={`px-4 py-2 rounded-md text-sm font-medium ${selectedStrategy === 'hold' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                  >
                    Hold
                  </button>
                  <button
                    onClick={() => handleStrategyChange('divest')}
                    className={`px-4 py-2 rounded-md text-sm font-medium ${selectedStrategy === 'divest' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                  >
                    Divest
                  </button>
                </div>
              </div>

              {/* Analysis Summary */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                <div className="bg-white shadow rounded-lg p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">Portfolio Health</h2>
                  <div className="flex items-center justify-between">
                    <p className="text-5xl font-bold" style={{ color: getPerformanceColor(analysis.performanceGrade) }}>
                      {(analysis.portfolioHealth * 100).toFixed(1)}%
                    </p>
                    <PortfolioHealthChart 
                      data={portfolioData.properties.map(prop => ({
                        property: prop.name,
                        healthScore: Math.floor(Math.random() * 40) + 60, // Random score 60-100
                        riskLevel: Math.random() > 0.5 ? 'Low' : 'Medium'
                      }))}
                    />
                  </div>
                  <p className="mt-4 text-gray-600">
                    Overall health of your portfolio based on selected strategy.
                  </p>
                </div>

                <div className="bg-white shadow rounded-lg p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">Risk Level</h2>
                  <div className="flex items-center justify-between">
                    <p className="text-5xl font-bold" style={{ color: getRiskColor(analysis.riskLevel).split(' ')[0] }}>
                      {analysis.riskLevel}
                    </p>
                    <RiskDistributionChart 
                      data={[
                        { name: 'Low Risk', value: Math.floor(Math.random() * 5) + 3, color: '#10B981' },
                        { name: 'Medium Risk', value: Math.floor(Math.random() * 3) + 1, color: '#F59E0B' },
                        { name: 'High Risk', value: Math.floor(Math.random() * 2), color: '#EF4444' }
                      ]}
                    />
                  </div>
                  <p className="mt-4 text-gray-600">
                    Assessed risk level of your current portfolio.
                  </p>
                </div>

                <div className="bg-white shadow rounded-lg p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">Performance Grade</h2>
                  <div className="flex items-center justify-between">
                    <p className="text-5xl font-bold" style={{ color: getPerformanceColor(analysis.performanceGrade) }}>
                      {analysis.performanceGrade}
                    </p>
                    {analysis.performanceGrade.startsWith('A') ? (
                      <CheckCircle className="h-16 w-16 text-green-500" />
                    ) : (
                      <AlertTriangle className="h-16 w-16 text-yellow-500" />
                    )}
                  </div>
                  <p className="mt-4 text-gray-600">
                    Overall performance grade of your portfolio.
                  </p>
                </div>
              </div>

              {/* Key Metrics */}
              <div className="bg-white shadow rounded-lg p-6 mb-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Key Metrics</h2>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Total Portfolio Value</dt>
                    <dd className="mt-1 text-lg font-semibold text-gray-900">{formatCurrency(analysis.metrics.totalValue)}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Average NOI</dt>
                    <dd className="mt-1 text-lg font-semibold text-gray-900">{formatCurrency(analysis.metrics.averageNOI)}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Average Occupancy</dt>
                    <dd className="mt-1 text-lg font-semibold text-gray-900">{formatPercentage(analysis.metrics.averageOccupancy)}</dd>
                  </div>
                </div>
              </div>

              {/* Recommendations */}
              <div className="bg-white shadow rounded-lg p-6 mb-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Recommendations</h2>
                <ul className="list-disc list-inside text-gray-600 space-y-2">
                  {analysis.recommendations.map((rec, index) => (
                    <li key={index}>{rec}</li>
                  ))}
                </ul>
              </div>

              {/* Property Table */}
              {properties.length > 0 && (
                <div className="bg-white shadow rounded-lg p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">Individual Property Performance</h2>
                  <PropertyTable properties={properties} />
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function PortfolioPage() {
  return (
    <DashboardLayout>
      <Suspense fallback={
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading portfolio...</p>
          </div>
        </div>
      }>
        <PortfolioContent />
      </Suspense>
    </DashboardLayout>
  );
}