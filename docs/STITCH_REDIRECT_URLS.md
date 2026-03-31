# 🔗 Stitch Redirect URLs Configuration

## Your Production Domain
**Domain:** `intandokaziherbal.co.za`

---

## 📍 Redirect URLs to Add in Stitch Dashboard

### Production URLs (Primary):
```
https://intandokaziherbal.co.za/store/order-confirmation
https://intandokaziherbal.co.za/store/checkout
```

### Local Testing URLs (Optional):
```
http://localhost:3000/store/order-confirmation
http://localhost:3000/store/checkout
```

---

## 🔧 How to Add in Stitch Dashboard

### Step 1: Login to Stitch
Go to: https://express.stitch.money/settings

### Step 2: Find Redirect URLs Section
Look for:
- **"Redirect URLs"** or
- **"Callback URLs"** or
- **"API Details"** → **"Redirect URLs"**

### Step 3: Add URLs
Click **"Add Redirect URL"** or **"+"** button

Add each URL one at a time:

#### URL 1 (Success - Production):
```
https://intandokaziherbal.co.za/store/order-confirmation
```

#### URL 2 (Cancel - Production):
```
https://intandokaziherbal.co.za/store/checkout
```

#### URL 3 (Success - Local Testing):
```
http://localhost:3000/store/order-confirmation
```

#### URL 4 (Cancel - Local Testing):
```
http://localhost:3000/store/checkout
```

### Step 4: Save
Click **"Save"** or **"Update"** button

---

## 🎯 What These URLs Do

### Success URL (order-confirmation):
- Customer lands here after **successful payment**
- Shows order confirmation details
- Displays order reference number
- Sends confirmation email/WhatsApp

### Cancel URL (checkout):
- Customer lands here if they **cancel payment**
- Returns to checkout page
- Cart items still preserved
- Can try payment again

---

## 🌐 Webhook URL (Also Add This)

### Production Webhook:
```
https://intandokaziherbal.co.za/api/payments/stitch-express/webhook
```

### Local Testing Webhook (with ngrok):
```
https://your-ngrok-url.ngrok.io/api/payments/stitch-express/webhook
```

**Steps:**
1. In Stitch dashboard, go to **"Webhooks"**
2. Click **"Configure webhooks"** or **"Add webhook"**
3. Add webhook URL
4. Copy the **webhook secret** provided
5. Add to your `.env` file:
   ```env
   STITCH_WEBHOOK_SECRET=your_actual_webhook_secret
   ```

---

## ✅ Verification

After adding redirect URLs, test the flow:

1. **Make a test purchase** on your site
2. **Click "Pay with Stitch"**
3. **Complete payment** on Stitch page
4. **Verify redirect** - You should land on:
   ```
   https://intandokaziherbal.co.za/store/order-confirmation?ref=NTH-2024-001&...
   ```

---

## 📊 Current Configuration

### Environment Variables Set:
```env
NEXT_PUBLIC_BASE_URL=https://intandokaziherbal.co.za
NEXTAUTH_URL=https://intandokaziherbal.co.za
NODE_ENV=production
STITCH_CLIENT_ID=test-4c7f8693-3514-4953-5d88-d8f90c116731
STITCH_CLIENT_SECRET=w0Raphl9eHpde96Y2CvqEM84DyvCN+zBOAiaKDdJsOkkGw6aaItE81GGZi3NStYF
NEXT_PUBLIC_STITCH_MOCK_MODE=false
```

### Redirect URLs in Code:
✅ Automatically use `https://intandokaziherbal.co.za` for redirects
✅ Success URL: `/store/order-confirmation`
✅ Cancel URL: `/store/checkout`

---

## 🚀 Next Steps

1. **Add redirect URLs** in Stitch dashboard (use the URLs above)
2. **Deploy your site** to `intandokaziherbal.co.za`
3. **Test payment flow** on production
4. **Configure webhook** (optional but recommended)
5. **Monitor first transactions**

---

## 🆘 Troubleshooting

### If Redirect Doesn't Work:
- ✅ Verify URLs are added in Stitch dashboard
- ✅ Check URLs use HTTPS (not HTTP)
- ✅ Ensure domain is accessible
- ✅ Check `NEXT_PUBLIC_BASE_URL` is correct

### If Payment Fails:
- ✅ Verify credentials are correct
- ✅ Check server logs for errors
- ✅ Ensure site is deployed and accessible
- ✅ Test locally first with localhost URLs

---

**Your production domain is configured! 🎉**

Add the redirect URLs to your Stitch dashboard and you're ready to go live!
