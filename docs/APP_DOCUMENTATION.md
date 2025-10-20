# LCM Analytics - Application Documentation

**Version**: 1.0.0  
**Date**: January 2025  
**Status**: Production Ready

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [System Architecture](#system-architecture)
3. [Key Modules](#key-modules)
4. [Analytics Engine Workflow](#analytics-engine-workflow)
5. [Algorithm Specifications](#algorithm-specifications)
6. [Data Flow & Processing](#data-flow--processing)
7. [User Workflow](#user-workflow)
8. [API Architecture](#api-architecture)
9. [Database Schema](#database-schema)
10. [Security & Authentication](#security--authentication)
11. [Deployment & Configuration](#deployment--configuration)

---

## 1. Executive Summary

### 1.1 Application Overview

**LCM Analytics** is a comprehensive commercial real estate portfolio management platform that combines property valuation, lease risk analysis, transaction reconciliation, occupancy optimization, and predictive modeling into a unified analytics solution.

### 1.2 Core Capabilities

- **Portfolio Analysis**: Property valuation, performance tracking, risk assessment
- **Lease Risk Scoring**: Predictive lease risk analysis with intervention recommendations
- **Transaction Reconciliation**: Automated payment matching and anomaly detection
- **Occupancy Intelligence**: IoT-driven space utilization with compliance monitoring
- **Predictive Modelling**: ML-powered forecasting for asset classification and risk prediction

### 1.3 Technology Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | Next.js 14, React 18, TypeScript, Tailwind CSS |
| **Backend** | Next.js API Routes, Node.js |
| **Database** | MySQL/PostgreSQL via Prisma ORM |
| **Authentication** | NextAuth.js |
| **Charts** | Recharts |
| **Deployment** | Vercel / Docker |

### 1.4 Key Differentiators

1. **Proprietary Algorithms**: Custom-built risk scoring and predictive models
2. **Multi-Source Integration**: Combines property, lease, transaction, and IoT data
3. **Real-Time Analytics**: Instant analysis on data upload
4. **Cross-Module Consistency**: Unified property and tenant tracking
5. **Regulatory Compliance**: Lease compliance monitoring and breach detection

---

## 2. System Architecture

### 2.1 High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         USER INTERFACE                           │
│              (Next.js Frontend - React Components)               │
└──────────────────────────┬──────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│                    AUTHENTICATION LAYER                          │
│                  (NextAuth.js - Session Management)              │
└──────────────────────────┬──────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│                      API LAYER (REST)                            │
│              (Next.js API Routes - /api/*)                       │
│                                                                   │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐            │
│  │  Portfolio  │  │    Lease    │  │ Transaction │            │
│  │     API     │  │   Analysis  │  │ Reconcile   │            │
│  │             │  │     API     │  │     API     │            │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘            │
│         │                 │                 │                    │
│  ┌──────┴──────┐  ┌──────┴──────┐  ┌──────┴──────┐            │
│  │  Occupancy  │  │ Predictive  │  │   Upload    │            │
│  │     API     │  │ Modelling   │  │     API     │            │
│  │             │  │     API     │  │             │            │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘            │
└─────────┼─────────────────┼─────────────────┼──────────────────┘
          │                 │                 │
          └─────────────────┼─────────────────┘
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│                    ANALYTICS ENGINE                              │
│            (Core Business Logic - analytics-engine.ts)           │
│                                                                   │
│  ┌──────────────────┐  ┌──────────────────┐                    │
│  │  Lease Risk      │  │  Transaction     │                    │
│  │  Scoring Module  │  │  Reconciliation  │                    │
│  │                  │  │  Module          │                    │
│  └──────────────────┘  └──────────────────┘                    │
│                                                                   │
│  ┌──────────────────┐  ┌──────────────────┐                    │
│  │  Occupancy       │  │  Predictive      │                    │
│  │  Analysis Module │  │  ML Module       │                    │
│  │                  │  │                  │                    │
│  └──────────────────┘  └──────────────────┘                    │
└─────────────────────────┬───────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────────┐
│                    DATA ACCESS LAYER                             │
│                  (Prisma ORM - Type-Safe Queries)                │
└─────────────────────────┬───────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────────┐
│                    DATABASE LAYER                                │
│                  (MySQL/PostgreSQL)                              │
│                                                                   │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐       │
│  │Properties│  │  Leases  │  │Transaction│ │Occupancy │       │
│  │          │  │          │  │           │  │   Data   │       │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘       │
│                                                                   │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐       │
│  │Predictive│  │ Analyses │  │  Uploads │  │  Users   │       │
│  │   Data   │  │          │  │          │  │          │       │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘       │
└─────────────────────────────────────────────────────────────────┘
```

### 2.2 Module Interaction Flow

```
User Upload → Data Validation → Database Storage → Analytics Engine → Results Storage → Dashboard Display

Example Flow:
1. User uploads lease_contracts.csv
2. Upload API validates CSV format and required fields
3. Data processor parses and transforms data
4. Prisma stores records in Leases table
5. Analytics engine calculates risk scores
6. Results stored in Analyses table
7. Frontend fetches and displays results with charts
```

### 2.3 Component Architecture

#### Frontend Components
```
src/
├── app/
│   ├── dashboard/
│   │   ├── portfolio/page.tsx          → Portfolio overview
│   │   └── modules/
│   │       ├── lease-analysis/         → Lease risk module
│   │       ├── transactions/           → Transaction reconciliation
│   │       ├── occupancy/              → Space utilization
│   │       └── predictive-modelling/   → ML forecasting
│   └── api/                             → REST API endpoints
├── components/
│   ├── charts/                          → Recharts visualizations
│   ├── layout/                          → Dashboard shell
│   ├── modals/                          → Upload dialogs
│   └── tables/                          → Data grids
└── lib/
    ├── analytics-engine.ts              → Core algorithms
    ├── dataProcessor.ts                 → CSV parsing
    └── validations.ts                   → Input validation
```

---

## 3. Key Modules

### 3.1 Simulation Engine

**Location**: `src/lib/analytics-engine.ts`

**Purpose**: Core computational engine that processes property, lease, transaction, and occupancy data to generate risk scores, predictions, and recommendations.

**Key Functions**:
- `calculateLeaseRiskScores()` - Lease risk analysis
- `reconcileTransactions()` - Payment matching
- `calculateOccupancyScore()` - Space utilization
- `runPredictiveModels()` - ML forecasting

**Processing Model**:
```
Input Data → Feature Engineering → Algorithm Application → Scoring → Classification → Output
```

### 3.2 Regulatory-Data Layer

**Location**: `src/lib/dataProcessor.ts`, Prisma Schema

**Purpose**: Handles data validation, transformation, and storage with regulatory compliance checks.

**Key Features**:
- CSV parsing with schema validation
- Type-safe database queries via Prisma
- Audit trail via Upload and Analysis tables
- GDPR-compliant user data handling

**Validation Rules**:
- Required field checks
- Data type validation
- Range validation (e.g., occupancy 0-100%)
- Date format validation
- Cross-reference validation (property IDs, tenant IDs)

### 3.3 Predictive-Scoring Module

**Location**: `src/lib/analytics-engine.ts` (lines 873-1054)

**Purpose**: ML-inspired predictive modeling for asset classification and risk forecasting.

**Algorithm Components**:
1. **Feature Engineering**
   - Lease duration ratios
   - Property type encoding
   - Location risk indexing

2. **ML Model Simulation** (Gradient Boosted Trees approach)
   - Lease renewal probability
   - EPC deterioration risk
   - Forecasted occupancy rate
   - Risk-adjusted rent forecast

3. **Weighted Scoring System**
   - EPC Risk: 40%
   - Occupancy Forecast: 30%
   - Rent Stability: 30%
   - Total Score: 0-100

4. **Asset Classification**
   - High Risk: < 40
   - Moderate: 40-70
   - Stable: > 70

### 3.4 Transaction Reconciliation Module

**Location**: `src/lib/analytics-engine.ts` (lines 540-882)

**Purpose**: Automated payment matching and anomaly detection.

**Key Algorithms**:
- Amount range validation (± threshold)
- Due date verification
- Early/late payment flagging
- Risk scoring based on payment patterns

**Reconciliation Rules**:
```
IF transaction.amount ≈ lease.expected_amount (±5%)
   AND transaction.date ≈ lease.due_date (±3 days)
   AND transaction.tenant_id = lease.tenant_id
THEN → Reconciled
ELSE → Flagged for review
```

### 3.5 Occupancy Intelligence Module

**Location**: `src/lib/analytics-engine.ts` (lines 1102-1418)

**Purpose**: Space utilization analysis with IoT sensor integration and lease compliance monitoring.

**Data Sources**:
- Desk usage sensors
- Badge-in/access control systems
- Meeting room booking systems
- Lighting/HVAC usage patterns
- Historical occupancy logs

**Analysis Framework**:
1. Baseline calculation (historical averages)
2. Current usage measurement (sensor data)
3. Utilization ratio calculation
4. Classification (Efficient/Underutilised/Overcrowded)
5. Lease compliance checking
6. Trend detection and forecasting

---

## 4. Analytics Engine Workflow

### 4.1 Overall Workflow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                        DATA INGESTION                            │
│                                                                   │
│  CSV Upload → Validation → Parsing → Database Storage            │
│                                                                   │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                    ANALYTICS ENGINE TRIGGER                      │
│                                                                   │
│  Auto-trigger or Manual → Fetch Data → Route to Module           │
│                                                                   │
└────────────────────────────┬────────────────────────────────────┘
                             │
         ┌───────────────────┼───────────────────┬────────────────┐
         │                   │                   │                │
         ▼                   ▼                   ▼                ▼
┌─────────────────┐ ┌─────────────────┐ ┌─────────────┐ ┌──────────────┐
│  LEASE RISK     │ │  TRANSACTION    │ │  OCCUPANCY  │ │  PREDICTIVE  │
│  SCORING        │ │  RECONCILIATION │ │  ANALYSIS   │ │  MODELLING   │
│                 │ │                 │ │             │ │              │
│ • EPC Score     │ │ • Match Txns    │ │ • Sensors   │ │ • Features   │
│ • Void Risk     │ │ • Validate      │ │ • Baseline  │ │ • ML Sim     │
│ • Rent Risk     │ │ • Flag Issues   │ │ • Ratio     │ │ • Scoring    │
│ • Demand        │ │ • Risk Score    │ │ • Classify  │ │ • Classify   │
│ • Occupancy     │ │ • Aggregate     │ │ • Trends    │ │              │
│                 │ │                 │ │             │ │              │
│ Output:         │ │ Output:         │ │ Output:     │ │ Output:      │
│ Risk Score 0-100│ │ Reconciled/     │ │ Utilization │ │ Total Score  │
│ Action: Dispose/│ │ Unreconciled    │ │ Efficient/  │ │ Stable/Mod/  │
│ Monitor/Retain  │ │ Anomalies List  │ │ Under/Over  │ │ High Risk    │
└────────┬────────┘ └────────┬────────┘ └──────┬──────┘ └──────┬───────┘
         │                   │                  │               │
         └───────────────────┼──────────────────┴───────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                    RESULTS AGGREGATION                           │
│                                                                   │
│  Combine Results → Calculate Summaries → Store in DB             │
│                                                                   │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                    PRESENTATION LAYER                            │
│                                                                   │
│  Fetch Results → Transform for UI → Render Charts & Tables       │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

### 4.2 Module-Specific Workflows

#### 4.2.1 Lease Risk Scoring Workflow

```
START
  │
  ├─→ Fetch Lease Data (leases, properties, market_data)
  │
  ├─→ FOR EACH lease:
  │     │
  │     ├─→ Get Property Details (EPC, maintenance, occupancy)
  │     │
  │     ├─→ Get Market Data (demand_index for location)
  │     │
  │     ├─→ CALCULATE COMPONENT SCORES:
  │     │     • epc_score = EPC_WEIGHT[epc_rating]
  │     │     • void_score = min(avg_void_months * 3, 30)
  │     │     • rent_score = rent_uplift_risk * 10
  │     │     • demand_score = 10 - min(demand_index / 10, 10)
  │     │     • occupancy_score = (1 - occupancy_rate) * 20
  │     │
  │     ├─→ lease_risk_score = SUM(all scores)
  │     │
  │     ├─→ CLASSIFY:
  │     │     IF score > 70: action = "Dispose or Retrofit"
  │     │     ELSE IF score > 40: action = "Monitor Closely"
  │     │     ELSE: action = "Low Risk"
  │     │
  │     └─→ STORE: {lease_id, risk_score, action, components}
  │
  ├─→ GENERATE INTERVENTIONS (prioritize by risk score DESC)
  │
  ├─→ SAVE to Analyses table (strategy='lease-risk')
  │
  └─→ RETURN {leases_with_scores, summary, interventions}
END
```

#### 4.2.2 Transaction Reconciliation Workflow

```
START
  │
  ├─→ Fetch Transactions & Leases
  │
  ├─→ FOR EACH transaction:
  │     │
  │     ├─→ FIND matching lease:
  │     │     WHERE lease.tenant_id = txn.tenant_id
  │     │     AND lease.property_id = txn.property_id
  │     │     AND txn.date BETWEEN lease.start AND lease.end
  │     │
  │     ├─→ IF no lease found:
  │     │     └─→ FLAG as 'no_lease_match'
  │     │
  │     ├─→ IF lease found:
  │     │     │
  │     │     ├─→ Calculate expected_amount (from lease.monthly_rent)
  │     │     │
  │     │     ├─→ Compare txn.amount vs expected:
  │     │     │     amount_variance = |actual - expected| / expected
  │     │     │     IF variance > 10%:
  │     │     │       └─→ FLAG as 'amount_mismatch'
  │     │     │
  │     │     ├─→ Check due_date vs transaction_date:
  │     │     │     days_late = transaction_date - due_date
  │     │     │     IF days_late > 0:
  │     │     │       └─→ FLAG as 'late_payment'
  │     │     │
  │     │     └─→ IF all checks pass:
  │     │           └─→ MARK as 'reconciled'
  │     │
  │     └─→ CALCULATE risk_score:
  │           base_score + late_fee_factor + anomaly_weight
  │
  ├─→ AGGREGATE by property/tenant (totals, counts, avg_risk)
  │
  ├─→ CREATE summary views (by property, by period)
  │
  ├─→ SAVE to Analyses table (strategy='transactions')
  │
  └─→ RETURN {reconciled, unreconciled, risk_scores, summary}
END
```

#### 4.2.3 Occupancy Analysis Workflow

```
START
  │
  ├─→ Fetch Occupancy Data (sensor_data, leases, historical_logs)
  │
  ├─→ FOR EACH property:
  │     │
  │     ├─→ CALCULATE baselineOccupancy:
  │     │     avg(historical_logs.last_3_months)
  │     │
  │     ├─→ CALCULATE currentUsage:
  │     │     weighted_avg(desk_usage, badge_ins, meeting_rooms, lighting)
  │     │
  │     ├─→ utilizationRatio = currentUsage / baselineOccupancy
  │     │
  │     ├─→ CLASSIFY:
  │     │     IF ratio > 1.2: "Overcrowded"
  │     │     ELSE IF ratio < 0.5: "Underutilised"
  │     │     ELSE: "Efficient"
  │     │
  │     ├─→ CHECK lease compliance:
  │     │     • Max occupancy violations
  │     │     • Unauthorized subletting
  │     │     • Co-working restrictions
  │     │     IF violation: leaseBreach = true
  │     │
  │     ├─→ DETECT trends (compare 3/6/12 month averages):
  │     │     Pattern: Stable/Growth/Decline/Recovery/Cooling/Volatile
  │     │     Direction: Increasing/Decreasing/Stable
  │     │
  │     ├─→ occupancy_score = round(currentUsage * 100, 2)
  │     │     IF leaseBreach: score *= 0.8 (20% penalty)
  │     │
  │     ├─→ GENERATE recommendations (based on classification + breach)
  │     │
  │     └─→ IDENTIFY risk_factors
  │
  ├─→ AGGREGATE summary (total, avg_score, counts by classification)
  │
  ├─→ SAVE to Analyses table (strategy='occupancy')
  │
  └─→ RETURN {analyses, summary}
END
```

#### 4.2.4 Predictive Modelling Workflow

```
START
  │
  ├─→ Fetch Property Data (purchase_price, dates, EPC, occupancy, market)
  │
  ├─→ FOR EACH property:
  │     │
  │     ├─→ FEATURE ENGINEERING:
  │     │     • leaseDurationRatio = (expiry - purchase) / years_elapsed
  │     │     • propertyTypeScore = encode(type) → {industrial: 0.9, office: 0.7, ...}
  │     │     • locationRiskIndex = f(marketDemand, gdp, inflation, interest)
  │     │
  │     ├─→ ML MODEL SIMULATION (Gradient Boosted Trees approach):
  │     │     │
  │     │     ├─→ renewalProbability:
  │     │     │     base = 0.7
  │     │     │     + leaseDurationRatio impact
  │     │     │     + occupancy_rate impact
  │     │     │     + marketDemand impact
  │     │     │     + maintenance_score impact
  │     │     │
  │     │     ├─→ epcDeteriorationScore:
  │     │     │     base = EPC_RISK[epc_rating]
  │     │     │     + propertyAge impact
  │     │     │     + maintenance_score impact
  │     │     │     → Classify: High/Med/Low
  │     │     │
  │     │     ├─→ forecastedOccupancy:
  │     │     │     current_occupancy
  │     │     │     + seasonalFactor
  │     │     │     + marketTrend
  │     │     │     + maintenanceImpact
  │     │     │
  │     │     └─→ riskAdjustedRent:
  │     │           market_rent * (1 + gdp_growth)
  │     │           * marketDemand_factor
  │     │           * forecastedOccupancy_factor
  │     │
  │     ├─→ WEIGHTED SCORING SYSTEM:
  │     │     epcComponent = (100 - epcRisk) * 0.40
  │     │     occupancyComponent = forecastedOccupancy * 0.30
  │     │     rentComponent = min(riskAdjRent/marketRent, 1.2) * 100 * 0.30
  │     │     total_score = SUM(components)
  │     │
  │     ├─→ ASSET CLASSIFICATION:
  │     │     IF total_score < 40: "High Risk"
  │     │     ELSE IF total_score < 70: "Moderate"
  │     │     ELSE: "Stable"
  │     │
  │     └─→ STORE: {property_id, all_scores, classification, confidence}
  │
  ├─→ AGGREGATE summary (avg_score, counts by classification)
  │
  ├─→ SAVE to Analyses table (strategy='predictive')
  │
  └─→ RETURN {predictions, summary}
END
```

---

## 5. Algorithm Specifications

### 5.1 Lease Risk Scoring Algorithm

**Location**: `src/lib/analytics-engine.ts::calculateLeaseRiskScores()`

**Purpose**: Calculate risk score (0-100) for each lease based on property and market factors.

**Inputs**:
- `leases[]` - Lease contracts with property references
- `properties[]` - Property details (EPC, maintenance, occupancy)
- `market_data[]` - Local demand indices

**Algorithm**:
```typescript
function calculateLeaseRiskScore(lease, property, marketData): RiskScore {
  // 1. EPC Rating Score (0-50)
  const EPC_WEIGHTS = {A: 0, B: 5, C: 10, D: 20, E: 30, F: 40, G: 50};
  const epc_score = EPC_WEIGHTS[property.epc_rating] || 25;
  
  // 2. Void Period Risk (0-30)
  const avg_void_months = max(0, 10 - property.maintenance_score);
  const void_score = min(avg_void_months * 3, 30);
  
  // 3. Rent Uplift Risk (0-10)
  const rent_uplift_risk = property.noi && property.current_value
    ? min(1, max(0, 1 - (property.noi / (property.current_value * 0.05))))
    : 0.5;
  const rent_score = rent_uplift_risk * 10;
  
  // 4. Local Demand Score (0-10, inverse)
  let local_demand_index = 50; // default
  if (marketData) {
    local_demand_index = marketData.demand_index > 1 
      ? marketData.demand_index 
      : marketData.demand_index * 100;
  }
  const demand_score = 10 - min(local_demand_index / 10, 10);
  
  // 5. Occupancy Risk (0-20)
  const occupancy_score = (1 - property.occupancy_rate) * 20;
  
  // TOTAL RISK SCORE
  const lease_risk_score = epc_score + void_score + rent_score 
                         + demand_score + occupancy_score;
  
  // RECOMMENDED ACTION
  let recommended_action;
  if (lease_risk_score > 70) {
    recommended_action = "Dispose or Retrofit";
  } else if (lease_risk_score > 40) {
    recommended_action = "Monitor Closely";
  } else {
    recommended_action = "Low Risk - Retain";
  }
  
  return {
    lease_id: lease.id,
    lease_risk_score,
    recommended_action,
    epc_score,
    void_score,
    rent_score,
    demand_score,
    occupancy_score,
    // Additional metadata
    avg_void_months,
    rent_uplift_risk,
    local_demand_index
  };
}
```

**Outputs**:
- `lease_risk_score` (0-100): Composite risk score
- `recommended_action`: "Dispose or Retrofit" | "Monitor Closely" | "Low Risk"
- Component scores for transparency
- Metadata for further analysis

**Risk Thresholds**:
- **0-40**: Low Risk - Retain
- **41-70**: Medium Risk - Monitor Closely
- **71-100**: High Risk - Dispose or Retrofit

---

### 5.2 Transaction Reconciliation Algorithm

**Location**: `src/lib/analytics-engine.ts::reconcileTransactions()`

**Purpose**: Match transactions against expected lease payments and flag anomalies.

**Inputs**:
- `transactions[]` - Payment records
- `leases[]` - Active lease contracts

**Algorithm**:
```typescript
function reconcileTransactions(transactions, leases): ReconciliationResult {
  const reconciled = [];
  const unreconciled = [];
  
  for (const txn of transactions) {
    // 1. Find matching lease
    const matchingLease = leases.find(lease => 
      lease.tenant_id === txn.tenant_id &&
      lease.property_id === txn.property_id &&
      txn.transaction_date >= lease.startDate &&
      txn.transaction_date <= lease.endDate
    );
    
    if (!matchingLease) {
      // No lease found - flag for review
      unreconciled.push({
        ...txn,
        reason: 'no_lease_match',
        details: 'No active lease found for this transaction'
      });
      continue;
    }
    
    // 2. Calculate expected amount
    const expected_amount = matchingLease.monthly_rent;
    
    // 3. Amount validation (±10% tolerance)
    const amount_variance = Math.abs(txn.amount - expected_amount) / expected_amount;
    
    if (amount_variance > 0.10) {
      unreconciled.push({
        ...txn,
        reason: 'amount_mismatch',
        expected: expected_amount,
        actual: txn.amount,
        variance_percent: amount_variance * 100
      });
      continue;
    }
    
    // 4. Due date validation
    const due_date = new Date(matchingLease.payment_due_date);
    const txn_date = new Date(txn.transaction_date);
    const days_difference = (txn_date - due_date) / (1000 * 60 * 60 * 24);
    
    // 5. Classify payment timing
    let timing_flag = 'on_time';
    if (days_difference < -3) {
      timing_flag = 'early';
    } else if (days_difference > 3) {
      timing_flag = 'late';
    }
    
    // 6. Transaction reconciled
    reconciled.push({
      ...txn,
      lease_id: matchingLease.id,
      expected_amount,
      timing: timing_flag,
      days_difference
    });
  }
  
  return { reconciled, unreconciled };
}
```

**Risk Scoring**:
```typescript
function calculateTransactionRisk(transaction, timing): number {
  // Base score by transaction type
  const BASE_SCORES = {
    'Rent': 10,
    'Service Charge': 5,
    'Utilities': 3,
    'Deposit': 15,
    'Other': 5
  };
  let base_score = BASE_SCORES[transaction.type] || 5;
  
  // Late payment penalty
  const days_late = max(0, timing.days_difference);
  const late_fee_factor = min(days_late * 2, 30);
  
  // Amount variance penalty
  const amount_variance = transaction.variance_percent || 0;
  const anomaly_weight = amount_variance > 10 ? amount_variance : 0;
  
  // Total risk
  return base_score + late_fee_factor + anomaly_weight;
}
```

**Outputs**:
- `reconciled[]` - Successfully matched transactions
- `unreconciled[]` - Flagged anomalies with reasons
- `risk_scores[]` - Risk rating per transaction
- `summary` - Aggregated statistics

---

### 5.3 Occupancy Analysis Algorithm

**Location**: `src/lib/analytics-engine.ts::calculateOccupancyScore()`

**Purpose**: Analyze space utilization and classify properties.

**Inputs**:
- `occupancy_sensor_data` - Desk usage, badge-ins, meeting rooms, lighting
- `lease_terms` - Max occupancy, subletting rules, co-working restrictions
- `historical_logs` - 3/6/12-month averages
- `tenant_info` - Business type, headcount

**Algorithm**:
```typescript
function calculateOccupancyScore(data): OccupancyAnalysis {
  // 1. BASELINE OCCUPANCY (historical average)
  const baseline = average([
    data.historical_logs.avg_occupancy_3_months,
    data.historical_logs.avg_occupancy_6_months,
    data.historical_logs.avg_occupancy_12_months
  ]);
  
  // 2. CURRENT USAGE (from sensors)
  const desk_weight = 0.40;
  const badge_weight = 0.30;
  const meeting_weight = 0.20;
  const lighting_weight = 0.10;
  
  const current_usage = 
    (data.sensor_data.desk_usage * desk_weight) +
    ((data.sensor_data.badge_ins / data.tenant_info.headcount_estimate) * 100 * badge_weight) +
    (data.sensor_data.meeting_room_usage * meeting_weight) +
    (data.sensor_data.lighting_usage * lighting_weight);
  
  // 3. UTILIZATION RATIO
  const utilization_ratio = current_usage / baseline;
  
  // 4. CLASSIFICATION
  let classification;
  if (utilization_ratio > 1.2) {
    classification = "Overcrowded";
  } else if (utilization_ratio < 0.5) {
    classification = "Underutilised";
  } else {
    classification = "Efficient";
  }
  
  // 5. LEASE COMPLIANCE CHECK
  const lease_breach = checkLeaseCompliance(
    data.lease_terms, 
    current_usage, 
    data.tenant_info
  );
  
  // 6. TREND DETECTION
  const trend = detectTrend(data.historical_logs);
  
  // 7. OCCUPANCY SCORE (with penalty for breach)
  let occupancy_score = round(current_usage, 2);
  if (lease_breach.breach) {
    occupancy_score *= 0.8; // 20% penalty
  }
  
  // 8. RECOMMENDATIONS
  const recommendations = generateRecommendations(
    classification, 
    lease_breach, 
    trend
  );
  
  // 9. RISK FACTORS
  const risk_factors = identifyRisks(
    classification, 
    lease_breach, 
    utilization_ratio, 
    trend
  );
  
  return {
    property_id: data.property_id,
    occupancy_score,
    utilization_classification: classification,
    lease_breach: lease_breach.breach,
    breach_details: lease_breach.details,
    predicted_future_pattern: trend.pattern,
    trend_direction: trend.direction,
    recommendations,
    risk_factors,
    baseline_occupancy: baseline,
    current_usage,
    utilization_ratio
  };
}
```

**Lease Compliance Checks**:
```typescript
function checkLeaseCompliance(lease_terms, current_usage, tenant_info): ComplianceResult {
  const violations = [];
  
  // Max occupancy check
  if (tenant_info.actual_headcount > lease_terms.max_occupancy) {
    violations.push(`Exceeds max occupancy: ${tenant_info.actual_headcount} > ${lease_terms.max_occupancy}`);
  }
  
  // Subletting check
  if (!lease_terms.subletting_allowed && 
      tenant_info.actual_headcount > tenant_info.headcount_estimate * 1.3) {
    violations.push('Potential unauthorized subletting detected');
  }
  
  // Co-working restriction check
  if (lease_terms.coworking_restrictions && current_usage > 90) {
    violations.push('High usage may violate co-working restrictions');
  }
  
  return {
    breach: violations.length > 0,
    details: violations
  };
}
```

**Outputs**:
- `occupancy_score` (0-100%): Current utilization level
- `utilization_classification`: Overcrowded/Underutilised/Efficient
- `lease_breach`: Boolean + details
- `predicted_future_pattern`: Stable/Growth/Decline/etc.
- `trend_direction`: Increasing/Decreasing/Stable
- `recommendations[]`: Actionable suggestions
- `risk_factors[]`: Identified risks

---

### 5.4 Predictive Modelling Algorithm

**Location**: `src/lib/analytics-engine.ts::runPredictiveModels()`

**Purpose**: ML-inspired forecasting for asset classification and risk prediction.

**Inputs**:
- Property data (purchase, valuation, EPC, maintenance)
- Lease data (expiry dates, rental rates)
- Market data (GDP, inflation, interest rates, demand)

**Algorithm**:
```typescript
function runPredictiveModels(properties, market_data): PredictiveResults {
  const predictions = [];
  
  for (const property of properties) {
    // 1. FEATURE ENGINEERING
    const property_age = years_between(property.purchase_date, now());
    const years_to_expiry = years_between(now(), property.lease_expiry_date);
    const lease_duration_ratio = years_to_expiry / property_age;
    
    const property_type_score = {
      'industrial': 0.9,
      'office': 0.7,
      'residential': 0.6,
      'retail': 0.4
    }[property.type.toLowerCase()] || 0.6;
    
    const location_risk_index = 
      (market_data.demand_index * 0.4) +
      ((100 - market_data.gdp_growth * 10) * 0.3) +
      ((100 - market_data.inflation_rate * 10) * 0.2) +
      ((100 - market_data.interest_rate * 2) * 0.1);
    
    // 2. ML MODEL SIMULATION (Gradient Boosted Trees approach)
    
    // 2a. Lease Renewal Probability
    let renewal_prob = 0.7; // base
    renewal_prob += (lease_duration_ratio > 0.5 ? 0.1 : -0.1);
    renewal_prob += (property.occupancy_rate - 0.85) * 0.5;
    renewal_prob += (market_data.demand_index / 100 - 0.5) * 0.3;
    renewal_prob += (property.maintenance_score / 10 - 0.7) * 0.2;
    renewal_prob = clamp(renewal_prob, 0, 1);
    
    // 2b. EPC Deterioration Risk
    const EPC_RISK = {A: 5, B: 10, C: 20, D: 35, E: 50, F: 70, G: 90};
    let epc_risk = EPC_RISK[property.epc_rating] || 30;
    epc_risk += property_age * 2;
    epc_risk -= (property.maintenance_score - 5) * 3;
    epc_risk = clamp(epc_risk, 0, 100);
    
    const predicted_epc_risk = 
      epc_risk < 30 ? 'Low' : 
      epc_risk < 60 ? 'Med' : 'High';
    
    // 2c. Forecasted Occupancy Rate
    const seasonal_factor = 0.02; // 2% seasonal variance
    const market_trend = (market_data.gdp_growth - 2) * 0.01;
    const maintenance_impact = (property.maintenance_score - 7) * 0.01;
    
    let forecasted_occupancy = property.occupancy_rate;
    forecasted_occupancy += seasonal_factor + market_trend + maintenance_impact;
    forecasted_occupancy = clamp(forecasted_occupancy, 0, 1);
    
    // 2d. Risk-Adjusted Rent Forecast
    const market_rent = property.market_rent || property.monthly_rent;
    let risk_adjusted_rent = market_rent * (1 + market_data.gdp_growth / 100);
    risk_adjusted_rent *= (0.8 + market_data.demand_index / 100 * 0.4);
    risk_adjusted_rent *= (0.9 + forecasted_occupancy * 0.2);
    
    // 3. WEIGHTED SCORING SYSTEM
    const epc_component = (100 - epc_risk) * 0.40;
    const occupancy_component = forecasted_occupancy * 100 * 0.30;
    const rent_stability = min(risk_adjusted_rent / market_rent, 1.2);
    const rent_component = rent_stability * 100 * 0.30;
    
    const total_score = epc_component + occupancy_component + rent_component;
    
    // 4. ASSET CLASSIFICATION
    let asset_classification;
    if (total_score < 40) {
      asset_classification = 'High Risk';
    } else if (total_score < 70) {
      asset_classification = 'Moderate';
    } else {
      asset_classification = 'Stable';
    }
    
    // 5. CONFIDENCE CALCULATION
    const data_completeness = 
      (property.purchase_date ? 0.2 : 0) +
      (property.epc_rating ? 0.2 : 0) +
      (property.maintenance_score ? 0.2 : 0) +
      (property.occupancy_rate ? 0.2 : 0) +
      (market_data ? 0.2 : 0);
    
    const confidence = round(data_completeness * 100, 1);
    
    predictions.push({
      property_id: property.id,
      property_name: property.name,
      lease_renewal_probability: round(renewal_prob * 100, 1),
      predicted_epc_risk,
      forecasted_occupancy_rate: round(forecasted_occupancy * 100, 1),
      risk_adjusted_rent_forecast: round(risk_adjusted_rent, 0),
      total_score: round(total_score, 1),
      asset_classification,
      confidence,
      // Component scores for transparency
      epc_component: round(epc_component, 1),
      occupancy_component: round(occupancy_component, 1),
      rent_component: round(rent_component, 1),
      // Risk factors
      risk_factors: identifyPredictiveRisks(property, total_score, epc_risk),
      // Economic context
      economic_factors: {
        gdp_growth: market_data.gdp_growth,
        inflation_rate: market_data.inflation_rate,
        interest_rate: market_data.interest_rate,
        market_demand: market_data.demand_index
      }
    });
  }
  
  // Aggregate summary
  const summary = {
    total_properties: predictions.length,
    stable_count: predictions.filter(p => p.asset_classification === 'Stable').length,
    moderate_count: predictions.filter(p => p.asset_classification === 'Moderate').length,
    high_risk_count: predictions.filter(p => p.asset_classification === 'High Risk').length,
    avg_total_score: average(predictions.map(p => p.total_score)),
    avg_confidence: average(predictions.map(p => p.confidence))
  };
  
  return { predictions, summary };
}
```

**Outputs**:
- `lease_renewal_probability` (%): Likelihood of renewal
- `predicted_epc_risk`: Low/Med/High deterioration risk
- `forecasted_occupancy_rate` (%): 12-month forecast
- `risk_adjusted_rent_forecast` (£): Expected market rent
- `total_score` (0-100): Composite weighted score
- `asset_classification`: High Risk/Moderate/Stable
- `confidence` (%): Prediction reliability
- Component scores for transparency
- Risk factors and economic context

---

## 6. Data Flow & Processing

### 6.1 CSV Upload Flow

```
User Selects File → Frontend Validation → FormData Creation → API Call
                                                                  │
                                            ┌─────────────────────┘
                                            ▼
                                      API Route (/api/upload)
                                            │
                                            ├─→ Authentication Check
                                            ├─→ File Type Validation
                                            ├─→ File Size Check
                                            └─→ Parse CSV
                                                    │
                                        ┌───────────┴────────────┐
                                        ▼                        ▼
                                  Valid Data              Invalid Data
                                        │                        │
                                        ├─→ Transform            └─→ Return Error
                                        ├─→ Create Upload Record
                                        ├─→ Batch Insert (Prisma)
                                        └─→ Return Success
                                                    │
                                        ┌───────────┴────────────┐
                                        ▼                        ▼
                                  Frontend Toast         Auto-trigger Analysis
                                  "Upload Success"       (if enabled for module)
```

### 6.2 Analysis Execution Flow

```
User Clicks "Analyze" / Auto-trigger
            │
            ▼
      API Call (POST /api/*/analyze)
            │
            ├─→ Fetch Raw Data (Prisma queries)
            │     • Properties
            │     • Leases
            │     • Transactions
            │     • Market Data
            │
            ├─→ Data Transformation
            │     • Format dates
            │     • Calculate derived fields
            │     • Enrich with relationships
            │
            ├─→ Analytics Engine Invocation
            │     • Route to appropriate module function
            │     • Pass formatted data
            │
            ├─→ Algorithm Execution
            │     • Component calculations
            │     • Scoring
            │     • Classification
            │     • Aggregation
            │
            ├─→ Save Results (Prisma)
            │     • Create Analysis record
            │     • Link to Upload and User
            │     • Store as JSON in results field
            │
            └─→ Return to Frontend
                  • Success status
                  • Analysis results
                  • Summary statistics
                        │
                        ▼
                  Update UI
                  • Populate tables
                  • Render charts
                  • Display metrics
                  • Show recommendations
```

### 6.3 Dashboard Data Flow

```
Page Load / Refresh
      │
      ├─→ Parallel API Calls:
      │     ├─→ GET /api/*/data (raw data)
      │     └─→ GET /api/*/analyze (latest analysis)
      │
      ├─→ Data Arrives
      │     • Raw data for tables
      │     • Analysis results for metrics
      │
      ├─→ Frontend Processing
      │     • Apply filters (search, type, risk)
      │     • Sort data
      │     • Calculate client-side metrics
      │     • Transform for charts
      │
      └─→ Render Components
            ├─→ Header with metrics
            ├─→ Charts (Recharts)
            ├─→ Tables with pagination
            ├─→ Filters and controls
            └─→ Export buttons
```

---

## 7. User Workflow

### 7.1 Complete User Journey

```
┌──────────────────────────────────────────────────────────────────┐
│ STEP 1: AUTHENTICATION                                           │
└──────────────────────────────────────────────────────────────────┘
User visits app → Redirected to /auth/signin
                       ↓
Enter credentials → NextAuth validates
                       ↓
Success → Redirect to /dashboard → Session created

┌──────────────────────────────────────────────────────────────────┐
│ STEP 2: DASHBOARD OVERVIEW                                       │
└──────────────────────────────────────────────────────────────────┘
Dashboard displays:
• Welcome message
• Quick stats (if data exists)
• Module cards with navigation
• Recent activity

User selects module → Navigate to module page

┌──────────────────────────────────────────────────────────────────┐
│ STEP 3: DATA UPLOAD                                              │
└──────────────────────────────────────────────────────────────────┘
Module page (e.g., /dashboard/modules/lease-analysis)
                       ↓
User clicks "Upload Data" → Modal opens
                       ↓
User downloads template (optional) → CSV template provided
                       ↓
User selects CSV file → File picker
                       ↓
User clicks "Upload" → Validation starts
                       ↓
                 ┌─────┴─────┐
                 ▼           ▼
           Valid File    Invalid File
                 │           │
                 │           └─→ Error message
                 │               "Missing required field: X"
                 │
                 ↓
           Upload progresses → Progress indicator
                 ↓
           Success → Toast notification
                     "20 records uploaded successfully"

┌──────────────────────────────────────────────────────────────────┐
│ STEP 4: ANALYSIS EXECUTION                                       │
└──────────────────────────────────────────────────────────────────┘
After upload (or user clicks "Analyze" / "Run Analysis")
                       ↓
Loading state displayed → Spinner + "Analyzing..."
                       ↓
API processes data → Analytics engine runs
                       ↓
Results returned → Loading state ends
                       ↓
Dashboard updates:
• Metrics cards refresh
• Tables populate
• Charts render
• Recommendations display

┌──────────────────────────────────────────────────────────────────┐
│ STEP 5: DATA EXPLORATION                                         │
└──────────────────────────────────────────────────────────────────┘
User interacts with data:
• Use search bar → Filter properties
• Apply filters → Type, Risk, Location
• Click tabs → Switch views (Overview, Analysis, Recommendations)
• Hover charts → View details
• Sort tables → Click column headers
• Click rows → View property details

┌──────────────────────────────────────────────────────────────────┐
│ STEP 6: INSIGHTS & ACTIONS                                       │
└──────────────────────────────────────────────────────────────────┘
Review analysis results:
• High-risk properties identified
• Recommendations provided
• Anomalies flagged
• Trends highlighted

User actions:
• Click "Export" → Download CSV/Excel
• Click "Refresh" → Re-run analysis
• Click property → View detailed report
• Navigate to related module → Cross-module analysis

┌──────────────────────────────────────────────────────────────────┐
│ STEP 7: CROSS-MODULE NAVIGATION                                  │
└──────────────────────────────────────────────────────────────────┘
User explores related data:
Lease Analysis → Check Transactions → Review Occupancy → Predictive Forecast

All modules maintain context via shared property/tenant IDs
```

### 7.2 Module-Specific Workflows

#### Portfolio Analysis Workflow
```
1. Upload portfolio_properties.csv
2. View portfolio overview (20 properties displayed)
3. Review key metrics (Total value, Avg occupancy, Risk distribution)
4. Filter by property type or location
5. Sort by occupancy or value
6. Click property → View details
7. Export portfolio report
```

#### Lease Analysis Workflow
```
1. Upload lease_contracts.csv
2. System auto-analyzes risk scores
3. View "Lease Risk Analysis Results"
   • Summary metrics
   • Intervention priorities (sorted by risk)
4. Switch to "Lease Overview" tab
   • View all leases with expiry warnings
5. Switch to "Risk Scores" tab
   • Detailed risk breakdown per lease
6. Switch to "Recommendations" tab
   • Actionable suggestions per property
7. Export lease risk report
```

#### Transactions Workflow
```
1. Upload property_transactions.csv
2. System auto-reconciles against leases
3. View key stats (Reconciled %, Anomalies, Volume)
4. Switch tabs:
   • Ledger: All transactions
   • History: Chronological view
   • Anomalies: Flagged issues (amount mismatch, late payments)
   • Unreconciled: All unmatched transactions
   • Property Report: Aggregated by property
5. Click anomaly → View details
6. Export reconciliation report
```

#### Occupancy Workflow
```
1. Upload occupancy_data.csv (with sensor data)
2. System analyzes utilization and compliance
3. View metrics (Efficient, Underutilised, Overcrowded, Breaches)
4. Switch tabs:
   • Overview: All properties with classification
   • Analysis: Detailed utilization breakdown
   • Recommendations: Actionable suggestions
5. Review lease breach alerts
6. Check trend predictions (Growth/Decline/Stable)
7. Export occupancy report
```

#### Predictive Modelling Workflow
```
1. Upload predictive_inputs.csv
2. System runs ML simulation
3. View metrics (Stable, Moderate, High Risk, Avg Score)
4. Switch tabs:
   • Predictions: All forecasts with classification
   • Scoring Details: Component breakdown (EPC, Occupancy, Rent)
   • Key Insights: Model performance and trends
5. Review renewal probabilities
6. Check EPC deterioration risks
7. Analyze forecasted occupancy rates
8. Export predictive report
```

---

## 8. API Architecture

### 8.1 API Endpoints Overview

| Module | Endpoint | Method | Purpose |
|--------|----------|--------|---------|
| **Upload** | `/api/upload` | POST | Upload CSV files |
| **Portfolio** | `/api/properties/data` | GET | Fetch properties |
| **Lease** | `/api/lease-analysis/analyze` | GET/POST | Fetch/Run analysis |
| **Transactions** | `/api/transactions/data` | GET | Fetch transactions |
| **Transactions** | `/api/transactions/analyze` | POST | Run reconciliation |
| **Occupancy** | `/api/occupancy/data` | GET | Fetch occupancy records |
| **Occupancy** | `/api/occupancy/analyze` | GET/POST | Fetch/Run analysis |
| **Predictive** | `/api/predictive/data` | GET | Fetch predictive data |
| **Predictive** | `/api/predictive/analyze` | POST | Run ML models |
| **Predictive** | `/api/predictive/clear` | DELETE | Clear all data |
| **Templates** | `/api/templates/*` | GET | Download CSV templates |

### 8.2 API Request/Response Examples

#### Upload API
```typescript
// POST /api/upload
Request:
FormData {
  file: File (CSV),
  module: 'lease-analysis'
}

Response (Success):
{
  success: true,
  uploadId: "clx123abc",
  recordCount: 30,
  module: "lease-analysis",
  fileName: "lease_contracts.csv"
}

Response (Error):
{
  error: "Missing required field: tenant_name",
  row: 5
}
```

#### Lease Analysis API
```typescript
// POST /api/lease-analysis/analyze
Request: {} (no body, uses authenticated user's data)

Response:
{
  success: true,
  data: {
    leases: [
      {
        id: "LEASE-001",
        property_id: "PROP-001",
        tenant_name: "TechStart Solutions",
        risk_score: 35.5,
        recommended_action: "Low Risk - Retain",
        // ... other fields
      },
      // ... more leases
    ],
    analysisResults: {
      summary: {
        total_leases: 30,
        avg_risk_score: 47.2,
        high_risk_count: 4,
        expiring_soon: 6
      },
      intervention_priorities: [
        {
          lease_id: "LEASE-011",
          risk_score: 78.5,
          action: "Dispose or Retrofit"
        },
        // ... sorted by risk DESC
      ],
      risk_scores: [
        {
          lease_id: "LEASE-001",
          lease_risk_score: 35.5,
          epc_score: 5,
          void_score: 15,
          rent_score: 4,
          demand_score: 3.5,
          occupancy_score: 8
        },
        // ... all risk breakdowns
      ]
    }
  }
}
```

#### Transaction Reconciliation API
```typescript
// POST /api/transactions/analyze
Request: {} (no body)

Response:
{
  success: true,
  data: {
    reconciled_transactions: [
      {
        transaction_id: "TXN-001",
        property_id: "PROP-001",
        tenant_id: "TENANT-001",
        amount: 45000,
        expected_amount: 45000,
        status: "Completed",
        timing: "on_time"
      },
      // ... more reconciled
    ],
    unreconciled_transactions: [
      {
        transaction_id: "TXN-049",
        property_id: "PROP-003",
        tenant_id: "UNKNOWN",
        amount: 15000,
        expected_amount: 18000,
        reason: "amount_mismatch",
        variance_percent: 16.7
      },
      // ... more unreconciled
    ],
    risk_scores: [
      {
        transaction_id: "TXN-012",
        risk_score: 47.5,
        risk_level: "High"
      },
      // ... all risk scores
    ],
    reconciliation_report: {
      total_transactions: 105,
      reconciled_count: 90,
      unreconciled_count: 15,
      reconciliation_rate: 85.7,
      total_amount: 4500000,
      flagged_anomalies: [
        {
          property_id: "PROP-007",
          anomaly_count: 5,
          total_risk: 245.5
        },
        // ... aggregated anomalies
      ],
      property_tenant_aggregations: [...],
      summary_by_property: [...],
      summary_by_period: [...]
    }
  }
}
```

#### Occupancy Analysis API
```typescript
// POST /api/occupancy/analyze
Request: {} (no body)

Response:
{
  success: true,
  data: {
    analyses: [
      {
        property_id: "PROP-001",
        property_name: "Downtown Tech Hub",
        occupancy_score: 92.0,
        utilization_classification: "Efficient",
        lease_breach: false,
        predicted_future_pattern: "Growth - Steadily increasing occupancy",
        trend_direction: "Increasing",
        recommendations: [
          "Occupancy levels are optimal",
          "Proactively plan for capacity expansion"
        ],
        risk_factors: [
          "No significant risk factors identified"
        ],
        baseline_occupancy: 94.0,
        current_usage: 92.0,
        utilization_ratio: 0.98
      },
      // ... more analyses
    ],
    summary: {
      total_properties: 20,
      avg_occupancy_score: 89.5,
      overcrowded_count: 2,
      underutilised_count: 3,
      efficient_count: 15,
      lease_breaches: 2,
      high_risk_properties: ["PROP-010", "PROP-007"]
    }
  }
}
```

#### Predictive Modelling API
```typescript
// POST /api/predictive/analyze
Request: {} (no body)

Response:
{
  success: true,
  data: {
    predictions: [
      {
        property_id: "PROP-001",
        property_name: "Downtown Tech Hub",
        lease_renewal_probability: 88.5,
        predicted_epc_risk: "Low",
        forecasted_occupancy_rate: 94.2,
        risk_adjusted_rent_forecast: 4650,
        total_score: 82.3,
        asset_classification: "Stable",
        confidence: 95.0,
        epc_component: 38.0,
        occupancy_component: 28.3,
        rent_component: 26.0,
        risk_factors: [
          "No significant risk factors identified"
        ],
        economic_factors: {
          gdp_growth: 2.3,
          inflation_rate: 3.5,
          interest_rate: 5.25,
          market_demand: 85
        }
      },
      // ... more predictions
    ],
    summary: {
      total_properties: 20,
      stable_count: 14,
      moderate_count: 4,
      high_risk_count: 2,
      avg_total_score: 67.8,
      avg_confidence: 92.5
    }
  }
}
```

### 8.3 Error Handling

All API endpoints follow consistent error patterns:

```typescript
// Authentication Error
{
  error: "Unauthorized",
  status: 401
}

// Validation Error
{
  error: "Missing required field: property_id",
  row: 12,
  status: 400
}

// Server Error
{
  error: "Failed to process analysis",
  details: "Database connection error",
  status: 500
}

// Not Found
{
  error: "No data found for this user",
  status: 404
}
```

---

## 9. Database Schema

### 9.1 Core Tables

#### Users Table
```prisma
model User {
  id            String    @id @default(cuid())
  name          String?
  email         String    @unique
  emailVerified DateTime?
  password      String
  image         String?
  role          String    @default("user")
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  uploads       Upload[]
  analyses      Analysis[]

  @@map("users")
}
```

#### Properties Table
```prisma
model Property {
  id                String   @id @default(cuid())
  propertyId        String   @unique
  propertyName      String
  propertyType      String
  location          String
  purchasePrice     Float
  purchaseDate      DateTime
  currentValue      Float
  occupancyRate     Float
  monthlyRent       Float
  noi               Float?
  epcRating         String?
  maintenanceScore  Float?
  marketRent        Float?
  latitude          Float?
  longitude         Float?
  uploadId          String
  createdAt         DateTime @default(now())

  upload            Upload   @relation(fields: [uploadId], references: [id])

  @@map("properties")
}
```

#### Leases Table
```prisma
model Lease {
  id                String   @id @default(cuid())
  leaseId           String   @unique
  propertyId        String
  tenantName        String
  tenantId          String?
  startDate         DateTime
  endDate           DateTime
  monthlyRent       Float
  escalationRate    Float?
  securityDeposit   Float?
  renewalOption     Boolean  @default(false)
  breakClause       Boolean  @default(false)
  tenantCreditRating String?
  leaseStatus       String   @default("Active")
  uploadId          String
  createdAt         DateTime @default(now())

  upload            Upload   @relation(fields: [uploadId], references: [id])

  @@map("leases")
}
```

#### Transactions Table
```prisma
model Transaction {
  id                String   @id @default(cuid())
  transactionId     String   @unique
  propertyId        String
  tenantId          String?
  leaseId           String?
  transactionType   String
  amount            Float
  expectedAmount    Float?
  transactionDate   DateTime
  dueDate           DateTime?
  status            String
  paymentMethod     String?
  reference         String?
  fees              Float    @default(0)
  notes             String?
  uploadId          String
  createdAt         DateTime @default(now())

  upload            Upload   @relation(fields: [uploadId], references: [id])

  @@map("transactions")
}
```

#### OccupancyData Table
```prisma
model OccupancyData {
  id                    String   @id @default(cuid())
  propertyId            String
  propertyName          String
  propertyType          String
  location              String
  totalUnits            Int
  occupiedUnits         Int
  occupancyRate         Float
  averageRent           Float
  totalRevenue          Float
  vacantUnits           Int
  leaseExpirations      Int
  riskLevel             String
  deskUsage             Float?
  badgeIns              Int?
  meetingRoomUsage      Float?
  lightingUsage         Float?
  temperatureAvg        Float?
  avgOccupancy3Months   Float?
  avgOccupancy6Months   Float?
  avgOccupancy12Months  Float?
  peakUsage             Float?
  permittedUsage        String?
  sublettingAllowed     Boolean  @default(true)
  coworkingRestrictions Boolean  @default(false)
  maxOccupancy          Int?
  businessType          String?
  headcountEstimate     Int?
  actualHeadcount       Int?
  uploadId              String
  createdAt             DateTime @default(now())

  upload                Upload   @relation(fields: [uploadId], references: [id])

  @@map("occupancy_data")
}
```

#### PredictiveData Table
```prisma
model PredictiveData {
  id                String   @id @default(cuid())
  propertyId        String
  propertyName      String
  propertyType      String
  location          String
  purchasePrice     Float
  purchaseDate      DateTime
  currentValue      Float
  occupancyRate     Float
  monthlyRent       Float
  noi               Float?
  epcRating         String?
  maintenanceScore  Float?
  marketRent        Float?
  leaseExpiryDate   DateTime?
  gdpGrowth         Float?
  inflationRate     Float?
  interestRate      Float?
  marketDemand      Float?
  uploadId          String
  createdAt         DateTime @default(now())

  upload            Upload   @relation(fields: [uploadId], references: [id])

  @@map("predictive_data")
}
```

#### Uploads Table
```prisma
model Upload {
  id         String   @id @default(cuid())
  userId     String
  fileName   String
  module     String
  recordCount Int
  status     String   @default("completed")
  createdAt  DateTime @default(now())

  user       User     @relation(fields: [userId], references: [id])
  properties Property[]
  leases     Lease[]
  transactions Transaction[]
  occupancyData OccupancyData[]
  predictiveData PredictiveData[]
  analyses   Analysis[]

  @@map("uploads")
}
```

#### Analyses Table
```prisma
model Analysis {
  id        String   @id @default(cuid())
  userId    String
  uploadId  String
  strategy  String   // 'portfolio', 'lease-risk', 'transactions', 'occupancy', 'predictive'
  results   Json?    // Stores computed analysis results
  createdAt DateTime @default(now())

  user      User     @relation(fields: [userId], references: [id])
  upload    Upload   @relation(fields: [uploadId], references: [id])

  @@map("analyses")
}
```

### 9.2 Data Relationships

```
User (1) ─────── (Many) Upload
                        │
                        ├─── (Many) Property
                        ├─── (Many) Lease
                        ├─── (Many) Transaction
                        ├─── (Many) OccupancyData
                        ├─── (Many) PredictiveData
                        └─── (Many) Analysis

User (1) ─────── (Many) Analysis

Upload (1) ────── (Many) Analysis
```

### 9.3 Data Flow Through Database

```
1. CSV Upload → Create Upload record → Insert data records → Link via uploadId

2. Analysis Trigger → Fetch data records → Process → Create Analysis record → Store JSON results

3. Dashboard Display → Fetch data records + latest Analysis → Combine → Render UI
```

---

## 10. Security & Authentication

### 10.1 Authentication Flow

```
User Login → NextAuth.js → bcrypt password verify → Create JWT session → Set cookie

Subsequent Requests:
Request → NextAuth middleware → Verify JWT → Attach session → Allow/Deny
```

### 10.2 Authorization

- All API routes check `getServerSession()` before processing
- User ID from session limits data access to user's own records
- Admin role can access all data (if implemented)

### 10.3 Data Security

- Passwords hashed with bcrypt (10 rounds)
- JWT tokens signed and encrypted
- HTTPS enforced in production
- CORS configured for allowed origins
- SQL injection prevented via Prisma (parameterized queries)
- XSS prevented via React (automatic escaping)

### 10.4 File Upload Security

- File type validation (CSV only)
- File size limits (10MB default)
- Malicious content scanning (basic)
- Uploaded files stored with unique IDs
- Server-side validation of all CSV data

---

## 11. Deployment & Configuration

### 11.1 Environment Variables

```env
# Database
DATABASE_URL="mysql://user:password@localhost:3306/lcm_database"

# NextAuth
NEXTAUTH_SECRET="your-secret-key-here"
NEXTAUTH_URL="http://localhost:3000"

# Optional: External APIs
MARKET_DATA_API_KEY="your-api-key"
```

### 11.2 Deployment Options

#### Vercel (Recommended)
```bash
1. Connect GitHub repository
2. Configure environment variables
3. Deploy
```

#### Docker
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npx prisma generate
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

#### Traditional Server
```bash
1. Clone repository
2. Install dependencies: npm install
3. Configure .env file
4. Run migrations: npx prisma migrate deploy
5. Build: npm run build
6. Start: npm start (or use PM2)
```

### 11.3 Database Setup

```bash
# Initialize database
npx prisma migrate deploy

# Seed with sample data (optional)
npx prisma db seed

# Generate Prisma client
npx prisma generate
```

### 11.4 Performance Optimization

- Server-side rendering (SSR) for initial page loads
- API response caching (stale-while-revalidate)
- Database indexes on frequently queried fields
- Lazy loading for charts and large datasets
- Image optimization via Next.js Image component
- Code splitting and tree shaking

---

## Appendices

### A. Algorithm Reference Documents

See attached PDF documents:
- `Appendix_A1_LCM_Lease_Risk_Algorithm.pdf`
- `Appendix_A1_LCM_Occupancy_Algorithm.pdf`
- `Appendix_A1_LCM_Portfolio_Analysis_Algorithm.pdf`
- `Appendix_A1_LCM_Predictive_Modelling_Algorithm.pdf`
- `Appendix_A1_LCM_Transactions_Algorithm.pdf`

### B. Sample Data Package

Complete sample data with 195 records available in:
`/sample-data/` directory

Includes:
- 5 CSV files (portfolio, leases, transactions, occupancy, predictive)
- Complete documentation (README, upload guide, relationships)
- Database reset script

### C. API Testing

Use tools like Postman or curl to test API endpoints:
```bash
# Example: Test lease analysis
curl -X POST http://localhost:3000/api/lease-analysis/analyze \
  -H "Cookie: next-auth.session-token=YOUR_TOKEN" \
  -H "Content-Type: application/json"
```

### D. Development Commands

```bash
# Development server
pnpm dev

# Build for production
pnpm build

# Start production server
pnpm start

# Run linter
pnpm lint

# Run tests
pnpm test

# Database commands
npx prisma studio          # Open Prisma Studio (GUI)
npx prisma migrate dev     # Create and apply migration
npx prisma db push         # Push schema without migration
npx prisma migrate reset   # Reset database
```

---

## Document Control

**Version**: 1.0.0  
**Date**: January 2025  
**Author**: LCM Analytics Development Team  
**Classification**: Internal Use  
**Status**: Production Ready

**Change Log**:
- v1.0.0 (2025-01-20): Initial comprehensive documentation

**Related Documents**:
- Software Requirements Specification (SRS)
- Architecture Design Document
- Algorithm Specification PDFs
- Sample Data Documentation
- API Reference Guide

---

**End of Document**

