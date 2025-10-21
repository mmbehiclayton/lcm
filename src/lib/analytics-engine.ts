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
  tenant_id?: string;  // Added: Tenant identifier for matching
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
  occupancy_efficiency: number;
  sustainability_flag: boolean;
  lease_maturity_exposure: number;
  assets: Array<{
    asset_id: string;
    suggested_action: string;
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
 * Determine suggested asset action from health score
 */
export function determineSuggestedAction(healthScore: number): 'retain' | 'reposition' | 'divest' {
  if (healthScore >= 80) return 'retain';
  if (healthScore >= 55) return 'reposition';
  return 'divest';
}

/**
 * Compute risk-weighted lease maturity exposure for charting
 * Weight higher risk for nearer expiries (<12m high, 12-24m medium, else low)
 */
export function computeLeaseMaturityExposure(
  properties: PropertyData[],
  propertyScores: Array<Record<string, any>>
): Array<{ property_id: string; days_to_expiry: number; risk_weight: number; bucket: 'lt_12m' | 'm12_24' | 'gt_24m' }>{
  const exposure: Array<{ property_id: string; days_to_expiry: number; risk_weight: number; bucket: 'lt_12m' | 'm12_24' | 'gt_24m' }> = [];
  for (const property of properties) {
    if (!property.lease_expiry_date) continue;
    const daysToExpiry = Math.floor(
      (new Date(property.lease_expiry_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
    );
    let bucket: 'lt_12m' | 'm12_24' | 'gt_24m' = 'gt_24m';
    let riskWeight = 0.5;
    if (daysToExpiry < 365) {
      bucket = 'lt_12m';
      riskWeight = 1.0;
    } else if (daysToExpiry < 730) {
      bucket = 'm12_24';
      riskWeight = 0.75;
    }
    exposure.push({ property_id: property.property_id, days_to_expiry: daysToExpiry, risk_weight: riskWeight, bucket });
  }
  return exposure;
}

/**
 * Compute occupancy efficiency rating (%) across portfolio
 */
export function computeOccupancyEfficiency(properties: PropertyData[]): number {
  if (properties.length === 0) return 0;
  const avg = properties.reduce((sum, p) => sum + (p.occupancy_rate || 0), 0) / properties.length;
  return Math.max(0, Math.min(100, Math.round(avg * 100)));
}

/**
 * Compute sustainability risk flag (traffic light) based on EPC distribution
 */
export function computeSustainabilityFlag(properties: PropertyData[]): 'green' | 'amber' | 'red' {
  // Map EPC to numeric risk
  const epcRisk: Record<string, number> = { A: 0, B: 1, C: 2, D: 3, E: 4, F: 5, G: 6 };
  const risks: number[] = properties
    .map(p => (p.epc_rating ? epcRisk[p.epc_rating] ?? 3 : 3));
  if (risks.length === 0) return 'amber';
  const avg = risks.reduce((a, b) => a + b, 0) / risks.length;
  if (avg <= 2) return 'green';
  if (avg <= 4) return 'amber';
  return 'red';
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
    // Find matching lease by property_id and tenant_id
    const matchingLease = leases.find(lease => 
      lease.property_id === txn.property_id && 
      lease.tenant_id === txn.tenant_id
    );
    
    if (matchingLease) {
      // Validate lease is active during transaction date
      const transactionDate = new Date(txn.timestamp);
      const leaseStart = new Date(matchingLease.lease_start);
      const leaseEnd = new Date(matchingLease.lease_end);
      
      const isLeaseActive = transactionDate >= leaseStart && transactionDate <= leaseEnd;
      
      if (!isLeaseActive) {
        unreconciled.push({
          transaction_id: txn.transaction_id,
          property_id: txn.property_id,
          status: "unreconciled",
          reason: "lease_inactive",
          transaction_date: txn.timestamp,
          lease_start: matchingLease.lease_start,
          lease_end: matchingLease.lease_end,
          expected_lease_period: `${matchingLease.lease_start} to ${matchingLease.lease_end}`
        });
        continue;
      }
      
      // Check amount tolerance (±5% by default, configurable)
      const tolerance = matchingLease.monthly_rent * 0.05;
      const amountVariance = Math.abs(txn.amount - matchingLease.monthly_rent);
      const isWithinTolerance = amountVariance <= tolerance;
      
      // Verify due date vs actual timestamp
      const dueDate = new Date(txn.due_date);
      const transactionDateOnly = new Date(txn.timestamp);
      const daysDifference = Math.floor((transactionDateOnly.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24));
      
      if (isWithinTolerance) {
        reconciled.push({
          transaction_id: txn.transaction_id,
          property_id: txn.property_id,
          tenant_id: txn.tenant_id,
          status: "reconciled",
          lease_match: true,
          lease_id: matchingLease.lease_id,
          amount_variance: txn.amount - matchingLease.monthly_rent,
          variance_percentage: (amountVariance / matchingLease.monthly_rent) * 100,
          days_difference: daysDifference,
          is_early_payment: daysDifference < 0,
          is_late_payment: daysDifference > 0,
          expected_amount: matchingLease.monthly_rent,
          actual_amount: txn.amount,
          transaction_date: txn.timestamp,
          due_date: txn.due_date,
          reconciliation_timestamp: new Date().toISOString()
        });
      } else {
        unreconciled.push({
          transaction_id: txn.transaction_id,
          property_id: txn.property_id,
          tenant_id: txn.tenant_id,
          status: "unreconciled",
          reason: "amount_mismatch",
          expected: matchingLease.monthly_rent,
          actual: txn.amount,
          variance: amountVariance,
          variance_percentage: (amountVariance / matchingLease.monthly_rent) * 100,
          tolerance_threshold: tolerance,
          days_difference: daysDifference,
          transaction_date: txn.timestamp,
          due_date: txn.due_date
        });
      }
    } else {
      unreconciled.push({
        transaction_id: txn.transaction_id,
        property_id: txn.property_id,
        tenant_id: txn.tenant_id,
        status: "unreconciled",
        reason: "no_lease_match",
        transaction_date: txn.timestamp,
        due_date: txn.due_date,
        available_leases: leases.filter(lease => lease.property_id === txn.property_id).map(lease => ({
          lease_id: lease.lease_id,
          tenant_name: lease.tenant_name,
          lease_period: `${lease.lease_start} to ${lease.lease_end}`
        }))
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
    // Find matching lease for contract validation
    const matchingLease = leases.find(lease => lease.property_id === txn.property_id);
    
    // 1. Base score by transaction type (0-40)
    const baseScoreMap: Record<string, number> = {
      'rent': 10,
      'service': 20,
      'deposit': 5,
      'purchase': 15,
      'sale': 15,
      'refinance': 25,
      'other': 30
    };
    const baseScore = baseScoreMap[txn.transaction_type.toLowerCase()] || 30;
    
    // 2. Late fee factor (days_late * 2, max 30)
    const dueDate = new Date(txn.due_date);
    const transactionDate = new Date(txn.timestamp);
    const daysLate = Math.floor((transactionDate.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24));
    const lateFeeFactor = Math.min(Math.max(daysLate * 2, 0), 30);
    
    // 3. Anomaly weight based on contract amount variance (0-30)
    let anomalyWeight = 0;
    if (txn.contract_amount && matchingLease) {
      const expectedAmount = matchingLease.monthly_rent;
      const tolerance = expectedAmount * 0.05; // ±5% tolerance
      const variance = Math.abs(txn.amount - expectedAmount);
      
      if (variance > tolerance) {
        const variancePct = (variance / expectedAmount) * 100;
        anomalyWeight = Math.min(variancePct * 3, 30); // 3 points per % variance, max 30
      }
    } else if (txn.contract_amount) {
      // No matching lease but has contract amount
      const variancePct = Math.abs(txn.amount - txn.contract_amount) / txn.contract_amount * 100;
      anomalyWeight = Math.min(variancePct * 2, 30);
    }
    
    // Calculate total risk: base_score + late_fee_factor + anomaly_weight
    const totalRisk = baseScore + lateFeeFactor + anomalyWeight;
    
    // Determine risk level
    let riskLevel = "Low";
    if (totalRisk > 70) riskLevel = "High";
    else if (totalRisk > 40) riskLevel = "Medium";
    
    // Flag early payments (negative days_late)
    const isEarlyPayment = daysLate < 0;
    const isLatePayment = daysLate > 0;
    
    riskScores.push({
      transaction_id: txn.transaction_id,
      property_id: txn.property_id,
      amount: txn.amount,
      risk_score: Math.min(totalRisk, 100),
      risk_level: riskLevel,
      base_score: baseScore,
      late_fee_factor: lateFeeFactor,
      anomaly_weight: anomalyWeight,
      days_late: daysLate,
      is_early_payment: isEarlyPayment,
      is_late_payment: isLatePayment,
      amount_variance: txn.contract_amount ? Math.abs(txn.amount - txn.contract_amount) : 0,
      variance_percentage: txn.contract_amount ? Math.abs(txn.amount - txn.contract_amount) / txn.contract_amount * 100 : 0,
      contract_match: !!matchingLease,
      timestamp: txn.timestamp,
      due_date: txn.due_date
    });
  }
  
  return riskScores;
}

/**
 * Aggregate transaction scores by property and tenant
 * Groups all transactions per property/tenant with total risk insights
 */
function aggregateTransactionsByPropertyTenant(
  reconciled: Array<Record<string, any>>,
  unreconciled: Array<Record<string, any>>,
  riskScores: Array<Record<string, any>>
): Array<Record<string, any>> {
  const aggregation: Record<string, any> = {};
  
  // Combine all transactions
  const allTransactions = [...reconciled, ...unreconciled];
  
  allTransactions.forEach(txn => {
    const key = `${txn.property_id}_${txn.tenant_id || 'unknown'}`;
    
    if (!aggregation[key]) {
      aggregation[key] = {
        property_id: txn.property_id,
        tenant_id: txn.tenant_id || 'unknown',
        total_transactions: 0,
        reconciled_count: 0,
        unreconciled_count: 0,
        total_risk_score: 0,
        average_risk_score: 0,
        high_risk_count: 0,
        medium_risk_count: 0,
        low_risk_count: 0,
        late_payments: 0,
        early_payments: 0,
        on_time_payments: 0,
        total_amount: 0,
        last_transaction_date: txn.transaction_date,
        transaction_types: {}
      };
    }
    
    const agg = aggregation[key];
    agg.total_transactions++;
    
    if (txn.status === 'reconciled') {
      agg.reconciled_count++;
    } else {
      agg.unreconciled_count++;
    }
    
    // Add risk score data
    const riskData = riskScores.find(r => r.transaction_id === txn.transaction_id);
    if (riskData) {
      agg.total_risk_score += riskData.risk_score;
      
      if (riskData.risk_level === 'High') agg.high_risk_count++;
      else if (riskData.risk_level === 'Medium') agg.medium_risk_count++;
      else agg.low_risk_count++;
      
      if (riskData.is_late_payment) agg.late_payments++;
      else if (riskData.is_early_payment) agg.early_payments++;
      else agg.on_time_payments++;
    }
    
    agg.total_amount += txn.actual_amount || txn.amount || 0;
    
    // Track last transaction date
    if (new Date(txn.transaction_date) > new Date(agg.last_transaction_date)) {
      agg.last_transaction_date = txn.transaction_date;
    }
  });
  
  // Calculate averages
  Object.values(aggregation).forEach((agg: any) => {
    agg.average_risk_score = agg.total_transactions > 0 
      ? agg.total_risk_score / agg.total_transactions 
      : 0;
    agg.reconciliation_rate = agg.total_transactions > 0
      ? agg.reconciled_count / agg.total_transactions
      : 0;
  });
  
  return Object.values(aggregation);
}

/**
 * Create summary view by property, unit, and period
 */
function createSummaryViews(
  reconciled: Array<Record<string, any>>,
  unreconciled: Array<Record<string, any>>,
  riskScores: Array<Record<string, any>>
): Record<string, any> {
  const allTransactions = [...reconciled, ...unreconciled];
  
  // Summary by property
  const propertyMap: Record<string, any> = {};
  allTransactions.forEach(txn => {
    if (!propertyMap[txn.property_id]) {
      propertyMap[txn.property_id] = {
        property_id: txn.property_id,
        total_transactions: 0,
        total_amount: 0,
        risk_scores: []
      };
    }
    propertyMap[txn.property_id].total_transactions++;
    propertyMap[txn.property_id].total_amount += txn.actual_amount || txn.amount || 0;
    
    const risk = riskScores.find(r => r.transaction_id === txn.transaction_id);
    if (risk) {
      propertyMap[txn.property_id].risk_scores.push(risk.risk_score);
    }
  });
  
  // Summary by period (monthly)
  const periodMap: Record<string, any> = {};
  allTransactions.forEach(txn => {
    const date = new Date(txn.transaction_date);
    const period = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    
    if (!periodMap[period]) {
      periodMap[period] = {
        period,
        total_transactions: 0,
        reconciled: 0,
        unreconciled: 0,
        total_amount: 0,
        average_risk: 0,
        risk_scores: []
      };
    }
    
    periodMap[period].total_transactions++;
    periodMap[period].total_amount += txn.actual_amount || txn.amount || 0;
    
    if (txn.status === 'reconciled') {
      periodMap[period].reconciled++;
    } else {
      periodMap[period].unreconciled++;
    }
    
    const risk = riskScores.find(r => r.transaction_id === txn.transaction_id);
    if (risk) {
      periodMap[period].risk_scores.push(risk.risk_score);
    }
  });
  
  // Calculate averages for periods
  Object.values(periodMap).forEach((period: any) => {
    if (period.risk_scores.length > 0) {
      period.average_risk = period.risk_scores.reduce((sum: number, score: number) => sum + score, 0) / period.risk_scores.length;
    }
  });
  
  // Calculate averages for properties
  Object.values(propertyMap).forEach((prop: any) => {
    if (prop.risk_scores.length > 0) {
      prop.average_risk = prop.risk_scores.reduce((sum: number, score: number) => sum + score, 0) / prop.risk_scores.length;
    }
  });
  
  return {
    by_property: Object.values(propertyMap),
    by_period: Object.values(periodMap).sort((a: any, b: any) => a.period.localeCompare(b.period))
  };
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
  
  // Risk analysis
  const highRiskCount = riskScores.filter(r => r.risk_score > 70).length;
  const mediumRiskCount = riskScores.filter(r => r.risk_score > 40 && r.risk_score <= 70).length;
  const lowRiskCount = riskScores.filter(r => r.risk_score <= 40).length;
  
  // Payment pattern analysis
  const earlyPayments = riskScores.filter(r => r.is_early_payment).length;
  const latePayments = riskScores.filter(r => r.is_late_payment).length;
  const onTimePayments = riskScores.filter(r => !r.is_early_payment && !r.is_late_payment).length;
  
  // Unreconciled reasons breakdown
  const unreconciledReasons = unreconciled.reduce((acc, txn) => {
    const reason = txn.reason || 'unknown';
    acc[reason] = (acc[reason] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  // Property-level summary
  const propertySummary = [...reconciled, ...unreconciled].reduce((acc, txn) => {
    const propId = txn.property_id;
    if (!acc[propId]) {
      acc[propId] = {
        property_id: propId,
        total_transactions: 0,
        reconciled_count: 0,
        unreconciled_count: 0,
        total_amount: 0,
        average_risk_score: 0
      };
    }
    acc[propId].total_transactions++;
    if (txn.status === 'reconciled') {
      acc[propId].reconciled_count++;
    } else {
      acc[propId].unreconciled_count++;
    }
    acc[propId].total_amount += txn.actual_amount || txn.amount || 0;
    return acc;
  }, {} as Record<string, any>);
  
  // Calculate average risk scores per property
  Object.keys(propertySummary).forEach(propId => {
    const propRiskScores = riskScores.filter(r => r.property_id === propId);
    propertySummary[propId].average_risk_score = propRiskScores.length > 0 
      ? propRiskScores.reduce((sum, r) => sum + r.risk_score, 0) / propRiskScores.length 
      : 0;
  });
  
  // Timeline analysis (last 30 days)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  
  const recentTransactions = [...reconciled, ...unreconciled].filter(txn => {
    const txnDate = new Date(txn.transaction_date || txn.timestamp);
    return txnDate >= thirtyDaysAgo;
  });
  
  // Generate recommendations based on analysis
  const recommendations = [];
  
  if (reconciliationRate < 0.8) {
    recommendations.push("Reconciliation rate below 80% - review data quality and lease matching");
  }
  
  if (highRiskCount > totalTransactions * 0.2) {
    recommendations.push("High proportion of high-risk transactions - implement additional controls");
  }
  
  if (latePayments > totalTransactions * 0.3) {
    recommendations.push("High late payment rate - review payment terms and tenant communication");
  }
  
  if (Object.keys(unreconciledReasons).includes('no_lease_match')) {
    recommendations.push("Multiple transactions without lease matches - verify lease data completeness");
  }
  
  if (Object.keys(unreconciledReasons).includes('amount_mismatch')) {
    recommendations.push("Amount mismatches detected - review contract terms and payment processing");
  }
  
  // Generate property/tenant aggregations
  const propertyTenantAggregations = aggregateTransactionsByPropertyTenant(reconciled, unreconciled, riskScores);
  
  // Create summary views
  const summaryViews = createSummaryViews(reconciled, unreconciled, riskScores);
  
  return {
    // Summary metrics
    total_transactions: totalTransactions,
    reconciled_count: reconciled.length,
    unreconciled_count: unreconciled.length,
    reconciliation_rate: reconciliationRate,
    
    // Risk analysis
    high_risk_transactions: highRiskCount,
    medium_risk_transactions: mediumRiskCount,
    low_risk_transactions: lowRiskCount,
    average_risk_score: riskScores.length > 0 
      ? riskScores.reduce((sum, r) => sum + r.risk_score, 0) / riskScores.length 
      : 0,
    
    // Payment patterns
    early_payments: earlyPayments,
    late_payments: latePayments,
    on_time_payments: onTimePayments,
    payment_timeliness_rate: totalTransactions > 0 ? onTimePayments / totalTransactions : 0,
    
    // Unreconciled breakdown
    unreconciled_reasons: unreconciledReasons,
    
    // Property-level insights
    property_summary: Object.values(propertySummary),
    properties_with_issues: Object.values(propertySummary).filter((p: any) => p.unreconciled_count > 0).length,
    
    // Timeline analysis
    recent_transaction_count: recentTransactions.length,
    recent_reconciliation_rate: recentTransactions.length > 0 
      ? recentTransactions.filter(t => t.status === 'reconciled').length / recentTransactions.length 
      : 0,
    
    // Recommendations
    recommendations: recommendations.length > 0 ? recommendations : [
      "Transaction reconciliation is performing well",
      "Continue monitoring for any emerging patterns",
      "Consider implementing automated alerts for high-risk transactions"
    ],
    
    // Audit trail flags
    flagged_anomalies: unreconciled.filter(txn => txn.reason === 'amount_mismatch' || txn.reason === 'lease_inactive'),
    high_risk_transaction_details: riskScores.filter(r => r.risk_score > 70),
    
    // NEW: Property/Tenant aggregations (as per core algorithm)
    property_tenant_aggregations: propertyTenantAggregations,
    
    // NEW: Summary views by property, unit, and period (as per core algorithm)
    summary_by_property: summaryViews.by_property,
    summary_by_period: summaryViews.by_period,
    
    // Generated timestamp
    report_timestamp: new Date().toISOString(),
    report_period: {
      start_date: thirtyDaysAgo.toISOString().split('T')[0],
      end_date: new Date().toISOString().split('T')[0]
    }
  };
}

/**
 * LCM Occupancy Module Algorithms
 */

export interface OccupancyInputData {
  property_id: string;
  occupancy_sensor_data?: {
    desk_usage?: number;
    lighting_usage?: number;
    temperature_avg?: number;
    badge_ins?: number;
    meeting_room_usage?: number;
  };
  lease_terms?: {
    permitted_usage?: string;
    subletting_allowed?: boolean;
    coworking_restrictions?: boolean;
    max_occupancy?: number;
  };
  historical_logs?: {
    avg_occupancy_3_months?: number;
    avg_occupancy_6_months?: number;
    avg_occupancy_12_months?: number;
    peak_usage?: number;
  };
  tenant_info?: {
    business_type?: string;
    headcount_estimate?: number;
    actual_headcount?: number;
  };
  current_occupancy?: number;
  total_capacity?: number;
}

export interface OccupancyAnalysisResult {
  property_id: string;
  occupancy_score: number;
  utilization_classification: string;
  lease_breach: boolean;
  breach_details?: string;
  predicted_future_pattern: string;
  trend_direction: string;
  recommendations: string[];
  risk_factors: string[];
  baseline_occupancy: number;
  current_usage: number;
  utilization_ratio: number;
}

/**
 * Calculate Occupancy Score per building, floor, and unit
 * Estimates current and future space occupancy levels, patterns, and anomalies
 * 
 * Algorithm as per specification:
 * - Uses IoT/Smart Meter Data (desk usage, lighting, temperature sensors)
 * - Incorporates Lease Clauses (permitted usage, subletting, co-working restrictions)
 * - Analyzes Historical Occupancy Logs (badge-ins, meeting room usage, access logs)
 * - Considers Tenant Business Type and Headcount Estimates
 */
export function calculateOccupancyScore(occupancyData: OccupancyInputData): OccupancyAnalysisResult {
  const {
    property_id,
    occupancy_sensor_data = {},
    lease_terms = {},
    historical_logs = {},
    tenant_info = {},
    current_occupancy = 0,
    total_capacity = 100
  } = occupancyData;

  // Step 1: Calculate baseline occupancy from historical data (last 3 months)
  const baselineOccupancy = historical_logs.avg_occupancy_3_months || 
                            historical_logs.avg_occupancy_6_months || 
                            historical_logs.avg_occupancy_12_months || 
                            current_occupancy || 
                            50; // default baseline

  // Step 2: Calculate current usage from sensor data
  // Average multiple sensor inputs for more accurate reading
  const sensorInputs: number[] = [];
  
  if (occupancy_sensor_data.desk_usage !== undefined) sensorInputs.push(occupancy_sensor_data.desk_usage);
  if (occupancy_sensor_data.badge_ins !== undefined) sensorInputs.push(occupancy_sensor_data.badge_ins);
  if (occupancy_sensor_data.meeting_room_usage !== undefined) sensorInputs.push(occupancy_sensor_data.meeting_room_usage);
  if (occupancy_sensor_data.lighting_usage !== undefined) sensorInputs.push(occupancy_sensor_data.lighting_usage * 0.8); // lighting weighted less
  
  const currentUsage = sensorInputs.length > 0
    ? sensorInputs.reduce((sum, val) => sum + val, 0) / sensorInputs.length
    : current_occupancy || baselineOccupancy;

  // Step 3: Calculate utilization ratio
  const utilizationRatio = baselineOccupancy > 0 
    ? currentUsage / baselineOccupancy 
    : currentUsage / 100;

  // Step 4: Determine utilization classification
  let classification: string;
  let classificationScore: number;
  
  if (utilizationRatio > 1.2) {
    classification = "Overcrowded";
    classificationScore = 85; // High risk
  } else if (utilizationRatio < 0.5) {
    classification = "Underutilised";
    classificationScore = 40; // Opportunity for optimization
  } else {
    classification = "Efficient";
    classificationScore = 100 - Math.abs(utilizationRatio - 1.0) * 50;
  }

  // Step 5: Check lease compliance
  const leaseBreachInfo = checkLeaseCompliance(lease_terms, currentUsage, tenant_info);
  
  // Step 6: Predict future occupancy patterns based on trend detection
  const trendAnalysis = detectOccupancyTrend(historical_logs, currentUsage);
  
  // Step 7: Calculate final occupancy score (0-100%)
  // Formula: (currentUsage * efficiency_factor) where efficiency_factor is based on classification
  let occupancyScore = Math.round(currentUsage * 100) / 100;
  
  // Adjust score based on lease compliance
  if (leaseBreachInfo.breach) {
    occupancyScore = Math.max(occupancyScore * 0.8, 0); // Penalty for breach
  }
  
  // Ensure score is between 0-100
  occupancyScore = Math.min(Math.max(occupancyScore, 0), 100);

  // Step 8: Generate recommendations
  const recommendations = generateOccupancyRecommendations(
    classification,
    leaseBreachInfo,
    trendAnalysis,
    currentUsage,
    baselineOccupancy
  );

  // Step 9: Identify risk factors
  const riskFactors = identifyOccupancyRiskFactors(
    classification,
    leaseBreachInfo,
    utilizationRatio,
    trendAnalysis
  );

  return {
    property_id,
    occupancy_score: occupancyScore,
    utilization_classification: classification,
    lease_breach: leaseBreachInfo.breach,
    breach_details: leaseBreachInfo.details,
    predicted_future_pattern: trendAnalysis.pattern,
    trend_direction: trendAnalysis.direction,
    recommendations,
    risk_factors: riskFactors,
    baseline_occupancy: baselineOccupancy,
    current_usage: currentUsage,
    utilization_ratio: utilizationRatio
  };
}

/**
 * Check lease compliance against current usage
 */
function checkLeaseCompliance(
  leaseTerms: OccupancyInputData['lease_terms'],
  currentUsage: number,
  tenantInfo: OccupancyInputData['tenant_info']
): { breach: boolean; details?: string } {
  if (!leaseTerms) {
    return { breach: false };
  }

  const breaches: string[] = [];

  // Check maximum occupancy limit
  if (leaseTerms.max_occupancy && currentUsage > leaseTerms.max_occupancy) {
    breaches.push(`Exceeds max occupancy limit of ${leaseTerms.max_occupancy} (current: ${currentUsage.toFixed(1)})`);
  }

  // Check subletting restrictions
  if (leaseTerms.subletting_allowed === false && tenantInfo?.actual_headcount) {
    if (tenantInfo.actual_headcount > (tenantInfo.headcount_estimate || 0) * 1.3) {
      breaches.push('Potential unauthorized subletting detected (headcount significantly exceeds estimate)');
    }
  }

  // Check co-working restrictions
  if (leaseTerms.coworking_restrictions && currentUsage > 90) {
    breaches.push('High occupancy may violate co-working restrictions');
  }

  // Check permitted usage
  if (leaseTerms.permitted_usage && leaseTerms.permitted_usage.toLowerCase().includes('single tenant')) {
    if (tenantInfo?.business_type && tenantInfo.business_type.toLowerCase().includes('shared')) {
      breaches.push('Multi-tenant usage detected but lease permits single tenant only');
    }
  }

  return {
    breach: breaches.length > 0,
    details: breaches.length > 0 ? breaches.join('; ') : undefined
  };
}

/**
 * Detect occupancy trends for future pattern prediction
 */
function detectOccupancyTrend(
  historicalLogs: OccupancyInputData['historical_logs'],
  currentUsage: number
): { pattern: string; direction: string } {
  if (!historicalLogs) {
    return { pattern: 'Stable', direction: 'Neutral' };
  }

  const months12 = historicalLogs.avg_occupancy_12_months || currentUsage;
  const months6 = historicalLogs.avg_occupancy_6_months || currentUsage;
  const months3 = historicalLogs.avg_occupancy_3_months || currentUsage;

  // Calculate trend slope
  const longTermTrend = months6 - months12;
  const shortTermTrend = months3 - months6;

  let pattern: string;
  let direction: string;

  // Determine trend direction
  if (shortTermTrend > 5) {
    direction = 'Increasing';
  } else if (shortTermTrend < -5) {
    direction = 'Decreasing';
  } else {
    direction = 'Stable';
  }

  // Determine pattern
  if (Math.abs(shortTermTrend) < 3 && Math.abs(longTermTrend) < 3) {
    pattern = 'Stable - Consistent occupancy levels';
  } else if (shortTermTrend > 0 && longTermTrend > 0) {
    pattern = 'Growth - Steadily increasing occupancy';
  } else if (shortTermTrend < 0 && longTermTrend < 0) {
    pattern = 'Decline - Steadily decreasing occupancy';
  } else if (shortTermTrend > 0 && longTermTrend < 0) {
    pattern = 'Recovery - Recent upturn after decline';
  } else if (shortTermTrend < 0 && longTermTrend > 0) {
    pattern = 'Cooling - Recent downturn after growth';
  } else {
    pattern = 'Volatile - Fluctuating occupancy patterns';
  }

  return { pattern, direction };
}

/**
 * Generate recommendations based on occupancy analysis
 */
function generateOccupancyRecommendations(
  classification: string,
  leaseBreachInfo: { breach: boolean; details?: string },
  trendAnalysis: { pattern: string; direction: string },
  currentUsage: number,
  baselineOccupancy: number
): string[] {
  const recommendations: string[] = [];

  // Classification-based recommendations
  if (classification === 'Overcrowded') {
    recommendations.push('Consider space expansion or desk-sharing optimization');
    recommendations.push('Review tenant headcount against lease terms');
    recommendations.push('Implement booking system for meeting rooms and hot desks');
  } else if (classification === 'Underutilised') {
    recommendations.push('Opportunity for space consolidation or subletting');
    recommendations.push('Review hybrid work policies to optimize space usage');
    recommendations.push('Consider downsizing or flexible lease renegotiation');
  } else {
    recommendations.push('Occupancy levels are optimal - maintain current operations');
  }

  // Lease breach recommendations
  if (leaseBreachInfo.breach) {
    recommendations.push(`URGENT: Address lease compliance issue - ${leaseBreachInfo.details}`);
    recommendations.push('Schedule immediate review with property management');
  }

  // Trend-based recommendations
  if (trendAnalysis.direction === 'Increasing' && currentUsage > 85) {
    recommendations.push('Proactively plan for capacity expansion');
    recommendations.push('Monitor trend closely - approaching maximum capacity');
  } else if (trendAnalysis.direction === 'Decreasing' && currentUsage < 60) {
    recommendations.push('Investigate causes of declining occupancy');
    recommendations.push('Consider marketing initiatives or lease incentives');
  }

  // Usage-specific recommendations
  if (currentUsage > 95) {
    recommendations.push('Near full capacity - ensure emergency egress compliance');
  } else if (currentUsage < 30) {
    recommendations.push('Significant vacancy - prioritize tenant acquisition');
  }

  return recommendations;
}

/**
 * Identify occupancy risk factors
 */
function identifyOccupancyRiskFactors(
  classification: string,
  leaseBreachInfo: { breach: boolean; details?: string },
  utilizationRatio: number,
  trendAnalysis: { pattern: string; direction: string }
): string[] {
  const riskFactors: string[] = [];

  if (classification === 'Overcrowded') {
    riskFactors.push('Health & safety compliance risk');
    riskFactors.push('Tenant satisfaction risk due to overcrowding');
  }

  if (classification === 'Underutilised') {
    riskFactors.push('Revenue loss from vacant space');
    riskFactors.push('Opportunity cost of underperforming asset');
  }

  if (leaseBreachInfo.breach) {
    riskFactors.push('Legal and contractual compliance risk');
    riskFactors.push('Potential for lease termination or penalties');
  }

  if (utilizationRatio > 1.5) {
    riskFactors.push('Extreme overutilization - structural concerns');
  }

  if (trendAnalysis.direction === 'Decreasing') {
    riskFactors.push('Declining tenant demand trend');
  }

  if (trendAnalysis.pattern.includes('Volatile')) {
    riskFactors.push('Unpredictable occupancy patterns');
  }

  return riskFactors.length > 0 ? riskFactors : ['No significant risk factors identified'];
}

/**
 * Batch analyze occupancy data for multiple properties
 */
export function analyzeOccupancyData(occupancyDataArray: OccupancyInputData[]): {
  analyses: OccupancyAnalysisResult[];
  summary: {
    total_properties: number;
    avg_occupancy_score: number;
    overcrowded_count: number;
    underutilised_count: number;
    efficient_count: number;
    lease_breaches: number;
    high_risk_properties: string[];
  };
} {
  const analyses = occupancyDataArray.map(data => calculateOccupancyScore(data));

  const summary = {
    total_properties: analyses.length,
    avg_occupancy_score: analyses.reduce((sum, a) => sum + a.occupancy_score, 0) / analyses.length,
    overcrowded_count: analyses.filter(a => a.utilization_classification === 'Overcrowded').length,
    underutilised_count: analyses.filter(a => a.utilization_classification === 'Underutilised').length,
    efficient_count: analyses.filter(a => a.utilization_classification === 'Efficient').length,
    lease_breaches: analyses.filter(a => a.lease_breach).length,
    high_risk_properties: analyses
      .filter(a => a.lease_breach || a.utilization_classification === 'Overcrowded')
      .map(a => a.property_id)
  };

  return { analyses, summary };
}

/**
 * LCM Predictive Modelling Module Algorithms
 */
/**
 * LCM Predictive Modelling - Comprehensive Implementation
 * Forecasts future lease performance, energy efficiency risk, occupancy likelihood
 * Uses gradient boosted trees simulation with explainable scoring
 */
export function runPredictiveModels(properties: PropertyData[], marketData: MarketData[]): Array<Record<string, any>> {
  const predictions: Array<Record<string, any>> = [];
  
  for (const prop of properties) {
    // Find market data for this property
    const marketMatch = marketData.find(
      m => m.location === prop.location && m.property_type === prop.type
    );
    
    // === FEATURE ENGINEERING ===
    
    // 1. Calculate lease duration ratios
    const leaseDurationRatio = prop.lease_expiry_date && prop.purchase_date ? 
      (new Date(prop.lease_expiry_date).getTime() - new Date().getTime()) / 
      (new Date(prop.lease_expiry_date).getTime() - new Date(prop.purchase_date).getTime()) : 0.5;
    
    // 2. Encode property type (ordinal encoding based on market performance)
    const propertyTypeScore: Record<string, number> = {
      'industrial': 0.9,  // Highest demand
      'office': 0.7,
      'residential': 0.6,
      'retail': 0.4       // Lowest current demand
    };
    const encodedPropertyType = propertyTypeScore[prop.type] || 0.5;
    
    // 3. Generate location risk index from external data
    const marketDemand = marketMatch?.demand_index || 0.5;
    const economicIndicators = marketMatch?.economic_indicators || { gdp_growth: 2.5, inflation_rate: 3.0, interest_rate: 4.5 };
    
    // Location risk index combines multiple factors
    const locationRiskIndex = (
      marketDemand * 0.4 +
      (economicIndicators.gdp_growth / 5) * 0.3 +
      (1 - economicIndicators.inflation_rate / 10) * 0.2 +
      (1 - economicIndicators.interest_rate / 10) * 0.1
    );
    
    // === ML MODEL SIMULATION (Gradient Boosted Trees) ===
    
    // Target 1: Lease Renewal Probability (%)
    const baseRenewalProb = 0.65;
    const renewalProbability = Math.min(Math.max(
      baseRenewalProb +
      leaseDurationRatio * 0.1 +
      (prop.occupancy_rate - 0.8) * 0.2 +
      (marketDemand - 0.5) * 0.15 +
      ((prop.maintenance_score || 5) - 5) / 10 * 0.1,
      0.1
    ), 0.95) * 100; // Convert to percentage
    
    // Target 2: Predicted EPC Deterioration Risk
    const epcRatingScores: Record<string, number> = { 'A': 1, 'B': 2, 'C': 3, 'D': 4, 'E': 5, 'F': 6, 'G': 7 };
    const currentEpcScore = epcRatingScores[prop.epc_rating || 'C'] || 3;
    const propertyAge = prop.purchase_date ? 
      (new Date().getFullYear() - new Date(prop.purchase_date).getFullYear()) : 10;
    
    const epcDeteriorationScore = Math.min(
      currentEpcScore * 0.4 +
      propertyAge / 50 * 0.3 +
      (1 - (prop.maintenance_score || 5) / 10) * 0.3,
      1
    ) * 100; // 0-100 score
    
    const epcRiskLevel = epcDeteriorationScore > 60 ? 'High' : epcDeteriorationScore > 35 ? 'Med' : 'Low';
    
    // Target 3: Forecasted Occupancy Rate over 12 months
    const seasonalFactor = 1.0 + (Math.random() - 0.5) * 0.05; // ±2.5% seasonal variation
    const marketTrend = marketDemand > 0.6 ? 1.02 : marketDemand < 0.4 ? 0.98 : 1.0;
    const maintenanceImpact = 1 + ((prop.maintenance_score || 5) - 5) / 100;
    
    const forecastedOccupancy = Math.min(Math.max(
      prop.occupancy_rate * seasonalFactor * marketTrend * maintenanceImpact,
      0.1
    ), 1.0) * 100; // Convert to percentage
    
    // Target 4: Risk-adjusted Rent Forecast (£/sqft)
    const baseRent = marketMatch?.market_rent || prop.current_value * 0.05 / 12 / 10000; // Estimate per sqft
    const rentGrowthRate = (
      economicIndicators.gdp_growth / 100 * 0.4 +
      (marketDemand - 0.5) * 0.03 +
      (forecastedOccupancy - 80) / 100 * 0.02
    );
    const riskAdjustedRent = baseRent * (1 + rentGrowthRate);
    
    // === WEIGHTED SCORING SYSTEM ===
    // Score = 0.4 * EPC Risk + 0.3 * Occupancy Forecast + 0.3 * Rent Stability Index
    
    // EPC Risk component (inverted so higher is better)
    const epcRiskComponent = (100 - epcDeteriorationScore) * 0.4;
    
    // Occupancy Forecast component
    const occupancyComponent = forecastedOccupancy * 0.3;
    
    // Rent Stability Index (based on consistency and growth)
    const rentStabilityIndex = Math.min(
      renewalProbability * 0.5 +
      (rentGrowthRate > 0 ? 50 : 30) +
      locationRiskIndex * 20,
      100
    );
    const rentStabilityComponent = rentStabilityIndex * 0.3;
    
    const totalScore = epcRiskComponent + occupancyComponent + rentStabilityComponent;
    
    // === ASSET CLASSIFICATION ===
    const assetClassification = totalScore < 40 ? 'High Risk' : totalScore <= 70 ? 'Moderate' : 'Stable';
    
    // Calculate predicted value based on comprehensive factors
    const valueGrowthRate = (
      rentGrowthRate * 0.5 +
      (locationRiskIndex - 0.5) * 0.05 +
      encodedPropertyType * 0.02 +
      (forecastedOccupancy / 100 - prop.occupancy_rate) * 0.03
    );
    
    const predictedValue = prop.current_value * (1 + valueGrowthRate);
    
    // Calculate confidence based on data quality and model factors
    const confidence = Math.min(
      0.6 + // Base confidence
      locationRiskIndex * 0.2 +
      (prop.maintenance_score ? 0.1 : 0) +
      (prop.epc_rating ? 0.1 : 0),
      0.95
    );
    
    // Risk factors
    const riskFactors: string[] = [];
    if (assetClassification === 'High Risk') riskFactors.push("high_risk_asset");
    if (epcRiskLevel === 'High') riskFactors.push("epc_deterioration");
    if (forecastedOccupancy < 80) riskFactors.push("low_occupancy");
    if (renewalProbability < 50) riskFactors.push("renewal_risk");
    
    predictions.push({
      property_id: prop.property_id,
      property_name: prop.name,
      property_type: prop.type,
      
      // Core predictions
      predicted_value: predictedValue,
      predicted_occupancy: forecastedOccupancy / 100,
      growth_rate: valueGrowthRate,
      
      // Key outputs as per specification
      lease_renewal_probability: Math.round(renewalProbability * 10) / 10,
      predicted_epc_risk: epcRiskLevel,
      epc_deterioration_score: Math.round(epcDeteriorationScore),
      forecasted_occupancy_rate: Math.round(forecastedOccupancy * 10) / 10,
      risk_adjusted_rent_forecast: Math.round(riskAdjustedRent * 100) / 100,
      
      // Scoring components
      total_score: Math.round(totalScore * 10) / 10,
      epc_risk_component: Math.round(epcRiskComponent * 10) / 10,
      occupancy_component: Math.round(occupancyComponent * 10) / 10,
      rent_stability_component: Math.round(rentStabilityComponent * 10) / 10,
      rent_stability_index: Math.round(rentStabilityIndex * 10) / 10,
      
      // Classification
      asset_classification: assetClassification,
      
      // Feature engineering outputs
      lease_duration_ratio: Math.round(leaseDurationRatio * 100) / 100,
      property_type_score: encodedPropertyType,
      location_risk_index: Math.round(locationRiskIndex * 100) / 100,
      
      // Additional metrics
      confidence: Math.round(confidence * 100),
      risk_factors: riskFactors,
      timeframe: "12_months",
      
      // Economic context
      economic_factors: {
        gdp_growth: economicIndicators.gdp_growth,
        inflation_rate: economicIndicators.inflation_rate,
        interest_rate: economicIndicators.interest_rate,
        market_demand: Math.round(marketDemand * 100)
      }
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
 * Check lease compliance based on occupancy data (Legacy function - use calculateOccupancyScore instead)
 */
export function checkOccupancyLeaseCompliance(occupancyData: any[], leases: any[]): Array<Record<string, any>> {
  const complianceAlerts: Array<Record<string, any>> = [];
  
  for (const occupancy of occupancyData) {
    // Find matching leases
    const propertyLeases = leases.filter((lease: any) => lease.property_id === occupancy.property_id);
    
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
/**
 * LCM Lease – Predictive Lease Risk Scoring Algorithm
 * Proprietary algorithm for early warnings and intervention recommendations
 * 
 * Inputs:
 * - EPC rating (A–G)
 * - Average void period in months
 * - Rent uplift risk (0–1)
 * - Local demand index (0–100)
 * - Occupancy rate (0–1)
 * 
 * Outputs:
 * - Lease Risk Score (0–100)
 * - Recommended Action: Dispose/Retrofit, Monitor Closely, or Low Risk
 */
export function calculateLeaseRiskScores(
  properties: PropertyData[], 
  leases: LeaseData[], 
  marketData: MarketData[]
): Array<Record<string, any>> {
  const riskScores: Array<Record<string, any>> = [];
  
  for (const property of properties) {
    // 1. EPC-based risk score
    const epcWeights: Record<string, number> = { A: 0, B: 5, C: 10, D: 20, E: 30, F: 40, G: 50 };
    const epcScore = epcWeights[property.epc_rating || ''] || 25;
    
    // 2. Void period score - Calculate avg void based on historical data or defaults
    // Using maintenance score as proxy for void period (lower maintenance = longer voids)
    const avgVoidMonths = property.maintenance_score ? 
      Math.max(0, 10 - property.maintenance_score) : // Lower maintenance correlates with longer voids
      3; // Default 3 months
    const voidScore = Math.min(avgVoidMonths * 3, 30); // Max contribution = 30
    
    // 3. Rent uplift risk - Based on market conditions and property value
    // Calculate from property value trend or use market data
    const rentUpliftRisk = property.noi && property.current_value ?
      Math.min(1, Math.max(0, 1 - (property.noi / (property.current_value * 0.05)))) : // Compare to 5% yield benchmark
      0.5; // Default moderate risk
    const rentScore = rentUpliftRisk * 10; // Max contribution = 10
    
    // 4. Local demand score - Inverse logic (lower demand = higher risk)
    const marketMatch = marketData.find(
      m => m.location === property.location && m.property_type === property.type
    );
    let localDemandIndex = 50; // Default mid-range
    if (marketMatch) {
      // Convert 0-1 scale to 0-100 if needed
      localDemandIndex = marketMatch.demand_index > 1 ? 
        marketMatch.demand_index : 
        marketMatch.demand_index * 100;
    }
    const demandScore = 10 - Math.min(localDemandIndex / 10, 10); // Inverse logic, max = 10
    
    // 5. Occupancy score
    const occupancyScore = (1 - property.occupancy_rate) * 20; // Max contribution = 20
    
    // Calculate total lease risk score
    const leaseRiskScore = epcScore + voidScore + rentScore + demandScore + occupancyScore;
    
    // Determine recommended action based on risk score
    let recommendedAction: string;
    if (leaseRiskScore > 70) {
      recommendedAction = "Dispose or Retrofit";
    } else if (leaseRiskScore > 40) {
      recommendedAction = "Monitor Closely";
    } else {
      recommendedAction = "Low Risk";
    }
    
    riskScores.push({
      property_id: property.property_id,
      lease_risk_score: Math.min(leaseRiskScore, 100),
      recommended_action: recommendedAction,
      risk_level: leaseRiskScore > 70 ? "High" : leaseRiskScore > 40 ? "Medium" : "Low",
      // Component scores for detailed analysis
      epc_score: epcScore,
      void_score: voidScore,
      rent_score: rentScore,
      demand_score: demandScore,
      occupancy_score: occupancyScore,
      // Additional metrics
      avg_void_months: avgVoidMonths,
      rent_uplift_risk: rentUpliftRisk,
      local_demand_index: localDemandIndex
    });
  }
  
  return riskScores;
}

/**
 * Generate recommended actions based on lease risk scores
 * Actions are determined by the risk score thresholds:
 * - >70: Dispose or Retrofit (High Priority, Immediate action)
 * - >40: Monitor Closely (Medium Priority, 3-6 months)
 * - <=40: Low Risk (Low Priority, Ongoing monitoring)
 */
export function generateLeaseRiskActions(
  riskScores: Array<Record<string, any>>, 
  properties: PropertyData[], 
  leases: LeaseData[]
): Array<Record<string, any>> {
  const actions: Array<Record<string, any>> = [];
  
  for (const risk of riskScores) {
    const riskScore = risk.lease_risk_score || risk.risk_score || 0;
    const recommendedAction = risk.recommended_action || "Review Required";
    
    let priority: string;
    let timeline: string;
    let interventions: string[] = [];
    
    if (riskScore > 70) {
      priority = "High";
      timeline = "Immediate";
      interventions = [
        "Consider property disposal or major retrofit",
        "Evaluate EPC improvement opportunities",
        "Review tenant quality and lease terms"
      ];
    } else if (riskScore > 40) {
      priority = "Medium";
      timeline = "3-6 months";
      interventions = [
        "Monitor lease renewal dates",
        "Assess market conditions regularly",
        "Plan preventive maintenance"
      ];
    } else {
      priority = "Low";
      timeline = "Ongoing";
      interventions = [
        "Continue standard monitoring",
        "Maintain good tenant relationships"
      ];
    }
    
    actions.push({
      property_id: risk.property_id,
      recommended_action: recommendedAction,
      priority: priority,
      timeline: timeline,
      interventions: interventions,
      risk_score: riskScore
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
 * Returns top priorities sorted by risk score (highest first)
 */
export function prioritizeLeaseInterventions(
  riskScores: Array<Record<string, any>>, 
  recommendedActions: Array<Record<string, any>>
): string[] {
  // Sort by risk score (highest first)
  const sortedRisks = [...riskScores].sort((a, b) => {
    const scoreA = a.lease_risk_score || a.risk_score || 0;
    const scoreB = b.lease_risk_score || b.risk_score || 0;
    return scoreB - scoreA;
  });
  
  const priorities: string[] = [];
  for (let i = 0; i < Math.min(sortedRisks.length, 5); i++) { // Top 5 priorities
    const risk = sortedRisks[i];
    const action = recommendedActions.find(a => a.property_id === risk.property_id) || {};
    const riskScore = risk.lease_risk_score || risk.risk_score || 0;
    const recommendedAction = action.recommended_action || risk.recommended_action || 'Review';
    
    priorities.push(
      `${i + 1}. Property ${risk.property_id}: ${recommendedAction} (Risk Score: ${riskScore.toFixed(1)}/100)`
    );
  }
  
  return priorities;
}
