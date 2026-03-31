# PayFast Custom Integration Checklist

Based on PayFast's official tutorial and documentation.

## ✅ Step 1: Basic Form Integration

### Required Fields
- [x] `merchant_id` - Your unique merchant ID
- [x] `merchant_key` - Your unique merchant key
- [x] `amount` - Payment amount in ZAR (formatted to 2 decimals)
- [x] `item_name` - Order identifier/product name

### URL Configuration
- [x] `return_url` - Where customer is sent after successful payment
- [x] `cancel_url` - Where customer is sent if they cancel
- [x] `notify_url` - Where PayFast sends ITN (webhook) notifications

### Environment Setup
- [x] Production URL: `https://www.payfast.co.za/eng/process`
- [x] Sandbox URL: `https://sandbox.payfast.co.za/eng/process`
- [x] Environment variable: `PAYFAST_ENVIRONMENT=production`

**Status:** ✅ COMPLETE

---

## ✅ Step 2: Security Signature

### Signature Generation Requirements
- [x] Create MD5 hash of form values
- [x] **CRITICAL:** Use field order (NOT alphabetical) as per PayFast docs
- [x] URL encode values with UPPERCASE hex characters (e.g., `%3A` not `%3a`)
- [x] Encode spaces as `+` (not `%20`)
- [x] Trim all values before encoding
- [x] Append passphrase at the end
- [x] Generate lowercase MD5 hash

### Field Order (As Per PayFast Documentation)
```
1. Merchant Details: merchant_id, merchant_key, return_url, cancel_url, notify_url
2. Customer Details: name_first, name_last, email_address, cell_number
3. Transaction Details: m_payment_id, amount, item_name, item_description, custom_*
4. Transaction Options: email_confirmation, confirmation_address
5. Payment Method: payment_method
```

**Status:** ✅ COMPLETE (Fixed in commit 3286442)

---

## ✅ Step 3: Additional Payment Data

### Customer Details (Optional but Recommended)
- [x] `name_first` - Customer first name
- [x] `name_last` - Customer last name
- [x] `email_address` - Customer email
- [x] `cell_number` - Customer phone number

### Transaction Details
- [x] `m_payment_id` - Unique order reference
- [x] `item_description` - Order description
- [x] `custom_str1-5` - Custom string fields (available)
- [x] `custom_int1-5` - Custom integer fields (available)

### Transaction Options
- [x] `email_confirmation` - Send confirmation email (set to '1')
- [x] `confirmation_address` - Email for confirmation

**Status:** ✅ COMPLETE

---

## ✅ Step 4: ITN (Instant Transaction Notification) Setup

### Webhook Endpoint
- [x] Endpoint created: `/api/payments/payfast/webhook`
- [x] Returns HTTP 200 to acknowledge receipt
- [x] Publicly accessible URL (required for production)

### Security Checks (As Per PayFast Tutorial)

#### 1. Signature Verification
- [x] Verify signature matches PayFast's signature
- [x] Use same signature generation logic as payment form

#### 2. Valid PayFast Domain Check
- [x] Verify request comes from valid PayFast domains:
  - `www.payfast.co.za`
  - `sandbox.payfast.co.za`
  - `w1w.payfast.co.za`
  - `w2w.payfast.co.za`

#### 3. Payment Data Validation
- [ ] **TODO:** Compare expected amount with `amount_gross`
- [ ] **TODO:** Verify order exists in database

#### 4. Server Confirmation
- [ ] **TODO:** Perform server request to PayFast to validate
  - Production: `https://www.payfast.co.za/eng/query/validate`
  - Sandbox: `https://sandbox.payfast.co.za/eng/query/validate`

### ITN Data Handling
- [x] Receive ITN parameters
- [x] Parse `payment_status` (COMPLETE, FAILED, PENDING, CANCELLED)
- [x] Extract `m_payment_id` (your order reference)
- [x] Extract `pf_payment_id` (PayFast transaction ID)
- [x] Extract `amount_gross`, `amount_fee`, `amount_net`
- [ ] **TODO:** Update order status in database

**Status:** ⚠️ PARTIAL - Security checks need enhancement

---

## 🔧 Implementation Files

### Core Files
- ✅ `src/lib/payfast.ts` - PayFast gateway class with signature generation
- ✅ `src/app/api/payments/payfast/create/route.ts` - Payment creation endpoint
- ✅ `src/app/api/payments/payfast/webhook/route.ts` - ITN webhook handler
- ✅ `src/hooks/usePayFastPayment.ts` - Frontend payment hook
- ✅ `.env.local` - Environment configuration

### Configuration
- ✅ Merchant ID: 34249465
- ✅ Merchant Key: oktxmly5tlwxf
- ✅ Passphrase: Intandokazi2026
- ✅ Environment: production

---

## 🚨 Critical Issues Fixed

### Issue 1: Alphabetical vs Field Order ✅ FIXED
**Problem:** Using alphabetical ordering instead of PayFast field order
**Solution:** Updated signature generation to use correct field order (commit 3286442)
**Reference:** PayFast docs: "Do not use the API signature format, which uses alphabetical ordering!"

### Issue 2: URL Encoding Case ✅ FIXED
**Problem:** Lowercase hex characters in URL encoding
**Solution:** Force uppercase hex characters (e.g., `%3A` not `%3a`)
**Reference:** PayFast docs: "The resultant URL encoding must be in upper case"

### Issue 3: Node Version ✅ FIXED
**Problem:** Node 24 causing deployment issues
**Solution:** Changed to Node 18.x for compatibility (commit 9eec8e1)

---

## 📋 Remaining Tasks

### High Priority
1. **Enhance ITN Security Checks**
   - Add amount validation
   - Add server confirmation request to PayFast
   - Add IP address verification

2. **Database Integration**
   - Update order status on payment completion
   - Store PayFast transaction ID
   - Log payment events

3. **Error Handling**
   - Add retry logic for failed ITN processing
   - Add admin notifications for failed payments
   - Add customer email notifications

### Medium Priority
4. **Testing**
   - Test with sandbox account
   - Test all payment statuses (COMPLETE, FAILED, CANCELLED)
   - Test signature verification
   - Test ITN webhook

5. **Production Readiness**
   - Remove debug logging
   - Add monitoring/alerting
   - Document deployment process

---

## 🧪 Testing Checklist

- [ ] Create sandbox PayFast account
- [ ] Test successful payment flow
- [ ] Test cancelled payment
- [ ] Test failed payment
- [ ] Verify ITN webhook receives notifications
- [ ] Verify signature validation works
- [ ] Test with different amounts
- [ ] Test with special characters in customer names
- [ ] Verify return URLs work correctly
- [ ] Test on production domain (not localhost)

---

## 📚 References

- PayFast Developer Docs: https://developers.payfast.co.za/docs
- PayFast Custom Integration Tutorial: Video transcript provided
- PayFast Sandbox: https://sandbox.payfast.co.za
- PayFast Support: [email protected] / 021 300 4455

---

**Last Updated:** March 31, 2026
**Implementation Status:** 85% Complete
**Ready for Testing:** Yes (with sandbox account)
