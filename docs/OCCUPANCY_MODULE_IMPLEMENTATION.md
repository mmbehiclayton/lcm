# LCM Occupancy Module - Implementation Guide

## Overview
Complete implementation of the LCM Occupancy Algorithm that estimates current and future space occupancy levels, patterns, and anomalies using IoT data, lease conditions, and behavioral insights.

---

## ✅ Implementation Status

### **Step 1: Algorithm Implementation** ✅ COMPLETE
**Location**: `src/lib/analytics-engine.ts` (lines 1043-1418)

### **Step 2: API Endpoints** ✅ COMPLETE  
**Location**: `src/app/api/occupancy/analyze/route.ts`

### **Step 3: Sample Data** ✅ COMPLETE
**Location**: `occupancy_sample.csv` (20 properties with full sensor data)

### **Step 4: Frontend Integration** ⏳ IN PROGRESS
**Location**: `src/app/dashboard/modules/occupancy/page.tsx`

### **Step 5: UI Improvements** ⏳ PENDING
Match styling of other modules (gradient headers, compact cards, etc.)

---

## 📊 Algorithm Specification

### **Key Inputs**
1. **IoT/Smart Meter Data**
   - Desk usage percentage
   - Badge-in counts
   - Meeting room utilization
   - Lighting usage
   - Temperature sensors

2. **Lease Clauses**
   - Permitted usage type
   - Subletting terms
   - Co-working restrictions
   - Maximum occupancy limits

3. **Historical Occupancy Logs**
   - 3-month average
   - 6-month average
   - 12-month average
   - Peak usage

4. **Tenant Information**
   - Business type
   - Headcount estimates
   - Actual headcount

### **Outputs**
1. **Occupancy Score** (0-100%)
2. **Utilization Classification**
   - Overcrowded (ratio > 1.2)
   - Underutilised (ratio < 0.5)
   - Efficient (0.5 ≤ ratio ≤ 1.2)
3. **Lease Breach Alerts**
4. **Predicted Future Patterns**
5. **Trend Direction** (Increasing/Decreasing/Stable)
6. **Smart Recommendations**
7. **Risk Factors**

---

## 🔧 Algorithm Implementation

### **Core Function**: `calculateOccupancyScore()`

```typescript
function calculateOccupancyScore(occupancyData: OccupancyInputData): OccupancyAnalysisResult
```

#### **Step-by-Step Process**:

1. **Calculate Baseline Occupancy**
   ```typescript
   baselineOccupancy = avg(historical_logs.last_3_months)
   ```

2. **Calculate Current Usage from Sensors**
   ```typescript
   currentUsage = mean(sensor_data.desk_usage, badge_ins, meeting_room_usage)
   ```

3. **Calculate Utilization Ratio**
   ```typescript
   utilizationRatio = currentUsage / baselineOccupancy
   ```

4. **Determine Classification**
   ```typescript
   if (utilizationRatio > 1.2): classification = "Overcrowded"
   elif (utilizationRatio < 0.5): classification = "Underutilised"
   else: classification = "Efficient"
   ```

5. **Check Lease Compliance**
   - Max occupancy violations
   - Subletting detection
   - Co-working restrictions
   - Permitted usage verification

6. **Detect Trends**
   - Compare 3/6/12-month averages
   - Identify patterns (Growth/Decline/Stable/etc.)

7. **Generate Recommendations**
   - Based on classification
   - Lease breach alerts
   - Trend-based suggestions
   - Usage-specific actions

8. **Calculate Final Score**
   ```typescript
   occupancyScore = round(currentUsage * 100, 2)
   if (leaseBreach): occupancyScore *= 0.8  // 20% penalty
   ```

---

## 🗃️ Sample Data Structure

### **CSV Fields** (occupancy_sample.csv)

#### **Basic Fields**:
- `property_id` - Unique identifier
- `property_name` - Property name
- `property_type` - Office/Retail/Industrial/Residential
- `location` - City and postcode
- `total_units` - Total capacity
- `occupied_units` - Currently occupied
- `occupancy_rate` - Percentage (0-100)
- `average_rent` - Per unit
- `total_revenue` - Monthly revenue
- `vacant_units` - Empty units
- `lease_expirations` - Expiring in 12 months
- `risk_level` - Low/Medium/High

#### **Sensor Data Fields** (NEW):
- `desk_usage` - Desk utilization % (0-100)
- `badge_ins` - Daily badge-in count
- `meeting_room_usage` - Meeting room % (0-100)
- `lighting_usage` - Lighting system % (0-100)
- `temperature_avg` - Average temp (°C)

#### **Historical Data** (NEW):
- `avg_occupancy_3_months` - 3-month average %
- `avg_occupancy_6_months` - 6-month average %
- `avg_occupancy_12_months` - 12-month average %
- `peak_usage` - Historical peak %

#### **Lease Terms** (NEW):
- `permitted_usage` - Usage type description
- `subletting_allowed` - true/false
- `coworking_restrictions` - true/false
- `max_occupancy` - Maximum allowed

#### **Tenant Info** (NEW):
- `business_type` - Industry/sector
- `headcount_estimate` - Expected headcount
- `actual_headcount` - Actual headcount

---

## 🔌 API Endpoints

### **POST /api/occupancy/analyze**

**Purpose**: Analyze occupancy data using the LCM algorithm

**Request**: No body required (uses database data)

**Response**:
```json
{
  "success": true,
  "data": {
    "analyses": [
      {
        "property_id": "PROP-001",
        "property_name": "Downtown Tech Hub",
        "occupancy_score": 92.0,
        "utilization_classification": "Efficient",
        "lease_breach": false,
        "predicted_future_pattern": "Growth - Steadily increasing occupancy",
        "trend_direction": "Increasing",
        "recommendations": [
          "Occupancy levels are optimal - maintain current operations",
          "Proactively plan for capacity expansion"
        ],
        "risk_factors": [
          "No significant risk factors identified"
        ],
        "baseline_occupancy": 94.0,
        "current_usage": 92.0,
        "utilization_ratio": 0.98
      }
    ],
    "summary": {
      "total_properties": 20,
      "avg_occupancy_score": 89.5,
      "overcrowded_count": 2,
      "underutilised_count": 3,
      "efficient_count": 15,
      "lease_breaches": 1,
      "high_risk_properties": ["PROP-010"]
    }
  }
}
```

### **GET /api/occupancy/analyze**

**Purpose**: Retrieve most recent analysis

**Response**: Same as POST (cached results)

---

## 📈 Analysis Summary Metrics

### **Property-Level**:
- Occupancy Score (0-100%)
- Classification (Overcrowded/Underutilised/Efficient)
- Lease Breach Status
- Future Pattern Prediction
- Trend Direction
- Baseline vs Current Usage
- Utilization Ratio
- Risk Factors (array)
- Recommendations (array)

### **Portfolio-Level**:
- Total Properties Analyzed
- Average Occupancy Score
- Count by Classification
- Total Lease Breaches
- High-Risk Properties List

---

## 💡 Utilization Classifications

### **Efficient** (0.5 ≤ ratio ≤ 1.2)
- **Meaning**: Optimal space utilization
- **Recommendation**: Maintain current operations
- **Risk**: None

### **Underutilised** (ratio < 0.5)
- **Meaning**: Significant vacant space
- **Recommendations**:
  - Space consolidation opportunities
  - Consider subletting
  - Review hybrid work policies
  - Flexible lease renegotiation
- **Risks**:
  - Revenue loss from vacant space
  - Opportunity cost

### **Overcrowded** (ratio > 1.2)
- **Meaning**: Exceeding optimal capacity
- **Recommendations**:
  - Space expansion planning
  - Implement desk-sharing/booking system
  - Review tenant headcount vs lease terms
- **Risks**:
  - Health & safety compliance
  - Tenant satisfaction issues
  - Potential lease violations

---

## 🚨 Lease Compliance Checks

### **1. Max Occupancy Violations**
```typescript
if (currentUsage > lease_terms.max_occupancy): BREACH
```

### **2. Unauthorized Subletting**
```typescript
if (!subletting_allowed && actual_headcount > estimate * 1.3): BREACH
```

### **3. Co-working Restrictions**
```typescript
if (coworking_restrictions && currentUsage > 90%): BREACH
```

### **4. Permitted Usage**
```typescript
if (usage_type != permitted_usage): BREACH
```

---

## 📊 Trend Patterns

| Pattern | Description | Trigger |
|---------|-------------|---------|
| **Stable** | Consistent levels | \|short_trend\| < 3 && \|long_trend\| < 3 |
| **Growth** | Steadily increasing | short_trend > 0 && long_trend > 0 |
| **Decline** | Steadily decreasing | short_trend < 0 && long_trend < 0 |
| **Recovery** | Upturn after decline | short_trend > 0 && long_trend < 0 |
| **Cooling** | Downturn after growth | short_trend < 0 && long_trend > 0 |
| **Volatile** | Fluctuating | Other combinations |

---

## 🎯 Innovation & Replication Barrier

### **Why This is Difficult to Replicate**:

1. **Hybrid Approach**: Combines space analytics + lease compliance
2. **Multi-Source Data**: IoT sensors + lease terms + behavioral analysis
3. **Contextual Intelligence**: Tenant-specific recommendations
4. **Predictive Capability**: Future pattern detection
5. **Compliance Integration**: Automated lease breach detection
6. **Industry-Specific**: Tailored for commercial real estate

### **Not Found in Typical BMS**:
- Basic BMS tracks occupancy only
- No lease compliance awareness
- No tenant behavior analysis
- No predictive modeling
- No contextual recommendations

---

## 🔄 Next Steps

### **Completed** ✅:
1. Core algorithm implementation
2. API endpoints (POST/GET)
3. Sample data with sensor fields
4. TypeScript interfaces
5. Error handling
6. Documentation

### **In Progress** ⏳:
7. Frontend integration
8. UI improvements

### **Pending** 📋:
9. Chart updates
10. Testing
11. Deployment

---

## 📝 Usage Example

### **Frontend Integration**:

```typescript
// Fetch and analyze
const response = await fetch('/api/occupancy/analyze', {
  method: 'POST'
});

const result = await response.json();

// Access results
const analyses = result.data.analyses;
const summary = result.data.summary;

// Display property analysis
analyses.forEach(analysis => {
  console.log(`${analysis.property_name}: ${analysis.occupancy_score}%`);
  console.log(`Classification: ${analysis.utilization_classification}`);
  console.log(`Trend: ${analysis.trend_direction}`);
  
  if (analysis.lease_breach) {
    console.warn(`⚠️ BREACH: ${analysis.breach_details}`);
  }
});

// Display summary
console.log(`Portfolio Average: ${summary.avg_occupancy_score}%`);
console.log(`Overcrowded: ${summary.overcrowded_count}`);
console.log(`Underutilised: ${summary.underutilised_count}`);
console.log(`Efficient: ${summary.efficient_count}`);
```

---

## 🗂️ Related Files

- **Algorithm**: `src/lib/analytics-engine.ts` (lines 1043-1418)
- **API Endpoint**: `src/app/api/occupancy/analyze/route.ts`
- **Frontend**: `src/app/dashboard/modules/occupancy/page.tsx`
- **Sample Data**: `occupancy_sample.csv`
- **Data Route**: `src/app/api/occupancy/data/route.ts`

---

**Last Updated**: 2025-01-20  
**Version**: 1.0.0  
**Status**: Algorithm & API Complete ✅ | Frontend In Progress ⏳

