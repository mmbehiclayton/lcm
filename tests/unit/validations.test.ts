import { 
  validatePropertyData, 
  validateLeaseData, 
  validateOccupancyData,
  validateAnalysisRequest,
  validateFileUpload 
} from '@/lib/validations';

describe('Data Validation', () => {
  describe('Property Data Validation', () => {
    test('should validate correct property data', () => {
      const validProperty = {
        property_id: 'PROP_001',
        name: 'Test Property',
        type: 'Office',
        location: 'New York',
        purchase_price: 1000000,
        current_value: 1100000,
        noi: 88000,
        occupancy_rate: 0.85
      };

      const result = validatePropertyData(validProperty);
      
      expect(result.valid).toBe(true);
      expect(result.data).toEqual(validProperty);
    });

    test('should reject invalid property data', () => {
      const invalidProperty = {
        property_id: '',
        name: 'Test Property',
        type: 'InvalidType',
        location: 'New York',
        purchase_price: -1000,
        current_value: 1100000,
        noi: 88000,
        occupancy_rate: 1.5
      };

      const result = validatePropertyData(invalidProperty);
      
      expect(result.valid).toBe(false);
      expect(result.error).toBeDefined();
    });
  });

  describe('Lease Data Validation', () => {
    test('should validate correct lease data', () => {
      const validLease = {
        lease_id: 'LEASE_001',
        property_id: 'PROP_001',
        tenant_name: 'Test Tenant',
        start_date: '2020-01-01',
        end_date: '2025-12-31',
        monthly_rent: 5000
      };

      const result = validateLeaseData(validLease);
      
      expect(result.valid).toBe(true);
      expect(result.data).toEqual(validLease);
    });

    test('should reject invalid lease data', () => {
      const invalidLease = {
        lease_id: '',
        property_id: 'PROP_001',
        tenant_name: 'Test Tenant',
        start_date: '2020-01-01',
        end_date: '2025-12-31',
        monthly_rent: -1000
      };

      const result = validateLeaseData(invalidLease);
      
      expect(result.valid).toBe(false);
      expect(result.error).toBeDefined();
    });
  });

  describe('Occupancy Data Validation', () => {
    test('should validate correct occupancy data', () => {
      const validOccupancy = {
        property_id: 'PROP_001',
        total_sq_ft: 10000,
        occupied_sq_ft: 8500,
        vacant_sq_ft: 1500
      };

      const result = validateOccupancyData(validOccupancy);
      
      expect(result.valid).toBe(true);
      expect(result.data).toEqual(validOccupancy);
    });

    test('should reject invalid occupancy data', () => {
      const invalidOccupancy = {
        property_id: 'PROP_001',
        total_sq_ft: -1000,
        occupied_sq_ft: 8500,
        vacant_sq_ft: 1500
      };

      const result = validateOccupancyData(invalidOccupancy);
      
      expect(result.valid).toBe(false);
      expect(result.error).toBeDefined();
    });
  });

  describe('Analysis Request Validation', () => {
    test('should validate correct analysis request', () => {
      const validRequest = {
        uploadId: 'upload_123',
        strategy: 'growth'
      };

      const result = validateAnalysisRequest(validRequest);
      
      expect(result.valid).toBe(true);
      expect(result.data).toEqual(validRequest);
    });

    test('should reject invalid analysis request', () => {
      const invalidRequest = {
        uploadId: '',
        strategy: 'invalid_strategy'
      };

      const result = validateAnalysisRequest(invalidRequest);
      
      expect(result.valid).toBe(false);
      expect(result.error).toBeDefined();
    });
  });

  describe('File Upload Validation', () => {
    test('should validate correct file upload', async () => {
      const mockFile = new File(['test content'], 'test.csv', { type: 'text/csv' });
      
      const result = await validateFileUpload(mockFile);
      
      expect(result.valid).toBe(true);
    });

    test('should reject invalid file type', async () => {
      const mockFile = new File(['test content'], 'test.pdf', { type: 'application/pdf' });
      
      const result = await validateFileUpload(mockFile);
      
      expect(result.valid).toBe(false);
      expect(result.error).toBeDefined();
    });

    test('should reject oversized file', async () => {
      const mockFile = new File(['test content'], 'test.csv', { type: 'text/csv' });
      Object.defineProperty(mockFile, 'size', { value: 100 * 1024 * 1024 }); // 100MB
      
      const result = await validateFileUpload(mockFile);
      
      expect(result.valid).toBe(false);
      expect(result.error).toBeDefined();
    });
  });
});
