# Vercel Deployment Checklist

## Pre-Deployment Setup

### 1. Environment Variables in Vercel Dashboard
- [ ] `DATABASE_URL` = `@postgres_url`
- [ ] `DIRECT_URL` = `@postgres_url`
- [ ] `NEXTAUTH_SECRET` = `@nextauth_secret`
- [ ] `NEXTAUTH_URL` = `@nextauth_url`

### 2. Vercel Postgres Database
- [ ] Create Vercel Postgres database
- [ ] Copy connection string to environment variables
- [ ] Test database connection

### 3. GitHub Repository
- [ ] Push all changes to main branch
- [ ] Ensure vercel.json is committed
- [ ] Verify package.json has correct scripts

## Deployment Steps

### 1. Connect to Vercel
- [ ] Import project from GitHub
- [ ] Select main branch
- [ ] Framework: Next.js (auto-detected)

### 2. Build Settings
- [ ] Build Command: `pnpm run vercel-build`
- [ ] Install Command: `pnpm install`
- [ ] Output Directory: `.next` (default)

### 3. Environment Variables
- [ ] Add all required environment variables
- [ ] Use Vercel's @postgres_url for database
- [ ] Set NEXTAUTH_URL to your Vercel domain

## Post-Deployment Verification

### 1. Database Connection
- [ ] Check if database tables are created
- [ ] Verify Prisma schema is applied
- [ ] Test API endpoints

### 2. Application Functionality
- [ ] Test authentication flow
- [ ] Upload sample data
- [ ] Verify all modules work
- [ ] Check currency formatting (GBP)

### 3. Performance
- [ ] Check build logs for errors
- [ ] Verify API response times
- [ ] Test file upload functionality

## Common Issues & Solutions

### Build Failures
- **Issue**: Prisma client not generated
- **Solution**: Ensure `vercel-build` script includes `prisma generate`

### Database Connection Issues
- **Issue**: DATABASE_URL not found
- **Solution**: Verify environment variables are set correctly

### Authentication Issues
- **Issue**: NextAuth not working
- **Solution**: Check NEXTAUTH_URL matches Vercel domain

## Troubleshooting Commands

```bash
# Check build logs
vercel logs

# Test database connection
npx prisma db push

# Generate Prisma client
npx prisma generate

# Check environment variables
vercel env ls
```

## Success Indicators
- [ ] Application loads without errors
- [ ] Database tables created successfully
- [ ] Authentication works
- [ ] All modules functional
- [ ] Currency displays as GBP (£)
- [ ] EPC ratings show as letters (A, B, C, etc.)
