# LCM Predictive Modelling - Data Guide

## Database Table Used

**Table Name:** `PredictiveData` and `Property`

The Predictive Modelling module can work with two approaches:

1. **Using Property Table** (Recommended for full algorithm features)
   - Uses existing property data with all fields needed for comprehensive analysis
   - Provides EPC rating, maintenance scores, lease dates, etc.
   - Enables all feature engineering capabilities

2. **Using PredictiveData Table** (Simplified approach)
   - Basic predictive data storage
   - Limited fields but faster setup

## Required Fields for Comprehensive Analysis

For the full predictive modeling algorithm to work with all features (as implemented), the following fields are needed:

| Field | Type | Description | Required | Default |
|-------|------|-------------|----------|---------|
| `property_id` | String | Unique identifier | ✅ Yes | - |
| `property_name` | String | Property name | ✅ Yes | - |
| `property_type` | String | Office/Retail/Industrial/Residential | ✅ Yes | - |
| `location` | String | Property location | ✅ Yes | - |
| `current_value` | Float | Current market value | ✅ Yes | - |
| `purchase_price` | Float | Original purchase price | No | 0 |
| `purchase_date` | Date | Date of purchase (YYYY-MM-DD) | No | - |
| `occupancy_rate` | Float | Current occupancy (0.0-1.0) | No | 0.8 |
| `epc_rating` | String | Energy rating (A-G) | No | C |
| `maintenance_score` | Integer | Maintenance quality (1-10) | No | 5 |
| `lease_expiry_date` | Date | Lease end date (YYYY-MM-DD) | No | - |
| `noi` | Float | Net Operating Income | No | 0 |

## Sample File: `predictive_modelling_sample.csv`

### Test Data Characteristics

The provided sample file contains **22 records** designed to test various scenarios:

#### Property Type Distribution
- **Office**: 6 properties (PRED-001, 003, 007, 011, 015, 019)
- **Retail**: 6 properties (PRED-002, 006, 010, 014, 018, 022)
- **Industrial**: 5 properties (PRED-004, 008, 012, 016, 020)
- **Residential**: 5 properties (PRED-005, 009, 013, 017, 021)

#### Location Variety
Covers major UK cities: London, Manchester, Bristol, Birmingham, Leeds, Liverpool, Cambridge, Sheffield, Edinburgh, Glasgow, Newcastle, Nottingham, Southampton, Cardiff, Oxford, Leicester, Brighton, Reading, Milton Keynes, Derby, Bath, York

#### Value Range
- **Low**: £4.5M - £7M (smaller retail/residential)
- **Medium**: £8M - £15M (standard commercial)
- **High**: £18M - £28M (premium offices/industrial)

#### EPC Ratings Distribution
- **A-rated**: 4 properties (excellent efficiency)
- **B-rated**: 9 properties (good efficiency)
- **C-rated**: 5 properties (average efficiency)
- **D-rated**: 2 properties (below average)
- **E-F rated**: 2 properties (poor efficiency, high risk)

#### Occupancy Rates
- **High (>90%)**: 8 properties → Stable assets
- **Good (80-90%)**: 8 properties → Moderate risk
- **Moderate (70-80%)**: 4 properties → Attention needed
- **Low (<70%)**: 2 properties → High risk

#### Maintenance Scores
- **Excellent (8-9)**: 12 properties
- **Good (6-7)**: 7 properties
- **Poor (3-5)**: 3 properties

#### Lease Expiry Timeline
- **Expiring soon (<3 years)**: 3 properties → Immediate renewal risk
- **Medium term (3-7 years)**: 7 properties → Planning horizon
- **Long term (>7 years)**: 12 properties → Stable

## Expected Algorithm Outputs

Based on this data, the algorithm will generate:

### High Risk Assets (Expected: 2-3)
- PRED-010: Heritage Retail Arcade (Low occupancy 68%, EPC E, Poor maintenance)
- PRED-014: Old Town Shopping Street (Very low occupancy 65%, EPC F, Poor maintenance, expiring soon)
- PRED-022: Community Shopping Center (Low occupancy 70%, EPC E, Poor maintenance, expiring soon)

### Moderate Risk Assets (Expected: 8-10)
- Properties with EPC C-D ratings
- Retail properties with declining markets
- Properties with 70-85% occupancy
- Properties approaching lease expiry

### Stable Assets (Expected: 9-12)
- PRED-003: Tech Hub Office (88% occupancy, EPC A, high maintenance)
- PRED-004: Industrial Logistics (95% occupancy, long lease)
- PRED-007: Innovation Quarter (90% occupancy, EPC A, premium location)
- PRED-008: Warehouse Distribution (98% occupancy, excellent performance)
- PRED-015: Innovation Tech Park (94% occupancy, EPC A, premium value)
- PRED-020: Advanced Manufacturing (97% occupancy, strong industrial demand)

### Key Predictions to Verify

1. **Lease Renewal Probability**
   - High maintenance + high occupancy → >75% renewal probability
   - Poor EPC + low occupancy → <50% renewal probability

2. **EPC Deterioration Risk**
   - Properties from 2015-2016 → Higher deterioration risk
   - Properties with EPC D-F → High risk classification
   - New properties (2019-2020) with EPC A-B → Low risk

3. **Forecasted Occupancy**
   - Industrial properties → Increasing trend (market demand high)
   - Retail properties → Decreasing trend (market headwinds)
   - Office properties → Stable/slight increase (hybrid work adjusted)
   - Residential → Stable/increasing (housing demand)

4. **Weighted Scoring**
   - Total scores should range from 30-85
   - Correlation with EPC, occupancy, and lease stability visible

## Testing Scenarios

### Scenario 1: Premium Performance
**Property**: PRED-015 (Innovation Tech Park)
- Expected Score: 75-85 (Stable)
- High renewal probability (>80%)
- Low EPC risk
- High forecasted occupancy (>92%)

### Scenario 2: High Risk Alert
**Property**: PRED-014 (Old Town Shopping Street)
- Expected Score: 25-35 (High Risk)
- Low renewal probability (<45%)
- High EPC deterioration risk
- Declining occupancy forecast

### Scenario 3: Moderate with Potential
**Property**: PRED-002 (Riverside Retail Park)
- Expected Score: 55-65 (Moderate)
- Medium renewal probability (60-70%)
- Medium EPC risk
- Stable occupancy with market dependency

### Scenario 4: Industrial Strength
**Property**: PRED-008 (Warehouse Distribution Hub)
- Expected Score: 78-88 (Stable)
- Very high renewal probability (>85%)
- Low-medium EPC risk
- Excellent occupancy forecast (>96%)

## Upload Instructions

1. Navigate to: `http://localhost:3000/dashboard/modules/predictive-modelling`
2. Click **"Upload Data"** button
3. Select `predictive_modelling_sample.csv`
4. Wait for processing
5. Click **"Run Analysis"** to generate predictions
6. View results in three tabs:
   - **Predictions**: Main table with all outputs
   - **Scoring Details**: Breakdown of weighted scoring
   - **Key Insights**: Risk distribution and recommendations

## Validation Checklist

After upload and analysis, verify:

- ✅ All 22 properties loaded successfully
- ✅ Asset classification distribution (2-3 High Risk, 8-10 Moderate, 9-12 Stable)
- ✅ Total scores range appropriately (30-85)
- ✅ Lease renewal probabilities vary by property characteristics
- ✅ EPC risk levels correlate with EPC ratings
- ✅ Forecasted occupancy reflects property type trends
- ✅ Confidence scores are reasonable (60-95%)
- ✅ Charts display data correctly
- ✅ Economic context shows in insights tab
- ✅ Recommendations are generated

## Notes

- The algorithm uses **property_type** encoding where Industrial (0.9) > Office (0.7) > Residential (0.6) > Retail (0.4) based on current market trends
- **Location risk index** is calculated from market demand and economic indicators
- **Seasonal factors** add realistic variation to forecasts
- All dates should be in ISO format (YYYY-MM-DD)
- Occupancy rates should be decimals (0.85 for 85%)
- Property values and NOI in currency units (no special formatting needed)

## Troubleshooting

If predictions don't generate:
1. Check that all required fields are present
2. Verify property_type values match: Office, Retail, Industrial, or Residential (case-sensitive)
3. Ensure dates are in YYYY-MM-DD format
4. Check that numeric fields contain valid numbers
5. Verify occupancy_rate is between 0 and 1

For support, check the browser console for error messages.

