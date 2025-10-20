# Vercel Deployment Checklist ✅

## Pre-Deployment (5-10 minutes)

### 1. Database Setup
- [ ] Create PlanetScale account (or choose alternative)
- [ ] Create database: `lcm-analytics`
- [ ] Get DATABASE_URL connection string
- [ ] Save connection string securely

### 2. Schema Push
```bash
export DATABASE_URL="your-connection-string"
npx prisma generate
npx prisma db push
```
- [ ] Confirm all tables created (13 tables)
- [ ] Test with: `npx prisma studio`

### 3. Code Ready
- [ ] All changes committed
- [ ] Pushed to GitHub main branch
- [ ] package.json updated with build script ✅ (Done!)

```bash
git status  # Should be clean
git push origin main
```

---

## Deployment (3-5 minutes)

### 4. Vercel Setup
- [ ] Go to: https://vercel.com/dashboard
- [ ] Click "Add New..." → "Project"
- [ ] Import your GitHub repository
- [ ] Click "Import"

### 5. Configure Environment Variables

Add these in Vercel during setup:

| Variable | Value | How to Get |
|----------|-------|------------|
| `DATABASE_URL` | `mysql://...` | From PlanetScale |
| `NEXTAUTH_SECRET` | Generate | `openssl rand -base64 32` |
| `NEXTAUTH_URL` | Leave blank for now | Will update after first deploy |

- [ ] DATABASE_URL added
- [ ] NEXTAUTH_SECRET generated and added
- [ ] NEXTAUTH_URL left blank (will update)

### 6. Deploy
- [ ] Click "Deploy" button
- [ ] Wait 2-3 minutes for build
- [ ] Build succeeds (green checkmark)
- [ ] Copy your Vercel URL

---

## Post-Deployment (5 minutes)

### 7. Update NEXTAUTH_URL
- [ ] Go to: Settings → Environment Variables
- [ ] Find `NEXTAUTH_URL`
- [ ] Set to your Vercel URL: `https://your-app.vercel.app`
- [ ] Click "Save"
- [ ] Redeploy (automatic or manual)

### 8. Test Application
Visit your deployed URL and test:

- [ ] Homepage loads
- [ ] Sign up works
- [ ] Sign in works
- [ ] Dashboard loads
- [ ] Portfolio page loads
- [ ] Lease Analysis page loads
- [ ] Transactions page loads
- [ ] Occupancy page loads
- [ ] Predictive Modelling page loads

### 9. Upload Sample Data
Upload in this order:

- [ ] 1_portfolio_properties.csv
- [ ] 2_lease_contracts.csv
- [ ] 3_property_transactions.csv
- [ ] 4_occupancy_data.csv
- [ ] 5_predictive_inputs.csv

### 10. Verify Functionality
- [ ] Data displays in tables
- [ ] Charts render correctly
- [ ] Analysis buttons work
- [ ] Reconciliation works (Transactions module)
- [ ] No errors in browser console

---

## Optional Enhancements

### 11. Custom Domain (Optional)
- [ ] Add custom domain in Vercel
- [ ] Configure DNS CNAME record
- [ ] Update NEXTAUTH_URL
- [ ] Test with custom domain

### 12. Monitoring Setup
- [ ] Enable Vercel Analytics
- [ ] Set up email notifications
- [ ] Monitor function logs
- [ ] Check database insights (PlanetScale)

---

## Quick Commands Reference

```bash
# Generate NEXTAUTH_SECRET
openssl rand -base64 32

# Check git status
git status

# Push to GitHub
git add .
git commit -m "chore: prepare for deployment"
git push origin main

# Deploy via CLI (alternative to dashboard)
npx vercel
vercel --prod

# View logs
vercel logs

# Open deployed app
vercel open
```

---

## Environment Variables Template

Copy this and fill in the values:

```bash
# Database (from PlanetScale/Railway)
DATABASE_URL="mysql://username:password@host.connect.psdb.cloud/lcm-analytics?sslaccept=strict"

# Authentication (generate with: openssl rand -base64 32)
NEXTAUTH_SECRET="your-generated-secret-here"

# App URL (your Vercel URL after first deploy)
NEXTAUTH_URL="https://your-app-name.vercel.app"

# Environment
NODE_ENV="production"
```

---

## Success Criteria ✅

Your deployment is successful when:

1. ✅ App loads without errors
2. ✅ Authentication works (sign up/sign in)
3. ✅ All 5 modules are accessible
4. ✅ Data uploads successfully
5. ✅ Charts and tables display correctly
6. ✅ Transaction reconciliation works
7. ✅ No console errors
8. ✅ Mobile responsive

---

## Troubleshooting Quick Fixes

### Build Fails
```bash
# Locally test build
pnpm build

# If successful, check Vercel build logs
# Usually missing env vars or Prisma issues
```

### Database Connection Error
- Verify DATABASE_URL is correct
- Check database is accessible
- Test locally with same connection string

### Prisma Client Error
- Ensure build script has: `prisma generate && next build`
- Check `package.json` line 8
- Redeploy

### Authentication Redirect Loop
- Ensure NEXTAUTH_URL matches your Vercel URL
- No trailing slash in NEXTAUTH_URL
- Redeploy after changing env vars

---

## Time Estimates ⏱️

- **Database Setup**: 5 minutes
- **Schema Push**: 2 minutes
- **Vercel Deployment**: 3 minutes
- **Post-Deploy Config**: 2 minutes
- **Testing**: 5 minutes

**Total**: ~15-20 minutes for complete deployment

---

## Need Help?

1. **Check**: `VERCEL_DEPLOYMENT_GUIDE.md` (detailed guide)
2. **Logs**: https://vercel.com/your-project/logs
3. **Vercel Docs**: https://vercel.com/docs
4. **PlanetScale Docs**: https://planetscale.com/docs

---

**🚀 You're ready to deploy! Start with Step 1 above.**

