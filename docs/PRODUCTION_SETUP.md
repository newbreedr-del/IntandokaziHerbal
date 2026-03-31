# 🚀 Production Setup Guide

## ✅ Current Configuration

### Stitch Express (Real API - Active)
```
Client ID: test-4c7f8693-3514-4953-5d88-d8f90c116731
Client Secret: w0Raphl9eHpde96Y2CvqEM84DyvCN+zBOAiaKDdJsOkkGw6aaItE81GGZi3NStYF
Environment: Sandbox (for testing)
Mock Mode: DISABLED ✅
```

---

## 📍 Redirect URLs Setup

### Current (Localhost):
- Success: `http://localhost:3000/store/order-confirmation`
- Cancel: `http://localhost:3000/store/checkout`

### For Production Deployment:

#### Option 1: Deploy to Vercel/Netlify First
1. Deploy your site (get production URL)
2. Update redirect URLs in Stitch dashboard
3. Update `.env` for production

#### Option 2: Use Custom Domain
If you have a domain (e.g., `nthandokazi.co.za`):
1. Add to Stitch dashboard:
   - Success: `https://nthandokazi.co.za/store/order-confirmation`
   - Cancel: `https://nthandokazi.co.za/store/checkout`
2. Update `.env.local`:
   ```env
   NEXT_PUBLIC_BASE_URL=https://nthandokazi.co.za
   ```

---

## 🔧 Stitch Dashboard Configuration

### 1. Add Redirect URLs
In your Stitch Express dashboard:
1. Go to **Settings** → **Redirect URLs**
2. Click **"Add Redirect URL"**
3. Add both URLs:
   ```
   http://localhost:3000/store/order-confirmation
   http://localhost:3000/store/checkout
   ```
4. For production, also add:
   ```
   https://your-domain.com/store/order-confirmation
   https://your-domain.com/store/checkout
   ```

### 2. Configure Webhook
1. Go to **Webhooks** section
2. Add webhook URL:
   - Local (with ngrok): `https://your-ngrok-url.ngrok.io/api/payments/stitch-express/webhook`
   - Production: `https://your-domain.com/api/payments/stitch-express/webhook`
3. Copy the webhook secret
4. Add to `.env.local`:
   ```env
   STITCH_WEBHOOK_SECRET=your_actual_webhook_secret
   ```

---

## 🧪 Testing with Real Stitch

### Test Locally First:
```bash
# Server should already be running
# Visit: http://localhost:3000/store

# Make a test purchase:
1. Add products to cart
2. Go to checkout
3. Select "Instant EFT (Stitch)"
4. Click "Pay with Stitch 🌿"
5. You'll be redirected to REAL Stitch payment page
6. Complete test payment
7. Redirected back to order confirmation
```

### Check Server Logs:
You should see:
```
Requesting Stitch token...
Token acquired successfully
Creating payment link with amount: 50000 cents
```

---

## 🌐 Deployment Options

### Option 1: Vercel (Recommended)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Follow prompts
# Copy production URL
```

### Option 2: Netlify
```bash
# Install Netlify CLI
npm i -g netlify-cli

# Build
npm run build

# Deploy
netlify deploy --prod
```

### Option 3: Custom Server
```bash
# Build for production
npm run build

# Start production server
npm start
```

---

## 📋 Production Checklist

### Before Going Live:
- [ ] Test payment flow locally with new credentials
- [ ] Add redirect URLs to Stitch dashboard
- [ ] Configure webhook URL (use ngrok for local testing)
- [ ] Add webhook secret to environment variables
- [ ] Test webhook events
- [ ] Deploy to production hosting
- [ ] Update `NEXT_PUBLIC_BASE_URL` for production
- [ ] Add production redirect URLs to Stitch
- [ ] Test end-to-end payment flow on production
- [ ] Verify webhook events on production

### Environment Variables for Production:
```env
# Update these for production
NEXT_PUBLIC_BASE_URL=https://your-production-domain.com
NEXTAUTH_URL=https://your-production-domain.com
NODE_ENV=production

# Keep these the same
STITCH_CLIENT_ID=test-4c7f8693-3514-4953-5d88-d8f90c116731
STITCH_CLIENT_SECRET=w0Raphl9eHpde96Y2CvqEM84DyvCN+zBOAiaKDdJsOkkGw6aaItE81GGZi3NStYF
STITCH_ENVIRONMENT=sandbox
NEXT_PUBLIC_STITCH_MOCK_MODE=false
```

---

## 🎯 Next Steps

### Immediate:
1. **Test locally** - Make a purchase at http://localhost:3000/store
2. **Verify credentials work** - Check server logs for token acquisition
3. **Add redirect URLs** - In Stitch dashboard

### For Production:
1. **Choose hosting** - Vercel, Netlify, or custom
2. **Deploy site** - Get production URL
3. **Update Stitch** - Add production redirect URLs
4. **Configure webhook** - Add production webhook URL
5. **Test live** - Make real test payment

---

## 🆘 Troubleshooting

### If Payment Fails:
1. Check server logs for errors
2. Verify credentials are correct
3. Ensure redirect URLs are added to Stitch dashboard
4. Check that mock mode is disabled

### If Redirect Doesn't Work:
1. Verify redirect URLs in Stitch dashboard
2. Check `NEXT_PUBLIC_BASE_URL` is correct
3. Ensure URLs use HTTPS in production

### If Webhook Doesn't Fire:
1. Use ngrok for local testing
2. Verify webhook URL is publicly accessible
3. Check webhook secret matches
4. Review webhook logs in Stitch dashboard

---

## 📞 Support

- **Stitch Support:** express-support@stitch.money
- **Dashboard:** https://stitch.money/dashboard
- **Docs:** https://stitch.money/docs/express

---

**Your site is ready for production testing! 🚀**

Current status:
- ✅ Real Stitch credentials configured
- ✅ Mock mode disabled
- ✅ Payment integration ready
- ⚠️ Need to add redirect URLs to Stitch dashboard
- ⚠️ Need to configure webhook (optional for now)
