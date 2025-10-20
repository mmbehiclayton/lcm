// Core data types for LCM Analytics MVP

export interface Property {
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

export interface Lease {
  lease_id: string;
  property_id: string;
  tenant_name: string;
  start_date: string;
  end_date: string;
  monthly_rent: number;
  security_deposit?: number;
  renewal_option?: boolean;
  break_clause?: boolean;
}

export interface Occupancy {
  property_id: string;
  total_sq_ft: number;
  occupied_sq_ft: number;
  vacant_sq_ft: number;
  common_areas?: number;
  parking_spaces?: number;
  occupied_parking?: number;
}

export interface PropertyMetrics {
  propertyId: string;
  leaseScore: number;
  occupancyScore: number;
  noiScore: number;
  energyScore: number;
  capexScore: number;
}

export interface PortfolioAnalysis {
  portfolioHealth: number;
  riskLevel: 'Low' | 'Medium' | 'High';
  performanceGrade: 'A+' | 'A' | 'B+' | 'B' | 'C+' | 'C';
  recommendations: string[];
  metrics: PropertyMetrics[];
}

export interface AnalysisResult {
  portfolio_health: number;
  risk_level: string;
  performance_grade: string;
  recommendations: string[];
  property_scores: PropertyMetrics[];
}

export interface Upload {
  id: string;
  filename: string;
  fileType: string;
  fileSize: number;
  filePath: string;
  metadata?: any;
  createdAt: string;
}

export interface Analysis {
  id: string;
  userId: string;
  uploadId: string;
  strategy: 'growth' | 'hold' | 'divest';
  results?: PortfolioAnalysis;
  createdAt: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

export interface FileUploadProps {
  onFileSelect: (file: File) => void;
  onRemove: () => void;
  selectedFile?: File;
  isLoading?: boolean;
}

export interface DashboardProps {
  analysis: PortfolioAnalysis;
  properties: Property[];
}

export interface ChartData {
  property: string;
  healthScore: number;
  riskLevel: string;
}

export interface TableColumn {
  key: string;
  label: string;
  sortable?: boolean;
  render?: (value: any, row: any) => React.ReactNode;
}

export interface ValidationResult {
  valid: boolean;
  error?: string;
  data?: any[];
}

export interface StrategyWeights {
  lease: number;
  occupancy: number;
  noi: number;
  energy: number;
  capex: number;
}

export interface LeaseAnalysis {
  expiring_soon: Array<{
    lease_id: string;
    tenant_name: string;
    days_to_expiry: number;
    monthly_rent: number;
    priority: 'high' | 'medium';
  }>;
  renewal_opportunities: Array<{
    lease_id: string;
    tenant_name: string;
    current_rent: number;
    market_rent_estimate: number;
    renewal_potential: number;
  }>;
  recommendations: string[];
}

export interface OccupancyAnalysis {
  portfolio_efficiency: number;
  underutilized_properties: Array<{
    property_id: string;
    utilization_rate: number;
    vacant_sq_ft: number;
    potential_revenue: number;
    optimization_potential: number;
  }>;
  optimization_opportunities: Array<{
    property_id: string;
    opportunity_type: string;
    potential_impact: number;
    implementation_cost: number;
  }>;
  recommendations: string[];
}

export interface RiskAssessment {
  overall_risk_score: number;
  risk_level: 'Low' | 'Medium' | 'High';
  risk_factors: {
    concentration_risk: number;
    lease_risk: number;
    market_risk: number;
    operational_risk: number;
    financial_risk: number;
  };
  recommendations: string[];
}

export interface ExportOptions {
  format: 'pdf' | 'excel' | 'csv';
  includeCharts: boolean;
  includeRecommendations: boolean;
  dateRange?: {
    start: string;
    end: string;
  };
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginationParams {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface FilterParams {
  propertyType?: string;
  location?: string;
  riskLevel?: string;
  dateRange?: {
    start: string;
    end: string;
  };
}

export interface SearchParams extends PaginationParams, FilterParams {
  query?: string;
}

export interface NotificationProps {
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  duration?: number;
  onClose?: () => void;
}

export interface LoadingState {
  isLoading: boolean;
  message?: string;
  progress?: number;
}

export interface ErrorState {
  hasError: boolean;
  message?: string;
  code?: string;
  details?: any;
}

// Utility types
export type Strategy = 'growth' | 'hold' | 'divest';
export type RiskLevel = 'Low' | 'Medium' | 'High';
export type PerformanceGrade = 'A+' | 'A' | 'B+' | 'B' | 'C+' | 'C';
export type PropertyType = 'Office' | 'Retail' | 'Industrial' | 'Residential';
export type FileType = 'csv' | 'xlsx' | 'xls';
export type ExportFormat = 'pdf' | 'excel' | 'csv';
