# 🔐 Complete Environment Variables Guide

## Local Development (.env.local)

Copy these variables to your `.env.local` file:

```bash
# Gemini AI API Key (for chatbot)
GEMINI_API_KEY=AIzaSyCKzsID--6ockxc_RdxKFfIXiNqGGwXITo

# PayFast Payment Gateway Configuration
PAYFAST_MERCHANT_ID=34249465
PAYFAST_MERCHANT_KEY=oktxmly5tlwxf
PAYFAST_PASSPHRASE=Intandokazi2026
PAYFAST_ENVIRONMENT=production

# Application Configuration
NEXT_PUBLIC_BASE_URL=http://localhost:3000
NODE_ENV=development

# NextAuth Configuration (for admin authentication)
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_nextauth_secret_here_generate_random_string

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://oaeirdgffwodkbcstdfh.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY=sb_publishable_JyAloXV06F0SSKRf868Hsg_rAVV3_Bv
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

---

## Production Environment (Vercel)

Add these variables to your Vercel project settings:

### ⚠️ CRITICAL: Must be added to Vercel

```bash
# PayFast Payment Gateway (CRITICAL)
PAYFAST_MERCHANT_ID=34249465
PAYFAST_MERCHANT_KEY=oktxmly5tlwxf
PAYFAST_PASSPHRASE=Intandokazi2026
PAYFAST_ENVIRONMENT=production

# Application URLs
NEXT_PUBLIC_BASE_URL=https://intandokaziherbal.co.za
NODE_ENV=production

# NextAuth Configuration
NEXTAUTH_URL=https://intandokaziherbal.co.za
NEXTAUTH_SECRET=generate_a_random_secret_string_here

# Supabase Configuration (NEW)
NEXT_PUBLIC_SUPABASE_URL=https://oaeirdgffwodkbcstdfh.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY=sb_publishable_JyAloXV06F0SSKRf868Hsg_rAVV3_Bv
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# Optional: Gemini API
GEMINI_API_KEY=AIzaSyCKzsID--6ockxc_RdxKFfIXiNqGGwXITo
```

---

## 🔑 How to Get Missing Keys

### 1. Supabase Service Role Key
1. Go to https://oaeirdgffwodkbcstdfh.supabase.co
2. Navigate to **Settings** → **API**
3. Find **Service Role Key** (starts with `eyJ...`)
4. Copy and paste as `SUPABASE_SERVICE_ROLE_KEY`

### 2. NextAuth Secret
Generate a secure random string:
```bash
# Option 1: Online generator
https://generate-secret.vercel.app/32

# Option 2: Using OpenSSL
openssl rand -base64 32
```

---

## 📋 Variable Explanations

### PayFast Variables
- `PAYFAST_MERCHANT_ID`: Your PayFast merchant ID
- `PAYFAST_MERCHANT_KEY`: Your PayFast merchant key  
- `PAYFAST_PASSPHRASE`: Your PayFast passphrase (CRITICAL for signature)
- `PAYFAST_ENVIRONMENT`: "production" for live site

### Application Variables
- `NEXT_PUBLIC_BASE_URL`: Your site URL (localhost for dev, domain for prod)
- `NODE_ENV`: "development" for local, "production" for live

### NextAuth Variables
- `NEXTAUTH_URL`: Your site URL for authentication
- `NEXTAUTH_SECRET`: Secret key for session security

### Supabase Variables
- `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY`: Public key (safe for browser)
- `SUPABASE_SERVICE_ROLE_KEY`: Server key (admin access, keep secret)

### Optional Variables
- `GEMINI_API_KEY`: For AI chatbot functionality

---

## 🚨 Security Notes

### ✅ Safe for Browser (NEXT_PUBLIC_*)
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY`
- `NEXT_PUBLIC_BASE_URL`

### ⚠️ Keep Secret (Server Only)
- `PAYFAST_PASSPHRASE`
- `NEXTAUTH_SECRET`
- `SUPABASE_SERVICE_ROLE_KEY`
- `GEMINI_API_KEY`

---

## 🔍 Testing Your Environment

### 1. Check Supabase Connection
Create test file `test-supabase.js`:
```javascript
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY
);

supabase.from('products').select('*').then(console.log);
```

### 2. Check PayFast Configuration
Visit: `/api/debug/env` - should show all variables as "SET"

### 3. Check Database Health
Visit: `/api/health` - should show database connection status

---

## 📝 Setup Checklist

### Local Development ✅
- [ ] Copy all variables to `.env.local`
- [ ] Replace `your_nextauth_secret_here` with generated secret
- [ ] Replace `your_service_role_key_here` with actual key
- [ ] Test local development server

### Production (Vercel) ✅
- [ ] Add all variables to Vercel Environment Variables
- [ ] Select **Production** environment
- [ ] Save and redeploy
- [ ] Test live site functionality

### Database Setup ✅
- [ ] Run SQL schema in Supabase
- [ ] Create admin user
- [ ] Set up storage bucket
- [ ] Test database connection

---

## 🆘 Troubleshooting

### Error: "Invalid environment variable"
- Check variable names match exactly
- Ensure no extra spaces or special characters
- Verify Vercel variables are set to Production

### Error: "Supabase connection failed"
- Verify Supabase URL and keys are correct
- Check service role key has proper permissions
- Ensure database schema is installed

### Error: "PayFast signature mismatch"
- Verify `PAYFAST_PASSPHRASE` matches exactly
- Check for extra spaces or special characters
- Ensure environment is set to "production"

---

## 📞 Support Resources

- **Supabase Dashboard:** https://oaeirdgffwodkbcstdfh.supabase.co
- **PayFast Support:** [email protected]
- **Vercel Docs:** https://vercel.com/docs

---

**Last Updated:** March 31, 2026
**Status:** Production Ready ✅
**Priority:** HIGH - Add to Vercel immediately!
