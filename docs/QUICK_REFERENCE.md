# LCM Analytics - Quick Reference Guide

**Version**: 1.0.0  
**Last Updated**: January 2025

---

## 🎯 Quick Navigation

| Need | See Section |
|------|-------------|
| **System Overview** | [Architecture Diagram](#architecture-diagram) |
| **Key Modules** | [Module Summary](#module-summary) |
| **Algorithms** | [Algorithm Quick Reference](#algorithm-quick-reference) |
| **User Workflow** | [User Journey Map](#user-journey-map) |
| **API Endpoints** | [API Quick Reference](#api-quick-reference) |
| **Troubleshooting** | [Common Issues](#common-issues) |

---

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         USER INTERFACE                           │
│              (Next.js Frontend - React Components)               │
│                                                                   │
│  Dashboard → Portfolio → Lease → Transactions → Occupancy → ML   │
└────────────────────────────┬────────────────────────────────────┘
                             │ HTTPS/REST
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                    AUTHENTICATION LAYER                          │
│                  (NextAuth.js + JWT Sessions)                    │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                         API LAYER                                │
│                    (Next.js API Routes)                          │
│                                                                   │
│  /upload  /properties  /leases  /transactions  /occupancy  /ML  │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                    ANALYTICS ENGINE                              │
│                  (Core Business Logic)                           │
│                                                                   │
│  Risk Scoring │ Reconciliation │ Occupancy │ Predictive Models  │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                    DATA ACCESS LAYER                             │
│                    (Prisma ORM)                                  │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                    DATABASE (MySQL)                              │
│  Properties │ Leases │ Transactions │ Occupancy │ Analyses      │
└─────────────────────────────────────────────────────────────────┘
```

---

## Module Summary

### 1. Portfolio Analysis
- **Purpose**: Property valuation and performance tracking
- **Key Metrics**: Total value, Occupancy rate, Risk distribution
- **File**: `src/app/dashboard/portfolio/page.tsx`
- **API**: `/api/properties/data`

### 2. Lease Risk Scoring
- **Purpose**: Predictive lease risk analysis with interventions
- **Algorithm**: EPC + Void + Rent + Demand + Occupancy → Risk Score (0-100)
- **File**: `src/lib/analytics-engine.ts::calculateLeaseRiskScores()`
- **API**: `/api/lease-analysis/analyze`

### 3. Transaction Reconciliation
- **Purpose**: Automated payment matching and anomaly detection
- **Algorithm**: Match by property/tenant/amount/date → Flag mismatches
- **File**: `src/lib/analytics-engine.ts::reconcileTransactions()`
- **API**: `/api/transactions/analyze`

### 4. Occupancy Intelligence
- **Purpose**: Space utilization analysis with IoT sensors
- **Algorithm**: Baseline vs Current → Ratio → Classify (Efficient/Under/Over)
- **File**: `src/lib/analytics-engine.ts::calculateOccupancyScore()`
- **API**: `/api/occupancy/analyze`

### 5. Predictive Modelling
- **Purpose**: ML-powered asset classification and forecasting
- **Algorithm**: Feature Engineering → ML Sim → Weighted Score → Classify
- **File**: `src/lib/analytics-engine.ts::runPredictiveModels()`
- **API**: `/api/predictive/analyze`

---

## Algorithm Quick Reference

### Lease Risk Score Formula
```
risk_score = epc_score(0-50) + void_score(0-30) + rent_score(0-10) 
           + demand_score(0-10) + occupancy_score(0-20)

Classification:
• 0-40: Low Risk → Retain
• 41-70: Medium Risk → Monitor
• 71-100: High Risk → Dispose/Retrofit
```

### Transaction Reconciliation Logic
```
IF transaction.amount ≈ lease.expected (±10%)
   AND transaction.date ≈ due_date (±3 days)
   AND tenant_id matches
THEN → Reconciled
ELSE → Flagged with reason (amount_mismatch / late_payment / no_lease)
```

### Occupancy Classification
```
utilization_ratio = current_usage / baseline_occupancy

Classification:
• ratio > 1.2 → Overcrowded
• ratio < 0.5 → Underutilised
• 0.5 ≤ ratio ≤ 1.2 → Efficient

Penalty: -20% if lease breach detected
```

### Predictive Score Calculation
```
total_score = (EPC_component × 0.40) 
            + (Occupancy_component × 0.30)
            + (Rent_stability_component × 0.30)

Classification:
• < 40: High Risk
• 40-70: Moderate
• > 70: Stable
```

---

## User Journey Map

```
1. LOGIN
   └─→ /auth/signin → Validate → Redirect to /dashboard

2. DASHBOARD
   └─→ View overview → Select module → Navigate

3. UPLOAD DATA
   └─→ Click "Upload" → Select CSV → Validate → Upload → Success

4. ANALYSIS
   └─→ Auto-trigger or Manual → Loading → Results displayed

5. EXPLORE
   └─→ Filter → Search → Sort → View charts → Read recommendations

6. EXPORT
   └─→ Click "Export" → Download CSV/Excel report

7. CROSS-MODULE
   └─→ Navigate between modules → Consistent property/tenant IDs
```

---

## API Quick Reference

### Upload Data
```http
POST /api/upload
Content-Type: multipart/form-data

FormData {
  file: <CSV file>,
  module: 'lease-analysis'
}

Response: { success: true, uploadId, recordCount }
```

### Run Analysis
```http
POST /api/*/analyze
(No body required - uses authenticated user's data)

Response: { success: true, data: { analyses, summary } }
```

### Fetch Data
```http
GET /api/*/data

Response: { records: [...] }
```

### Clear Data (Predictive only)
```http
DELETE /api/predictive/clear?clearProperties=true

Response: { success: true, deleted: {...} }
```

---

## Common Issues

### Issue: "No data found"
**Solution**: Upload CSV file first via "Upload Data" button

### Issue: "Analysis not running"
**Solution**: Click "Analyze" or "Run Analysis" button manually

### Issue: "Invalid CSV format"
**Solution**: Download template and match column names exactly

### Issue: "Authentication error"
**Solution**: Sign in again - session may have expired

### Issue: "Stats showing N/A or 0"
**Solution**: Re-run analysis or refresh the page

### Issue: "Unreconciled transactions"
**Solution**: Check amount matches, due dates, and tenant IDs in data

---

## File Locations

### Frontend
```
src/app/dashboard/
├── portfolio/page.tsx              # Portfolio module
└── modules/
    ├── lease-analysis/page.tsx     # Lease risk module
    ├── transactions/page.tsx       # Transaction reconciliation
    ├── occupancy/page.tsx          # Occupancy analysis
    └── predictive-modelling/page.tsx # Predictive ML
```

### Backend (APIs)
```
src/app/api/
├── upload/route.ts                 # File upload handler
├── properties/data/route.ts        # Portfolio data
├── lease-analysis/analyze/route.ts # Lease analysis
├── transactions/analyze/route.ts   # Transaction reconcile
├── occupancy/analyze/route.ts      # Occupancy analysis
└── predictive/analyze/route.ts     # Predictive modelling
```

### Core Logic
```
src/lib/
├── analytics-engine.ts             # All algorithms (2000+ lines)
├── dataProcessor.ts                # CSV parsing
├── validations.ts                  # Input validation
└── auth.ts                         # NextAuth config
```

### Database
```
prisma/
├── schema.prisma                   # Database schema
└── migrations/                     # Migration history
```

---

## Key Metrics

### Performance
- Page load: < 2 seconds
- Analysis time: 1-4 seconds (depending on module)
- API response: < 1 second

### Data Volumes (Sample Data)
- Properties: 20
- Leases: 30
- Transactions: 105
- Occupancy records: 20
- Predictions: 20
- **Total**: 195 records

### Risk Distribution (Expected)
- Low Risk: 60%
- Medium Risk: 25%
- High Risk: 15%

---

## Development Commands

```bash
# Start dev server
pnpm dev

# Build production
pnpm build

# Database operations
npx prisma studio              # Open GUI
npx prisma migrate dev         # Create migration
npx prisma db push             # Push schema
npx prisma migrate reset       # Reset DB

# Reset and seed with sample data
npx prisma migrate reset --force
# Then upload CSV files from /sample-data/
```

---

## Tech Stack Summary

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14, React 18, TypeScript |
| Styling | Tailwind CSS |
| Charts | Recharts |
| Backend | Next.js API Routes, Node.js |
| Database | MySQL/PostgreSQL |
| ORM | Prisma |
| Auth | NextAuth.js |
| Deployment | Vercel / Docker |

---

## URL Structure

```
# Authentication
/auth/signin                        # Login page
/auth/signup                        # Register page

# Dashboard
/dashboard                          # Main dashboard
/dashboard/portfolio                # Portfolio module
/dashboard/modules/lease-analysis   # Lease risk module
/dashboard/modules/transactions     # Transaction module
/dashboard/modules/occupancy        # Occupancy module
/dashboard/modules/predictive-modelling # Predictive module

# Other
/dashboard/properties               # Properties list
/dashboard/upload                   # Upload page
```

---

## Security Checklist

- ✅ Password hashing (bcrypt)
- ✅ JWT session tokens
- ✅ HTTPS in production
- ✅ SQL injection prevention (Prisma)
- ✅ XSS prevention (React)
- ✅ CORS configuration
- ✅ File upload validation
- ✅ Authentication middleware
- ✅ User data isolation

---

## Support Resources

### Documentation
- `docs/APP_DOCUMENTATION.md` - Complete technical documentation
- `docs/srs.md` - Requirements specification
- `docs/architecture.md` - Architecture details
- `sample-data/README.md` - Sample data guide

### Algorithm PDFs
- `docs/Appendix_A1_LCM_Lease_Risk_Algorithm.pdf`
- `docs/Appendix_A1_LCM_Occupancy_Algorithm.pdf`
- `docs/Appendix_A1_LCM_Portfolio_Analysis_Algorithm.pdf`
- `docs/Appendix_A1_LCM_Predictive_Modelling_Algorithm.pdf`
- `docs/Appendix_A1_LCM_Transactions_Algorithm.pdf`

### Sample Data
- `sample-data/` - Complete sample data package (195 records)
- `sample-data/UPLOAD_GUIDE.md` - Step-by-step upload instructions
- `sample-data/DATA_RELATIONSHIPS.md` - Data consistency map

---

**Quick Reference Version**: 1.0.0  
**Last Updated**: January 2025  
**For**: Developers, Testers, Support Staff

---

**Need more details?** See `docs/APP_DOCUMENTATION.md` for comprehensive documentation.

