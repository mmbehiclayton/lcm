# Pseudocode and Logic Flow
## LCM Analytics MVP - Real Estate Intelligence Platform

### Document Information
- **Version**: 1.0
- **Date**: October 2024
- **Project**: LCM Analytics MVP

---

## 1. Portfolio Health Scoring Algorithm

### 1.1 Core Scoring Logic

```python
# Python Implementation
def calculate_portfolio_health(properties, strategy):
    """
    Calculate overall portfolio health score based on weighted metrics
    
    Args:
        properties: List of property objects
        strategy: Investment strategy ('growth', 'hold', 'divest')
    
    Returns:
        Portfolio health score (0-100)
    """
    
    # Step 1: Get strategy-specific weights
    weights = get_strategy_weights(strategy)
    
    # Step 2: Calculate individual property scores
    property_scores = []
    for property in properties:
        scores = {
            'lease_score': calculate_lease_score(property),
            'occupancy_score': calculate_occupancy_score(property),
            'noi_score': calculate_noi_score(property),
            'energy_score': calculate_energy_score(property),
            'capex_score': calculate_capex_score(property)
        }
        property_scores.append(scores)
    
    # Step 3: Apply weighted scoring
    total_weighted_score = 0
    for scores in property_scores:
        weighted_score = (
            scores['lease_score'] * weights['lease'] +
            scores['occupancy_score'] * weights['occupancy'] +
            scores['noi_score'] * weights['noi'] +
            scores['energy_score'] * weights['energy'] +
            scores['capex_score'] * weights['capex']
        )
        total_weighted_score += weighted_score
    
    # Step 4: Calculate portfolio average
    portfolio_health = total_weighted_score / len(property_scores)
    
    return portfolio_health

def get_strategy_weights(strategy):
    """Get weighting configuration based on investment strategy"""
    
    weight_configs = {
        'growth': {
            'lease': 0.30,      # Focus on lease stability
            'occupancy': 0.20,   # Moderate occupancy importance
            'noi': 0.30,        # High NOI importance for growth
            'energy': 0.10,     # Lower energy efficiency focus
            'capex': 0.10       # Lower maintenance focus
        },
        'hold': {
            'lease': 0.25,      # Balanced lease management
            'occupancy': 0.25,   # Equal occupancy importance
            'noi': 0.20,        # Moderate NOI focus
            'energy': 0.15,     # Higher energy efficiency
            'capex': 0.15       # Higher maintenance focus
        },
        'divest': {
            'lease': 0.40,      # High lease stability for sale
            'occupancy': 0.10,   # Lower occupancy focus
            'noi': 0.20,        # Moderate NOI importance
            'energy': 0.20,     # High energy efficiency for value
            'capex': 0.10       # Lower maintenance focus
        }
    }
    
    return weight_configs.get(strategy, weight_configs['hold'])
```

### 1.2 Individual Metric Calculations

```python
def calculate_lease_score(property):
    """Calculate lease-related risk score (0-100)"""
    
    if not property.lease_expiry_date:
        return 50  # Neutral score for missing data
    
    # Calculate days to lease expiry
    expiry_date = datetime.strptime(property.lease_expiry_date, '%Y-%m-%d')
    days_to_expiry = (expiry_date - datetime.now()).days
    
    # Risk-based scoring
    if days_to_expiry < 90:
        return 20   # High risk - immediate action needed
    elif days_to_expiry < 180:
        return 40   # Medium-high risk
    elif days_to_expiry < 365:
        return 60   # Medium risk - planning needed
    elif days_to_expiry < 730:
        return 80   # Low risk - good stability
    else:
        return 100  # Very low risk - excellent stability

def calculate_occupancy_score(property):
    """Calculate occupancy efficiency score (0-100)"""
    
    occupancy_rate = property.occupancy_rate
    
    # Tiered scoring based on occupancy percentage
    if occupancy_rate >= 0.95:
        return 100   # Excellent occupancy
    elif occupancy_rate >= 0.90:
        return 90    # Very good occupancy
    elif occupancy_rate >= 0.85:
        return 80    # Good occupancy
    elif occupancy_rate >= 0.80:
        return 70    # Acceptable occupancy
    elif occupancy_rate >= 0.75:
        return 60    # Below average occupancy
    elif occupancy_rate >= 0.70:
        return 50    # Poor occupancy
    else:
        return 30    # Critical occupancy issues

def calculate_noi_score(property):
    """Calculate NOI yield score (0-100)"""
    
    # Calculate NOI yield percentage
    noi_yield = property.noi / property.current_value
    
    # Market-based scoring
    if noi_yield >= 0.08:
        return 100   # Excellent yield
    elif noi_yield >= 0.07:
        return 90    # Very good yield
    elif noi_yield >= 0.06:
        return 80    # Good yield
    elif noi_yield >= 0.05:
        return 70    # Average yield
    elif noi_yield >= 0.04:
        return 60    # Below average yield
    elif noi_yield >= 0.03:
        return 50    # Poor yield
    else:
        return 30    # Critical yield issues

def calculate_energy_score(property):
    """Calculate energy efficiency score (0-100)"""
    
    # EPC rating to score mapping
    epc_scores = {
        'A': 100,    # Excellent energy efficiency
        'B': 80,     # Very good efficiency
        'C': 60,     # Good efficiency
        'D': 40,     # Average efficiency
        'E': 20,     # Poor efficiency
        'F': 10,     # Very poor efficiency
        'G': 0       # Worst efficiency
    }
    
    return epc_scores.get(property.epc_rating, 50)  # Default to neutral

def calculate_capex_score(property):
    """Calculate capital expenditure score (0-100)"""
    
    maintenance_score = property.maintenance_score or 5  # Default to neutral
    
    # Convert 1-10 scale to 0-100 scale
    capex_score = maintenance_score * 10
    
    return min(capex_score, 100)  # Cap at 100
```

---

## 2. JavaScript Implementation

### 2.1 Portfolio Health Calculation

```javascript
// JavaScript Implementation
class PortfolioAnalyzer {
  constructor() {
    this.strategyWeights = {
      growth: {
        lease: 0.30,
        occupancy: 0.20,
        noi: 0.30,
        energy: 0.10,
        capex: 0.10
      },
      hold: {
        lease: 0.25,
        occupancy: 0.25,
        noi: 0.20,
        energy: 0.15,
        capex: 0.15
      },
      divest: {
        lease: 0.40,
        occupancy: 0.10,
        noi: 0.20,
        energy: 0.20,
        capex: 0.10
      }
    };
  }

  calculatePortfolioHealth(properties, strategy) {
    // Step 1: Get strategy weights
    const weights = this.strategyWeights[strategy] || this.strategyWeights.hold;
    
    // Step 2: Calculate individual scores
    const propertyScores = properties.map(property => ({
      leaseScore: this.calculateLeaseScore(property),
      occupancyScore: this.calculateOccupancyScore(property),
      noiScore: this.calculateNOIScore(property),
      energyScore: this.calculateEnergyScore(property),
      capexScore: this.calculateCapexScore(property)
    }));
    
    // Step 3: Apply weighted scoring
    const totalWeightedScore = propertyScores.reduce((total, scores) => {
      const weightedScore = 
        scores.leaseScore * weights.lease +
        scores.occupancyScore * weights.occupancy +
        scores.noiScore * weights.noi +
        scores.energyScore * weights.energy +
        scores.capexScore * weights.capex;
      
      return total + weightedScore;
    }, 0);
    
    // Step 4: Calculate portfolio average
    const portfolioHealth = totalWeightedScore / propertyScores.length;
    
    return {
      portfolioHealth: Math.round(portfolioHealth * 100) / 100,
      riskLevel: this.assessRiskLevel(portfolioHealth),
      performanceGrade: this.calculatePerformanceGrade(portfolioHealth),
      propertyScores
    };
  }

  calculateLeaseScore(property) {
    if (!property.leaseExpiryDate) {
      return 50; // Neutral score for missing data
    }
    
    const expiryDate = new Date(property.leaseExpiryDate);
    const today = new Date();
    const daysToExpiry = Math.ceil((expiryDate - today) / (1000 * 60 * 60 * 24));
    
    // Risk-based scoring
    if (daysToExpiry < 90) return 20;
    if (daysToExpiry < 180) return 40;
    if (daysToExpiry < 365) return 60;
    if (daysToExpiry < 730) return 80;
    return 100;
  }

  calculateOccupancyScore(property) {
    const occupancyRate = property.occupancyRate;
    
    if (occupancyRate >= 0.95) return 100;
    if (occupancyRate >= 0.90) return 90;
    if (occupancyRate >= 0.85) return 80;
    if (occupancyRate >= 0.80) return 70;
    if (occupancyRate >= 0.75) return 60;
    if (occupancyRate >= 0.70) return 50;
    return 30;
  }

  calculateNOIScore(property) {
    const noiYield = property.noi / property.currentValue;
    
    if (noiYield >= 0.08) return 100;
    if (noiYield >= 0.07) return 90;
    if (noiYield >= 0.06) return 80;
    if (noiYield >= 0.05) return 70;
    if (noiYield >= 0.04) return 60;
    if (noiYield >= 0.03) return 50;
    return 30;
  }

  calculateEnergyScore(property) {
    const epcScores = {
      'A': 100, 'B': 80, 'C': 60, 'D': 40,
      'E': 20, 'F': 10, 'G': 0
    };
    
    return epcScores[property.epcRating] || 50;
  }

  calculateCapexScore(property) {
    const maintenanceScore = property.maintenanceScore || 5;
    return Math.min(maintenanceScore * 10, 100);
  }

  assessRiskLevel(score) {
    if (score >= 80) return 'Low';
    if (score >= 60) return 'Medium';
    return 'High';
  }

  calculatePerformanceGrade(score) {
    if (score >= 90) return 'A+';
    if (score >= 85) return 'A';
    if (score >= 80) return 'B+';
    if (score >= 75) return 'B';
    if (score >= 70) return 'C+';
    return 'C';
  }
}
```

---

## 3. Lease Analysis Logic

### 3.1 Lease Expiry Analysis

```python
def analyze_lease_expiry(leases):
    """
    Analyze lease expiry patterns and generate alerts
    
    Args:
        leases: List of lease objects with expiry dates
    
    Returns:
        Dictionary with expiry analysis results
    """
    
    analysis_results = {
        'expiring_soon': [],      # Leases expiring within 6 months
        'renewal_opportunities': [],  # Leases with renewal options
        'risk_properties': [],    # Properties with high lease risk
        'recommendations': []     # Actionable recommendations
    }
    
    current_date = datetime.now()
    
    for lease in leases:
        expiry_date = datetime.strptime(lease.end_date, '%Y-%m-%d')
        days_to_expiry = (expiry_date - current_date).days
        
        # Identify leases expiring soon
        if days_to_expiry <= 180:  # 6 months
            analysis_results['expiring_soon'].append({
                'lease_id': lease.lease_id,
                'tenant_name': lease.tenant_name,
                'days_to_expiry': days_to_expiry,
                'monthly_rent': lease.monthly_rent,
                'priority': 'high' if days_to_expiry <= 90 else 'medium'
            })
        
        # Check for renewal opportunities
        if lease.renewal_option:
            analysis_results['renewal_opportunities'].append({
                'lease_id': lease.lease_id,
                'tenant_name': lease.tenant_name,
                'current_rent': lease.monthly_rent,
                'market_rent_estimate': estimate_market_rent(lease),
                'renewal_potential': calculate_renewal_probability(lease)
            })
    
    # Generate recommendations
    analysis_results['recommendations'] = generate_lease_recommendations(analysis_results)
    
    return analysis_results

def calculate_renewal_probability(lease):
    """Calculate probability of lease renewal based on historical data"""
    
    # Factors affecting renewal probability
    factors = {
        'lease_duration': min(lease.lease_duration_years / 5, 1.0),  # Longer leases = higher renewal
        'rent_growth': calculate_rent_growth_rate(lease),
        'tenant_stability': get_tenant_stability_score(lease.tenant_name),
        'market_conditions': get_market_condition_score(lease.location)
    }
    
    # Weighted probability calculation
    renewal_probability = (
        factors['lease_duration'] * 0.3 +
        factors['rent_growth'] * 0.25 +
        factors['tenant_stability'] * 0.25 +
        factors['market_conditions'] * 0.2
    )
    
    return min(max(renewal_probability, 0.0), 1.0)
```

### 3.2 Rent Optimization Analysis

```python
def analyze_rent_optimization(leases, market_data):
    """
    Analyze rent optimization opportunities
    
    Args:
        leases: List of current leases
        market_data: Market rent data by location and property type
    
    Returns:
        Rent optimization recommendations
    """
    
    optimization_opportunities = []
    
    for lease in leases:
        current_rent = lease.monthly_rent
        market_rent = get_market_rent(lease.location, lease.property_type, market_data)
        
        # Calculate rent gap
        rent_gap_percentage = ((market_rent - current_rent) / current_rent) * 100
        
        if rent_gap_percentage > 10:  # Significant upside potential
            optimization_opportunities.append({
                'lease_id': lease.lease_id,
                'property_id': lease.property_id,
                'current_rent': current_rent,
                'market_rent': market_rent,
                'upside_potential': rent_gap_percentage,
                'recommended_action': 'rent_increase',
                'timeline': calculate_optimal_timing(lease)
            })
        elif rent_gap_percentage < -10:  # Over-rented
            optimization_opportunities.append({
                'lease_id': lease.lease_id,
                'property_id': lease.property_id,
                'current_rent': current_rent,
                'market_rent': market_rent,
                'downside_risk': abs(rent_gap_percentage),
                'recommended_action': 'rent_reduction',
                'timeline': 'immediate'
            })
    
    return optimization_opportunities
```

---

## 4. Occupancy Analysis Logic

### 4.1 Space Utilization Analysis

```python
def analyze_space_utilization(properties):
    """
    Analyze space utilization efficiency across portfolio
    
    Args:
        properties: List of properties with occupancy data
    
    Returns:
        Space utilization analysis results
    """
    
    utilization_analysis = {
        'portfolio_efficiency': 0,
        'underutilized_properties': [],
        'optimization_opportunities': [],
        'recommendations': []
    }
    
    total_efficiency = 0
    property_count = 0
    
    for property in properties:
        # Calculate utilization metrics
        utilization_rate = property.occupied_sq_ft / property.total_sq_ft
        efficiency_score = calculate_efficiency_score(property)
        
        total_efficiency += efficiency_score
        property_count += 1
        
        # Identify underutilized properties
        if utilization_rate < 0.80:  # Below 80% utilization
            utilization_analysis['underutilized_properties'].append({
                'property_id': property.property_id,
                'utilization_rate': utilization_rate,
                'vacant_sq_ft': property.vacant_sq_ft,
                'potential_revenue': calculate_vacancy_cost(property),
                'optimization_potential': calculate_optimization_potential(property)
            })
        
        # Generate optimization opportunities
        if efficiency_score < 70:  # Low efficiency score
            opportunities = generate_space_optimization_opportunities(property)
            utilization_analysis['optimization_opportunities'].extend(opportunities)
    
    # Calculate portfolio efficiency
    utilization_analysis['portfolio_efficiency'] = total_efficiency / property_count
    
    # Generate recommendations
    utilization_analysis['recommendations'] = generate_utilization_recommendations(
        utilization_analysis
    )
    
    return utilization_analysis

def calculate_efficiency_score(property):
    """Calculate space efficiency score (0-100)"""
    
    # Base utilization score
    utilization_rate = property.occupied_sq_ft / property.total_sq_ft
    utilization_score = utilization_rate * 100
    
    # Adjust for common area efficiency
    common_area_ratio = property.common_areas / property.total_sq_ft
    if common_area_ratio > 0.15:  # More than 15% common area
        utilization_score *= 0.9  # Penalty for excessive common area
    
    # Adjust for parking efficiency
    if property.parking_spaces > 0:
        parking_utilization = property.occupied_parking / property.parking_spaces
        parking_score = parking_utilization * 20  # 20% weight for parking
        utilization_score = (utilization_score * 0.8) + parking_score
    
    return min(utilization_score, 100)

def calculate_vacancy_cost(property):
    """Calculate monthly cost of vacancy"""
    
    # Estimate market rent per sq ft
    market_rent_per_sqft = estimate_market_rent_per_sqft(property.location, property.type)
    
    # Calculate monthly vacancy cost
    monthly_vacancy_cost = property.vacant_sq_ft * market_rent_per_sqft
    
    return monthly_vacancy_cost
```

---

## 5. Risk Assessment Logic

### 5.1 Portfolio Risk Scoring

```python
def assess_portfolio_risk(properties, market_conditions):
    """
    Assess overall portfolio risk level
    
    Args:
        properties: List of properties with risk factors
        market_conditions: Current market conditions data
    
    Returns:
        Risk assessment results
    """
    
    risk_factors = {
        'concentration_risk': calculate_concentration_risk(properties),
        'lease_risk': calculate_lease_risk(properties),
        'market_risk': calculate_market_risk(properties, market_conditions),
        'operational_risk': calculate_operational_risk(properties),
        'financial_risk': calculate_financial_risk(properties)
    }
    
    # Calculate weighted risk score
    risk_weights = {
        'concentration_risk': 0.20,
        'lease_risk': 0.25,
        'market_risk': 0.20,
        'operational_risk': 0.15,
        'financial_risk': 0.20
    }
    
    total_risk_score = sum(
        risk_factors[factor] * risk_weights[factor]
        for factor in risk_factors
    )
    
    # Determine risk level
    if total_risk_score >= 80:
        risk_level = 'High'
    elif total_risk_score >= 60:
        risk_level = 'Medium'
    else:
        risk_level = 'Low'
    
    return {
        'overall_risk_score': total_risk_score,
        'risk_level': risk_level,
        'risk_factors': risk_factors,
        'recommendations': generate_risk_recommendations(risk_factors)
    }

def calculate_concentration_risk(properties):
    """Calculate geographic and sector concentration risk"""
    
    # Geographic concentration
    locations = [prop.location for prop in properties]
    location_diversity = len(set(locations)) / len(properties)
    
    # Sector concentration
    sectors = [prop.type for prop in properties]
    sector_diversity = len(set(sectors)) / len(properties)
    
    # Calculate concentration risk (higher = more risk)
    concentration_risk = (1 - location_diversity) * 50 + (1 - sector_diversity) * 50
    
    return min(concentration_risk, 100)

def calculate_lease_risk(properties):
    """Calculate lease expiry and tenant concentration risk"""
    
    total_lease_risk = 0
    
    for property in properties:
        # Lease expiry risk
        if property.lease_expiry_date:
            days_to_expiry = (datetime.strptime(property.lease_expiry_date, '%Y-%m-%d') - datetime.now()).days
            if days_to_expiry < 365:  # Expiring within year
                total_lease_risk += 30
            elif days_to_expiry < 730:  # Expiring within 2 years
                total_lease_risk += 15
        
        # Occupancy risk
        if property.occupancy_rate < 0.80:
            total_lease_risk += 25
        elif property.occupancy_rate < 0.90:
            total_lease_risk += 10
    
    # Average lease risk across portfolio
    avg_lease_risk = total_lease_risk / len(properties)
    
    return min(avg_lease_risk, 100)
```

---

## 6. Recommendation Engine Logic

### 6.1 Actionable Recommendations

```python
def generate_portfolio_recommendations(analysis_results, strategy):
    """
    Generate actionable recommendations based on analysis results
    
    Args:
        analysis_results: Complete analysis results
        strategy: Investment strategy
    
    Returns:
        List of prioritized recommendations
    """
    
    recommendations = []
    
    # Portfolio health recommendations
    if analysis_results['portfolio_health'] < 70:
        recommendations.append({
            'priority': 'high',
            'category': 'portfolio_health',
            'title': 'Improve Portfolio Health',
            'description': 'Portfolio health score is below optimal. Focus on lease renewals and occupancy improvements.',
            'action_items': [
                'Review and renew expiring leases',
                'Implement marketing strategy for vacant spaces',
                'Consider property improvements to increase NOI'
            ],
            'timeline': '3-6 months',
            'expected_impact': 'Increase portfolio health by 10-15 points'
        })
    
    # Strategy-specific recommendations
    if strategy == 'growth':
        recommendations.extend(generate_growth_recommendations(analysis_results))
    elif strategy == 'hold':
        recommendations.extend(generate_hold_recommendations(analysis_results))
    elif strategy == 'divest':
        recommendations.extend(generate_divest_recommendations(analysis_results))
    
    # Risk mitigation recommendations
    if analysis_results['risk_level'] == 'High':
        recommendations.append({
            'priority': 'high',
            'category': 'risk_mitigation',
            'title': 'Address High Risk Factors',
            'description': 'Portfolio shows high risk indicators requiring immediate attention.',
            'action_items': [
                'Diversify geographic concentration',
                'Address lease expiry risks',
                'Improve occupancy rates'
            ],
            'timeline': '1-3 months',
            'expected_impact': 'Reduce risk level to Medium'
        })
    
    # Sort by priority and expected impact
    recommendations.sort(key=lambda x: (
        {'high': 3, 'medium': 2, 'low': 1}[x['priority']],
        x['expected_impact']
    ), reverse=True)
    
    return recommendations

def generate_growth_recommendations(analysis_results):
    """Generate growth strategy specific recommendations"""
    
    recommendations = []
    
    # Acquisition opportunities
    if analysis_results['portfolio_health'] > 80:
        recommendations.append({
            'priority': 'medium',
            'category': 'acquisition',
            'title': 'Consider Strategic Acquisitions',
            'description': 'Strong portfolio performance supports growth through acquisition.',
            'action_items': [
                'Identify high-performing markets for expansion',
                'Evaluate acquisition targets with similar characteristics',
                'Develop acquisition criteria and target metrics'
            ],
            'timeline': '6-12 months',
            'expected_impact': 'Portfolio growth of 20-30%'
        })
    
    return recommendations
```

---

## 7. Data Validation Logic

### 7.1 Input Data Validation

```python
def validate_property_data(property_data):
    """
    Validate property data for completeness and accuracy
    
    Args:
        property_data: Dictionary of property information
    
    Returns:
        Validation results with errors and warnings
    """
    
    validation_results = {
        'valid': True,
        'errors': [],
        'warnings': [],
        'suggestions': []
    }
    
    # Required field validation
    required_fields = ['property_id', 'name', 'type', 'location', 'current_value', 'noi']
    for field in required_fields:
        if not property_data.get(field):
            validation_results['errors'].append(f'Missing required field: {field}')
            validation_results['valid'] = False
    
    # Data type validation
    if property_data.get('current_value') and not isinstance(property_data['current_value'], (int, float)):
        validation_results['errors'].append('current_value must be a number')
        validation_results['valid'] = False
    
    # Range validation
    if property_data.get('occupancy_rate'):
        occupancy_rate = property_data['occupancy_rate']
        if not (0 <= occupancy_rate <= 1):
            validation_results['errors'].append('occupancy_rate must be between 0 and 1')
            validation_results['valid'] = False
    
    # Business logic validation
    if property_data.get('noi') and property_data.get('current_value'):
        noi_yield = property_data['noi'] / property_data['current_value']
        if noi_yield > 0.15:  # 15% yield seems unrealistic
            validation_results['warnings'].append('NOI yield appears unusually high - please verify data')
        elif noi_yield < 0.01:  # 1% yield seems low
            validation_results['warnings'].append('NOI yield appears unusually low - please verify data')
    
    # Date validation
    if property_data.get('lease_expiry_date'):
        try:
            expiry_date = datetime.strptime(property_data['lease_expiry_date'], '%Y-%m-%d')
            if expiry_date < datetime.now():
                validation_results['warnings'].append('Lease expiry date is in the past')
        except ValueError:
            validation_results['errors'].append('Invalid lease expiry date format')
            validation_results['valid'] = False
    
    return validation_results
```

---

*This pseudocode document provides the foundational logic for implementing the LCM Analytics MVP scoring algorithms, ensuring consistent and accurate analysis across all modules.*
