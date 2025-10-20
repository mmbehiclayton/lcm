import { z } from 'zod';

// Property validation schema
export const PropertySchema = z.object({
  property_id: z.string().min(1, 'Property ID is required'),
  name: z.string().min(1, 'Property name is required'),
  type: z.enum(['Office', 'Retail', 'Industrial', 'Residential'], {
    errorMap: () => ({ message: 'Property type must be Office, Retail, Industrial, or Residential' })
  }),
  location: z.string().min(1, 'Location is required'),
  purchase_price: z.number().positive('Purchase price must be positive'),
  current_value: z.number().positive('Current value must be positive'),
  noi: z.number().min(0, 'NOI cannot be negative'),
  occupancy_rate: z.number().min(0).max(1, 'Occupancy rate must be between 0 and 1'),
  purchase_date: z.string().optional(),
  lease_expiry_date: z.string().optional(),
  epc_rating: z.enum(['A', 'B', 'C', 'D', 'E', 'F', 'G']).optional(),
  maintenance_score: z.number().min(1).max(10).optional()
});

// Lease validation schema
export const LeaseSchema = z.object({
  lease_id: z.string().min(1, 'Lease ID is required'),
  property_id: z.string().min(1, 'Property ID is required'),
  tenant_name: z.string().min(1, 'Tenant name is required'),
  start_date: z.string().min(1, 'Start date is required'),
  end_date: z.string().min(1, 'End date is required'),
  monthly_rent: z.number().positive('Monthly rent must be positive'),
  security_deposit: z.number().min(0).optional(),
  renewal_option: z.boolean().optional(),
  break_clause: z.boolean().optional()
});

// Occupancy validation schema
export const OccupancySchema = z.object({
  property_id: z.string().min(1, 'Property ID is required'),
  total_sq_ft: z.number().positive('Total square feet must be positive'),
  occupied_sq_ft: z.number().min(0, 'Occupied square feet cannot be negative'),
  vacant_sq_ft: z.number().min(0, 'Vacant square feet cannot be negative'),
  common_areas: z.number().min(0).optional(),
  parking_spaces: z.number().int().min(0).optional(),
  occupied_parking: z.number().int().min(0).optional()
});

// File upload validation
export const FileUploadSchema = z.object({
  file: z.instanceof(File, { message: 'File is required' }),
  maxSize: z.number().optional().default(50 * 1024 * 1024), // 50MB default
  allowedTypes: z.array(z.string()).optional().default([
    'text/csv',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  ])
});

// Analysis request validation
export const AnalysisRequestSchema = z.object({
  uploadId: z.string().min(1, 'Upload ID is required'),
  strategy: z.enum(['growth', 'hold', 'divest'], {
    errorMap: () => ({ message: 'Strategy must be growth, hold, or divest' })
  }),
  customWeights: z.object({
    lease: z.number().min(0).max(1),
    occupancy: z.number().min(0).max(1),
    noi: z.number().min(0).max(1),
    energy: z.number().min(0).max(1),
    capex: z.number().min(0).max(1)
  }).optional()
});

// User validation schema
export const UserSchema = z.object({
  email: z.string().email('Invalid email address'),
  name: z.string().min(1, 'Name is required'),
  password: z.string().min(8, 'Password must be at least 8 characters').optional()
});

// Authentication validation
export const LoginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required')
});

export const RegisterSchema = z.object({
  email: z.string().email('Invalid email address'),
  name: z.string().min(1, 'Name is required'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"]
});

// Search and filter validation
export const SearchParamsSchema = z.object({
  query: z.string().optional(),
  page: z.number().int().min(1).optional().default(1),
  limit: z.number().int().min(1).max(100).optional().default(10),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).optional().default('asc'),
  propertyType: z.enum(['Office', 'Retail', 'Industrial', 'Residential']).optional(),
  location: z.string().optional(),
  riskLevel: z.enum(['Low', 'Medium', 'High']).optional(),
  dateRange: z.object({
    start: z.string(),
    end: z.string()
  }).optional()
});

// Export options validation
export const ExportOptionsSchema = z.object({
  format: z.enum(['pdf', 'excel', 'csv']),
  includeCharts: z.boolean().optional().default(true),
  includeRecommendations: z.boolean().optional().default(true),
  dateRange: z.object({
    start: z.string(),
    end: z.string()
  }).optional()
});

// File validation functions
export async function validateFileUpload(file: File): Promise<{ valid: boolean; error?: string }> {
  try {
    const result = FileUploadSchema.parse({ file });
    
    // Check file size
    if (file.size > result.maxSize) {
      return {
        valid: false,
        error: `File size exceeds maximum allowed size of ${formatFileSize(result.maxSize)}`
      };
    }
    
    // Check file type
    if (!result.allowedTypes.includes(file.type)) {
      return {
        valid: false,
        error: `File type not supported. Allowed types: ${result.allowedTypes.join(', ')}`
      };
    }
    
    return { valid: true };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        valid: false,
        error: error.errors[0]?.message || 'Invalid file'
      };
    }
    return {
      valid: false,
      error: 'File validation failed'
    };
  }
}

export function validatePropertyData(data: any): { valid: boolean; error?: string; data?: any } {
  try {
    const validatedData = PropertySchema.parse(data);
    return { valid: true, data: validatedData };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        valid: false,
        error: error.errors[0]?.message || 'Invalid property data'
      };
    }
    return {
      valid: false,
      error: 'Property data validation failed'
    };
  }
}

export function validateLeaseData(data: any): { valid: boolean; error?: string; data?: any } {
  try {
    const validatedData = LeaseSchema.parse(data);
    return { valid: true, data: validatedData };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        valid: false,
        error: error.errors[0]?.message || 'Invalid lease data'
      };
    }
    return {
      valid: false,
      error: 'Lease data validation failed'
    };
  }
}

export function validateOccupancyData(data: any): { valid: boolean; error?: string; data?: any } {
  try {
    const validatedData = OccupancySchema.parse(data);
    return { valid: true, data: validatedData };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        valid: false,
        error: error.errors[0]?.message || 'Invalid occupancy data'
      };
    }
    return {
      valid: false,
      error: 'Occupancy data validation failed'
    };
  }
}

export function validateAnalysisRequest(data: any): { valid: boolean; error?: string; data?: any } {
  try {
    const validatedData = AnalysisRequestSchema.parse(data);
    return { valid: true, data: validatedData };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        valid: false,
        error: error.errors[0]?.message || 'Invalid analysis request'
      };
    }
    return {
      valid: false,
      error: 'Analysis request validation failed'
    };
  }
}

export function validateUserData(data: any): { valid: boolean; error?: string; data?: any } {
  try {
    const validatedData = UserSchema.parse(data);
    return { valid: true, data: validatedData };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        valid: false,
        error: error.errors[0]?.message || 'Invalid user data'
      };
    }
    return {
      valid: false,
      error: 'User data validation failed'
    };
  }
}

export function validateLoginData(data: any): { valid: boolean; error?: string; data?: any } {
  try {
    const validatedData = LoginSchema.parse(data);
    return { valid: true, data: validatedData };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        valid: false,
        error: error.errors[0]?.message || 'Invalid login data'
      };
    }
    return {
      valid: false,
      error: 'Login data validation failed'
    };
  }
}

export function validateRegisterData(data: any): { valid: boolean; error?: string; data?: any } {
  try {
    const validatedData = RegisterSchema.parse(data);
    return { valid: true, data: validatedData };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        valid: false,
        error: error.errors[0]?.message || 'Invalid registration data'
      };
    }
    return {
      valid: false,
      error: 'Registration data validation failed'
    };
  }
}

export function validateSearchParams(data: any): { valid: boolean; error?: string; data?: any } {
  try {
    const validatedData = SearchParamsSchema.parse(data);
    return { valid: true, data: validatedData };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        valid: false,
        error: error.errors[0]?.message || 'Invalid search parameters'
      };
    }
    return {
      valid: false,
      error: 'Search parameters validation failed'
    };
  }
}

export function validateExportOptions(data: any): { valid: boolean; error?: string; data?: any } {
  try {
    const validatedData = ExportOptionsSchema.parse(data);
    return { valid: true, data: validatedData };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        valid: false,
        error: error.errors[0]?.message || 'Invalid export options'
      };
    }
    return {
      valid: false,
      error: 'Export options validation failed'
    };
  }
}

// Helper function for file size formatting
function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}
