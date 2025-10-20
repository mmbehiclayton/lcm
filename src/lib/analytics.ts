import { Property, PortfolioAnalysis, PropertyMetrics, Strategy, StrategyWeights } from '@/types';

export class AnalyticsEngine {
  /**
   * Calculate overall portfolio health score based on weighted metrics
   */
  static calculatePortfolioHealth(
    properties: Property[],
    strategy: Strategy
  ): PortfolioAnalysis {
    const weights = this.getStrategyWeights(strategy);
    
    const metrics = properties.map(property => ({
      propertyId: property.property_id,
      leaseScore: this.calculateLeaseScore(property),
      occupancyScore: this.calculateOccupancyScore(property),
      noiScore: this.calculateNOIScore(property),
      energyScore: this.calculateEnergyScore(property),
      capexScore: this.calculateCapexScore(property)
    }));

    const portfolioHealth = metrics.reduce((total, metric) => {
      const weightedScore = 
        metric.leaseScore * weights.lease +
        metric.occupancyScore * weights.occupancy +
        metric.noiScore * weights.noi +
        metric.energyScore * weights.energy +
        metric.capexScore * weights.capex;
      
      return total + weightedScore;
    }, 0) / metrics.length;

    return {
      portfolioHealth: Math.round(portfolioHealth * 100) / 100,
      riskLevel: this.assessRiskLevel(portfolioHealth),
      performanceGrade: this.calculatePerformanceGrade(portfolioHealth),
      recommendations: this.generateRecommendations(metrics, strategy),
      metrics
    };
  }

  /**
   * Get strategy-specific weights for scoring
   */
  private static getStrategyWeights(strategy: Strategy): StrategyWeights {
    const weightConfigs: Record<Strategy, StrategyWeights> = {
      growth: { lease: 0.3, occupancy: 0.2, noi: 0.3, energy: 0.1, capex: 0.1 },
      hold: { lease: 0.25, occupancy: 0.25, noi: 0.2, energy: 0.15, capex: 0.15 },
      divest: { lease: 0.4, occupancy: 0.1, noi: 0.2, energy: 0.2, capex: 0.1 }
    };
    
    return weightConfigs[strategy];
  }

  /**
   * Calculate lease-related risk score (0-100)
   */
  private static calculateLeaseScore(property: Property): number {
    if (!property.lease_expiry_date) {
      return 50; // Neutral score for missing data
    }
    
    const daysToExpiry = this.calculateDaysToExpiry(property.lease_expiry_date);
    
    // Risk-based scoring
    if (daysToExpiry < 90) return 20;   // High risk - immediate action needed
    if (daysToExpiry < 180) return 40;  // Medium-high risk
    if (daysToExpiry < 365) return 60;  // Medium risk - planning needed
    if (daysToExpiry < 730) return 80;  // Low risk - good stability
    return 100; // Very low risk - excellent stability
  }

  /**
   * Calculate occupancy efficiency score (0-100)
   */
  private static calculateOccupancyScore(property: Property): number {
    const occupancyRate = property.occupancy_rate;
    
    if (occupancyRate >= 0.95) return 100; // Excellent occupancy
    if (occupancyRate >= 0.90) return 90;  // Very good occupancy
    if (occupancyRate >= 0.85) return 80;  // Good occupancy
    if (occupancyRate >= 0.80) return 70;  // Acceptable occupancy
    if (occupancyRate >= 0.75) return 60;  // Below average occupancy
    if (occupancyRate >= 0.70) return 50;  // Poor occupancy
    return 30; // Critical occupancy issues
  }

  /**
   * Calculate NOI yield score (0-100)
   */
  private static calculateNOIScore(property: Property): number {
    const noiYield = property.noi / property.current_value;
    
    if (noiYield >= 0.08) return 100; // Excellent yield
    if (noiYield >= 0.07) return 90;  // Very good yield
    if (noiYield >= 0.06) return 80;  // Good yield
    if (noiYield >= 0.05) return 70;  // Average yield
    if (noiYield >= 0.04) return 60;  // Below average yield
    if (noiYield >= 0.03) return 50;  // Poor yield
    return 30; // Critical yield issues
  }

  /**
   * Calculate energy efficiency score (0-100)
   */
  private static calculateEnergyScore(property: Property): number {
    const epcRatings: Record<string, number> = {
      'A': 100, 'B': 80, 'C': 60, 'D': 40,
      'E': 20, 'F': 10, 'G': 0
    };
    
    return epcRatings[property.epc_rating || ''] || 50; // Default to neutral
  }

  /**
   * Calculate capital expenditure score (0-100)
   */
  private static calculateCapexScore(property: Property): number {
    const maintenanceScore = property.maintenance_score || 5; // Default to neutral
    return Math.min(maintenanceScore * 10, 100); // Cap at 100
  }

  /**
   * Assess risk level based on portfolio health score
   */
  private static assessRiskLevel(score: number): 'Low' | 'Medium' | 'High' {
    if (score >= 80) return 'Low';
    if (score >= 60) return 'Medium';
    return 'High';
  }

  /**
   * Calculate performance grade based on portfolio health score
   */
  private static calculatePerformanceGrade(score: number): 'A+' | 'A' | 'B+' | 'B' | 'C+' | 'C' {
    if (score >= 90) return 'A+';
    if (score >= 85) return 'A';
    if (score >= 80) return 'B+';
    if (score >= 75) return 'B';
    if (score >= 70) return 'C+';
    return 'C';
  }

  /**
   * Generate actionable recommendations based on analysis
   */
  private static generateRecommendations(
    metrics: PropertyMetrics[],
    strategy: Strategy
  ): string[] {
    const recommendations: string[] = [];
    
    // Analyze lease scores
    const lowLeaseScores = metrics.filter(m => m.leaseScore < 50);
    if (lowLeaseScores.length > 0) {
      recommendations.push('Review lease renewals for properties with expiring leases');
    }
    
    // Analyze occupancy scores
    const lowOccupancyScores = metrics.filter(m => m.occupancyScore < 60);
    if (lowOccupancyScores.length > 0) {
      recommendations.push('Implement marketing strategy for vacant properties');
    }
    
    // Analyze NOI scores
    const lowNOIScores = metrics.filter(m => m.noiScore < 60);
    if (lowNOIScores.length > 0) {
      recommendations.push('Review rent levels and operating expenses to improve NOI');
    }
    
    // Strategy-specific recommendations
    if (strategy === 'growth') {
      recommendations.push('Consider acquisition opportunities in high-performing markets');
      recommendations.push('Focus on properties with strong NOI growth potential');
    } else if (strategy === 'hold') {
      recommendations.push('Maintain current portfolio with focus on lease renewals');
      recommendations.push('Optimize operational efficiency across all properties');
    } else if (strategy === 'divest') {
      recommendations.push('Identify underperforming assets for potential divestment');
      recommendations.push('Focus on properties with low occupancy or poor NOI performance');
    }
    
    return recommendations;
  }

  /**
   * Calculate days to lease expiry
   */
  private static calculateDaysToExpiry(expiryDate: string): number {
    const expiry = new Date(expiryDate);
    const today = new Date();
    const diffTime = expiry.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  /**
   * Calculate portfolio concentration risk
   */
  static calculateConcentrationRisk(properties: Property[]): number {
    // Geographic concentration
    const locations = properties.map(p => p.location);
    const locationDiversity = new Set(locations).size / locations.length;
    
    // Sector concentration
    const sectors = properties.map(p => p.type);
    const sectorDiversity = new Set(sectors).size / sectors.length;
    
    // Calculate concentration risk (higher = more risk)
    const concentrationRisk = (1 - locationDiversity) * 50 + (1 - sectorDiversity) * 50;
    
    return Math.min(concentrationRisk, 100);
  }

  /**
   * Calculate lease expiry risk
   */
  static calculateLeaseRisk(properties: Property[]): number {
    let totalLeaseRisk = 0;
    
    for (const property of properties) {
      // Lease expiry risk
      if (property.lease_expiry_date) {
        const daysToExpiry = this.calculateDaysToExpiry(property.lease_expiry_date);
        if (daysToExpiry < 365) { // Expiring within year
          totalLeaseRisk += 30;
        } else if (daysToExpiry < 730) { // Expiring within 2 years
          totalLeaseRisk += 15;
        }
      }
      
      // Occupancy risk
      if (property.occupancy_rate < 0.80) {
        totalLeaseRisk += 25;
      } else if (property.occupancy_rate < 0.90) {
        totalLeaseRisk += 10;
      }
    }
    
    // Average lease risk across portfolio
    return Math.min(totalLeaseRisk / properties.length, 100);
  }

  /**
   * Calculate market risk based on property types and locations
   */
  static calculateMarketRisk(properties: Property[]): number {
    // This is a simplified calculation
    // In a real implementation, you would integrate with market data APIs
    
    const riskFactors = {
      office: 0.3,      // Office market risk
      retail: 0.4,      // Retail market risk (higher due to e-commerce)
      industrial: 0.2,  // Industrial market risk (lower, more stable)
      residential: 0.25 // Residential market risk
    };
    
    const totalRisk = properties.reduce((sum, property) => {
      return sum + (riskFactors[property.type as keyof typeof riskFactors] || 0.3);
    }, 0);
    
    return (totalRisk / properties.length) * 100;
  }

  /**
   * Calculate operational risk based on property conditions
   */
  static calculateOperationalRisk(properties: Property[]): number {
    const totalRisk = properties.reduce((sum, property) => {
      let risk = 0;
      
      // Maintenance score risk
      if (property.maintenance_score) {
        if (property.maintenance_score < 5) risk += 30;
        else if (property.maintenance_score < 7) risk += 15;
      } else {
        risk += 20; // Unknown maintenance condition
      }
      
      // Energy efficiency risk
      if (property.epc_rating) {
        const epcRisk = { 'A': 0, 'B': 10, 'C': 20, 'D': 30, 'E': 40, 'F': 50, 'G': 60 };
        risk += epcRisk[property.epc_rating as keyof typeof epcRisk] || 25;
      } else {
        risk += 25; // Unknown energy efficiency
      }
      
      return sum + risk;
    }, 0);
    
    return Math.min(totalRisk / properties.length, 100);
  }

  /**
   * Calculate financial risk based on NOI and leverage
   */
  static calculateFinancialRisk(properties: Property[]): number {
    const totalRisk = properties.reduce((sum, property) => {
      let risk = 0;
      
      // NOI yield risk
      const noiYield = property.noi / property.current_value;
      if (noiYield < 0.03) risk += 40;
      else if (noiYield < 0.05) risk += 20;
      else if (noiYield < 0.07) risk += 10;
      
      // Occupancy risk
      if (property.occupancy_rate < 0.70) risk += 30;
      else if (property.occupancy_rate < 0.80) risk += 15;
      
      return sum + risk;
    }, 0);
    
    return Math.min(totalRisk / properties.length, 100);
  }
}
