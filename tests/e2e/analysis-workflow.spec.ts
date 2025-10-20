import { test, expect } from '@playwright/test';

test.describe('Analysis Workflow E2E', () => {
  test('should complete full analysis workflow', async ({ page }) => {
    // Navigate to upload page
    await page.goto('/upload');
    
    // Wait for page to load
    await expect(page.locator('h1')).toContainText('Upload Your Real Estate Data');
    
    // Create a test CSV file
    const csvContent = `property_id,name,type,location,purchase_price,current_value,noi,occupancy_rate,purchase_date,lease_expiry_date,epc_rating,maintenance_score
PROP_001,Test Office Building,Office,New York,1000000,1100000,88000,0.85,2020-01-01,2025-12-31,B,8
PROP_002,Test Retail Space,Retail,Los Angeles,800000,900000,54000,0.75,2019-06-01,2024-06-30,C,6`;
    
    // Upload file
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles({
      name: 'test-data.csv',
      mimeType: 'text/csv',
      buffer: Buffer.from(csvContent)
    });
    
    // Wait for file to be selected
    await expect(page.locator('text=test-data.csv')).toBeVisible();
    
    // Click upload button
    await page.click('button:has-text("Upload and Analyze")');
    
    // Wait for upload to complete
    await expect(page.locator('text=Upload Successful!')).toBeVisible();
    
    // Wait for redirect to analysis page
    await page.waitForURL('/analysis*');
    
    // Verify analysis page elements
    await expect(page.locator('h1')).toContainText('Portfolio Analysis');
    await expect(page.locator('text=Portfolio Health')).toBeVisible();
    await expect(page.locator('text=Performance Grade')).toBeVisible();
    await expect(page.locator('text=Risk Level')).toBeVisible();
    await expect(page.locator('text=Properties')).toBeVisible();
    
    // Verify charts are present
    await expect(page.locator('[data-testid="portfolio-health-chart"]')).toBeVisible();
    await expect(page.locator('[data-testid="risk-distribution-chart"]')).toBeVisible();
    
    // Verify recommendations section
    await expect(page.locator('text=Recommendations')).toBeVisible();
    
    // Verify properties table
    await expect(page.locator('text=Property Details')).toBeVisible();
    await expect(page.locator('text=PROP_001')).toBeVisible();
    await expect(page.locator('text=PROP_002')).toBeVisible();
  });

  test('should handle file upload errors', async ({ page }) => {
    await page.goto('/upload');
    
    // Try to upload invalid file type
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles({
      name: 'test.pdf',
      mimeType: 'application/pdf',
      buffer: Buffer.from('test content')
    });
    
    // Should show error
    await expect(page.locator('text=File type not supported')).toBeVisible();
  });

  test('should handle strategy selection', async ({ page }) => {
    // Navigate to analysis page (assuming we have an existing analysis)
    await page.goto('/analysis?uploadId=test-upload-id');
    
    // Wait for page to load
    await page.waitForLoadState('networkidle');
    
    // Select different strategy
    await page.selectOption('select', 'growth');
    
    // Wait for analysis to update
    await expect(page.locator('text=Portfolio Health')).toBeVisible();
  });

  test('should handle export functionality', async ({ page }) => {
    await page.goto('/analysis?uploadId=test-upload-id');
    
    // Wait for page to load
    await page.waitForLoadState('networkidle');
    
    // Click export button
    await page.click('button:has-text("Export")');
    
    // Should show export options or trigger download
    // Note: This would need to be implemented based on actual export functionality
  });
});
