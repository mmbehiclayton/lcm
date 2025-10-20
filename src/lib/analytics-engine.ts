/**
 * LCM Analytics Engine - Native JavaScript implementation
 * Replaces Python service functionality for Vercel deployment
 */

// Types for analytics data
export interface PropertyData {
  property_id: string;
  name: string;
  type: string;
  location: string;
  purchase_price: number;
  current_value: number;
  noi: number;
  occupancy_rate: number;
  purchase_date?: string;
  lease_expiry_date?: string;
  epc_rating?: string;
  maintenance_score?: number;
}

export interface TransactionData {
  transaction_id: string;
  property_id: string;
  tenant_id: string;
  transaction_type: string;
  amount: number;
  due_date: string;
  timestamp: string;
  bank_reference?: string;
  contract_amount?: number;
}

export interface LeaseData {
  lease_id: string;
  property_id: string;
  tenant_name: string;
  lease_start: string;
  lease_end: string;
  monthly_rent: number;
  security_deposit?: number;
  renewal_option?: boolean;
  break_clause?: boolean;
}

export interface OccupancyData {
  property_id: string;
  total_sq_ft: number;
  occupied_sq_ft: number;
  vacant_sq_ft: number;
  common_areas?: number;
  parking_spaces?: number;
  occupied_parking?: number;
  sensor_data?: Record<string, any>;
}

export interface MarketData {
  location: string;
  property_type: string;
  market_rent: number;
  demand_index: number;
  economic_indicators?: Record<string, number>;
}

// Analysis result types
export interface AnalysisResponse {
  portfolio_health: number;
  risk_level: string;
  performance_grade: string;
  recommendations: string[];
  property_scores: Array<{
    property_id: string;
    lease_score: number;
    occupancy_score: number;
    noi_score: number;
    energy_score: number;
    capex_score: number;
    sustainability_score?: number;
    market_score?: number;
  }>;
}

export interface TransactionAnalysisResponse {
  reconciled_transactions: Array<Record<string, any>>;
  unreconciled_transactions: Array<Record<string, any>>;
  risk_scores: Array<Record<string, any>>;
  reconciliation_report: Record<string, any>;
}

export interface PredictiveAnalysisResponse {
  predictions: Array<Record<string, any>>;
  risk_assessments: Array<Record<string, any>>;
  confidence_scores: Array<Record<string, any>>;
  recommendations: string[];
}

export interface OccupancyAnalysisResponse {
  utilization_scores: Array<Record<string, any>>;
  compliance_alerts: Array<Record<string, any>>;
  optimization_recommendations: string[];
  efficiency_metrics: Record<string, any>;
}

export interface LeaseRiskResponse {
  risk_scores: Array<Record<string, any>>;
  recommended_actions: Array<Record<string, any>>;
  risk_factors: Array<Record<string, any>>;
  intervention_priorities: string[];
}

/**
 * Enhanced property scoring with strategy-specific considerations
 */
export function calculateEnhancedPropertyScores(property: PropertyData, strategy: string) {
  const scores: Record<string, number> = {};
  
  // Enhanced lease score calculation
  scores.lease_score = calculateEnhancedLeaseScore(property);
  
  // Enhanced occupancy score
  scores.occupancy_score = calculateEnhancedOccupancyScore(property);
  
  // Enhanced NOI score
  scores.noi_score = calculateEnhancedNoiScore(property);
  
  // Enhanced energy score with sustainability factors
  scores.energy_score = calculateEnhancedEnergyScore(property);
  
  // Enhanced capex score
  scores.capex_score = calculateEnhancedCapexScore(property);
  
  // Additional scores for enhanced analysis
  scores.sustainability_score = calculateSustainabilityScore(property);
  scores.market_score = calculateMarketScore(property);
  
  return scores;
}

/**
 * Enhanced lease scoring with multiple risk factors
 */
function calculateEnhancedLeaseScore(property: PropertyData): number {
  if (!property.lease_expiry_date) {
    return 50; // Neutral for missing data
  }
  
  const daysToExpiry = Math.floor(
    (new Date(property.lease_expiry_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
  );
  
  // Base score from expiry timing
  let baseScore: number;
  if (daysToExpiry < 90) {
    baseScore = 20;
  } else if (daysToExpiry < 180) {
    baseScore = 40;
  } else if (daysToExpiry < 365) {
    baseScore = 60;
  } else if (daysToExpiry < 730) {
    baseScore = 80;
  } else {
    baseScore = 100;
  }
  
  // Adjust for occupancy rate (lease risk is higher with low occupancy)
  const occupancyFactor = property.occupancy_rate * 0.2;
  const finalScore = Math.min(baseScore + occupancyFactor * 20, 100);
  
  return finalScore;
}

/**
 * Enhanced occupancy scoring with trend analysis
 */
function calculateEnhancedOccupancyScore(property: PropertyData): number {
  const occupancyRate = property.occupancy_rate;
  
  // Base scoring
  let baseScore: number;
  if (occupancyRate >= 0.95) {
    baseScore = 100;
  } else if (occupancyRate >= 0.90) {
    baseScore = 90;
  } else if (occupancyRate >= 0.85) {
    baseScore = 80;
  } else if (occupancyRate >= 0.80) {
    baseScore = 70;
  } else if (occupancyRate >= 0.75) {
    baseScore = 60;
  } else if (occupancyRate >= 0.70) {
    baseScore = 50;
  } else {
    baseScore = 30;
  }
  
  // Adjust for property type (some types have naturally lower occupancy)
  const propertyTypeAdjustment: Record<string, number> = {
    office: 0,
    retail: -5,
    industrial: 0,
    residential: 5
  };
  
  const adjustment = propertyTypeAdjustment[property.type] || 0;
  const finalScore = Math.max(Math.min(baseScore + adjustment, 100), 0);
  
  return finalScore;
}

/**
 * Enhanced NOI scoring with yield and growth analysis
 */
function calculateEnhancedNoiScore(property: PropertyData): number {
  if (property.current_value === 0) {
    return 0;
  }
  
  const noiYield = property.noi / property.current_value;
  
  // Enhanced yield scoring
  let baseScore: number;
  if (noiYield >= 0.08) {
    baseScore = 100;
  } else if (noiYield >= 0.07) {
    baseScore = 90;
  } else if (noiYield >= 0.06) {
    baseScore = 80;
  } else if (noiYield >= 0.05) {
    baseScore = 70;
  } else if (noiYield >= 0.04) {
    baseScore = 60;
  } else if (noiYield >= 0.03) {
    baseScore = 50;
  } else {
    baseScore = 30;
  }
  
  // Adjust for property value growth potential
  if (property.current_value > property.purchase_price) {
    const growthFactor = (property.current_value / property.purchase_price) * 5;
    const finalScore = Math.min(baseScore + growthFactor, 100);
    return finalScore;
  } else {
    return baseScore;
  }
}

/**
 * Enhanced energy scoring with EPC and sustainability factors
 */
function calculateEnhancedEnergyScore(property: PropertyData): number {
  const epcRatings: Record<string, number> = {
    A: 100, B: 85, C: 70, D: 55, E: 40, F: 25, G: 10
  };
  const baseScore = epcRatings[property.epc_rating || ''] || 50;
  
  // Adjust for property age (newer properties typically more efficient)
  if (property.purchase_date) {
    const propertyAge = (new Date().getTime() - new Date(property.purchase_date).getTime()) / (1000 * 60 * 60 * 24 * 365);
    let ageFactor: number;
    if (propertyAge < 5) {
      ageFactor = 10;
    } else if (propertyAge < 10) {
      ageFactor = 5;
    } else {
      ageFactor = 0;
    }
    const finalScore = Math.min(baseScore + ageFactor, 100);
    return finalScore;
  } else {
    return baseScore;
  }
}

/**
 * Enhanced capex scoring with maintenance history
 */
function calculateEnhancedCapexScore(property: PropertyData): number {
  const maintenanceScore = property.maintenance_score || 5;
  const baseScore = maintenanceScore * 10;
  
  // Adjust for property value (higher value properties need more maintenance)
  let adjustment: number;
  if (property.current_value > 10000000) { // High-value properties
    adjustment = 10;
  } else if (property.current_value > 5000000) {
    adjustment = 5;
  } else {
    adjustment = 0;
  }
  
  const finalScore = Math.min(baseScore + adjustment, 100);
  return finalScore;
}

/**
 * Calculate sustainability score based on EPC and environmental factors
 */
function calculateSustainabilityScore(property: PropertyData): number {
  const epcScores: Record<string, number> = {
    A: 100, B: 80, C: 60, D: 40, E: 20, F: 10, G: 0
  };
  const baseScore = epcScores[property.epc_rating || ''] || 50;
  
  // Adjust for property type (some types are naturally more sustainable)
  const typeAdjustment: Record<string, number> = {
    office: 0,
    retail: -5,
    industrial: -10,
    residential: 5
  };
  
  const adjustment = typeAdjustment[property.type] || 0;
  const finalScore = Math.max(Math.min(baseScore + adjustment, 100), 0);
  
  return finalScore;
}

/**
 * Calculate market positioning score
 */
function calculateMarketScore(property: PropertyData): number {
  // This would typically use market data, but for now we'll use property characteristics
  const locationScore = 70; // Placeholder - would use actual market data
  const typeScore = 80;     // Placeholder - would use market demand data
  
  // Weighted average
  const marketScore = (locationScore * 0.6 + typeScore * 0.4);
  return marketScore;
}

/**
 * Enhanced strategy weighting and portfolio analysis
 */
export function getEnhancedStrategyWeights(strategy: string, customWeights?: Record<string, number>): Record<string, number> {
  if (customWeights) {
    return customWeights;
  }
  
  const weightConfigs: Record<string, Record<string, number>> = {
    growth: {
      lease: 0.30, occupancy: 0.20, noi: 0.30, energy: 0.10, capex: 0.10,
      sustainability: 0.05, market: 0.05
    },
    hold: {
      lease: 0.25, occupancy: 0.25, noi: 0.20, energy: 0.15, capex: 0.15,
      sustainability: 0.10, market: 0.05
    },
    divest: {
      lease: 0.40, occupancy: 0.10, noi: 0.20, energy: 0.20, capex: 0.10,
      sustainability: 0.15, market: 0.05
    }
  };
  
  return weightConfigs[strategy] || weightConfigs.hold;
}

/**
 * Enhanced portfolio health calculation with additional metrics
 */
export function calculateEnhancedPortfolioHealth(
  propertyScores: Array<Record<string, any>>, 
  weights: Record<string, number>
): number {
  let totalScore = 0;
  for (const property of propertyScores) {
    const weightedScore = (
      property.lease_score * weights.lease +
      property.occupancy_score * weights.occupancy +
      property.noi_score * weights.noi +
      property.energy_score * weights.energy +
      property.capex_score * weights.capex +
      (property.sustainability_score || 0) * (weights.sustainability || 0) +
      (property.market_score || 0) * (weights.market || 0)
    );
    totalScore += weightedScore;
  }
  
  return totalScore / propertyScores.length;
}

/**
 * Enhanced risk assessment considering portfolio concentration
 */
export function assessEnhancedRiskLevel(score: number, propertyScores: Array<Record<string, any>>): string {
  // Base risk level
  let baseRisk: string;
  if (score >= 80) {
    baseRisk = "Low";
  } else if (score >= 60) {
    baseRisk = "Medium";
  } else {
    baseRisk = "High";
  }
  
  // Adjust for concentration risk
  const lowScores = propertyScores.filter(p => p.lease_score < 50 || p.occupancy_score < 50);
  const concentrationRisk = lowScores.length / propertyScores.length;
  
  if (concentrationRisk > 0.3) { // More than 30% of properties have low scores
    if (baseRisk === "Low") {
      return "Medium";
    } else if (baseRisk === "Medium") {
      return "High";
    }
  }
  
  return baseRisk;
}

/**
 * Calculate performance grade
 */
export function calculatePerformanceGrade(score: number): string {
  if (score >= 90) {
    return "A+";
  } else if (score >= 85) {
    return "A";
  } else if (score >= 80) {
    return "B+";
  } else if (score >= 75) {
    return "B";
  } else if (score >= 70) {
    return "C+";
  } else {
    return "C";
  }
}

/**
 * Generate enhanced recommendations with strategy-specific insights
 */
export function generateEnhancedRecommendations(
  propertyScores: Array<Record<string, any>>, 
  strategy: string, 
  properties: PropertyData[]
): string[] {
  const recommendations: string[] = [];
  
  // Portfolio health recommendations
  const avgScore = propertyScores.reduce((sum, p) => sum + p.lease_score, 0) / propertyScores.length;
  if (avgScore < 70) {
    recommendations.push("Portfolio health requires immediate attention - focus on lease renewals and occupancy improvements");
  }
  
  // Strategy-specific recommendations
  if (strategy === "growth") {
    recommendations.push(
      "Consider acquisition opportunities in high-performing markets",
      "Focus on properties with strong NOI growth potential",
      "Evaluate expansion opportunities for existing high-performing assets"
    );
  } else if (strategy === "hold") {
    recommendations.push(
      "Maintain current portfolio with focus on operational efficiency",
      "Consider energy efficiency improvements to enhance sustainability scores",
      "Monitor market conditions for potential repositioning opportunities"
    );
  } else if (strategy === "divest") {
    recommendations.push(
      "Identify underperforming assets for potential divestment",
      "Focus on lease stability to maximize sale value",
      "Consider timing market conditions for optimal exit strategies"
    );
  }
  
  // Risk mitigation recommendations
  const highRiskProperties = propertyScores.filter(p => p.lease_score < 40 || p.occupancy_score < 40);
  if (highRiskProperties.length > 0) {
    recommendations.push(`Address ${highRiskProperties.length} high-risk properties immediately`);
  }
  
  return recommendations;
}

/**
 * LCM Transactions Module Algorithms
 */
export function reconcileTransactions(transactions: TransactionData[], leases: LeaseData[]): [Array<Record<string, any>>, Array<Record<string, any>>] {
  const reconciled: Array<Record<string, any>> = [];
  const unreconciled: Array<Record<string, any>> = [];
  
  for (const txn of transactions) {
    // Find matching lease
    const matchingLease = leases.find(
      lease => lease.property_id === txn.property_id && lease.tenant_name === txn.tenant_id
    );
    
    if (matchingLease) {
      // Check amount tolerance (±5%)
      if (txn.contract_amount && matchingLease.monthly_rent) {
        const tolerance = matchingLease.monthly_rent * 0.05;
        if (Math.abs(txn.amount - matchingLease.monthly_rent) <= tolerance) {
          reconciled.push({
            transaction_id: txn.transaction_id,
            status: "reconciled",
            lease_match: true,
            amount_variance: txn.amount - matchingLease.monthly_rent
          });
        } else {
          unreconciled.push({
            transaction_id: txn.transaction_id,
            status: "unreconciled",
            reason: "amount_mismatch",
            expected: matchingLease.monthly_rent,
            actual: txn.amount
          });
        }
      } else {
        unreconciled.push({
          transaction_id: txn.transaction_id,
          status: "unreconciled",
          reason: "no_contract_amount"
        });
      }
    } else {
      unreconciled.push({
        transaction_id: txn.transaction_id,
        status: "unreconciled",
        reason: "no_matching_lease"
      });
    }
  }
  
  return [reconciled, unreconciled];
}

/**
 * Calculate risk scores for transactions
 */
export function calculateTransactionRiskScores(transactions: TransactionData[], leases: LeaseData[]): Array<Record<string, any>> {
  const riskScores: Array<Record<string, any>> = [];
  
  for (const txn of transactions) {
    let baseRisk = 0;
    
    // Late payment risk
    const dueDate = new Date(txn.due_date);
    const transactionDate = new Date(txn.timestamp);
    const daysLate = Math.floor((transactionDate.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysLate > 0) {
      baseRisk += Math.min(daysLate * 2, 50); // Max 50 points for lateness
    }
    
    // Amount variance risk
    if (txn.contract_amount) {
      const variancePct = Math.abs(txn.amount - txn.contract_amount) / txn.contract_amount * 100;
      baseRisk += Math.min(variancePct * 5, 30); // Max 30 points for variance
    }
    
    // Transaction type risk
    const typeRisk: Record<string, number> = { rent: 0, service: 10, deposit: 5 };
    baseRisk += typeRisk[txn.transaction_type] || 0;
    
    riskScores.push({
      transaction_id: txn.transaction_id,
      risk_score: Math.min(baseRisk, 100),
      risk_level: baseRisk > 70 ? "High" : baseRisk > 40 ? "Medium" : "Low"
    });
  }
  
  return riskScores;
}

/**
 * Generate reconciliation report
 */
export function generateReconciliationReport(
  reconciled: Array<Record<string, any>>, 
  unreconciled: Array<Record<string, any>>, 
  riskScores: Array<Record<string, any>>
): Record<string, any> {
  const totalTransactions = reconciled.length + unreconciled.length;
  const reconciliationRate = totalTransactions > 0 ? reconciled.length / totalTransactions : 0;
  
  const highRiskCount = riskScores.filter(r => r.risk_score > 70).length;
  
  return {
    total_transactions: totalTransactions,
    reconciled_count: reconciled.length,
    unreconciled_count: unreconciled.length,
    reconciliation_rate: reconciliationRate,
    high_risk_transactions: highRiskCount,
    recommendations: [
      "Review unreconciled transactions for data quality issues",
      "Implement automated reconciliation for routine transactions",
      "Focus on high-risk transactions for manual review"
    ]
  };
}

/**
 * LCM Predictive Modelling Module Algorithms
 */
export function runPredictiveModels(properties: PropertyData[], marketData: MarketData[]): Array<Record<string, any>> {
  const predictions: Array<Record<string, any>> = [];
  
  for (const prop of properties) {
    // Simulate predictive model outputs
    // In a real implementation, these would be trained ML models
    
    // Find market data for this property
    const marketMatch = marketData.find(
      m => m.location === prop.location && m.property_type === prop.type
    );
    
    const marketFactor = marketMatch?.demand_index || 0.5;
    
    // Occupancy prediction
    const baseOccupancy = prop.occupancy_rate;
    const predictedOccupancy = Math.min(Math.max(baseOccupancy * (1 + (marketFactor - 0.5) * 0.2), 0), 1);
    
    // Value prediction
    const baseValue = prop.current_value;
    const growthRate = 0.03 + (marketFactor - 0.5) * 0.02; // 1-5% growth based on market
    const predictedValue = baseValue * (1 + growthRate);
    
    // Risk prediction
    const riskFactors: string[] = [];
    if (prop.occupancy_rate < 0.8) {
      riskFactors.push("low_occupancy");
    }
    if ((prop.maintenance_score || 5) < 3) {
      riskFactors.push("maintenance_issues");
    }
    if (prop.epc_rating && ["F", "G"].includes(prop.epc_rating)) {
      riskFactors.push("energy_inefficiency");
    }
    
    predictions.push({
      property_id: prop.property_id,
      predicted_occupancy: predictedOccupancy,
      predicted_value: predictedValue,
      growth_rate: growthRate,
      risk_factors: riskFactors,
      confidence: 0.7 + (marketFactor - 0.5) * 0.3 // 40-100% confidence
    });
  }
  
  return predictions;
}

/**
 * Calculate risk assessments for predictions
 */
export function calculatePredictiveRisks(
  properties: PropertyData[], 
  predictions: Array<Record<string, any>>
): Array<Record<string, any>> {
  const riskAssessments: Array<Record<string, any>> = [];
  
  for (const pred of predictions) {
    let riskScore = 0;
    const riskFactors: string[] = [];
    
    // Occupancy risk
    if (pred.predicted_occupancy < 0.8) {
      riskScore += 30;
      riskFactors.push("occupancy_risk");
    }
    
    // Value risk
    if (pred.growth_rate < 0) {
      riskScore += 25;
      riskFactors.push("value_decline");
    }
    
    // Market risk
    if (pred.confidence < 0.6) {
      riskScore += 20;
      riskFactors.push("market_uncertainty");
    }
    
    // Maintenance risk
    const property = properties.find(p => p.property_id === pred.property_id);
    if (property && (property.maintenance_score || 5) < 3) {
      riskScore += 15;
      riskFactors.push("maintenance_risk");
    }
    
    riskAssessments.push({
      property_id: pred.property_id,
      risk_score: Math.min(riskScore, 100),
      risk_level: riskScore > 70 ? "High" : riskScore > 40 ? "Medium" : "Low",
      risk_factors: riskFactors
    });
  }
  
  return riskAssessments;
}

/**
 * Calculate confidence scores for predictions
 */
export function calculateConfidenceScores(
  predictions: Array<Record<string, any>>, 
  riskAssessments: Array<Record<string, any>>
): Array<Record<string, any>> {
  const confidenceScores: Array<Record<string, any>> = [];
  
  for (const pred of predictions) {
    const riskAssessment = riskAssessments.find(r => r.property_id === pred.property_id) || {};
    
    // Base confidence from prediction
    const baseConfidence = pred.confidence;
    
    // Adjust for risk factors
    const riskAdjustment = 1 - (riskAssessment.risk_score || 0) / 100 * 0.3;
    
    const finalConfidence = baseConfidence * riskAdjustment;
    
    confidenceScores.push({
      property_id: pred.property_id,
      confidence_score: Math.max(finalConfidence, 0.1),
      confidence_level: finalConfidence > 0.8 ? "High" : finalConfidence > 0.6 ? "Medium" : "Low"
    });
  }
  
  return confidenceScores;
}

/**
 * Generate recommendations based on predictive analysis
 */
export function generatePredictiveRecommendations(
  predictions: Array<Record<string, any>>, 
  riskAssessments: Array<Record<string, any>>
): string[] {
  const recommendations: string[] = [];
  
  // High-risk properties
  const highRisk = riskAssessments.filter(r => r.risk_score > 70);
  if (highRisk.length > 0) {
    recommendations.push(`Monitor ${highRisk.length} high-risk properties closely`);
  }
  
  // Low occupancy predictions
  const lowOccupancy = predictions.filter(p => p.predicted_occupancy < 0.8);
  if (lowOccupancy.length > 0) {
    recommendations.push("Implement marketing strategies for properties with predicted low occupancy");
  }
  
  // Value decline predictions
  const decliningValues = predictions.filter(p => p.growth_rate < 0);
  if (decliningValues.length > 0) {
    recommendations.push("Consider repositioning or divesting properties with predicted value decline");
  }
  
  return recommendations;
}

/**
 * LCM Occupancy Module Algorithms
 */
export function calculateUtilizationScores(occupancyData: OccupancyData[]): Array<Record<string, any>> {
  const utilizationScores: Array<Record<string, any>> = [];
  
  for (const data of occupancyData) {
    // Basic utilization rate
    const utilizationRate = data.occupied_sq_ft / data.total_sq_ft;
    
    // Efficiency score based on utilization and common areas
    const commonAreaFactor = 1 - ((data.common_areas || 0) / data.total_sq_ft);
    const efficiencyScore = utilizationRate * commonAreaFactor * 100;
    
    // Parking utilization
    let parkingUtilization = 0;
    if (data.parking_spaces && data.occupied_parking) {
      parkingUtilization = data.occupied_parking / data.parking_spaces;
    }
    
    utilizationScores.push({
      property_id: data.property_id,
      utilization_rate: utilizationRate,
      efficiency_score: efficiencyScore,
      parking_utilization: parkingUtilization,
      vacant_sq_ft: data.vacant_sq_ft,
      utilization_classification: classifyUtilization(utilizationRate)
    });
  }
  
  return utilizationScores;
}

/**
 * Classify utilization level
 */
function classifyUtilization(utilizationRate: number): string {
  if (utilizationRate > 1.2) {
    return "Overcrowded";
  } else if (utilizationRate < 0.5) {
    return "Underutilized";
  } else {
    return "Efficient";
  }
}

/**
 * Check lease compliance based on occupancy data
 */
export function checkLeaseCompliance(occupancyData: OccupancyData[], leases: LeaseData[]): Array<Record<string, any>> {
  const complianceAlerts: Array<Record<string, any>> = [];
  
  for (const occupancy of occupancyData) {
    // Find matching leases
    const propertyLeases = leases.filter(lease => lease.property_id === occupancy.property_id);
    
    for (const lease of propertyLeases) {
      // Check for overcrowding (if lease has occupancy limits)
      if (occupancy.occupied_sq_ft > occupancy.total_sq_ft) {
        complianceAlerts.push({
          property_id: occupancy.property_id,
          lease_id: lease.lease_id,
          alert_type: "overcrowding",
          severity: "High",
          description: "Occupancy exceeds available space"
        });
      }
      
      // Check for underutilization
      if (occupancy.occupied_sq_ft < occupancy.total_sq_ft * 0.5) {
        complianceAlerts.push({
          property_id: occupancy.property_id,
          lease_id: lease.lease_id,
          alert_type: "underutilization",
          severity: "Medium",
          description: "Significant underutilization of space"
        });
      }
    }
  }
  
  return complianceAlerts;
}

/**
 * Generate optimization recommendations for occupancy
 */
export function generateOccupancyOptimizationRecommendations(utilizationScores: Array<Record<string, any>>): string[] {
  const recommendations: string[] = [];
  
  const underutilized = utilizationScores.filter(u => u.utilization_classification === "Underutilized");
  if (underutilized.length > 0) {
    recommendations.push(`Optimize space utilization for ${underutilized.length} underutilized properties`);
  }
  
  const overcrowded = utilizationScores.filter(u => u.utilization_classification === "Overcrowded");
  if (overcrowded.length > 0) {
    recommendations.push(`Address overcrowding issues in ${overcrowded.length} properties`);
  }
  
  // General recommendations
  recommendations.push(
    "Consider flexible workspace arrangements to improve utilization",
    "Implement space monitoring systems for real-time occupancy tracking",
    "Review lease terms to ensure optimal space allocation"
  );
  
  return recommendations;
}

/**
 * Calculate overall efficiency metrics
 */
export function calculateEfficiencyMetrics(occupancyData: OccupancyData[], utilizationScores: Array<Record<string, any>>): Record<string, any> {
  const totalSqFt = occupancyData.reduce((sum, data) => sum + data.total_sq_ft, 0);
  const occupiedSqFt = occupancyData.reduce((sum, data) => sum + data.occupied_sq_ft, 0);
  const overallUtilization = totalSqFt > 0 ? occupiedSqFt / totalSqFt : 0;
  
  const avgEfficiency = utilizationScores.reduce((sum, u) => sum + u.efficiency_score, 0) / utilizationScores.length;
  
  return {
    overall_utilization_rate: overallUtilization,
    average_efficiency_score: avgEfficiency,
    total_vacant_sq_ft: occupancyData.reduce((sum, data) => sum + data.vacant_sq_ft, 0),
    utilization_trend: avgEfficiency > 70 ? "improving" : "declining"
  };
}

/**
 * LCM Lease Risk Scoring Module Algorithms
 */
export function calculateLeaseRiskScores(
  properties: PropertyData[], 
  leases: LeaseData[], 
  marketData: MarketData[]
): Array<Record<string, any>> {
  const riskScores: Array<Record<string, any>> = [];
  
  for (const property of properties) {
    // EPC-based risk
    const epcWeights: Record<string, number> = { A: 0, B: 5, C: 10, D: 20, E: 30, F: 40, G: 50 };
    const epcScore = epcWeights[property.epc_rating || ''] || 25;
    
    // Occupancy risk
    const occupancyRisk = (1 - property.occupancy_rate) * 20;
    
    // Market risk
    const marketMatch = marketData.find(
      m => m.location === property.location && m.property_type === property.type
    );
    let marketRisk = 0;
    if (marketMatch) {
      const demandIndex = marketMatch.demand_index;
      marketRisk = (1 - demandIndex) * 10;
    }
    
    // Lease expiry risk
    let leaseExpiryRisk = 0;
    if (property.lease_expiry_date) {
      const daysToExpiry = Math.floor(
        (new Date(property.lease_expiry_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
      );
      if (daysToExpiry < 365) {
        leaseExpiryRisk = 25;
      } else if (daysToExpiry < 730) {
        leaseExpiryRisk = 15;
      }
    }
    
    // Calculate total risk score
    const totalRisk = epcScore + occupancyRisk + marketRisk + leaseExpiryRisk;
    const riskLevel = totalRisk > 70 ? "High" : totalRisk > 40 ? "Medium" : "Low";
    
    riskScores.push({
      property_id: property.property_id,
      risk_score: Math.min(totalRisk, 100),
      risk_level: riskLevel,
      epc_risk: epcScore,
      occupancy_risk: occupancyRisk,
      market_risk: marketRisk,
      lease_expiry_risk: leaseExpiryRisk
    });
  }
  
  return riskScores;
}

/**
 * Generate recommended actions based on lease risk scores
 */
export function generateLeaseRiskActions(
  riskScores: Array<Record<string, any>>, 
  properties: PropertyData[], 
  leases: LeaseData[]
): Array<Record<string, any>> {
  const actions: Array<Record<string, any>> = [];
  
  for (const risk of riskScores) {
    let action: string;
    let priority: string;
    
    if (risk.risk_score > 70) {
      action = "Dispose or Retrofit";
      priority = "High";
    } else if (risk.risk_score > 40) {
      action = "Monitor Closely";
      priority = "Medium";
    } else {
      action = "Low Risk";
      priority = "Low";
    }
    
    actions.push({
      property_id: risk.property_id,
      recommended_action: action,
      priority: priority,
      timeline: risk.risk_score > 70 ? "Immediate" : risk.risk_score > 40 ? "3-6 months" : "Ongoing"
    });
  }
  
  return actions;
}

/**
 * Identify specific risk factors for each property
 */
export function identifyLeaseRiskFactors(
  properties: PropertyData[], 
  leases: LeaseData[], 
  marketData: MarketData[]
): Array<Record<string, any>> {
  const riskFactors: Array<Record<string, any>> = [];
  
  for (const property of properties) {
    const factors: string[] = [];
    
    // EPC risk factors
    if (property.epc_rating && ["F", "G"].includes(property.epc_rating)) {
      factors.push("Poor energy efficiency");
    }
    
    // Occupancy risk factors
    if (property.occupancy_rate < 0.8) {
      factors.push("Low occupancy");
    }
    
    // Market risk factors
    const marketMatch = marketData.find(
      m => m.location === property.location && m.property_type === property.type
    );
    if (marketMatch && marketMatch.demand_index < 0.5) {
      factors.push("Weak market demand");
    }
    
    // Lease expiry risk factors
    if (property.lease_expiry_date) {
      const daysToExpiry = Math.floor(
        (new Date(property.lease_expiry_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
      );
      if (daysToExpiry < 365) {
        factors.push("Lease expiring within 12 months");
      }
    }
    
    riskFactors.push({
      property_id: property.property_id,
      risk_factors: factors,
      factor_count: factors.length
    });
  }
  
  return riskFactors;
}

/**
 * Prioritize lease interventions based on risk scores
 */
export function prioritizeLeaseInterventions(
  riskScores: Array<Record<string, any>>, 
  recommendedActions: Array<Record<string, any>>
): string[] {
  // Sort by risk score (highest first)
  const sortedRisks = riskScores.sort((a, b) => b.risk_score - a.risk_score);
  
  const priorities: string[] = [];
  for (let i = 0; i < Math.min(sortedRisks.length, 5); i++) { // Top 5 priorities
    const risk = sortedRisks[i];
    const action = recommendedActions.find(a => a.property_id === risk.property_id) || {};
    priorities.push(
      `${i + 1}. Property ${risk.property_id}: ${action.recommended_action || 'Review'} (Risk: ${risk.risk_score.toFixed(1)})`
    );
  }
  
  return priorities;
}
