# Capitec Pay Integration Guide

## 🎯 Overview

Capitec Pay has been integrated via **PayGate** payment gateway. This allows customers to pay directly using their Capitec account.

---

## 📋 Setup Steps

### 1. Register with PayGate

1. Visit https://www.paygate.co.za
2. Click "Get Started" or "Sign Up"
3. Complete the business registration form
4. Submit required documents:
   - Company registration documents
   - Bank statements
   - ID documents
   - Proof of address

### 2. Get Your Credentials

Once approved, you'll receive:
- **PayGate ID** (e.g., `10011072130`)
- **Secret Key** (encryption key for checksums)

### 3. Configure Environment Variables

Add to your `.env.local` file:

```env
# PayGate Configuration
PAYGATE_ID=your_paygate_id_here
PAYGATE_SECRET=your_secret_key_here

# Production URL
PAYGATE_URL=https://secure.paygate.co.za/payweb3/process.trans

# For Testing (use test credentials)
# PAYGATE_URL=https://secure.paygate.co.za/payweb3/test/process.trans
```

### 4. Test Credentials (Sandbox)

For testing, PayGate provides test credentials:

```env
PAYGATE_ID=10011072130
PAYGATE_SECRET=secret
PAYGATE_URL=https://secure.paygate.co.za/payweb3/test/process.trans
```

**Test Cards:**
- **Approved:** 4000000000000002
- **Declined:** 5100000000000003
- **CVV:** Any 3 digits
- **Expiry:** Any future date

---

## 🔧 How It Works

### Payment Flow:

1. **Customer selects Capitec Pay** at checkout
2. **System initiates payment** via PayGate API
3. **Customer redirected** to PayGate payment page
4. **Customer completes payment** using Capitec Pay
5. **PayGate processes** the transaction
6. **Customer redirected back** to your site
7. **Webhook notification** sent to your server
8. **Order status updated** automatically

---

## 📁 Files Created

### Backend Integration:

**`src/lib/paygate.ts`**
- PayGate service class
- Checksum generation/verification
- Payment initiation
- Transaction queries

**`src/app/api/payments/paygate/initiate/route.ts`**
- API endpoint to initiate payments
- Creates payment request
- Returns redirect URL

**`src/app/api/payments/paygate/notify/route.ts`**
- Webhook endpoint for PayGate notifications
- Verifies payment status
- Updates order status

### Frontend:

**`src/app/store/payment-return/page.tsx`**
- Payment return page
- Shows success/failure status
- Handles all payment outcomes

**`src/app/store/checkout/page.tsx`**
- Updated to handle Capitec Pay
- Redirects to PayGate when selected

---

## 💳 Payment Methods Supported

PayGate supports multiple payment methods:

| Code | Method | Description |
|------|--------|-------------|
| `CC` | Credit Card | Visa, Mastercard |
| `BT` | Bank Transfer | EFT, Instant EFT |
| `EW` | eWallet | Various eWallets |
| `PC` | **Capitec Pay** | Direct Capitec payment |

Currently configured for **Capitec Pay (PC)**.

---

## 🔒 Security Features

### Checksum Verification:
- All requests/responses verified with MD5 checksum
- Prevents tampering
- Ensures data integrity

### HTTPS Only:
- All communication over secure HTTPS
- PCI DSS compliant

### Webhook Validation:
- Verifies PayGate notifications
- Prevents fraudulent callbacks

---

## 📊 Transaction Status Codes

| Code | Status | Description |
|------|--------|-------------|
| `0` | Not Done | Transaction pending |
| `1` | **Approved** | Payment successful |
| `2` | Declined | Payment failed |
| `4` | Cancelled | User cancelled |

---

## 🧪 Testing

### Test the Integration:

1. **Start your development server:**
   ```bash
   npm run dev
   ```

2. **Add items to cart** and proceed to checkout

3. **Select "Capitec Pay"** as payment method

4. **Complete checkout** with test details

5. **Use test card** on PayGate page:
   - Card: `4000000000000002`
   - CVV: `123`
   - Expiry: Any future date

6. **Verify redirect** back to success page

### Check Logs:

```bash
# Server logs will show:
- Payment initiation
- PayGate response
- Webhook notifications
- Transaction status updates
```

---

## 🔄 Webhook Configuration

PayGate will send notifications to:
```
https://intandokaziherbal.co.za/api/payments/paygate/notify
```

**Important:**
- Webhook URL must be publicly accessible
- HTTPS required for production
- Responds with status updates

---

## 📝 Customization

### Change Payment Method:

In `src/app/store/checkout/page.tsx`:

```typescript
// For Capitec Pay only
payMethod: 'PC'

// For general card payment
payMethod: 'CC'

// For bank transfer
payMethod: 'BT'
```

### Update Return URLs:

In `src/app/api/payments/paygate/initiate/route.ts`:

```typescript
returnUrl: `${appUrl}/store/payment-return`,
notifyUrl: `${appUrl}/api/payments/paygate/notify`,
```

---

## 🚨 Troubleshooting

### Payment Not Initiating:

**Check:**
- PayGate credentials in `.env.local`
- API endpoint accessible
- Console for error messages

**Solution:**
```bash
# Verify environment variables
echo $PAYGATE_ID
echo $PAYGATE_SECRET
```

### Webhook Not Receiving:

**Check:**
- Webhook URL is public (not localhost)
- HTTPS enabled in production
- PayGate dashboard webhook settings

**Solution:**
- Use ngrok for local testing
- Check server logs for incoming requests

### Invalid Checksum Error:

**Check:**
- Secret key matches PayGate dashboard
- No extra spaces in environment variables
- Data not modified in transit

**Solution:**
```typescript
// Verify checksum calculation
console.log('Calculated checksum:', checksum);
console.log('Received checksum:', data.CHECKSUM);
```

### Payment Declined:

**Check:**
- Using correct test card for sandbox
- Sufficient funds (production)
- Card not expired

---

## 📞 Support

### PayGate Support:
- **Email:** support@paygate.co.za
- **Phone:** +27 (0)11 100 8933
- **Portal:** https://portal.paygate.co.za

### Documentation:
- **API Docs:** https://docs.paygate.co.za
- **Integration Guide:** Available in PayGate portal

---

## 🎯 Production Checklist

Before going live:

- [ ] Register for PayGate production account
- [ ] Complete business verification
- [ ] Get production credentials
- [ ] Update `.env.local` with production keys
- [ ] Change `PAYGATE_URL` to production URL
- [ ] Test with real card (small amount)
- [ ] Verify webhook receives notifications
- [ ] Test full order flow
- [ ] Monitor first few transactions
- [ ] Set up transaction monitoring

---

## 💰 Fees

PayGate charges per transaction:
- **Setup Fee:** Varies by plan
- **Monthly Fee:** Varies by plan
- **Transaction Fee:** ~2.9% + R2.00 per transaction
- **Capitec Pay Fee:** May have specific rates

**Note:** Contact PayGate for exact pricing for your business.

---

## 🔐 PCI Compliance

PayGate is PCI DSS Level 1 compliant:
- No card data stored on your server
- All sensitive data handled by PayGate
- Secure tokenization
- Encrypted transmission

---

## 📈 Monitoring

### Track Transactions:

**PayGate Portal:**
- Login to https://portal.paygate.co.za
- View all transactions
- Download reports
- Manage settings

**Your Database:**
- Log all payment attempts
- Store transaction IDs
- Track success/failure rates

---

## ✅ Integration Complete!

Your Capitec Pay integration is ready. Customers can now:
- ✅ Select Capitec Pay at checkout
- ✅ Pay securely via PayGate
- ✅ Get instant confirmation
- ✅ Receive order updates

**Next Steps:**
1. Register with PayGate
2. Get production credentials
3. Update environment variables
4. Test thoroughly
5. Go live!

---

**Version:** 1.0.0  
**Last Updated:** April 2026  
**Status:** ✅ Ready for Production (after PayGate registration)
