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
  X,
  RefreshCw
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

  // Advanced tab removed; single overview page
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [properties, setProperties] = useState<Property[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedStrategy, setSelectedStrategy] = useState<'growth' | 'hold' | 'divest'>('hold');
  const [showUpload, setShowUpload] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
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
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600 mx-auto"></div>
            <Building2 className="h-8 w-8 text-blue-600 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
          </div>
          <p className="mt-6 text-base font-medium text-gray-700">Loading portfolio data...</p>
          <p className="mt-2 text-sm text-gray-500">Please wait while we fetch your properties</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-purple-700 rounded-xl shadow-lg p-8 text-white">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <div className="flex items-center space-x-3 mb-3">
              <Building2 className="h-10 w-10" />
              <h1 className="text-4xl font-bold">Portfolio & Analysis</h1>
            </div>
            <p className="text-blue-100 text-base max-w-2xl">
              Comprehensive view of your real estate portfolio with advanced analytics and performance insights
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={async () => {
                setIsRefreshing(true);
                try {
                  await fetchPortfolioData();
                  await fetchAnalysis();
                  toast.success('Portfolio data refreshed');
                } catch (e) {
                  toast.error('Failed to refresh');
                } finally {
                  setIsRefreshing(false);
                }
              }}
              disabled={isRefreshing}
              className="inline-flex items-center justify-center p-3 bg-white/10 hover:bg-white/20 text-white rounded-lg backdrop-blur-sm border border-white/20 transition-all duration-200 hover:scale-105"
              title="Refresh"
              aria-label="Refresh"
            >
              <RefreshCw className={`h-5 w-5 ${isRefreshing ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={() => setShowUpload(!showUpload)}
              className="inline-flex items-center px-6 py-3 bg-white text-blue-700 font-semibold rounded-lg shadow-md hover:shadow-xl transition-all duration-200 transform hover:scale-105 hover:bg-blue-50"
            >
              <Upload className="h-5 w-5 mr-2" />
              Upload Data
            </button>
            {analysis && (
              <button
                onClick={() => handleExport('pdf')}
                className="inline-flex items-center px-5 py-3 bg-white/10 hover:bg-white/20 text-white font-medium rounded-lg backdrop-blur-sm border border-white/20 transition-all duration-200"
              >
                <Download className="h-5 w-5 mr-2" />
                Export
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

      {/* Portfolio Overview */}
        <div>
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 p-4 border border-blue-200">
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-blue-600 uppercase tracking-wide mb-1">Total Properties</p>
                  <p className="text-2xl font-bold text-blue-900 truncate">{portfolioData.totalProperties}</p>
                </div>
                <div className="bg-blue-200 p-2.5 rounded-lg flex-shrink-0 ml-2">
                  <Building2 className="h-6 w-6 text-blue-700" />
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 p-4 border border-green-200">
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-green-600 uppercase tracking-wide mb-1">Total Value</p>
                  <p className="text-2xl font-bold text-green-900 truncate">{formatCurrency(portfolioData.totalValue)}</p>
                </div>
                <div className="bg-green-200 p-2.5 rounded-lg flex-shrink-0 ml-2">
                  <DollarSign className="h-6 w-6 text-green-700" />
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 p-4 border border-purple-200">
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-purple-600 uppercase tracking-wide mb-1">Total NOI</p>
                  <p className="text-2xl font-bold text-purple-900 truncate">{formatCurrency(portfolioData.totalNOI)}</p>
                </div>
                <div className="bg-purple-200 p-2.5 rounded-lg flex-shrink-0 ml-2">
                  <TrendingUp className="h-6 w-6 text-purple-700" />
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 p-4 border border-orange-200">
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-orange-600 uppercase tracking-wide mb-1">Avg Occupancy</p>
                  <p className="text-2xl font-bold text-orange-900 truncate">{(portfolioData.averageOccupancy * 100).toFixed(1)}%</p>
                </div>
                <div className="bg-orange-200 p-2.5 rounded-lg flex-shrink-0 ml-2">
                  <Target className="h-6 w-6 text-orange-700" />
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
          <div className="bg-white shadow-lg rounded-xl overflow-hidden border border-gray-200">
            <div className="px-6 py-5 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Building2 className="h-5 w-5 text-gray-600" />
                  <h3 className="text-lg font-bold text-gray-900">Portfolio Properties</h3>
                </div>
                <span className="text-sm text-gray-500 font-medium">
                  {filteredProperties.length} {filteredProperties.length === 1 ? 'Property' : 'Properties'}
                </span>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-5 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                      Property
                    </th>
                    <th className="px-5 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                      Location
                    </th>
                    <th className="px-5 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-5 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                      Value
                    </th>
                    <th className="px-5 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                      NOI
                    </th>
                    <th className="px-5 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                      Occupancy
                    </th>
                    <th className="px-5 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                      Performance
                    </th>
                    <th className="px-5 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                      Purchase Date
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                  {filteredProperties.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="px-6 py-12 text-center">
                        <div className="flex flex-col items-center justify-center">
                          <div className="bg-gray-100 rounded-full p-4 mb-4">
                            <Building2 className="h-12 w-12 text-gray-400" />
                          </div>
                          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Properties Found</h3>
                          <p className="text-sm text-gray-500 mb-4">
                            {searchQuery || Object.keys(filters).length > 0 
                              ? 'Try adjusting your search or filters' 
                              : 'Upload portfolio data to get started'}
                          </p>
                          {!searchQuery && Object.keys(filters).length === 0 && (
                            <button
                              onClick={() => setShowUpload(true)}
                              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
                            >
                              <Upload className="h-4 w-4 mr-2" />
                              Upload Portfolio
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredProperties.map((property) => (
                      <tr key={property.id} className="hover:bg-blue-50 transition-colors duration-150">
                        <td className="px-5 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-semibold text-gray-900">{property.name}</div>
                            <div className="text-xs text-gray-500">ID: {property.id}</div>
                          </div>
                        </td>
                        <td className="px-5 py-4 whitespace-nowrap">
                          <div className="flex items-center text-sm text-gray-700">
                            <MapPin className="h-4 w-4 mr-1.5 text-gray-400" />
                            {property.location}
                          </div>
                        </td>
                        <td className="px-5 py-4 whitespace-nowrap">
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700 border border-blue-200">
                            {property.type}
                          </span>
                        </td>
                        <td className="px-5 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {formatCurrency(property.value)}
                        </td>
                        <td className="px-5 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {formatCurrency(property.noi)}
                        </td>
                        <td className="px-5 py-4 whitespace-nowrap">
                          <div className="flex items-center space-x-2">
                            <div className="text-sm font-semibold text-gray-900">{(property.occupancy * 100).toFixed(1)}%</div>
                            <div className="w-16 bg-gray-200 rounded-full h-1.5">
                              <div 
                                className="bg-gradient-to-r from-green-400 to-green-600 h-1.5 rounded-full" 
                                style={{ width: `${(property.occupancy * 100).toFixed(0)}%` }}
                              ></div>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border ${
                            property.performance.startsWith('A') ? 'bg-green-100 text-green-700 border-green-200' :
                            property.performance.startsWith('B') ? 'bg-yellow-100 text-yellow-700 border-yellow-200' :
                            'bg-red-100 text-red-700 border-red-200'
                          }`}>
                            <Star className="h-3 w-3 mr-1" />
                            {property.performance}
                          </span>
                        </td>
                        <td className="px-5 py-4 whitespace-nowrap text-sm text-gray-600">
                          <div className="flex items-center">
                            <Calendar className="h-4 w-4 mr-1.5 text-gray-400" />
                            {new Date(property.purchaseDate).toLocaleDateString()}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

      {/* Advanced Analysis section removed in favor of unified overview */}
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