# Testing Plan
## LCM Analytics MVP - Real Estate Intelligence Platform

### Document Information
- **Version**: 1.0
- **Date**: October 2024
- **Project**: LCM Analytics MVP

---

## 1. Testing Strategy Overview

### 1.1 Testing Objectives
- Ensure all functional requirements are met
- Validate data accuracy and calculation correctness
- Verify system performance under expected load
- Confirm security and data protection measures
- Validate user experience and interface usability

### 1.2 Testing Levels
- **Unit Testing**: Individual component and function testing
- **Integration Testing**: API and service integration testing
- **System Testing**: End-to-end workflow testing
- **User Acceptance Testing**: Business requirement validation
- **Performance Testing**: Load and stress testing
- **Security Testing**: Authentication and data protection

---

## 2. Unit Testing Plan

### 2.1 Frontend Component Testing

#### 2.1.1 File Upload Component Tests

| Test Case | Description | Input | Expected Output | Priority |
|-----------|-------------|-------|-----------------|----------|
| TC-001 | Valid CSV file upload | CSV file (5MB) | Upload success, file preview shown | High |
| TC-002 | Valid Excel file upload | Excel file (.xlsx) | Upload success, file preview shown | High |
| TC-003 | Invalid file type upload | PDF file | Error message displayed | High |
| TC-004 | File size limit exceeded | CSV file (60MB) | Error message displayed | High |
| TC-005 | Drag and drop functionality | Drag CSV file to drop zone | File accepted and preview shown | Medium |
| TC-006 | File removal | Remove uploaded file | File removed, upload area reset | Medium |

```typescript
// tests/unit/components/FileUpload.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { FileUpload } from '@/components/forms/FileUpload';

describe('FileUpload Component', () => {
  test('should accept valid CSV file', async () => {
    const mockOnFileSelect = jest.fn();
    render(<FileUpload onFileSelect={mockOnFileSelect} />);
    
    const file = new File(['property_id,name,type\nPROP_001,Test,Office'], 'test.csv', {
      type: 'text/csv'
    });
    
    const input = screen.getByLabelText(/upload/i);
    fireEvent.change(input, { target: { files: [file] } });
    
    await waitFor(() => {
      expect(mockOnFileSelect).toHaveBeenCalledWith(file);
    });
  });

  test('should reject invalid file type', async () => {
    const mockOnFileSelect = jest.fn();
    render(<FileUpload onFileSelect={mockOnFileSelect} />);
    
    const file = new File(['content'], 'test.pdf', { type: 'application/pdf' });
    const input = screen.getByLabelText(/upload/i);
    fireEvent.change(input, { target: { files: [file] } });
    
    await waitFor(() => {
      expect(screen.getByText(/invalid file type/i)).toBeInTheDocument();
    });
  });
});
```

#### 2.1.2 Dashboard Component Tests

| Test Case | Description | Input | Expected Output | Priority |
|-----------|-------------|-------|-----------------|----------|
| TC-007 | Portfolio health chart rendering | Analysis results data | Chart displays correctly | High |
| TC-008 | Data table sorting | Click column header | Data sorted by column | High |
| TC-009 | Filter functionality | Select filter option | Data filtered correctly | Medium |
| TC-010 | Export functionality | Click export button | File download initiated | Medium |
| TC-011 | Responsive design | Mobile viewport | Layout adapts correctly | Medium |

### 2.2 Backend Service Testing

#### 2.2.1 Analytics Engine Tests

| Test Case | Description | Input | Expected Output | Priority |
|-----------|-------------|-------|-----------------|----------|
| TC-012 | Portfolio health calculation | Property data + strategy | Correct health score | High |
| TC-013 | Lease score calculation | Property with lease data | Correct lease score | High |
| TC-014 | Occupancy score calculation | Property occupancy data | Correct occupancy score | High |
| TC-015 | NOI score calculation | Property financial data | Correct NOI score | High |
| TC-016 | Strategy weight application | Different strategies | Correct weight application | High |
| TC-017 | Missing data handling | Property with missing fields | Default values applied | Medium |

```typescript
// tests/unit/services/analyticsEngine.test.ts
import { AnalyticsEngine } from '@/lib/services/analyticsEngine';

describe('AnalyticsEngine', () => {
  const mockProperties = [
    {
      property_id: 'PROP_001',
      name: 'Test Property',
      type: 'Office',
      location: 'New York',
      purchase_price: 1000000,
      current_value: 1100000,
      noi: 88000,
      occupancy_rate: 0.85,
      lease_expiry_date: '2025-12-31',
      epc_rating: 'B',
      maintenance_score: 8
    }
  ];

  test('should calculate portfolio health for growth strategy', () => {
    const result = AnalyticsEngine.calculatePortfolioHealth(mockProperties, 'growth');
    
    expect(result.portfolioHealth).toBeGreaterThan(0);
    expect(result.portfolioHealth).toBeLessThanOrEqual(100);
    expect(result.riskLevel).toMatch(/Low|Medium|High/);
    expect(result.performanceGrade).toMatch(/A\+|A|B\+|B|C\+|C/);
  });

  test('should apply correct weights for different strategies', () => {
    const growthResult = AnalyticsEngine.calculatePortfolioHealth(mockProperties, 'growth');
    const holdResult = AnalyticsEngine.calculatePortfolioHealth(mockProperties, 'hold');
    const divestResult = AnalyticsEngine.calculatePortfolioHealth(mockProperties, 'divest');
    
    // Results should differ based on strategy weights
    expect(growthResult.portfolioHealth).not.toBe(holdResult.portfolioHealth);
    expect(holdResult.portfolioHealth).not.toBe(divestResult.portfolioHealth);
  });

  test('should handle missing optional fields', () => {
    const propertyWithMissingFields = {
      ...mockProperties[0],
      epc_rating: undefined,
      maintenance_score: undefined
    };

    const result = AnalyticsEngine.calculatePortfolioHealth([propertyWithMissingFields], 'hold');
    
    expect(result.portfolioHealth).toBeGreaterThan(0);
    expect(result.metrics[0].energyScore).toBe(50); // Default value
    expect(result.metrics[0].capexScore).toBe(50); // Default value
  });
});
```

#### 2.2.2 Data Processing Tests

| Test Case | Description | Input | Expected Output | Priority |
|-----------|-------------|-------|-----------------|----------|
| TC-018 | CSV parsing | Valid CSV file | Parsed data array | High |
| TC-019 | Excel parsing | Valid Excel file | Parsed data array | High |
| TC-020 | Data validation | Invalid data format | Validation errors | High |
| TC-021 | Large file processing | CSV with 10,000 rows | Processing completes | Medium |
| TC-022 | Data cleaning | Data with missing values | Cleaned data | Medium |

---

## 3. Integration Testing Plan

### 3.1 API Integration Tests

#### 3.1.1 File Upload API Tests

| Test Case | Description | Input | Expected Output | Priority |
|-----------|-------------|-------|-----------------|----------|
| TC-023 | Valid file upload | CSV file via API | 200 OK, upload ID returned | High |
| TC-024 | Invalid file type upload | PDF file via API | 400 Bad Request | High |
| TC-025 | File size limit | Large file via API | 413 Payload Too Large | High |
| TC-026 | Authentication required | Upload without auth | 401 Unauthorized | High |
| TC-027 | Database storage | Successful upload | File metadata stored | High |

```typescript
// tests/integration/api/upload.test.ts
import { NextRequest } from 'next/server';
import { POST as uploadHandler } from '@/app/api/upload/route';

describe('Upload API Integration', () => {
  test('should handle valid file upload', async () => {
    const formData = new FormData();
    const mockFile = new File(['property_id,name,type\nPROP_001,Test,Office'], 'test.csv', {
      type: 'text/csv'
    });
    formData.append('file', mockFile);

    const request = new NextRequest('http://localhost:3000/api/upload', {
      method: 'POST',
      body: formData
    });

    const response = await uploadHandler(request);
    const data = await response.json();
    
    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.uploadId).toBeDefined();
  });

  test('should reject invalid file type', async () => {
    const formData = new FormData();
    const mockFile = new File(['content'], 'test.pdf', { type: 'application/pdf' });
    formData.append('file', mockFile);

    const request = new NextRequest('http://localhost:3000/api/upload', {
      method: 'POST',
      body: formData
    });

    const response = await uploadHandler(request);
    
    expect(response.status).toBe(400);
  });
});
```

#### 3.1.2 Analysis API Tests

| Test Case | Description | Input | Expected Output | Priority |
|-----------|-------------|-------|-----------------|----------|
| TC-028 | Portfolio analysis | Upload ID + strategy | Analysis results | High |
| TC-029 | Invalid upload ID | Non-existent upload ID | 404 Not Found | High |
| TC-030 | Missing strategy | Upload ID only | 400 Bad Request | High |
| TC-031 | Analysis processing time | Large dataset | Processing completes < 60s | Medium |
| TC-032 | Concurrent analysis | Multiple requests | All processed correctly | Medium |

### 3.2 Database Integration Tests

| Test Case | Description | Input | Expected Output | Priority |
|-----------|-------------|-------|-----------------|----------|
| TC-033 | User creation | User data | User record created | High |
| TC-034 | Upload storage | File metadata | Upload record created | High |
| TC-035 | Analysis storage | Analysis results | Analysis record created | High |
| TC-036 | Data retrieval | Query parameters | Correct data returned | High |
| TC-037 | Data relationships | Related queries | Correct joins performed | Medium |

### 3.3 Python Service Integration Tests

| Test Case | Description | Input | Expected Output | Priority |
|-----------|-------------|-------|-----------------|----------|
| TC-038 | Python service health | Health check request | Service available | High |
| TC-039 | Analysis via Python | Property data | Analysis results | High |
| TC-040 | Service unavailable | Python service down | Fallback to JS logic | Medium |
| TC-041 | Large dataset processing | 1000+ properties | Processing completes | Medium |

---

## 4. System Testing Plan

### 4.1 End-to-End Workflow Tests

#### 4.1.1 Complete Analysis Workflow

| Test Case | Description | Steps | Expected Output | Priority |
|-----------|-------------|-------|-----------------|----------|
| TC-042 | Full analysis workflow | Upload → Analyze → View Results | Complete workflow success | High |
| TC-043 | Multiple file uploads | Upload multiple files | All files processed | High |
| TC-044 | Analysis with different strategies | Test all three strategies | Different results per strategy | High |
| TC-045 | Export functionality | Export analysis results | File downloaded | Medium |
| TC-046 | User session management | Login → Analyze → Logout | Session handled correctly | Medium |

```typescript
// tests/e2e/analysis-workflow.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Analysis Workflow E2E', () => {
  test('should complete full analysis workflow', async ({ page }) => {
    // Navigate to upload page
    await page.goto('/upload');
    
    // Upload file
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles('tests/fixtures/sample-data.csv');
    
    // Wait for upload success
    await expect(page.locator('[data-testid="upload-success"]')).toBeVisible();
    
    // Navigate to analysis
    await page.click('[data-testid="analyze-button"]');
    
    // Select strategy
    await page.selectOption('[data-testid="strategy-select"]', 'growth');
    
    // Start analysis
    await page.click('[data-testid="start-analysis"]');
    
    // Wait for results
    await expect(page.locator('[data-testid="analysis-results"]')).toBeVisible();
    
    // Verify dashboard elements
    await expect(page.locator('[data-testid="portfolio-health-chart"]')).toBeVisible();
    await expect(page.locator('[data-testid="recommendations-list"]')).toBeVisible();
  });
});
```

#### 4.1.2 User Interface Tests

| Test Case | Description | Input | Expected Output | Priority |
|-----------|-------------|-------|-----------------|----------|
| TC-047 | Dashboard responsiveness | Different screen sizes | Layout adapts correctly | High |
| TC-048 | Chart interactions | Click chart elements | Interactive features work | Medium |
| TC-049 | Table functionality | Sort, filter, paginate | All features work | Medium |
| TC-050 | Navigation | Navigate between pages | Navigation works correctly | Medium |
| TC-051 | Error handling | Invalid inputs | Error messages displayed | High |

### 4.2 Performance Testing

#### 4.2.1 Load Testing

| Test Case | Description | Load | Expected Output | Priority |
|-----------|-------------|------|-----------------|----------|
| TC-052 | Concurrent users | 50 users | All requests processed | High |
| TC-053 | File upload load | 10 simultaneous uploads | All uploads successful | Medium |
| TC-054 | Analysis load | 20 concurrent analyses | All analyses complete | Medium |
| TC-055 | Database load | 100 concurrent queries | Response time < 2s | Medium |

#### 4.2.2 Stress Testing

| Test Case | Description | Load | Expected Output | Priority |
|-----------|-------------|------|-----------------|----------|
| TC-056 | Large file processing | 50MB CSV file | Processing completes < 60s | High |
| TC-057 | Large dataset analysis | 10,000 properties | Analysis completes < 120s | Medium |
| TC-058 | Memory usage | Extended processing | No memory leaks | Medium |
| TC-059 | Database connections | High connection count | Connection pool managed | Medium |

---

## 5. Security Testing Plan

### 5.1 Authentication and Authorization Tests

| Test Case | Description | Input | Expected Output | Priority |
|-----------|-------------|-------|-----------------|----------|
| TC-060 | Valid login | Correct credentials | Access granted | High |
| TC-061 | Invalid login | Incorrect credentials | Access denied | High |
| TC-062 | Session timeout | Inactive session | Session expired | High |
| TC-063 | Unauthorized access | No authentication | Access denied | High |
| TC-064 | Role-based access | Different user roles | Appropriate access | Medium |

### 5.2 Data Security Tests

| Test Case | Description | Input | Expected Output | Priority |
|-----------|-------------|-------|-----------------|----------|
| TC-065 | File upload security | Malicious file | File rejected | High |
| TC-066 | SQL injection | Malicious input | Injection prevented | High |
| TC-067 | XSS prevention | Script injection | Scripts sanitized | High |
| TC-068 | Data encryption | Sensitive data | Data encrypted | High |
| TC-069 | File access control | Unauthorized file access | Access denied | Medium |

---

## 6. User Acceptance Testing Plan

### 6.1 Business Requirement Validation

| Test Case | Description | Acceptance Criteria | Priority |
|-----------|-------------|-------------------|----------|
| TC-070 | Portfolio analysis accuracy | Health scores within 5% of manual calculation | High |
| TC-071 | Lease analysis functionality | Expiry alerts generated correctly | High |
| TC-072 | Occupancy analysis | Utilization metrics calculated correctly | High |
| TC-073 | Export functionality | Exported data matches dashboard | High |
| TC-074 | User interface usability | Users can complete analysis in < 10 minutes | Medium |

### 6.2 User Experience Tests

| Test Case | Description | Input | Expected Output | Priority |
|-----------|-------------|-------|-----------------|----------|
| TC-075 | File upload UX | Drag and drop file | Intuitive upload process | Medium |
| TC-076 | Dashboard navigation | Navigate dashboard | Easy navigation | Medium |
| TC-077 | Error message clarity | Invalid input | Clear error messages | Medium |
| TC-078 | Mobile responsiveness | Mobile device usage | Mobile-friendly interface | Medium |
| TC-079 | Loading indicators | Long operations | Progress indicators shown | Low |

---

## 7. Test Data Management

### 7.1 Test Data Requirements

```typescript
// Test data fixtures
export const mockProperties = [
  {
    property_id: 'PROP_001',
    name: 'Downtown Office Tower',
    type: 'Office',
    location: 'New York, NY',
    purchase_price: 5000000,
    current_value: 5500000,
    noi: 275000,
    occupancy_rate: 0.85,
    purchase_date: '2020-01-15',
    lease_expiry_date: '2025-06-30',
    epc_rating: 'B',
    maintenance_score: 8.5
  },
  // Additional test properties...
];

export const mockLeases = [
  {
    lease_id: 'LEASE_001',
    property_id: 'PROP_001',
    tenant_name: 'Tech Corp Inc',
    start_date: '2020-01-01',
    end_date: '2025-12-31',
    monthly_rent: 15000,
    security_deposit: 30000,
    renewal_option: true,
    break_clause: false
  },
  // Additional test leases...
];
```

### 7.2 Test Environment Setup

```bash
# Test database setup
DATABASE_URL="postgresql://test_user:test_pass@localhost:5432/lcm_test"

# Test file storage
UPLOAD_DIR="./test-uploads"

# Test Python service
PYTHON_SERVICE_URL="http://localhost:8001"
```

---

## 8. Test Execution Plan

### 8.1 Testing Phases

| Phase | Duration | Focus | Deliverables |
|-------|----------|-------|--------------|
| Unit Testing | Week 1-2 | Component functionality | Unit test results |
| Integration Testing | Week 3-4 | API and service integration | Integration test results |
| System Testing | Week 5-6 | End-to-end workflows | System test results |
| Performance Testing | Week 7 | Load and stress testing | Performance metrics |
| Security Testing | Week 8 | Security validation | Security test results |
| UAT | Week 9-10 | Business validation | UAT sign-off |

### 8.2 Test Automation

```yaml
# .github/workflows/test.yml
name: Test Suite

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  unit-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: pnpm install
      - run: pnpm test:unit

  integration-tests:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:14
        env:
          POSTGRES_PASSWORD: postgres
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: pnpm install
      - run: pnpm test:integration

  e2e-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: pnpm install
      - run: pnpm test:e2e
```

---

## 9. Test Metrics and Reporting

### 9.1 Test Coverage Targets

| Component | Coverage Target | Current Coverage |
|-----------|-----------------|-------------------|
| Frontend Components | 80% | TBD |
| Backend Services | 85% | TBD |
| API Endpoints | 90% | TBD |
| Database Operations | 75% | TBD |
| Overall System | 80% | TBD |

### 9.2 Test Reporting

```typescript
// Test report generation
export interface TestReport {
  testSuite: string;
  totalTests: number;
  passedTests: number;
  failedTests: number;
  skippedTests: number;
  coverage: number;
  executionTime: number;
  timestamp: string;
}

export function generateTestReport(results: TestResult[]): TestReport {
  return {
    testSuite: 'LCM Analytics MVP',
    totalTests: results.length,
    passedTests: results.filter(r => r.status === 'passed').length,
    failedTests: results.filter(r => r.status === 'failed').length,
    skippedTests: results.filter(r => r.status === 'skipped').length,
    coverage: calculateCoverage(results),
    executionTime: calculateExecutionTime(results),
    timestamp: new Date().toISOString()
  };
}
```

---

## 10. Defect Management

### 10.1 Defect Classification

| Severity | Description | Response Time |
|----------|-------------|---------------|
| Critical | System crash, data loss | 2 hours |
| High | Major functionality broken | 8 hours |
| Medium | Minor functionality issues | 24 hours |
| Low | Cosmetic issues | 72 hours |

### 10.2 Defect Tracking

```typescript
// Defect tracking interface
export interface Defect {
  id: string;
  title: string;
  description: string;
  severity: 'Critical' | 'High' | 'Medium' | 'Low';
  status: 'Open' | 'In Progress' | 'Resolved' | 'Closed';
  assignedTo: string;
  reportedBy: string;
  reportedAt: string;
  resolvedAt?: string;
  testCaseId?: string;
  stepsToReproduce: string[];
  expectedResult: string;
  actualResult: string;
}
```

---

*This comprehensive testing plan ensures thorough validation of the LCM Analytics MVP across all functional and non-functional requirements, providing confidence in system reliability and performance.*
