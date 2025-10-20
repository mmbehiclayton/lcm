# Quick Start Guide - After Schema Update

## 🚀 3-Step Process to Fix Everything

### Step 1: Apply Database Migration (2 minutes)

```bash
cd C:\Users\USER\projects\lcm
npx prisma db push
```

**Expected output**:
```
✔ Generated Prisma Client
✔ The database is now in sync with the Prisma schema.
```

---

### Step 2: Clear Old Data (1 minute)

Option A - Using reset script:
```bash
mysql -u root -p lcm_db < sample-data\reset-database.sql
```

Option B - Manual (via Prisma Studio):
```bash
npx prisma studio
# Open in browser, manually delete all records from:
# - transactions
# - leases  
# - occupancy_data
# - analyses
```

---

### Step 3: Re-upload CSV Files (5 minutes)

**Important**: Upload in this order!

#### 1. Portfolio (optional)
- URL: `http://localhost:3000/dashboard/portfolio`
- File: `sample-data/1_portfolio_properties.csv`
- Expected: 20 properties

#### 2. Leases (REQUIRED - do this first!)
- URL: `http://localhost:3000/dashboard/modules/lease-analysis`
- File: `sample-data/2_lease_contracts.csv`
- Expected: 30 leases

#### 3. Transactions
- URL: `http://localhost:3000/dashboard/modules/transactions`
- File: `sample-data/3_property_transactions.csv`
- Expected: 105 transactions

#### 4. Occupancy
- URL: `http://localhost:3000/dashboard/modules/occupancy`
- File: `sample-data/4_occupancy_data.csv`
- Expected: 20 properties

#### 5. Predictive (optional)
- URL: `http://localhost:3000/dashboard/modules/predictive-modelling`
- File: `sample-data/5_predictive_inputs.csv`
- Expected: 20 properties

---

## ✅ Verification Checklist

After upload, check:

### Transactions Module
- [ ] Navigate to Transactions → Click "Refresh"
- [ ] Anomalies tab shows **<30 records** (not 105)
- [ ] Most transactions show as "Reconciled"
- [ ] Ledger tab shows tenant IDs like "TENANT-001" (not "tenant-PROP-001")

### Occupancy Module
- [ ] Navigate to Occupancy → Click "Refresh"
- [ ] Utilization Analysis tab shows percentages like "96%" (not "9600%")
- [ ] Current Usage: 90-100%
- [ ] Baseline: 90-95%

### Lease Module
- [ ] Navigate to Lease Analysis
- [ ] All leases show proper tenant names
- [ ] Risk scores calculated
- [ ] No "N/A" values

---

## 🎯 Success Indicators

| Module | Metric | Before | After ✅ |
|--------|--------|--------|----------|
| Transactions | Reconciliation Rate | 0% | >80% |
| Transactions | Anomalies | 105 | <30 |
| Transactions | Tenant IDs | Fake | Real |
| Occupancy | Percentage Display | 9600% | 96% |
| Occupancy | Sensor Data | Missing | Present |
| Leases | Tenant IDs | Missing | Present |

---

## 🐛 Quick Fixes

### Issue: "Column doesn't exist" error
```bash
npx prisma db push --force-reset
```

### Issue: Still seeing fake tenant IDs
1. Hard refresh: `Ctrl + Shift + R`
2. Clear browser cache
3. Restart dev server: `pnpm dev`

### Issue: Upload fails
1. Check file path is correct
2. Verify CSV has no extra blank lines
3. Check console for errors: `F12` → Console tab

---

## 🔍 Database Verification (Optional)

Check if data is properly saved:

```sql
-- Check transactions have tenant IDs
SELECT transactionId, tenantId, leaseId 
FROM transactions 
LIMIT 5;

-- Should show: TENANT-001, LEASE-001 (not NULL or fake IDs)

-- Check leases have tenant IDs
SELECT leaseId, tenantId, tenantName 
FROM leases 
LIMIT 5;

-- Should show: TENANT-001, TENANT-002, etc.

-- Check occupancy has sensor data
SELECT propertyId, deskUsage, badgeIns 
FROM occupancy_data 
LIMIT 5;

-- Should show: Numbers like 92, 450 (not NULL)
```

---

## ⏱️ Total Time Required

- Migration: 2 minutes
- Clear data: 1 minute
- Re-upload CSVs: 5 minutes
- Verification: 2 minutes

**Total: ~10 minutes** ⚡

---

## 📞 Need Help?

If something doesn't work:

1. Check `DATABASE_SCHEMA_UPDATE_COMPLETE.md` for detailed troubleshooting
2. Review `TRANSACTIONS_ANOMALIES_ANALYSIS.md` for logic explanation
3. Check browser console (F12) for JavaScript errors
4. Check terminal for API errors

---

**Ready?** Start with Step 1! 🚀

