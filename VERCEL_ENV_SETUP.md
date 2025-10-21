# Vercel Environment Variables Setup

## Required Environment Variables

You need to set these environment variables in your Vercel dashboard:

### 1. Database Configuration
```
DATABASE_URL=postgresql://neondb_owner:npg_WGNo7uf4Xqhb@ep-shiny-field-ad7dyxxz-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require
```

### 2. NextAuth Configuration
```
NEXTAUTH_SECRET=your-super-secret-key-here-make-it-long-and-random
NEXTAUTH_URL=https://lcmapp.vercel.app
```

### 3. Optional (if using external services)
```
NEXTAUTH_URL=https://lcmapp.vercel.app
```

## How to Set Environment Variables in Vercel

1. Go to your Vercel dashboard
2. Select your project (lcm)
3. Go to **Settings** → **Environment Variables**
4. Add each variable:
   - **Name**: `DATABASE_URL`
   - **Value**: `postgresql://neondb_owner:npg_WGNo7uf4Xqhb@ep-shiny-field-ad7dyxxz-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require`
   - **Environment**: Production, Preview, Development

   - **Name**: `NEXTAUTH_SECRET`
   - **Value**: `your-super-secret-key-here-make-it-long-and-random` (generate a random string)
   - **Environment**: Production, Preview, Development

   - **Name**: `NEXTAUTH_URL`
   - **Value**: `https://lcmapp.vercel.app`
   - **Environment**: Production, Preview, Development

## Generate a Secure NEXTAUTH_SECRET

You can generate a secure secret using:

```bash
# Option 1: Using OpenSSL
openssl rand -base64 32

# Option 2: Using Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"

# Option 3: Online generator
# Visit: https://generate-secret.vercel.app/32
```

## After Setting Environment Variables

1. **Redeploy your application** - Go to Vercel dashboard → Deployments → Redeploy
2. **Test the application** - Visit your app URL
3. **Check the logs** - Monitor for any remaining errors

## Troubleshooting

- If you still get errors, check that all environment variables are set correctly
- Make sure there are no extra spaces or quotes in the values
- Ensure the database URL is accessible from Vercel
- Check that the NEXTAUTH_SECRET is at least 32 characters long
