# Vercel Deployment Guide - LCM Analytics 🚀

## Prerequisites ✅

Before deploying to Vercel, ensure you have:

1. ✅ **GitHub repository** with your code pushed
2. ✅ **Vercel account** (free tier works) - https://vercel.com
3. ✅ **MySQL database** (hosted - see options below)
4. ✅ All code committed and pushed to main branch

---

## Step 1: Choose and Setup Database 💾

### Option A: PlanetScale (Recommended ⭐)

**Why PlanetScale:**
- ✅ Free tier: 5GB storage, 1 billion reads/month
- ✅ Built for serverless (perfect for Vercel)
- ✅ No connection pooling needed
- ✅ Automatic backups
- ✅ Branches for safe schema changes

**Setup Steps:**

1. **Create Account:**
   - Go to: https://planetscale.com
   - Sign up with GitHub

2. **Create Database:**
   - Click "New database"
   - Name: `lcm-analytics`
   - Region: Choose closest to your users
   - Click "Create database"

3. **Get Connection String:**
   ```
   - Click "Connect" button
   - Select "Prisma" from dropdown
   - Copy the DATABASE_URL
   ```
   
   Example:
   ```
   mysql://xxxxxxxxxx:************@aws.connect.psdb.cloud/lcm-analytics?sslaccept=strict
   ```

4. **Allow Schema Changes:**
   - Click "Settings" → "General"
   - Enable "Automatically copy migration data"

### Option B: Railway 🚂

**Setup:**
1. Go to: https://railway.app
2. Create new project → "Provision MySQL"
3. Click on MySQL → Variables tab
4. Copy `DATABASE_URL`

### Option C: AWS RDS / DigitalOcean

These require payment but offer more control.

---

## Step 2: Push Schema to Database 📊

### Using PlanetScale CLI (Optional):

```bash
# Install PlanetScale CLI
brew install planetscale/tap/pscale  # Mac
# Or: https://github.com/planetscale/cli#installation

# Authenticate
pscale auth login

# Connect to database
pscale connect lcm-analytics main --port 3309

# In another terminal, push schema
DATABASE_URL="mysql://root@127.0.0.1:3309/lcm-analytics" npx prisma db push
```

### Using Direct Connection:

```bash
# Set your hosted DATABASE_URL
export DATABASE_URL="your-planetscale-connection-string"

# Generate Prisma client
npx prisma generate

# Push schema to database
npx prisma db push

# Verify tables created
npx prisma studio
```

**Expected Tables Created:**
- users
- accounts
- sessions
- verification_tokens
- uploads
- properties
- leases
- transactions
- occupancy_data
- predictive_data
- analyses
- portfolio_scores
- lease_scores
- occupancy_scores

---

## Step 3: Deploy to Vercel 🌐

### Method 1: Vercel Dashboard (Easiest)

1. **Go to Vercel:**
   - Visit: https://vercel.com/dashboard
   - Click "Add New..." → "Project"

2. **Import Repository:**
   - Click "Import Git Repository"
   - Select your GitHub repository
   - Click "Import"

3. **Configure Project:**
   ```
   Framework Preset: Next.js (auto-detected)
   Root Directory: ./
   Build Command: npm run build (or pnpm build)
   Output Directory: .next (auto-detected)
   Install Command: pnpm install
   ```

4. **Add Environment Variables:**
   
   Click "Environment Variables" and add:

   | Key | Value | Example |
   |-----|-------|---------|
   | `DATABASE_URL` | Your database connection string | `mysql://user:pass@host/db` |
   | `NEXTAUTH_SECRET` | Random string (32+ chars) | Generate with: `openssl rand -base64 32` |
   | `NEXTAUTH_URL` | Your Vercel URL | `https://your-app.vercel.app` |
   | `NODE_ENV` | production | `production` |

   **To generate NEXTAUTH_SECRET:**
   ```bash
   openssl rand -base64 32
   ```

5. **Deploy:**
   - Click "Deploy"
   - Wait 2-3 minutes for build
   - ✅ Your app is live!

### Method 2: Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel

# Add environment variables
vercel env add DATABASE_URL production
vercel env add NEXTAUTH_SECRET production
vercel env add NEXTAUTH_URL production

# Deploy to production
vercel --prod
```

---

## Step 4: Post-Deployment Setup 🔧

### 1. Update NEXTAUTH_URL

After first deployment, update the environment variable:

```bash
# In Vercel Dashboard:
# Settings → Environment Variables → NEXTAUTH_URL
# Change from temporary URL to your actual domain
# Example: https://lcm-analytics.vercel.app
```

### 2. Seed Initial Data (Optional)

**Option A: Through UI:**
1. Navigate to your deployed app
2. Sign up for an account
3. Upload sample data from `sample-data/` folder in order:
   - 1_portfolio_properties.csv
   - 2_lease_contracts.csv
   - 3_property_transactions.csv
   - 4_occupancy_data.csv
   - 5_predictive_inputs.csv

**Option B: Via API (if you created a seed endpoint):**
```bash
curl -X POST https://your-app.vercel.app/api/seed \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 3. Test All Modules

Visit and test:
- ✅ Portfolio Analysis: `/dashboard/portfolio`
- ✅ Lease Analysis: `/dashboard/modules/lease-analysis`
- ✅ Transactions: `/dashboard/modules/transactions`
- ✅ Occupancy: `/dashboard/modules/occupancy`
- ✅ Predictive: `/dashboard/modules/predictive-modelling`

### 4. Monitor Performance

```bash
# Check Vercel Analytics
https://vercel.com/your-username/lcm-analytics/analytics

# Check Function Logs
https://vercel.com/your-username/lcm-analytics/logs
```

---

## Step 5: Custom Domain (Optional) 🌍

### Add Custom Domain:

1. **In Vercel Dashboard:**
   - Go to your project → Settings → Domains
   - Click "Add"
   - Enter your domain: `analytics.yourdomain.com`

2. **Update DNS:**
   - Add CNAME record in your DNS provider:
   ```
   Type: CNAME
   Name: analytics
   Value: cname.vercel-dns.com
   ```

3. **Update Environment Variable:**
   ```bash
   NEXTAUTH_URL=https://analytics.yourdomain.com
   ```

4. **Redeploy:**
   - Vercel auto-redeploys on env changes
   - Or trigger manual: `vercel --prod`

---

## Troubleshooting 🔧

### Issue: "Cannot connect to database"

**Fix:**
- Verify DATABASE_URL is correct in Vercel env vars
- Check database is accessible from internet
- For PlanetScale: Ensure you're using the correct connection string with SSL

### Issue: "Prisma Client not found"

**Fix:**
- Ensure `package.json` has updated build script:
  ```json
  "build": "prisma generate && next build"
  ```
- Redeploy from Vercel dashboard

### Issue: "NEXTAUTH_URL not set"

**Fix:**
- Add NEXTAUTH_URL environment variable
- Format: `https://your-app.vercel.app` (no trailing slash)
- Redeploy

### Issue: "Function timeout"

**Fix:**
- Vercel free tier: 10s timeout
- Upgrade to Pro: 60s timeout
- Or optimize heavy computations

### Issue: "Missing environment variables"

**Fix:**
```bash
# Check all required vars are set:
vercel env ls

# Add missing ones:
vercel env add VARIABLE_NAME production
```

### Issue: "Upload fails"

**Fix:**
- Vercel has 4.5MB request body limit
- For larger files, use external storage (S3, Cloudinary)
- Or split uploads into chunks

---

## Environment Variables Checklist ✅

| Variable | Required | Where to Get | Example |
|----------|----------|--------------|---------|
| `DATABASE_URL` | ✅ Yes | PlanetScale/Railway | `mysql://user@host/db` |
| `NEXTAUTH_SECRET` | ✅ Yes | Generate: `openssl rand -base64 32` | `abc123...xyz` |
| `NEXTAUTH_URL` | ✅ Yes | Your Vercel URL | `https://app.vercel.app` |
| `NODE_ENV` | ⚠️ Auto-set | Vercel sets automatically | `production` |

---

## Performance Optimization 🚀

### 1. Enable Caching

In `next.config.js`:
```javascript
module.exports = {
  // ... existing config
  experimental: {
    serverActions: true,
  },
  // Add caching headers
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Cache-Control', value: 'public, s-maxage=60, stale-while-revalidate=120' }
        ]
      }
    ];
  }
};
```

### 2. Database Connection Pooling

For PlanetScale, connection pooling is handled automatically.

For other databases, use Prisma connection limit:
```javascript
// prisma/schema.prisma
datasource db {
  provider = "mysql"
  url      = env("DATABASE_URL")
  relationMode = "prisma" // For PlanetScale
}
```

### 3. Edge Functions (Optional)

Move lightweight APIs to Edge for faster response:
```typescript
// src/app/api/simple-route/route.ts
export const runtime = 'edge';
```

---

## Monitoring & Logs 📊

### View Logs:
```bash
# Via CLI
vercel logs

# Or in Dashboard
https://vercel.com/your-username/lcm-analytics/logs
```

### Set Up Alerts:
1. Vercel Dashboard → Project → Settings → Notifications
2. Enable:
   - Deployment failures
   - Domain configuration errors
   - Function errors

### Monitor Database:
- PlanetScale: https://app.planetscale.com/your-org/lcm-analytics/insights
- Check query performance
- Monitor connection count

---

## Scaling Considerations 💪

### Free Tier Limits:
- ✅ Bandwidth: 100GB/month
- ✅ Function execution: 100GB-hrs
- ✅ Builds: 100 hours/month
- ⚠️ Function duration: 10 seconds
- ⚠️ Request body: 4.5MB

### When to Upgrade to Pro ($20/month):
- Function timeout: 60s (vs 10s)
- Password protection
- Custom domains: Unlimited
- Team members: Unlimited
- Preview deployments: Unlimited

---

## Continuous Deployment 🔄

### Auto-Deploy on Push:

Vercel automatically deploys when you push to GitHub:

```bash
# Make changes
git add .
git commit -m "feat: add new feature"
git push origin main

# Vercel auto-detects and deploys
```

### Preview Deployments:

Every branch gets a preview URL:
```bash
git checkout -b feature/new-module
git push origin feature/new-module

# Vercel creates preview at:
# https://lcm-analytics-git-feature-new-module-username.vercel.app
```

---

## Security Checklist 🔒

Before going live:

- ✅ Environment variables set correctly
- ✅ NEXTAUTH_SECRET is strong (32+ characters)
- ✅ Database credentials are secure
- ✅ No sensitive data in code
- ✅ API routes have authentication
- ✅ CORS configured if needed
- ✅ Rate limiting on API endpoints (optional)

---

## Success Checklist ✅

After deployment, verify:

- [ ] App loads at Vercel URL
- [ ] Can sign up / sign in
- [ ] All 5 modules are accessible
- [ ] File uploads work
- [ ] Data displays correctly
- [ ] Charts render properly
- [ ] No console errors
- [ ] Database queries work
- [ ] Authentication redirects work
- [ ] Mobile responsive

---

## Quick Deploy Commands

```bash
# 1. Ensure everything is committed
git add .
git commit -m "chore: prepare for Vercel deployment"
git push origin main

# 2. Deploy via CLI (or use dashboard)
vercel

# 3. Set environment variables
vercel env add DATABASE_URL production
vercel env add NEXTAUTH_SECRET production
vercel env add NEXTAUTH_URL production

# 4. Deploy to production
vercel --prod

# 5. Open in browser
vercel open
```

---

## Post-Deployment

### Your app will be live at:
```
https://lcm-analytics-[random].vercel.app
```

### Update this in:
1. Vercel Environment Variables → NEXTAUTH_URL
2. Share the URL with your team
3. Test all functionality

---

## Next Steps 🎯

1. ✅ Set up custom domain (optional)
2. ✅ Configure monitoring/alerts
3. ✅ Add team members to Vercel project
4. ✅ Set up production database backups
5. ✅ Document API endpoints
6. ✅ Create user documentation

---

## Support & Resources 📚

- **Vercel Docs**: https://vercel.com/docs
- **Next.js Deployment**: https://nextjs.org/docs/deployment
- **PlanetScale Docs**: https://planetscale.com/docs
- **Prisma Deployment**: https://www.prisma.io/docs/guides/deployment

---

**🎉 Ready to deploy! Follow the steps above and your LCM Analytics platform will be live in minutes!**

For issues, check the Troubleshooting section or Vercel logs.
