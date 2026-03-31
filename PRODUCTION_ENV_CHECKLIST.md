# Production Environment Variables Checklist

## ⚠️ CRITICAL: Set These in Your Hosting Platform

Your production deployment needs these environment variables configured in your hosting platform's dashboard (Vercel, Netlify, Hostinger, etc.).

---

## Required Environment Variables

### 1. PayFast Configuration (REQUIRED)

```bash
PAYFAST_MERCHANT_ID=34249465
PAYFAST_MERCHANT_KEY=oktxmly5tlwxf
PAYFAST_PASSPHRASE=Intandokazi2026
PAYFAST_ENVIRONMENT=production
```

**⚠️ IMPORTANT:** Without these, checkout will fail with a 500 error.

### 2. Application URLs (REQUIRED)

```bash
NEXT_PUBLIC_BASE_URL=https://intandokaziherbal.co.za
NEXTAUTH_URL=https://intandokaziherbal.co.za
NODE_ENV=production
```

### 3. NextAuth Secret (REQUIRED for Admin)

```bash
NEXTAUTH_SECRET=your_nextauth_secret_here_generate_random_string
```

**Generate a secure random string:**
```bash
# On Linux/Mac:
openssl rand -base64 32

# Or use online generator:
# https://generate-secret.vercel.app/32
```

### 4. Optional: AI Chatbot

```bash
GEMINI_API_KEY=your_gemini_api_key_here
```

---

## How to Set Environment Variables

### Vercel
1. Go to your project dashboard
2. Click **Settings** → **Environment Variables**
3. Add each variable with its value
4. Select **Production** environment
5. Click **Save**
6. **Redeploy** your site

### Netlify
1. Go to **Site settings** → **Build & deploy** → **Environment**
2. Click **Edit variables**
3. Add each variable
4. Click **Save**
5. **Trigger a new deploy**

### Hostinger
1. Go to **hPanel** → **Advanced** → **Environment Variables**
2. Add each variable
3. Save changes
4. Restart your application

---

## Verification Steps

After setting environment variables:

1. **Check the debug endpoint:**
   ```
   https://intandokaziherbal.co.za/api/debug/env
   ```
   Should show all variables as "SET"

2. **Check the health endpoint:**
   ```
   https://intandokaziherbal.co.za/api/health
   ```
   Should show PayFast as "configured: true"

3. **Test checkout:**
   - Add a product to cart
   - Proceed to checkout
   - Fill in details
   - Click "Place Order"
   - Should redirect to PayFast (not show error)

---

## Common Issues

### Issue: "Server configuration error: Missing PAYFAST_PASSPHRASE"
**Solution:** Add `PAYFAST_PASSPHRASE=Intandokazi2026` to production environment variables

### Issue: Checkout redirects back to products page
**Solution:** Check browser console for error. Likely missing environment variables.

### Issue: 400 Bad Request from PayFast
**Solution:** 
- Verify all PayFast credentials are correct
- Ensure `PAYFAST_ENVIRONMENT=production`
- Check that passphrase matches your PayFast account

### Issue: Signature mismatch
**Solution:**
- Verify passphrase is EXACTLY: `Intandokazi2026`
- No extra spaces or characters
- Case-sensitive

---

## Security Notes

- ✅ Never commit `.env.local` to git (already in `.gitignore`)
- ✅ Keep credentials secure
- ✅ Use different credentials for sandbox vs production
- ✅ Rotate `NEXTAUTH_SECRET` periodically

---

**Last Updated:** March 31, 2026
