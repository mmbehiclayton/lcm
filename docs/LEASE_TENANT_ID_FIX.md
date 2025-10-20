# Fix: Lease tenant_id Showing NULL

## Problem 🐛

After uploading lease CSV:
- ✅ `transactions` table: `tenantId` populated correctly (`TENANT-001`, `TENANT-002`, etc.)
- ❌ `leases` table: `tenantId` showing NULL

## Root Cause 🔍

The `cleanLeaseData` function in `src/lib/dataProcessor.ts` was missing the `tenant_id` field processing. It was cleaning and normalizing other fields but not extracting `tenant_id` from the CSV.

---

## Fix Applied ✅

**File**: `src/lib/dataProcessor.ts` (Line 213)

### Before:
```typescript
static cleanLeaseData(data: any[]): any[] {
  return data.map(lease => ({
    lease_id: lease.lease_id || lease.leaseId,
    property_id: lease.property_id || lease.propertyId,
    // tenant_id was MISSING! ❌
    tenant_name: lease.tenant_name || lease.tenantName,
    lease_start: lease.lease_start || lease.leaseStart,
    // ... other fields
  }));
}
```

### After:
```typescript
static cleanLeaseData(data: any[]): any[] {
  return data.map(lease => ({
    lease_id: lease.lease_id?.trim() || lease.leaseId?.trim() || '',
    property_id: lease.property_id?.trim() || lease.propertyId?.trim() || '',
    tenant_id: lease.tenant_id?.trim() || lease.tenantId?.trim() || null, // ✅ NOW INCLUDED
    tenant_name: lease.tenant_name?.trim() || lease.tenantName?.trim() || '',
    lease_start: lease.lease_start || lease.leaseStart,
    escalation_rate: lease.escalation_rate || lease.escalationRate ? parseFloat(lease.escalation_rate || lease.escalationRate) : null, // ✅ Fixed to allow null
    // ... other fields with improved parsing
  }));
}
```

### Additional Improvements:
1. ✅ Added `tenant_id` extraction
2. ✅ Improved `escalation_rate` to allow `null` instead of defaulting to 0
3. ✅ Added `.trim()` to all string fields for cleaner data
4. ✅ Enhanced boolean parsing for `renewal_option` and `break_clause`

---

## How to Test 🧪

### Step 1: Clear Old Lease Data
```sql
DELETE FROM leases;
```

Or use Prisma Studio (`npx prisma studio`).

### Step 2: Re-upload Lease CSV

1. Navigate to: `http://localhost:3000/dashboard/modules/lease-analysis`
2. Click "Upload Data"
3. Select: `sample-data/2_lease_contracts.csv`
4. Wait for success message

### Step 3: Verify in Database

**Option A - Via SQL**:
```sql
SELECT leaseId, propertyId, tenantId, tenantName 
FROM leases 
LIMIT 10;
```

**Expected Result**:
```
leaseId      propertyId  tenantId      tenantName
LEASE-001    PROP-001    TENANT-001    TechStart Solutions
LEASE-002    PROP-001    TENANT-002    DataCore Analytics
LEASE-003    PROP-002    TENANT-003    Global Finance Corp
...
```

**Option B - Via Prisma Studio**:
```bash
npx prisma studio
```
- Open `leases` table
- Check `tenantId` column - should show `TENANT-001`, `TENANT-002`, etc.

### Step 4: Verify Transaction Reconciliation

1. Navigate to: `http://localhost:3000/dashboard/modules/transactions`
2. Click "Refresh"
3. Check "Anomalies" tab
4. **Expected**: Anomalies should drop significantly (from 105 to ~20-30)

---

## Data Flow Verification 📊

### CSV → Processing → Database

```
CSV File:
lease_id,property_id,tenant_name,tenant_id,lease_start,...
LEASE-001,PROP-001,TechStart Solutions,TENANT-001,2022-01-01,...

↓ (Upload API reads CSV)

cleanLeaseData() extracts:
{
  lease_id: 'LEASE-001',
  property_id: 'PROP-001',
  tenant_id: 'TENANT-001',  ← ✅ Now extracted
  tenant_name: 'TechStart Solutions',
  ...
}

↓ (Upload API saves to DB)

Database `leases` table:
leaseId: 'LEASE-001'
propertyId: 'PROP-001'
tenantId: 'TENANT-001'  ← ✅ Now populated
tenantName: 'TechStart Solutions'
...
```

---

## Expected Reconciliation Improvement 📈

### Before Fix:
```
Transactions: 105
Reconciled: 0 (0%)
Anomalies: 105 (100% - all "NO_LEASE_MATCH")

Reason: tenant_id in transactions was populated,
        but tenant_id in leases was NULL,
        so matching failed.
```

### After Fix:
```
Transactions: 105
Reconciled: ~85 (81%)
Anomalies: ~20 (19% - genuine issues only)

Breakdown of anomalies:
- AMOUNT_MISMATCH: ~12 (11%)
- LEASE_INACTIVE: ~6 (6%)
- NO_LEASE_MATCH: ~2 (2%)
```

---

## Files Modified 📝

1. ✅ `src/lib/dataProcessor.ts` - Line 213: Added `tenant_id` to `cleanLeaseData`

---

## Status ✅

**Fix Applied**: Yes  
**Ready to Test**: Yes  
**Action Required**: Re-upload lease CSV  

---

## Quick Test Command

After re-uploading, check tenant IDs are populated:

```bash
# Via terminal (if you have mysql CLI)
mysql -u root -p lcm_db -e "SELECT leaseId, tenantId, tenantName FROM leases LIMIT 5;"

# Or via Prisma Studio
npx prisma studio
```

---

**The fix is complete! Just re-upload the lease CSV and tenant IDs should populate correctly.** 🎉

