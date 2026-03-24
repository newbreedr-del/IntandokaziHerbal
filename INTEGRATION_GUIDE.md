# 🌿 Nthandokazi Herbal - Integration Guide

This guide covers the integration of **Stitch Payment Gateway** and **Respond.io** into your e-commerce platform.

---

## 📋 Table of Contents

1. [Prerequisites](#prerequisites)
2. [Stitch Payment Gateway Setup](#stitch-payment-gateway-setup)
3. [Respond.io Setup](#respondio-setup)
4. [Environment Variables](#environment-variables)
5. [Testing](#testing)
6. [Deployment](#deployment)
7. [Troubleshooting](#troubleshooting)

---

## Prerequisites

Before you begin, ensure you have:

- ✅ Node.js 18+ installed
- ✅ A Stitch account ([Sign up here](https://stitch.money))
- ✅ A Respond.io account ([Sign up here](https://respond.io))
- ✅ WhatsApp Business API access (via Respond.io)
- ✅ A South African bank account for receiving payments

---

## 🔐 Stitch Payment Gateway Setup

### Step 1: Create a Stitch Account

1. Go to [stitch.money](https://stitch.money) and sign up
2. Complete KYC verification
3. Navigate to the Dashboard

### Step 2: Get API Credentials

1. In the Stitch Dashboard, go to **Settings** → **API Keys**
2. Create a new API key for your application
3. Copy the following credentials:
   - Client ID
   - Client Secret
4. Generate a webhook secret for security

### Step 3: Configure Webhooks

1. In Stitch Dashboard, go to **Webhooks**
2. Add a new webhook endpoint: `https://yourdomain.com/api/payments/stitch/webhook`
3. Select events to listen to:
   - `payment.completed`
   - `payment.failed`
   - `payment.cancelled`
4. Save the webhook secret

### Step 4: Add Bank Account Details

Update the bank account details in `src/lib/stitch.ts`:

```typescript
beneficiaryName: 'Nthandokazi Herbal',
beneficiaryBankId: 'nedbank', // Your bank ID
beneficiaryAccountNumber: '1234567890', // Your account number
```

**Supported Bank IDs:**
- `absa`
- `capitec`
- `fnb`
- `nedbank`
- `standard_bank`
- `investec`
- `discovery`
- `tymebank`

### Step 5: Test in Sandbox

1. Set `STITCH_ENVIRONMENT=sandbox` in `.env.local`
2. Use Stitch's test credentials to simulate payments
3. Verify webhooks are received correctly

---

## 💬 Respond.io Setup

### Step 1: Create Respond.io Account

1. Sign up at [respond.io](https://respond.io)
2. Complete the onboarding process
3. Connect your WhatsApp Business account

### Step 2: Get API Credentials

1. Go to **Settings** → **API & Webhooks**
2. Generate an API key
3. Copy your Channel ID (WhatsApp channel)
4. Copy your Workspace ID

### Step 3: Configure Webhooks

1. In Respond.io, go to **Webhooks**
2. Add webhook URL: `https://yourdomain.com/api/respondio/webhook`
3. Select events:
   - `message.received`
   - `message.delivered`
   - `message.read`
   - `contact.created`
4. Generate and save webhook secret

### Step 4: Create Message Templates (Optional)

For WhatsApp template messages:

1. Go to **Message Templates** in Respond.io
2. Create templates for:
   - Order confirmation
   - Payment reminder
   - Shipping notification
3. Get approval from WhatsApp (required for templates)

### Step 5: Embed Chat Widget

The chat widget is automatically embedded on your store pages via `RespondIOWidget` component.

To customize:
```typescript
<RespondIOWidget 
  workspaceId="your_workspace_id"
  hideOnMobile={false}
/>
```

---

## 🔧 Environment Variables

Create a `.env.local` file in the root directory:

```bash
# Copy from .env.example
cp .env.example .env.local
```

Update the following variables:

### Stitch Configuration
```env
STITCH_CLIENT_ID=test_client_xxxxx
STITCH_CLIENT_SECRET=test_secret_xxxxx
STITCH_ENVIRONMENT=sandbox
STITCH_WEBHOOK_SECRET=your_webhook_secret_here
```

### Respond.io Configuration
```env
RESPONDIO_API_KEY=your_api_key_here
RESPONDIO_CHANNEL_ID=your_channel_id_here
RESPONDIO_BASE_URL=https://api.respond.io
RESPONDIO_WEBHOOK_SECRET=your_webhook_secret_here
NEXT_PUBLIC_RESPONDIO_WORKSPACE_ID=your_workspace_id_here
```

### Application URLs
```env
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

---

## 🧪 Testing

### Install Dependencies

```bash
npm install
```

### Run Development Server

```bash
npm run dev
```

### Test Stitch Payment Flow

1. Add items to cart
2. Proceed to checkout
3. Fill in billing details
4. Select "Instant EFT (Stitch)" payment method
5. Click "Pay with Stitch"
6. You'll be redirected to Stitch payment page
7. Complete test payment
8. Verify redirect back to confirmation page

### Test Respond.io Integration

1. Visit the store page
2. Look for the chat widget in bottom-right corner
3. Send a test message
4. Check Respond.io dashboard for the message
5. Reply from dashboard and verify it appears in widget

### Test Webhooks Locally

Use ngrok to expose your local server:

```bash
# Install ngrok
npm install -g ngrok

# Expose port 3000
ngrok http 3000

# Update webhook URLs in Stitch and Respond.io dashboards
# Use the ngrok URL: https://xxxxx.ngrok.io/api/payments/stitch/webhook
```

---

## 🚀 Deployment

### Pre-Deployment Checklist

- [ ] Update `STITCH_ENVIRONMENT` to `production`
- [ ] Update `NEXT_PUBLIC_BASE_URL` to your production domain
- [ ] Update webhook URLs in Stitch and Respond.io dashboards
- [ ] Verify bank account details are correct
- [ ] Test payment flow in production mode
- [ ] Set up monitoring for webhook failures

### Deploy to Vercel/Netlify

1. Push code to GitHub
2. Connect repository to Vercel/Netlify
3. Add environment variables in deployment settings
4. Deploy

### Update Webhook URLs

After deployment, update webhook URLs:

**Stitch:**
- `https://yourdomain.com/api/payments/stitch/webhook`

**Respond.io:**
- `https://yourdomain.com/api/respondio/webhook`

---

## 🔍 Troubleshooting

### Stitch Payment Issues

**Problem:** Payment creation fails
- ✅ Check API credentials are correct
- ✅ Verify environment is set correctly (sandbox/production)
- ✅ Check bank account details are valid
- ✅ Review error logs in console

**Problem:** Webhooks not received
- ✅ Verify webhook URL is accessible publicly
- ✅ Check webhook secret matches
- ✅ Review Stitch dashboard for webhook delivery logs
- ✅ Ensure HTTPS is enabled (required for production)

### Respond.io Issues

**Problem:** Chat widget not appearing
- ✅ Check `NEXT_PUBLIC_RESPONDIO_WORKSPACE_ID` is set
- ✅ Verify workspace ID is correct
- ✅ Check browser console for errors
- ✅ Ensure script is loading (check Network tab)

**Problem:** Messages not sending
- ✅ Verify API key is valid
- ✅ Check channel ID is correct
- ✅ Ensure WhatsApp channel is active
- ✅ Review Respond.io dashboard for errors

### General Issues

**Problem:** Module not found errors
```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

**Problem:** TypeScript errors
```bash
# Rebuild TypeScript
npm run build
```

---

## 📞 Support

### Stitch Support
- Documentation: https://stitch.money/docs
- Support: support@stitch.money
- Dashboard: https://stitch.money/dashboard

### Respond.io Support
- Documentation: https://docs.respond.io
- Support: support@respond.io
- Dashboard: https://app.respond.io

---

## 🎯 Next Steps

1. **Complete KYC verification** with Stitch
2. **Set up WhatsApp Business** account via Respond.io
3. **Create message templates** for automated notifications
4. **Test thoroughly** in sandbox environment
5. **Go live** and monitor transactions

---

## 📝 Notes

- Stitch charges a transaction fee (check their pricing)
- WhatsApp template messages require approval (24-48 hours)
- Keep webhook secrets secure and never commit to Git
- Monitor webhook delivery in both dashboards
- Set up error alerting for failed payments/messages

---

**Last Updated:** March 2026
**Version:** 1.0.0
