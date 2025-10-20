# LCM Analytics - Comprehensive Sample Data

## Overview
This folder contains consistent, interconnected sample data for all LCM Analytics modules. All datasets share common property IDs and relationships to ensure realistic testing scenarios.

## Data Relationships

```
Portfolio (20 Properties)
    ↓
    ├─→ Leases (30 leases across properties)
    ├─→ Transactions (100+ transactions linked to leases)
    ├─→ Occupancy (20 records with sensor data)
    └─→ Predictive Modelling (20 property records with full metrics)
```

## Shared Property IDs

All datasets use consistent Property IDs: **PROP-001 through PROP-020**

### Property Portfolio Mix:
- **Office**: PROP-001, PROP-002, PROP-005, PROP-008, PROP-010, PROP-013, PROP-017, PROP-019
- **Retail**: PROP-003, PROP-007, PROP-012, PROP-018
- **Industrial**: PROP-006, PROP-011, PROP-015
- **Residential**: PROP-004, PROP-009, PROP-014, PROP-016, PROP-020

## Data Files

### 1. **portfolio_properties.csv**
- Base property information
- Purchase prices, dates, locations
- Current valuations
- EPC ratings
- Maintenance scores

### 2. **lease_contracts.csv**
- Active leases for each property
- Some properties have multiple tenants
- Includes renewal options, break clauses
- Expiry dates spanning 2025-2028

### 3. **property_transactions.csv**
- Rent payments
- Service charges
- Deposits
- Utilities
- Includes reconciled and unreconciled records
- Early/late payments

### 4. **occupancy_data.csv**
- IoT sensor data
- Historical occupancy trends
- Lease compliance info
- Tenant headcounts
- Utilization metrics

### 5. **predictive_inputs.csv**
- Full property metrics for ML modeling
- Market indicators
- Economic factors
- Same as portfolio_properties.csv but with additional fields

## Upload Order

For best results, upload in this order:

1. **portfolio_properties.csv** → Portfolio Analysis Module
2. **lease_contracts.csv** → Lease Analysis Module
3. **property_transactions.csv** → Transactions Module
4. **occupancy_data.csv** → Occupancy Module
5. **predictive_inputs.csv** → Predictive Modelling Module

## Data Consistency Rules

### Property IDs
- Always use format: PROP-XXX (e.g., PROP-001)
- All modules reference the same 20 properties

### Tenant IDs
- Format: TENANT-XXX (e.g., TENANT-001)
- Consistent across leases and transactions

### Dates
- Purchase dates: 2018-2022
- Lease start dates: 2020-2024
- Lease end dates: 2025-2028
- Transaction dates: 2024-2025

### Financial Consistency
- Monthly rent in leases = expected transaction amounts
- Occupancy revenue = rent × occupied units
- Property value correlates with NOI and rent

### Performance Metrics
- EPC ratings affect predictive risk scores
- Maintenance scores correlate with occupancy
- Market demand affects lease renewal probability

## Test Scenarios Included

### High-Risk Properties
- **PROP-007**: Low occupancy (72%), High risk, Retail decline
- **PROP-012**: High risk, Multiple late payments
- **PROP-018**: Underutilised, Below market rent

### Efficient Properties
- **PROP-001**: 96% occupancy, Low risk, Tech sector growth
- **PROP-003**: 100% occupancy, Industrial demand
- **PROP-013**: Corporate HQ, 95% occupancy, Stable

### Lease Expiring Soon
- **PROP-005**: 3 expiring in 6 months
- **PROP-014**: 12 expiring in next year

### Transaction Issues
- **PROP-007**: 5 unreconciled payments
- **PROP-012**: Late payment patterns
- **PROP-018**: Amount mismatches

### Compliance Issues
- **PROP-010**: Overcrowded (110 actual vs 85 estimated)
- **PROP-007**: Underutilised (<50% baseline)

## Database Reset Instructions

### Option 1: Using Prisma (Recommended)
```bash
# Reset database
npx prisma migrate reset --force

# Run seed script (if available)
npx prisma db seed
```

### Option 2: Manual SQL
```sql
-- Truncate all data tables
TRUNCATE TABLE analyses;
TRUNCATE TABLE transactions;
TRUNCATE TABLE occupancy_data;
TRUNCATE TABLE predictive_data;
TRUNCATE TABLE leases;
TRUNCATE TABLE properties;
TRUNCATE TABLE uploads;

-- Reset auto-increment (if needed)
ALTER TABLE uploads AUTO_INCREMENT = 1;
```

### Option 3: Drop and Recreate
```bash
# Drop database
npx prisma migrate reset --force --skip-seed

# Push schema
npx prisma db push
```

## Upload via UI

1. Navigate to each module
2. Click "Upload Data" button
3. Select corresponding CSV file
4. Wait for success message
5. Check analysis results

## Expected Outcomes

After uploading all datasets:

### Portfolio Analysis
- 20 properties displayed
- Total portfolio value: £45M+
- Average occupancy: 88-92%
- 4 High-risk properties

### Lease Analysis
- 30 leases tracked
- 8 expiring within 6 months
- Average risk score: 45-55
- 5 intervention priorities

### Transactions Module
- 100+ transactions
- 85-90% reconciled
- 10-15% unreconciled
- 3-5 high-risk properties

### Occupancy Module
- 15 Efficient properties
- 3 Underutilised
- 2 Overcrowded
- 2-3 Lease breaches

### Predictive Modelling
- 12 Stable assets
- 5 Moderate risk
- 3 High risk
- Average total score: 60-70

## Data Quality

- ✅ All dates are valid and realistic
- ✅ All financial figures are consistent
- ✅ Property IDs match across all files
- ✅ Tenant IDs consistent in leases and transactions
- ✅ Occupancy rates match unit counts
- ✅ EPC ratings follow UK standards (A-G)
- ✅ Locations are real UK cities with postcodes

## Maintenance

To update sample data:
1. Maintain property ID consistency
2. Update dates to current period
3. Ensure financial calculations are correct
4. Test all modules after changes
5. Update this README with any changes

---

**Last Updated**: 2025-01-20  
**Version**: 1.0.0  
**Total Records**: 190+ across all modules  
**Properties**: 20 diverse properties  
**Consistency**: 100% cross-module relationships

