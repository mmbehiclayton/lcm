# LCM Analytics - Sample Data Upload Guide

## 🎯 Overview

This guide will walk you through uploading the comprehensive sample data to your LCM Analytics system. The data is designed to be consistent across all modules with shared property IDs, tenant IDs, and realistic relationships.

---

## 📋 Pre-Upload Checklist

### ✅ Before You Begin:

1. **Backup existing data** (if any)
   ```bash
   # Export your current database (if needed)
   mysqldump -u username -p lcm_database > backup_$(date +%Y%m%d).sql
   ```

2. **Verify application is running**
   ```bash
   pnpm dev
   # Application should be running on http://localhost:3000
   ```

3. **Confirm database connection**
   - Check `.env` file has correct `DATABASE_URL`
   - Test connection: `npx prisma db pull`

4. **Clear existing data** (recommended for clean test)
   - Option A: Run `sample-data/reset-database.sql` in MySQL
   - Option B: Use Prisma: `npx prisma migrate reset --force`

---

## 🗃️ Data Files Overview

| File | Module | Records | Upload Priority |
|------|--------|---------|-----------------|
| `1_portfolio_properties.csv` | Portfolio Analysis | 20 properties | 1️⃣ FIRST |
| `2_lease_contracts.csv` | Lease Analysis | 30 leases | 2️⃣ SECOND |
| `3_property_transactions.csv` | Transactions | 105 transactions | 3️⃣ THIRD |
| `4_occupancy_data.csv` | Occupancy | 20 properties | 4️⃣ FOURTH |
| `5_predictive_inputs.csv` | Predictive Modelling | 20 properties | 5️⃣ FIFTH |

**Total Records**: 195 across all modules  
**Shared Properties**: 20 (PROP-001 to PROP-020)  
**Shared Tenants**: 30 (TENANT-001 to TENANT-030)

---

## 📤 Step-by-Step Upload Instructions

### **Step 1: Upload Portfolio Properties** 🏢

**File**: `1_portfolio_properties.csv`

1. Navigate to: `http://localhost:3000/dashboard/portfolio`
2. Click **"Upload Data"** button
3. Select `1_portfolio_properties.csv`
4. Wait for success message
5. **Verify**:
   - ✅ 20 properties displayed
   - ✅ Total portfolio value: ~£155M
   - ✅ Average occupancy: 90.5%
   - ✅ Properties span Office, Retail, Industrial, Residential

**Expected Stats**:
- Total Properties: 20
- Total Value: £155,200,000
- Average Occupancy: 90.5%
- Total Monthly Rent: £3,813,200

---

### **Step 2: Upload Lease Contracts** 📝

**File**: `2_lease_contracts.csv`

1. Navigate to: `http://localhost:3000/dashboard/modules/lease-analysis`
2. Click **"Upload Data"** button
3. Select `2_lease_contracts.csv`
4. Wait for success message and analysis to complete
5. **Verify**:
   - ✅ 30 leases displayed
   - ✅ Multiple leases for some properties (PROP-001, PROP-002, etc.)
   - ✅ Expiry dates ranging 2025-2029
   - ✅ Risk scores calculated

**Expected Stats**:
- Total Leases: 30
- Expiring Soon (6 months): 6-8
- Average Risk Score: 45-55
- High Risk Properties: 3-4

**Key Test Cases**:
- **PROP-001**: 2 tenants (TechStart, DataCore)
- **PROP-002**: 2 tenants (Global Finance, Legal Associates)
- **PROP-005**: 2 tenants (Innovation Startup, Design Studio)
- **PROP-007**: 2 tenants (Discount Retail, Fast Food) - High Risk
- **PROP-012**: Single tenant - Expiring 2025-05-31

---

### **Step 3: Upload Transactions** 💰

**File**: `3_property_transactions.csv`

1. Navigate to: `http://localhost:3000/dashboard/modules/transactions`
2. Click **"Upload Data"** button
3. Select `3_property_transactions.csv`
4. Wait for analysis to complete
5. **Verify**:
   - ✅ 105 transactions displayed
   - ✅ Mix of Completed and Pending statuses
   - ✅ Reconciled and unreconciled records
   - ✅ Multiple transaction types (Rent, Service Charge, Utilities, etc.)

**Expected Stats**:
- Total Transactions: 105
- Completed: 95-98
- Pending: 7-10
- Unreconciled: 10-15
- Total Volume: ~£4.5M
- Total Fees: £2,000-£3,000

**Key Test Cases**:
- **PROP-007**: Multiple late payments, amount mismatches (High Risk)
- **PROP-012**: Late payments, amount variances (High Risk)
- **PROP-018**: Amount mismatches (Medium Risk)
- **Unreconciled**: TXN-049 to TXN-052, TXN-095 to TXN-098

**Transaction Types Included**:
- Rent payments (monthly)
- Service charges
- Utilities
- Deposits
- Maintenance
- Parking fees
- Insurance

---

### **Step 4: Upload Occupancy Data** 📊

**File**: `4_occupancy_data.csv`

1. Navigate to: `http://localhost:3000/dashboard/modules/occupancy`
2. Click **"Upload Data"** button
3. Select `4_occupancy_data.csv`
4. Wait for analysis to complete
5. **Verify**:
   - ✅ 20 properties displayed
   - ✅ IoT sensor data (desk usage, badge-ins, etc.)
   - ✅ Utilization classifications
   - ✅ Lease breach alerts (if any)

**Expected Stats**:
- Total Properties: 20
- Overall Occupancy: 88-92%
- Efficient: 15
- Underutilised: 3
- Overcrowded: 2
- Lease Breaches: 2-3

**Key Test Cases**:
- **PROP-001**: Efficient (96% occupancy, 92% desk usage)
- **PROP-006**: Efficient (100% occupancy, industrial)
- **PROP-007**: Underutilised (72% occupancy, 65% desk usage)
- **PROP-010**: Overcrowded (95% occupancy, 110 actual vs 85 capacity)
- **PROP-012**: Underutilised (75% occupancy, retail decline)

**Sensor Data Included**:
- Desk usage percentage
- Badge-in counts
- Meeting room utilization
- Lighting usage
- Temperature averages
- Historical occupancy trends (3/6/12 months)

---

### **Step 5: Upload Predictive Data** 🔮

**File**: `5_predictive_inputs.csv`

1. Navigate to: `http://localhost:3000/dashboard/modules/predictive-modelling`
2. Click **"Upload Data"** button
3. Select `5_predictive_inputs.csv`
4. Wait for ML analysis to complete
5. **Verify**:
   - ✅ 20 predictions displayed
   - ✅ Asset classifications (Stable/Moderate/High Risk)
   - ✅ Total scores (0-100)
   - ✅ Economic factors integrated

**Expected Stats**:
- Total Properties: 20
- Stable Assets: 12-14
- Moderate Risk: 4-5
- High Risk: 2-3
- Average Total Score: 65-70

**Key Test Cases**:
- **PROP-001**: Stable (Tech sector, High demand, EPC B)
- **PROP-002**: Stable (Finance, Prime location, EPC A)
- **PROP-007**: High Risk (Retail decline, Low occupancy, EPC D)
- **PROP-012**: High Risk (Retail, Low demand, EPC D)
- **PROP-015**: Stable (Data centre, 100% occupancy, EPC A)

**Predictive Metrics**:
- Lease Renewal Probability
- EPC Deterioration Risk
- Forecasted Occupancy Rate
- Risk-Adjusted Rent Forecast
- Economic factors (GDP, inflation, interest rates)

---

## ✅ Post-Upload Verification

### Cross-Module Consistency Checks:

1. **Property IDs Match**
   ```
   Portfolio: 20 properties → All modules should show same IDs
   ```

2. **Tenant Consistency**
   ```
   Leases show TENANT-001, TENANT-002, etc.
   Transactions reference same tenant IDs
   ```

3. **Financial Consistency**
   ```
   Portfolio monthly rent ≈ Sum of lease rents
   Transaction volumes align with expected amounts
   ```

4. **Occupancy Consistency**
   ```
   Occupancy rates in Occupancy module match Portfolio
   Unit counts are consistent
   ```

5. **Risk Alignment**
   ```
   High-risk properties should appear across modules:
   - PROP-007: Lease risk, Transaction issues, Low occupancy
   - PROP-012: Lease risk, Late payments, Retail decline
   ```

---

## 🧪 Testing Scenarios

### Scenario 1: High-Risk Property Analysis
**Property**: PROP-007 (City Centre Retail Unit)
- ✅ Portfolio: Low occupancy (72%)
- ✅ Leases: 2 expiring soon, Low credit tenants
- ✅ Transactions: Multiple late payments, amount mismatches
- ✅ Occupancy: Underutilised, Desk usage 65%
- ✅ Predictive: High Risk classification

### Scenario 2: Stable Asset Performance
**Property**: PROP-001 (Downtown Tech Hub)
- ✅ Portfolio: High value (£12M), Strong occupancy (96%)
- ✅ Leases: 2 A-rated tenants, Long-term contracts
- ✅ Transactions: All on-time payments
- ✅ Occupancy: Efficient utilization, 92% desk usage
- ✅ Predictive: Stable classification

### Scenario 3: Transaction Reconciliation
**Focus**: Properties with payment issues
- ✅ PROP-007: 5+ late payments, amount mismatches
- ✅ PROP-012: Consistent late payment pattern
- ✅ PROP-018: Amount variances
- ✅ Unreconciled: TXN-049, TXN-050, TXN-051, TXN-052

### Scenario 4: Lease Expiry Management
**Focus**: Properties with expiring leases
- ✅ PROP-005: 2 leases expiring 2025-2026
- ✅ PROP-012: Lease expiring May 2025
- ✅ PROP-018: Lease expiring March 2025
- ✅ PROP-014: 12 lease expirations tracked

---

## 🔍 Troubleshooting

### Issue: Upload fails with "Invalid CSV format"
**Solution**:
- Ensure no extra commas or line breaks in CSV
- Check file encoding is UTF-8
- Verify all required fields are present

### Issue: Analysis doesn't run automatically
**Solution**:
- Click "Analyze" or "Run Analysis" button manually
- Check browser console for errors
- Verify API endpoints are responding

### Issue: Data appears but no relationships
**Solution**:
- Verify upload order was followed
- Check property IDs match exactly (PROP-001 format)
- Ensure tenant IDs are consistent

### Issue: Stats show "N/A" or zero values
**Solution**:
- Refresh the page
- Re-run analysis
- Check database has all uploaded records

---

## 📊 Expected Dashboard Overview

### After All Uploads Complete:

**Portfolio Module**:
- 20 properties, £155M total value
- Average occupancy: 90.5%
- 4 high-risk properties

**Lease Analysis**:
- 30 active leases
- 6-8 expiring within 6 months
- Average risk score: 45-55

**Transactions**:
- 105 transactions
- 90%+ reconciled
- £4.5M total volume
- 10-15 anomalies

**Occupancy**:
- 88-92% average occupancy
- 15 efficient properties
- 3 underutilised
- 2 overcrowded
- 2-3 lease breaches

**Predictive Modelling**:
- 12-14 stable assets
- 4-5 moderate risk
- 2-3 high risk
- Average score: 65-70

---

## 🎓 Training Use Cases

### For Demonstrations:
1. Show cross-module consistency
2. Highlight high-risk property journey (PROP-007)
3. Demonstrate lease expiry workflow
4. Showcase transaction reconciliation
5. Present predictive insights

### For Testing:
1. Test filters and search across modules
2. Verify export functionality
3. Test refresh and re-analysis
4. Validate alert notifications
5. Check performance with realistic data volume

---

## 🔄 Re-Upload Instructions

If you need to start fresh:

1. Run `reset-database.sql`
2. OR use: `npx prisma migrate reset --force`
3. Follow upload steps 1-5 again
4. Verify all modules after each upload

---

## 📞 Support

If you encounter issues:

1. Check browser console for errors
2. Review server logs
3. Verify `.env` configuration
4. Ensure Prisma schema is up to date
5. Test API endpoints directly

---

**Last Updated**: 2025-01-20  
**Version**: 1.0.0  
**Total Upload Time**: ~5-10 minutes  
**Recommended Browser**: Chrome/Edge (latest)

