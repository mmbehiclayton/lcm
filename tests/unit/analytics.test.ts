import { 
  calculateEnhancedPropertyScores,
  getEnhancedStrategyWeights,
  calculateEnhancedPortfolioHealth,
  assessEnhancedRiskLevel,
  calculatePerformanceGrade,
  generateEnhancedRecommendations,
  type PropertyData
} from '@/lib/analytics-engine';

describe('Analytics Engine', () => {
  const mockProperties: PropertyData[] = [
    {
      property_id: 'PROP_001',
      name: 'Test Property 1',
      type: 'office',
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
      type: 'retail',
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

  test('should calculate property scores', () => {
    const scores = calculateEnhancedPropertyScores(mockProperties[0], 'growth');
    
    expect(scores.lease_score).toBeGreaterThan(0);
    expect(scores.lease_score).toBeLessThanOrEqual(100);
    expect(scores.occupancy_score).toBeGreaterThan(0);
    expect(scores.occupancy_score).toBeLessThanOrEqual(100);
    expect(scores.noi_score).toBeGreaterThan(0);
    expect(scores.noi_score).toBeLessThanOrEqual(100);
    expect(scores.energy_score).toBeGreaterThan(0);
    expect(scores.energy_score).toBeLessThanOrEqual(100);
    expect(scores.capex_score).toBeGreaterThan(0);
    expect(scores.capex_score).toBeLessThanOrEqual(100);
  });

  test('should get correct strategy weights', () => {
    const growthWeights = getEnhancedStrategyWeights('growth');
    const holdWeights = getEnhancedStrategyWeights('hold');
    const divestWeights = getEnhancedStrategyWeights('divest');
    
    expect(growthWeights.lease).toBe(0.30);
    expect(growthWeights.noi).toBe(0.30);
    expect(holdWeights.occupancy).toBe(0.25);
    expect(divestWeights.lease).toBe(0.40);
  });

  test('should calculate portfolio health', () => {
    const propertyScores = mockProperties.map(prop => {
      const scores = calculateEnhancedPropertyScores(prop, 'growth');
      return {
        property_id: prop.property_id,
        lease_score: scores.lease_score,
        occupancy_score: scores.occupancy_score,
        noi_score: scores.noi_score,
        energy_score: scores.energy_score,
        capex_score: scores.capex_score,
        sustainability_score: scores.sustainability_score,
        market_score: scores.market_score
      };
    });
    
    const weights = getEnhancedStrategyWeights('growth');
    const portfolioHealth = calculateEnhancedPortfolioHealth(propertyScores, weights);
    
    expect(portfolioHealth).toBeGreaterThan(0);
    expect(portfolioHealth).toBeLessThanOrEqual(100);
  });

  test('should assess risk level correctly', () => {
    const propertyScores = [
      { property_id: '1', lease_score: 90, occupancy_score: 85, noi_score: 80, energy_score: 75, capex_score: 70 },
      { property_id: '2', lease_score: 60, occupancy_score: 55, noi_score: 50, energy_score: 45, capex_score: 40 }
    ];
    
    const riskLevel = assessEnhancedRiskLevel(75, propertyScores);
    expect(['Low', 'Medium', 'High']).toContain(riskLevel);
  });

  test('should calculate performance grade', () => {
    expect(calculatePerformanceGrade(95)).toBe('A+');
    expect(calculatePerformanceGrade(85)).toBe('A');
    expect(calculatePerformanceGrade(80)).toBe('B+');
    expect(calculatePerformanceGrade(75)).toBe('B');
    expect(calculatePerformanceGrade(70)).toBe('C+');
    expect(calculatePerformanceGrade(65)).toBe('C');
  });

  test('should generate recommendations', () => {
    const propertyScores = [
      { property_id: '1', lease_score: 90, occupancy_score: 85, noi_score: 80, energy_score: 75, capex_score: 70 },
      { property_id: '2', lease_score: 30, occupancy_score: 25, noi_score: 20, energy_score: 15, capex_score: 10 }
    ];
    
    const recommendations = generateEnhancedRecommendations(propertyScores, 'growth', mockProperties);
    
    expect(Array.isArray(recommendations)).toBe(true);
    expect(recommendations.length).toBeGreaterThan(0);
  });

  test('should handle missing optional fields', () => {
    const propertyWithMissingFields: PropertyData = {
      property_id: 'PROP_003',
      name: 'Test Property 3',
      type: 'office',
      location: 'Chicago',
      purchase_price: 1200000,
      current_value: 1300000,
      noi: 100000,
      occupancy_rate: 0.90,
      epc_rating: undefined,
      maintenance_score: undefined
    };
    
    const scores = calculateEnhancedPropertyScores(propertyWithMissingFields, 'hold');
    
    expect(scores.lease_score).toBeGreaterThan(0);
    expect(scores.energy_score).toBeGreaterThan(0);
    expect(scores.capex_score).toBeGreaterThan(0);
  });
});