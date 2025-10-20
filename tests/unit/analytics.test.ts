import { AnalyticsEngine } from '@/lib/analytics';
import { Property } from '@/types';

describe('AnalyticsEngine', () => {
  const mockProperties: Property[] = [
    {
      property_id: 'PROP_001',
      name: 'Test Property 1',
      type: 'Office',
      location: 'New York',
      purchase_price: 1000000,
      current_value: 1100000,
      noi: 88000,
      occupancy_rate: 0.85,
      purchase_date: '2020-01-01',
      lease_expiry_date: '2025-12-31',
      epc_rating: 'B',
      maintenance_score: 8
    },
    {
      property_id: 'PROP_002',
      name: 'Test Property 2',
      type: 'Retail',
      location: 'Los Angeles',
      purchase_price: 800000,
      current_value: 900000,
      noi: 54000,
      occupancy_rate: 0.75,
      purchase_date: '2019-06-01',
      lease_expiry_date: '2024-06-30',
      epc_rating: 'C',
      maintenance_score: 6
    }
  ];

  test('should calculate portfolio health for growth strategy', () => {
    const result = AnalyticsEngine.calculatePortfolioHealth(mockProperties, 'growth');
    
    expect(result.portfolioHealth).toBeGreaterThan(0);
    expect(result.portfolioHealth).toBeLessThanOrEqual(100);
    expect(result.riskLevel).toMatch(/Low|Medium|High/);
    expect(result.performanceGrade).toMatch(/A\+|A|B\+|B|C\+|C/);
    expect(Array.isArray(result.recommendations)).toBe(true);
    expect(Array.isArray(result.metrics)).toBe(true);
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

  test('should calculate concentration risk', () => {
    const risk = AnalyticsEngine.calculateConcentrationRisk(mockProperties);
    
    expect(risk).toBeGreaterThanOrEqual(0);
    expect(risk).toBeLessThanOrEqual(100);
  });

  test('should calculate lease risk', () => {
    const risk = AnalyticsEngine.calculateLeaseRisk(mockProperties);
    
    expect(risk).toBeGreaterThanOrEqual(0);
    expect(risk).toBeLessThanOrEqual(100);
  });

  test('should calculate market risk', () => {
    const risk = AnalyticsEngine.calculateMarketRisk(mockProperties);
    
    expect(risk).toBeGreaterThanOrEqual(0);
    expect(risk).toBeLessThanOrEqual(100);
  });

  test('should calculate operational risk', () => {
    const risk = AnalyticsEngine.calculateOperationalRisk(mockProperties);
    
    expect(risk).toBeGreaterThanOrEqual(0);
    expect(risk).toBeLessThanOrEqual(100);
  });

  test('should calculate financial risk', () => {
    const risk = AnalyticsEngine.calculateFinancialRisk(mockProperties);
    
    expect(risk).toBeGreaterThanOrEqual(0);
    expect(risk).toBeLessThanOrEqual(100);
  });
});
