# Fix: Unknown argument `tenantId` Error

## Problem 🐛

```
Unknown argument `tenantId`. Available options are marked with ?.
```

**Root Cause**: The Prisma Client hasn't been regenerated after the schema was updated. The TypeScript types and runtime client still reflect the old schema without the new fields.

---

## Solution (3 Steps) 🔧

### Step 1: Stop Development Server

In the terminal running `pnpm dev`, press:
```
Ctrl + C
```

Wait for it to fully stop.

---

### Step 2: Regenerate Prisma Client & Push Schema

```bash
# Regenerate Prisma client with new schema
npx prisma generate

# Push schema changes to database
npx prisma db push
```

**Expected output:**
```
✔ Generated Prisma Client
✔ The database is now in sync with the Prisma schema.
```

---

### Step 3: Restart Development Server

```bash
pnpm dev
```

Wait for compilation to complete.

---

## Then Re-upload

1. **Portfolio** (optional but recommended):
   - Go to: `http://localhost:3000/dashboard/portfolio`
   - Upload: `sample-data/1_portfolio_properties.csv`

2. **Leases** (REQUIRED):
   - Go to: `http://localhost:3000/dashboard/modules/lease-analysis`
   - Upload: `sample-data/2_lease_contracts.csv`
   - ✅ Should work now!

3. **Transactions**:
   - Go to: `http://localhost:3000/dashboard/modules/transactions`
   - Upload: `sample-data/3_property_transactions.csv`

4. **Occupancy**:
   - Go to: `http://localhost:3000/dashboard/modules/occupancy`
   - Upload: `sample-data/4_occupancy_data.csv`

---

## Why This Happened

When you update `prisma/schema.prisma`, you need to run **two commands**:

1. **`npx prisma generate`** - Updates TypeScript types and Prisma Client code
2. **`npx prisma db push`** - Updates the actual database schema

Without step 1, the code still thinks the old schema is in place, even if the database has the new columns.

---

## Alternative: One-Line Fix

If you want to do both in one go:

```bash
# Stop dev server first (Ctrl+C), then:
npx prisma db push && npx prisma generate && pnpm dev
```

This will:
1. ✅ Push schema to database
2. ✅ Generate new Prisma client
3. ✅ Start dev server

---

## Verification

After restart, check the terminal should show:
```
✓ Compiled successfully
```

Then try uploading leases again - the error should be gone! ✅

---

**Status**: Waiting for you to restart the dev server 🔄

