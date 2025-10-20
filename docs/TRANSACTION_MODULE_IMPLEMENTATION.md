# LCM Transactions Module - Core Algorithm Implementation

## Overview
This document outlines the complete implementation of the LCM Transactions Module, following the specified core algorithm logic for transaction reconciliation, risk scoring, and aggregation.

---

## ✅ Core Algorithm Implementation Status

### **1. Transaction Type Identification** ✅
**Status**: Implemented in `calculateTransactionRiskScores()`

**Implementation**:
```typescript
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
```

**Transaction Types Supported**:
- Rent payments (base risk: 10)
- Service charges (base risk: 20)
- Deposits (base risk: 5)
- Purchase transactions (base risk: 15)
- Sale transactions (base risk: 15)
- Refinancing (base risk: 25)
- Other (base risk: 30)

---

### **2. Cross-Check Against Active Lease Contracts** ✅
**Status**: Fully implemented in `reconcileTransactions()`

**Implementation Steps**:
1. **Find matching lease** by property_id and tenant_id
2. **Validate lease is active** during transaction date:
   ```typescript
   const isLeaseActive = transactionDate >= leaseStart && transactionDate <= leaseEnd;
   ```
3. **Validate amount range** (±5% tolerance):
   ```typescript
   const tolerance = matchingLease.monthly_rent * 0.05;
   const amountVariance = Math.abs(txn.amount - matchingLease.monthly_rent);
   const isWithinTolerance = amountVariance <= tolerance;
   ```
4. **Verify due date vs actual timestamp**:
   ```typescript
   const daysDifference = Math.floor((transactionDate - dueDate) / (1000 * 60 * 60 * 24));
   ```
5. **Flag early/late payments**:
   ```typescript
   is_early_payment: daysDifference < 0,
   is_late_payment: daysDifference > 0,
   ```

---

### **3. Bank Feed Matching** 🟡
**Status**: Partial - Framework in place

**Current Implementation**:
- Transaction matching by lease ID and timestamp
- Amount proximity validation
- Contract amount comparison

**To Do (Future Enhancement)**:
- Integration with actual bank feed data
- Real-time bank reconciliation
- Automated bank statement import

**Placeholder Logic**:
```typescript
// Currently using contract_amount as proxy for bank feed
if (txn.contract_amount) {
  const variance = Math.abs(txn.amount - txn.contract_amount);
  // Flag if variance exceeds tolerance
}
```

---

### **4. Anomaly Detection & Flagging** ✅
**Status**: Fully implemented

**Unreconciled Transaction Reasons**:
1. **`lease_inactive`**: Transaction occurred outside lease period
2. **`amount_mismatch`**: Amount variance exceeds tolerance (>5%)
3. **`no_lease_match`**: No matching lease found for property/tenant

**Anomaly Flagging**:
```typescript
flagged_anomalies: unreconciled.filter(txn => 
  txn.reason === 'amount_mismatch' || txn.reason === 'lease_inactive'
)
```

---

### **5. Risk Scoring Formula** ✅
**Status**: Fully implemented as specified

**Formula**: `Risk = base_score + late_fee_factor + anomaly_weight`

**Components**:

#### **A. Base Score (0-40)**
Based on transaction type:
- See transaction type mapping above

#### **B. Late Fee Factor (0-30)**
Based on payment timeliness:
```typescript
const daysLate = Math.floor((transactionDate - dueDate) / (1000 * 60 * 60 * 24));
const lateFeeFactor = Math.min(Math.max(daysLate * 2, 0), 30);
```
- 2 points per day late
- Maximum 30 points
- 0 for on-time or early payments

#### **C. Anomaly Weight (0-30)**
Based on contract amount variance:
```typescript
if (variance > tolerance) {
  const variancePct = (variance / expectedAmount) * 100;
  anomalyWeight = Math.min(variancePct * 3, 30); // 3 points per % variance
}
```
- 3 points per percentage of variance
- Maximum 30 points

**Risk Levels**:
- **High Risk**: Total score > 70
- **Medium Risk**: Total score 40-70
- **Low Risk**: Total score < 40

---

### **6. Property/Tenant Aggregation** ✅
**Status**: Newly implemented

**Function**: `aggregateTransactionsByPropertyTenant()`

**Aggregated Metrics Per Property/Tenant**:
```typescript
{
  property_id: string,
  tenant_id: string,
  total_transactions: number,
  reconciled_count: number,
  unreconciled_count: number,
  total_risk_score: number,
  average_risk_score: number,
  high_risk_count: number,
  medium_risk_count: number,
  low_risk_count: number,
  late_payments: number,
  early_payments: number,
  on_time_payments: number,
  total_amount: number,
  last_transaction_date: string,
  reconciliation_rate: number
}
```

**Usage**: Provides total risk insights per property/tenant combination

---

### **7. Summary Views** ✅
**Status**: Newly implemented

**Function**: `createSummaryViews()`

#### **A. Summary by Property**
```typescript
{
  property_id: string,
  total_transactions: number,
  total_amount: number,
  average_risk: number,
  risk_scores: number[]
}
```

#### **B. Summary by Period (Monthly)**
```typescript
{
  period: string,              // Format: "YYYY-MM"
  total_transactions: number,
  reconciled: number,
  unreconciled: number,
  total_amount: number,
  average_risk: number,
  risk_scores: number[]
}
```

**Access in Report**:
```typescript
analysisResults.reconciliation_report.property_tenant_aggregations
analysisResults.reconciliation_report.summary_by_property
analysisResults.reconciliation_report.summary_by_period
```

---

## 📊 Data Flow

```
1. Transaction Upload
   ↓
2. Parse & Validate
   ↓
3. reconcileTransactions()
   - Cross-check against leases
   - Validate amounts & dates
   - Flag anomalies
   ↓
4. calculateTransactionRiskScores()
   - Apply risk formula
   - Calculate base_score + late_fee_factor + anomaly_weight
   ↓
5. aggregateTransactionsByPropertyTenant()
   - Group by property/tenant
   - Calculate total risk insights
   ↓
6. createSummaryViews()
   - Create property summaries
   - Create period summaries
   ↓
7. generateReconciliationReport()
   - Compile all data
   - Generate recommendations
   ↓
8. Display in UI
```

---

## 🎯 API Response Structure

```typescript
{
  // Original data
  reconciled_transactions: Array,
  unreconciled_transactions: Array,
  risk_scores: Array,
  
  // Reconciliation report
  reconciliation_report: {
    // Summary metrics
    total_transactions: number,
    reconciled_count: number,
    unreconciled_count: number,
    reconciliation_rate: number,
    
    // Risk analysis
    high_risk_transactions: number,
    medium_risk_transactions: number,
    low_risk_transactions: number,
    average_risk_score: number,
    
    // Payment patterns
    early_payments: number,
    late_payments: number,
    on_time_payments: number,
    
    // Property insights
    property_summary: Array,
    
    // NEW: Aggregations (as per core algorithm)
    property_tenant_aggregations: Array,
    summary_by_property: Array,
    summary_by_period: Array,
    
    // Anomaly flags
    flagged_anomalies: Array,
    high_risk_transaction_details: Array,
    
    // Recommendations
    recommendations: Array
  }
}
```

---

## 🚀 Usage Examples

### **1. Get Property/Tenant Risk Insights**
```typescript
const aggregations = analysisResults.reconciliation_report.property_tenant_aggregations;

// Find highest risk property/tenant
const highestRisk = aggregations.sort((a, b) => 
  b.average_risk_score - a.average_risk_score
)[0];

console.log(`Highest risk: ${highestRisk.property_id} / ${highestRisk.tenant_id}`);
console.log(`Average risk score: ${highestRisk.average_risk_score}`);
console.log(`Unreconciled: ${highestRisk.unreconciled_count} / ${highestRisk.total_transactions}`);
```

### **2. Get Monthly Trends**
```typescript
const periods = analysisResults.reconciliation_report.summary_by_period;

periods.forEach(period => {
  console.log(`${period.period}:`);
  console.log(`  Transactions: ${period.total_transactions}`);
  console.log(`  Reconciliation Rate: ${(period.reconciled / period.total_transactions * 100).toFixed(1)}%`);
  console.log(`  Average Risk: ${period.average_risk.toFixed(1)}`);
});
```

### **3. Get Property Performance**
```typescript
const properties = analysisResults.reconciliation_report.summary_by_property;

properties.forEach(prop => {
  console.log(`Property ${prop.property_id}:`);
  console.log(`  Total Amount: $${prop.total_amount.toLocaleString()}`);
  console.log(`  Average Risk: ${prop.average_risk.toFixed(1)}`);
  console.log(`  Transactions: ${prop.total_transactions}`);
});
```

---

## 📝 Notes

### **What's Working**:
✅ Transaction type identification  
✅ Lease contract validation  
✅ Amount tolerance checking  
✅ Due date verification  
✅ Early/late payment flagging  
✅ Risk scoring formula (base + late_fee + anomaly)  
✅ Property/tenant aggregation  
✅ Summary views by property and period  
✅ Anomaly detection and flagging  

### **Future Enhancements**:
🟡 Bank feed integration (real-time)  
🟡 Automated bank statement import  
🟡 Machine learning for anomaly detection  
🟡 Predictive risk modeling  
🟡 Integration with payment gateways  

### **Configuration**:
- **Amount Tolerance**: Currently 5% (configurable)
- **Late Payment Points**: 2 points/day (configurable)
- **Anomaly Weight**: 3 points/% variance (configurable)
- **Risk Thresholds**: 40 (low/medium), 70 (medium/high)

---

## 🔗 Related Files

- **Algorithm Implementation**: `src/lib/analytics-engine.ts` (lines 540-1041)
- **API Endpoint**: `src/app/api/transactions/analyze/route.ts`
- **Frontend Display**: `src/app/dashboard/modules/transactions/page.tsx`
- **Data Processing**: `src/lib/dataProcessor.ts`

---

**Last Updated**: 2025-01-20  
**Version**: 1.0.0  
**Status**: Production Ready ✅

