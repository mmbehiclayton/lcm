from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestRegressor, GradientBoostingRegressor
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from datetime import datetime, timedelta
import json

app = FastAPI(title="LCM Analytics Python Service", version="1.0.0")

# Data Models for All LCM Modules
class PropertyData(BaseModel):
    property_id: str
    name: str
    type: str
    location: str
    purchase_price: float
    current_value: float
    noi: float
    occupancy_rate: float
    purchase_date: str = None
    lease_expiry_date: str = None
    epc_rating: str = None
    maintenance_score: float = None

class TransactionData(BaseModel):
    transaction_id: str
    property_id: str
    tenant_id: str
    transaction_type: str  # rent, service, deposit
    amount: float
    due_date: str
    timestamp: str
    bank_reference: str = None
    contract_amount: float = None

class LeaseData(BaseModel):
    lease_id: str
    property_id: str
    tenant_name: str
    lease_start: str
    lease_end: str
    monthly_rent: float
    security_deposit: float = None
    renewal_option: bool = False
    break_clause: bool = False

class OccupancyData(BaseModel):
    property_id: str
    total_sq_ft: float
    occupied_sq_ft: float
    vacant_sq_ft: float
    common_areas: float = None
    parking_spaces: int = None
    occupied_parking: int = None
    sensor_data: Dict[str, Any] = None

class MarketData(BaseModel):
    location: str
    property_type: str
    market_rent: float
    demand_index: float
    economic_indicators: Dict[str, float] = None

# Request/Response Models
class AnalysisRequest(BaseModel):
    properties: List[PropertyData]
    strategy: str
    weights: Dict[str, float] = None

class TransactionAnalysisRequest(BaseModel):
    transactions: List[TransactionData]
    leases: List[LeaseData]

class PredictiveAnalysisRequest(BaseModel):
    properties: List[PropertyData]
    historical_data: List[Dict[str, Any]]
    market_data: List[MarketData]

class OccupancyAnalysisRequest(BaseModel):
    occupancy_data: List[OccupancyData]
    lease_data: List[LeaseData]

class LeaseRiskRequest(BaseModel):
    properties: List[PropertyData]
    leases: List[LeaseData]
    market_data: List[MarketData]

# Response Models
class AnalysisResponse(BaseModel):
    portfolio_health: float
    risk_level: str
    performance_grade: str
    recommendations: List[str]
    property_scores: List[Dict[str, Any]]

class TransactionAnalysisResponse(BaseModel):
    reconciled_transactions: List[Dict[str, Any]]
    unreconciled_transactions: List[Dict[str, Any]]
    risk_scores: List[Dict[str, Any]]
    reconciliation_report: Dict[str, Any]

class PredictiveAnalysisResponse(BaseModel):
    predictions: List[Dict[str, Any]]
    risk_assessments: List[Dict[str, Any]]
    confidence_scores: List[Dict[str, Any]]
    recommendations: List[str]

class OccupancyAnalysisResponse(BaseModel):
    utilization_scores: List[Dict[str, Any]]
    compliance_alerts: List[Dict[str, Any]]
    optimization_recommendations: List[str]
    efficiency_metrics: Dict[str, Any]

class LeaseRiskResponse(BaseModel):
    risk_scores: List[Dict[str, Any]]
    recommended_actions: List[Dict[str, Any]]
    risk_factors: List[Dict[str, Any]]
    intervention_priorities: List[str]

@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "LCM Analytics Python Service"}

# LCM Portfolio Analysis Module
@app.post("/portfolio/analyze", response_model=AnalysisResponse)
async def analyze_portfolio(request: AnalysisRequest):
    """LCM Portfolio Analysis - Enhanced with strategy-specific weighting"""
    try:
        # Convert to DataFrame for analysis
        df = pd.DataFrame([prop.dict() for prop in request.properties])
        
        # Calculate individual scores with enhanced algorithms
        property_scores = []
        for _, property in df.iterrows():
            scores = calculate_enhanced_property_scores(property, request.strategy)
            property_scores.append({
                "property_id": property["property_id"],
                "lease_score": scores["lease_score"],
                "occupancy_score": scores["occupancy_score"],
                "noi_score": scores["noi_score"],
                "energy_score": scores["energy_score"],
                "capex_score": scores["capex_score"],
                "sustainability_score": scores.get("sustainability_score", 0),
                "market_score": scores.get("market_score", 0)
            })
        
        # Calculate portfolio health with strategy-specific weighting
        weights = get_enhanced_strategy_weights(request.strategy, request.weights)
        portfolio_health = calculate_enhanced_portfolio_health(property_scores, weights)
        
        # Generate comprehensive recommendations
        recommendations = generate_enhanced_recommendations(property_scores, request.strategy, df)
        
        return AnalysisResponse(
            portfolio_health=portfolio_health,
            risk_level=assess_enhanced_risk_level(portfolio_health, property_scores),
            performance_grade=calculate_performance_grade(portfolio_health),
            recommendations=recommendations,
            property_scores=property_scores
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# LCM Transactions Module
@app.post("/transactions/analyze", response_model=TransactionAnalysisResponse)
async def analyze_transactions(request: TransactionAnalysisRequest):
    """LCM Transactions Module - Reconciliation and risk scoring"""
    try:
        # Convert to DataFrames
        transactions_df = pd.DataFrame([txn.dict() for txn in request.transactions])
        leases_df = pd.DataFrame([lease.dict() for lease in request.leases])
        
        # Perform transaction reconciliation
        reconciled, unreconciled = reconcile_transactions(transactions_df, leases_df)
        
        # Calculate risk scores for transactions
        risk_scores = calculate_transaction_risk_scores(transactions_df, leases_df)
        
        # Generate reconciliation report
        reconciliation_report = generate_reconciliation_report(reconciled, unreconciled, risk_scores)
        
        return TransactionAnalysisResponse(
            reconciled_transactions=reconciled,
            unreconciled_transactions=unreconciled,
            risk_scores=risk_scores,
            reconciliation_report=reconciliation_report
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# LCM Predictive Modelling Module
@app.post("/predictive/analyze", response_model=PredictiveAnalysisResponse)
async def analyze_predictive(request: PredictiveAnalysisRequest):
    """LCM Predictive Modelling - Forecasting and risk assessment"""
    try:
        # Prepare data for machine learning models
        features_df = prepare_predictive_features(request.properties, request.historical_data, request.market_data)
        
        # Train and run predictive models
        predictions = run_predictive_models(features_df)
        
        # Calculate risk assessments
        risk_assessments = calculate_predictive_risks(features_df, predictions)
        
        # Generate confidence scores
        confidence_scores = calculate_confidence_scores(predictions, risk_assessments)
        
        # Generate recommendations
        recommendations = generate_predictive_recommendations(predictions, risk_assessments)
        
        return PredictiveAnalysisResponse(
            predictions=predictions,
            risk_assessments=risk_assessments,
            confidence_scores=confidence_scores,
            recommendations=recommendations
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# LCM Occupancy Module
@app.post("/occupancy/analyze", response_model=OccupancyAnalysisResponse)
async def analyze_occupancy(request: OccupancyAnalysisRequest):
    """LCM Occupancy Module - Space utilization and compliance analysis"""
    try:
        # Convert to DataFrames
        occupancy_df = pd.DataFrame([occ.dict() for occ in request.occupancy_data])
        leases_df = pd.DataFrame([lease.dict() for lease in request.lease_data])
        
        # Calculate utilization scores
        utilization_scores = calculate_utilization_scores(occupancy_df)
        
        # Check compliance alerts
        compliance_alerts = check_lease_compliance(occupancy_df, leases_df)
        
        # Generate optimization recommendations
        optimization_recommendations = generate_occupancy_optimization_recommendations(occupancy_df, utilization_scores)
        
        # Calculate efficiency metrics
        efficiency_metrics = calculate_efficiency_metrics(occupancy_df, utilization_scores)
        
        return OccupancyAnalysisResponse(
            utilization_scores=utilization_scores,
            compliance_alerts=compliance_alerts,
            optimization_recommendations=optimization_recommendations,
            efficiency_metrics=efficiency_metrics
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# LCM Lease Risk Scoring Module
@app.post("/lease-risk/analyze", response_model=LeaseRiskResponse)
async def analyze_lease_risk(request: LeaseRiskRequest):
    """LCM Lease Risk Scoring - EPC-based risk assessment and intervention recommendations"""
    try:
        # Convert to DataFrames
        properties_df = pd.DataFrame([prop.dict() for prop in request.properties])
        leases_df = pd.DataFrame([lease.dict() for lease in request.leases])
        market_df = pd.DataFrame([market.dict() for market in request.market_data])
        
        # Calculate lease risk scores
        risk_scores = calculate_lease_risk_scores(properties_df, leases_df, market_df)
        
        # Generate recommended actions
        recommended_actions = generate_lease_risk_actions(risk_scores, properties_df, leases_df)
        
        # Identify risk factors
        risk_factors = identify_lease_risk_factors(properties_df, leases_df, market_df)
        
        # Set intervention priorities
        intervention_priorities = prioritize_lease_interventions(risk_scores, recommended_actions)
        
        return LeaseRiskResponse(
            risk_scores=risk_scores,
            recommended_actions=recommended_actions,
            risk_factors=risk_factors,
            intervention_priorities=intervention_priorities
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Enhanced Algorithm Implementations for All LCM Modules

def calculate_enhanced_property_scores(property: pd.Series, strategy: str) -> Dict[str, float]:
    """Enhanced property scoring with strategy-specific considerations"""
    scores = {}
    
    # Enhanced lease score calculation
    scores["lease_score"] = calculate_enhanced_lease_score(property)
    
    # Enhanced occupancy score
    scores["occupancy_score"] = calculate_enhanced_occupancy_score(property)
    
    # Enhanced NOI score
    scores["noi_score"] = calculate_enhanced_noi_score(property)
    
    # Enhanced energy score with sustainability factors
    scores["energy_score"] = calculate_enhanced_energy_score(property)
    
    # Enhanced capex score
    scores["capex_score"] = calculate_enhanced_capex_score(property)
    
    # Additional scores for enhanced analysis
    scores["sustainability_score"] = calculate_sustainability_score(property)
    scores["market_score"] = calculate_market_score(property)
    
    return scores

def calculate_enhanced_lease_score(property: pd.Series) -> float:
    """Enhanced lease scoring with multiple risk factors"""
    if pd.isna(property["lease_expiry_date"]):
        return 50  # Neutral for missing data
    
    days_to_expiry = (pd.to_datetime(property["lease_expiry_date"]) - pd.Timestamp.now()).days
    
    # Base score from expiry timing
    if days_to_expiry < 90:
        base_score = 20
    elif days_to_expiry < 180:
        base_score = 40
    elif days_to_expiry < 365:
        base_score = 60
    elif days_to_expiry < 730:
        base_score = 80
    else:
        base_score = 100
    
    # Adjust for occupancy rate (lease risk is higher with low occupancy)
    occupancy_factor = property["occupancy_rate"] * 0.2
    final_score = min(base_score + occupancy_factor * 20, 100)
    
    return final_score

def calculate_enhanced_occupancy_score(property: pd.Series) -> float:
    """Enhanced occupancy scoring with trend analysis"""
    occupancy_rate = property["occupancy_rate"]
    
    # Base scoring
    if occupancy_rate >= 0.95:
        base_score = 100
    elif occupancy_rate >= 0.90:
        base_score = 90
    elif occupancy_rate >= 0.85:
        base_score = 80
    elif occupancy_rate >= 0.80:
        base_score = 70
    elif occupancy_rate >= 0.75:
        base_score = 60
    elif occupancy_rate >= 0.70:
        base_score = 50
    else:
        base_score = 30
    
    # Adjust for property type (some types have naturally lower occupancy)
    property_type_adjustment = {
        "office": 0,
        "retail": -5,
        "industrial": 0,
        "residential": 5
    }
    
    adjustment = property_type_adjustment.get(property["type"], 0)
    final_score = max(min(base_score + adjustment, 100), 0)
    
    return final_score

def calculate_enhanced_noi_score(property: pd.Series) -> float:
    """Enhanced NOI scoring with yield and growth analysis"""
    if property["current_value"] == 0:
        return 0
    
    noi_yield = property["noi"] / property["current_value"]
    
    # Enhanced yield scoring
    if noi_yield >= 0.08:
        base_score = 100
    elif noi_yield >= 0.07:
        base_score = 90
    elif noi_yield >= 0.06:
        base_score = 80
    elif noi_yield >= 0.05:
        base_score = 70
    elif noi_yield >= 0.04:
        base_score = 60
    elif noi_yield >= 0.03:
        base_score = 50
    else:
        base_score = 30
    
    # Adjust for property value growth potential
    if property["current_value"] > property["purchase_price"]:
        growth_factor = (property["current_value"] / property["purchase_price"]) * 5
        final_score = min(base_score + growth_factor, 100)
    else:
        final_score = base_score
    
    return final_score

def calculate_enhanced_energy_score(property: pd.Series) -> float:
    """Enhanced energy scoring with EPC and sustainability factors"""
    epc_ratings = {"A": 100, "B": 85, "C": 70, "D": 55, "E": 40, "F": 25, "G": 10}
    base_score = epc_ratings.get(property["epc_rating"], 50)
    
    # Adjust for property age (newer properties typically more efficient)
    if pd.notna(property["purchase_date"]):
        property_age = (pd.Timestamp.now() - pd.to_datetime(property["purchase_date"])).days / 365
        if property_age < 5:
            age_factor = 10
        elif property_age < 10:
            age_factor = 5
        else:
            age_factor = 0
        final_score = min(base_score + age_factor, 100)
    else:
        final_score = base_score
    
    return final_score

def calculate_enhanced_capex_score(property: pd.Series) -> float:
    """Enhanced capex scoring with maintenance history"""
    maintenance_score = property["maintenance_score"] or 5
    base_score = maintenance_score * 10
    
    # Adjust for property value (higher value properties need more maintenance)
    if property["current_value"] > 10000000:  # High-value properties
        adjustment = 10
    elif property["current_value"] > 5000000:
        adjustment = 5
    else:
        adjustment = 0
    
    final_score = min(base_score + adjustment, 100)
    return final_score

def calculate_sustainability_score(property: pd.Series) -> float:
    """Calculate sustainability score based on EPC and environmental factors"""
    epc_scores = {"A": 100, "B": 80, "C": 60, "D": 40, "E": 20, "F": 10, "G": 0}
    base_score = epc_scores.get(property["epc_rating"], 50)
    
    # Adjust for property type (some types are naturally more sustainable)
    type_adjustment = {
        "office": 0,
        "retail": -5,
        "industrial": -10,
        "residential": 5
    }
    
    adjustment = type_adjustment.get(property["type"], 0)
    final_score = max(min(base_score + adjustment, 100), 0)
    
    return final_score

def calculate_market_score(property: pd.Series) -> float:
    """Calculate market positioning score"""
    # This would typically use market data, but for now we'll use property characteristics
    location_score = 70  # Placeholder - would use actual market data
    type_score = 80     # Placeholder - would use market demand data
    
    # Weighted average
    market_score = (location_score * 0.6 + type_score * 0.4)
    return market_score

# Enhanced Strategy Weighting and Portfolio Analysis
def get_enhanced_strategy_weights(strategy: str, custom_weights: Dict[str, float] = None) -> Dict[str, float]:
    """Enhanced strategy weighting with additional factors"""
    if custom_weights:
        return custom_weights
    
    weight_configs = {
        "growth": {
            "lease": 0.30, "occupancy": 0.20, "noi": 0.30, "energy": 0.10, "capex": 0.10,
            "sustainability": 0.05, "market": 0.05
        },
        "hold": {
            "lease": 0.25, "occupancy": 0.25, "noi": 0.20, "energy": 0.15, "capex": 0.15,
            "sustainability": 0.10, "market": 0.05
        },
        "divest": {
            "lease": 0.40, "occupancy": 0.10, "noi": 0.20, "energy": 0.20, "capex": 0.10,
            "sustainability": 0.15, "market": 0.05
        }
    }
    
    return weight_configs.get(strategy, weight_configs["hold"])

def calculate_enhanced_portfolio_health(property_scores: List[Dict], weights: Dict[str, float]) -> float:
    """Enhanced portfolio health calculation with additional metrics"""
    total_score = 0
    for property in property_scores:
        weighted_score = (
            property["lease_score"] * weights["lease"] +
            property["occupancy_score"] * weights["occupancy"] +
            property["noi_score"] * weights["noi"] +
            property["energy_score"] * weights["energy"] +
            property["capex_score"] * weights["capex"] +
            property.get("sustainability_score", 0) * weights.get("sustainability", 0) +
            property.get("market_score", 0) * weights.get("market", 0)
        )
        total_score += weighted_score
    
    return total_score / len(property_scores)

def assess_enhanced_risk_level(score: float, property_scores: List[Dict]) -> str:
    """Enhanced risk assessment considering portfolio concentration"""
    # Base risk level
    if score >= 80:
        base_risk = "Low"
    elif score >= 60:
        base_risk = "Medium"
    else:
        base_risk = "High"
    
    # Adjust for concentration risk
    low_scores = [p for p in property_scores if p["lease_score"] < 50 or p["occupancy_score"] < 50]
    concentration_risk = len(low_scores) / len(property_scores)
    
    if concentration_risk > 0.3:  # More than 30% of properties have low scores
        if base_risk == "Low":
            return "Medium"
        elif base_risk == "Medium":
            return "High"
    
    return base_risk

def generate_enhanced_recommendations(property_scores: List[Dict], strategy: str, properties_df: pd.DataFrame) -> List[str]:
    """Enhanced recommendations with strategy-specific insights"""
    recommendations = []
    
    # Portfolio health recommendations
    avg_score = sum(p["lease_score"] for p in property_scores) / len(property_scores)
    if avg_score < 70:
        recommendations.append("Portfolio health requires immediate attention - focus on lease renewals and occupancy improvements")
    
    # Strategy-specific recommendations
    if strategy == "growth":
        recommendations.extend([
            "Consider acquisition opportunities in high-performing markets",
            "Focus on properties with strong NOI growth potential",
            "Evaluate expansion opportunities for existing high-performing assets"
        ])
    elif strategy == "hold":
        recommendations.extend([
            "Maintain current portfolio with focus on operational efficiency",
            "Consider energy efficiency improvements to enhance sustainability scores",
            "Monitor market conditions for potential repositioning opportunities"
        ])
    elif strategy == "divest":
        recommendations.extend([
            "Identify underperforming assets for potential divestment",
            "Focus on lease stability to maximize sale value",
            "Consider timing market conditions for optimal exit strategies"
        ])
    
    # Risk mitigation recommendations
    high_risk_properties = [p for p in property_scores if p["lease_score"] < 40 or p["occupancy_score"] < 40]
    if high_risk_properties:
        recommendations.append(f"Address {len(high_risk_properties)} high-risk properties immediately")
    
    return recommendations

# LCM Transactions Module Algorithms
def reconcile_transactions(transactions_df: pd.DataFrame, leases_df: pd.DataFrame) -> tuple:
    """Reconcile transactions with lease contracts"""
    reconciled = []
    unreconciled = []
    
    for _, txn in transactions_df.iterrows():
        # Find matching lease
        matching_lease = leases_df[
            (leases_df["property_id"] == txn["property_id"]) &
            (leases_df["tenant_id"] == txn["tenant_id"])
        ]
        
        if not matching_lease.empty:
            lease = matching_lease.iloc[0]
            # Check amount tolerance (±5%)
            if txn["contract_amount"] and lease["monthly_rent"]:
                tolerance = lease["monthly_rent"] * 0.05
                if abs(txn["amount"] - lease["monthly_rent"]) <= tolerance:
                    reconciled.append({
                        "transaction_id": txn["transaction_id"],
                        "status": "reconciled",
                        "lease_match": True,
                        "amount_variance": txn["amount"] - lease["monthly_rent"]
                    })
                else:
                    unreconciled.append({
                        "transaction_id": txn["transaction_id"],
                        "status": "unreconciled",
                        "reason": "amount_mismatch",
                        "expected": lease["monthly_rent"],
                        "actual": txn["amount"]
                    })
            else:
                unreconciled.append({
                    "transaction_id": txn["transaction_id"],
                    "status": "unreconciled",
                    "reason": "no_contract_amount"
                })
        else:
            unreconciled.append({
                "transaction_id": txn["transaction_id"],
                "status": "unreconciled",
                "reason": "no_matching_lease"
            })
    
    return reconciled, unreconciled

def calculate_transaction_risk_scores(transactions_df: pd.DataFrame, leases_df: pd.DataFrame) -> List[Dict]:
    """Calculate risk scores for transactions"""
    risk_scores = []
    
    for _, txn in transactions_df.iterrows():
        base_risk = 0
        
        # Late payment risk
        due_date = pd.to_datetime(txn["due_date"])
        transaction_date = pd.to_datetime(txn["timestamp"])
        days_late = (transaction_date - due_date).days
        
        if days_late > 0:
            base_risk += min(days_late * 2, 50)  # Max 50 points for lateness
        
        # Amount variance risk
        if txn["contract_amount"]:
            variance_pct = abs(txn["amount"] - txn["contract_amount"]) / txn["contract_amount"] * 100
            base_risk += min(variance_pct * 5, 30)  # Max 30 points for variance
        
        # Transaction type risk
        type_risk = {"rent": 0, "service": 10, "deposit": 5}
        base_risk += type_risk.get(txn["transaction_type"], 0)
        
        risk_scores.append({
            "transaction_id": txn["transaction_id"],
            "risk_score": min(base_risk, 100),
            "risk_level": "High" if base_risk > 70 else "Medium" if base_risk > 40 else "Low"
        })
    
    return risk_scores

def generate_reconciliation_report(reconciled: List[Dict], unreconciled: List[Dict], risk_scores: List[Dict]) -> Dict:
    """Generate comprehensive reconciliation report"""
    total_transactions = len(reconciled) + len(unreconciled)
    reconciliation_rate = len(reconciled) / total_transactions if total_transactions > 0 else 0
    
    high_risk_count = len([r for r in risk_scores if r["risk_score"] > 70])
    
    return {
        "total_transactions": total_transactions,
        "reconciled_count": len(reconciled),
        "unreconciled_count": len(unreconciled),
        "reconciliation_rate": reconciliation_rate,
        "high_risk_transactions": high_risk_count,
        "recommendations": [
            "Review unreconciled transactions for data quality issues",
            "Implement automated reconciliation for routine transactions",
            "Focus on high-risk transactions for manual review"
        ]
    }

# LCM Predictive Modelling Module Algorithms
def prepare_predictive_features(properties: List[PropertyData], historical_data: List[Dict], market_data: List[MarketData]) -> pd.DataFrame:
    """Prepare features for predictive modelling"""
    features = []
    
    for prop in properties:
        # Basic property features
        feature_row = {
            "property_id": prop.property_id,
            "current_value": prop.current_value,
            "noi": prop.noi,
            "occupancy_rate": prop.occupancy_rate,
            "epc_rating": prop.epc_rating,
            "maintenance_score": prop.maintenance_score or 5
        }
        
        # Market features
        market_match = next((m for m in market_data if m.location == prop.location and m.property_type == prop.type), None)
        if market_match:
            feature_row.update({
                "market_rent": market_match.market_rent,
                "demand_index": market_match.demand_index
            })
        
        # Historical features (if available)
        prop_history = [h for h in historical_data if h.get("property_id") == prop.property_id]
        if prop_history:
            feature_row.update({
                "historical_occupancy": np.mean([h.get("occupancy_rate", 0) for h in prop_history]),
                "historical_noi": np.mean([h.get("noi", 0) for h in prop_history]),
                "trend_occupancy": np.polyfit(range(len(prop_history)), [h.get("occupancy_rate", 0) for h in prop_history], 1)[0]
            })
        
        features.append(feature_row)
    
    return pd.DataFrame(features)

def run_predictive_models(features_df: pd.DataFrame) -> List[Dict]:
    """Run predictive models for forecasting"""
    predictions = []
    
    for _, row in features_df.iterrows():
        # Simulate predictive model outputs
        # In a real implementation, these would be trained ML models
        
        # Occupancy prediction
        base_occupancy = row["occupancy_rate"]
        market_factor = row.get("demand_index", 0.5)
        predicted_occupancy = min(max(base_occupancy * (1 + (market_factor - 0.5) * 0.2), 0), 1)
        
        # Value prediction
        base_value = row["current_value"]
        growth_rate = 0.03 + (market_factor - 0.5) * 0.02  # 1-5% growth based on market
        predicted_value = base_value * (1 + growth_rate)
        
        # Risk prediction
        risk_factors = []
        if row["occupancy_rate"] < 0.8:
            risk_factors.append("low_occupancy")
        if row.get("maintenance_score", 5) < 3:
            risk_factors.append("maintenance_issues")
        if row["epc_rating"] in ["F", "G"]:
            risk_factors.append("energy_inefficiency")
        
        predictions.append({
            "property_id": row["property_id"],
            "predicted_occupancy": predicted_occupancy,
            "predicted_value": predicted_value,
            "growth_rate": growth_rate,
            "risk_factors": risk_factors,
            "confidence": 0.7 + (market_factor - 0.5) * 0.3  # 40-100% confidence
        })
    
    return predictions

def calculate_predictive_risks(features_df: pd.DataFrame, predictions: List[Dict]) -> List[Dict]:
    """Calculate risk assessments for predictions"""
    risk_assessments = []
    
    for pred in predictions:
        risk_score = 0
        risk_factors = []
        
        # Occupancy risk
        if pred["predicted_occupancy"] < 0.8:
            risk_score += 30
            risk_factors.append("occupancy_risk")
        
        # Value risk
        if pred["growth_rate"] < 0:
            risk_score += 25
            risk_factors.append("value_decline")
        
        # Market risk
        if pred["confidence"] < 0.6:
            risk_score += 20
            risk_factors.append("market_uncertainty")
        
        # Maintenance risk
        property_data = features_df[features_df["property_id"] == pred["property_id"]].iloc[0]
        if property_data.get("maintenance_score", 5) < 3:
            risk_score += 15
            risk_factors.append("maintenance_risk")
        
        risk_assessments.append({
            "property_id": pred["property_id"],
            "risk_score": min(risk_score, 100),
            "risk_level": "High" if risk_score > 70 else "Medium" if risk_score > 40 else "Low",
            "risk_factors": risk_factors
        })
    
    return risk_assessments

def calculate_confidence_scores(predictions: List[Dict], risk_assessments: List[Dict]) -> List[Dict]:
    """Calculate confidence scores for predictions"""
    confidence_scores = []
    
    for pred in predictions:
        risk_assessment = next((r for r in risk_assessments if r["property_id"] == pred["property_id"]), {})
        
        # Base confidence from prediction
        base_confidence = pred["confidence"]
        
        # Adjust for risk factors
        risk_adjustment = 1 - (risk_assessment.get("risk_score", 0) / 100) * 0.3
        
        final_confidence = base_confidence * risk_adjustment
        
        confidence_scores.append({
            "property_id": pred["property_id"],
            "confidence_score": max(final_confidence, 0.1),
            "confidence_level": "High" if final_confidence > 0.8 else "Medium" if final_confidence > 0.6 else "Low"
        })
    
    return confidence_scores

def generate_predictive_recommendations(predictions: List[Dict], risk_assessments: List[Dict]) -> List[str]:
    """Generate recommendations based on predictive analysis"""
    recommendations = []
    
    # High-risk properties
    high_risk = [r for r in risk_assessments if r["risk_score"] > 70]
    if high_risk:
        recommendations.append(f"Monitor {len(high_risk)} high-risk properties closely")
    
    # Low occupancy predictions
    low_occupancy = [p for p in predictions if p["predicted_occupancy"] < 0.8]
    if low_occupancy:
        recommendations.append("Implement marketing strategies for properties with predicted low occupancy")
    
    # Value decline predictions
    declining_values = [p for p in predictions if p["growth_rate"] < 0]
    if declining_values:
        recommendations.append("Consider repositioning or divesting properties with predicted value decline")
    
    return recommendations

# LCM Occupancy Module Algorithms
def calculate_utilization_scores(occupancy_df: pd.DataFrame) -> List[Dict]:
    """Calculate space utilization scores"""
    utilization_scores = []
    
    for _, row in occupancy_df.iterrows():
        # Basic utilization rate
        utilization_rate = row["occupied_sq_ft"] / row["total_sq_ft"]
        
        # Efficiency score based on utilization and common areas
        common_area_factor = 1 - (row.get("common_areas", 0) / row["total_sq_ft"])
        efficiency_score = utilization_rate * common_area_factor * 100
        
        # Parking utilization
        parking_utilization = 0
        if row.get("parking_spaces") and row.get("occupied_parking"):
            parking_utilization = row["occupied_parking"] / row["parking_spaces"]
        
        utilization_scores.append({
            "property_id": row["property_id"],
            "utilization_rate": utilization_rate,
            "efficiency_score": efficiency_score,
            "parking_utilization": parking_utilization,
            "vacant_sq_ft": row["vacant_sq_ft"],
            "utilization_classification": classify_utilization(utilization_rate)
        })
    
    return utilization_scores

def classify_utilization(utilization_rate: float) -> str:
    """Classify utilization level"""
    if utilization_rate > 1.2:
        return "Overcrowded"
    elif utilization_rate < 0.5:
        return "Underutilized"
    else:
        return "Efficient"

def check_lease_compliance(occupancy_df: pd.DataFrame, leases_df: pd.DataFrame) -> List[Dict]:
    """Check lease compliance based on occupancy data"""
    compliance_alerts = []
    
    for _, occupancy in occupancy_df.iterrows():
        # Find matching leases
        property_leases = leases_df[leases_df["property_id"] == occupancy["property_id"]]
        
        for _, lease in property_leases.iterrows():
            # Check for overcrowding (if lease has occupancy limits)
            if occupancy["occupied_sq_ft"] > occupancy["total_sq_ft"]:
                compliance_alerts.append({
                    "property_id": occupancy["property_id"],
                    "lease_id": lease["lease_id"],
                    "alert_type": "overcrowding",
                    "severity": "High",
                    "description": "Occupancy exceeds available space"
                })
            
            # Check for underutilization
            if occupancy["occupied_sq_ft"] < occupancy["total_sq_ft"] * 0.5:
                compliance_alerts.append({
                    "property_id": occupancy["property_id"],
                    "lease_id": lease["lease_id"],
                    "alert_type": "underutilization",
                    "severity": "Medium",
                    "description": "Significant underutilization of space"
                })
    
    return compliance_alerts

def generate_occupancy_optimization_recommendations(occupancy_df: pd.DataFrame, utilization_scores: List[Dict]) -> List[str]:
    """Generate optimization recommendations for occupancy"""
    recommendations = []
    
    underutilized = [u for u in utilization_scores if u["utilization_classification"] == "Underutilized"]
    if underutilized:
        recommendations.append(f"Optimize space utilization for {len(underutilized)} underutilized properties")
    
    overcrowded = [u for u in utilization_scores if u["utilization_classification"] == "Overcrowded"]
    if overcrowded:
        recommendations.append(f"Address overcrowding issues in {len(overcrowded)} properties")
    
    # General recommendations
    recommendations.extend([
        "Consider flexible workspace arrangements to improve utilization",
        "Implement space monitoring systems for real-time occupancy tracking",
        "Review lease terms to ensure optimal space allocation"
    ])
    
    return recommendations

def calculate_efficiency_metrics(occupancy_df: pd.DataFrame, utilization_scores: List[Dict]) -> Dict:
    """Calculate overall efficiency metrics"""
    total_sq_ft = occupancy_df["total_sq_ft"].sum()
    occupied_sq_ft = occupancy_df["occupied_sq_ft"].sum()
    overall_utilization = occupied_sq_ft / total_sq_ft if total_sq_ft > 0 else 0
    
    avg_efficiency = np.mean([u["efficiency_score"] for u in utilization_scores])
    
    return {
        "overall_utilization_rate": overall_utilization,
        "average_efficiency_score": avg_efficiency,
        "total_vacant_sq_ft": occupancy_df["vacant_sq_ft"].sum(),
        "utilization_trend": "improving" if avg_efficiency > 70 else "declining"
    }

# LCM Lease Risk Scoring Module Algorithms
def calculate_lease_risk_scores(properties_df: pd.DataFrame, leases_df: pd.DataFrame, market_df: pd.DataFrame) -> List[Dict]:
    """Calculate lease risk scores based on EPC and market factors"""
    risk_scores = []
    
    for _, property in properties_df.iterrows():
        # EPC-based risk
        epc_weights = {"A": 0, "B": 5, "C": 10, "D": 20, "E": 30, "F": 40, "G": 50}
        epc_score = epc_weights.get(property["epc_rating"], 25)
        
        # Occupancy risk
        occupancy_risk = (1 - property["occupancy_rate"]) * 20
        
        # Market risk
        market_match = market_df[
            (market_df["location"] == property["location"]) & 
            (market_df["property_type"] == property["type"])
        ]
        market_risk = 0
        if not market_match.empty:
            demand_index = market_match.iloc[0]["demand_index"]
            market_risk = (1 - demand_index) * 10
        
        # Lease expiry risk
        lease_expiry_risk = 0
        if pd.notna(property["lease_expiry_date"]):
            days_to_expiry = (pd.to_datetime(property["lease_expiry_date"]) - pd.Timestamp.now()).days
            if days_to_expiry < 365:
                lease_expiry_risk = 25
            elif days_to_expiry < 730:
                lease_expiry_risk = 15
        
        # Calculate total risk score
        total_risk = epc_score + occupancy_risk + market_risk + lease_expiry_risk
        risk_level = "High" if total_risk > 70 else "Medium" if total_risk > 40 else "Low"
        
        risk_scores.append({
            "property_id": property["property_id"],
            "risk_score": min(total_risk, 100),
            "risk_level": risk_level,
            "epc_risk": epc_score,
            "occupancy_risk": occupancy_risk,
            "market_risk": market_risk,
            "lease_expiry_risk": lease_expiry_risk
        })
    
    return risk_scores

def generate_lease_risk_actions(risk_scores: List[Dict], properties_df: pd.DataFrame, leases_df: pd.DataFrame) -> List[Dict]:
    """Generate recommended actions based on lease risk scores"""
    actions = []
    
    for risk in risk_scores:
        if risk["risk_score"] > 70:
            action = "Dispose or Retrofit"
            priority = "High"
        elif risk["risk_score"] > 40:
            action = "Monitor Closely"
            priority = "Medium"
        else:
            action = "Low Risk"
            priority = "Low"
        
        actions.append({
            "property_id": risk["property_id"],
            "recommended_action": action,
            "priority": priority,
            "timeline": "Immediate" if risk["risk_score"] > 70 else "3-6 months" if risk["risk_score"] > 40 else "Ongoing"
        })
    
    return actions

def identify_lease_risk_factors(properties_df: pd.DataFrame, leases_df: pd.DataFrame, market_df: pd.DataFrame) -> List[Dict]:
    """Identify specific risk factors for each property"""
    risk_factors = []
    
    for _, property in properties_df.iterrows():
        factors = []
        
        # EPC risk factors
        if property["epc_rating"] in ["F", "G"]:
            factors.append("Poor energy efficiency")
        
        # Occupancy risk factors
        if property["occupancy_rate"] < 0.8:
            factors.append("Low occupancy")
        
        # Market risk factors
        market_match = market_df[
            (market_df["location"] == property["location"]) & 
            (market_df["property_type"] == property["type"])
        ]
        if not market_match.empty and market_match.iloc[0]["demand_index"] < 0.5:
            factors.append("Weak market demand")
        
        # Lease expiry risk factors
        if pd.notna(property["lease_expiry_date"]):
            days_to_expiry = (pd.to_datetime(property["lease_expiry_date"]) - pd.Timestamp.now()).days
            if days_to_expiry < 365:
                factors.append("Lease expiring within 12 months")
        
        risk_factors.append({
            "property_id": property["property_id"],
            "risk_factors": factors,
            "factor_count": len(factors)
        })
    
    return risk_factors

def prioritize_lease_interventions(risk_scores: List[Dict], recommended_actions: List[Dict]) -> List[str]:
    """Prioritize lease interventions based on risk scores"""
    # Sort by risk score (highest first)
    sorted_risks = sorted(risk_scores, key=lambda x: x["risk_score"], reverse=True)
    
    priorities = []
    for i, risk in enumerate(sorted_risks[:5]):  # Top 5 priorities
        action = next((a for a in recommended_actions if a["property_id"] == risk["property_id"]), {})
        priorities.append(f"{i+1}. Property {risk['property_id']}: {action.get('recommended_action', 'Review')} (Risk: {risk['risk_score']:.1f})")
    
    return priorities

# Legacy functions for backward compatibility
def calculate_portfolio_health(property_scores: List[Dict], weights: Dict[str, float]) -> float:
    """Legacy portfolio health calculation"""
    return calculate_enhanced_portfolio_health(property_scores, weights)

def assess_risk_level(score: float) -> str:
    """Legacy risk assessment"""
    if score >= 80:
        return "Low"
    elif score >= 60:
        return "Medium"
    else:
        return "High"

def calculate_performance_grade(score: float) -> str:
    """Calculate performance grade"""
    if score >= 90:
        return "A+"
    elif score >= 85:
        return "A"
    elif score >= 80:
        return "B+"
    elif score >= 75:
        return "B"
    elif score >= 70:
        return "C+"
    else:
        return "C"

def generate_recommendations(property_scores: List[Dict], strategy: str) -> List[str]:
    """Legacy recommendations generation"""
    return generate_enhanced_recommendations(property_scores, strategy, pd.DataFrame())

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
