# PayFast Integration Details - Intandokazi Herbal Products

**Date:** March 31, 2026  
**Merchant:** Intandokazi Herbal Products  
**Website:** https://intandokaziherbal.co.za  
**Environment:** Production

---

## Merchant Account Details

- **Merchant ID:** 34249465
- **Merchant Key:** oktxmly5tlwxf
- **Passphrase:** Intandokazi2026
- **Environment:** Production (Live)

---

## Integration Overview

We have implemented a custom PayFast integration for our e-commerce store selling traditional herbal products. The integration uses server-side signature generation and form-based POST submission to PayFast.

---

## Technical Implementation

### 1. Payment Flow

1. Customer completes checkout on our site
2. Our backend API creates payment data with signature
3. Customer is redirected to PayFast via form POST
4. PayFast processes payment
5. Customer returns to our site
6. PayFast sends ITN (webhook) to our server

### 2. API Endpoint

**Backend Payment Creation:**
```
POST https://intandokaziherbal.co.za/api/payments/payfast/create
```

**Request Payload Example:**
```json
{
  "amount": 100.00,
  "reference": "NTK-123456",
  "customerName": "John Doe",
  "customerEmail": "john@example.com",
  "customerPhone": "0723456789",
  "itemName": "Order NTK-123456 - Intandokazi Herbal",
  "itemDescription": "Imbiza Yamadoda x1, Bath Salt x2"
}
```

### 3. PayFast Submission

**PayFast URL:**
```
https://www.payfast.co.za/eng/process
```

**Form Parameters Submitted:**
```
merchant_id=34249465
merchant_key=oktxmly5tlwxf
return_url=https://intandokaziherbal.co.za/store/order-confirmation
cancel_url=https://intandokaziherbal.co.za/store/checkout
notify_url=https://intandokaziherbal.co.za/api/payments/payfast/webhook
name_first=John
name_last=Doe
email_address=john@example.com
cell_number=0723456789
m_payment_id=NTK-123456
amount=100.00
item_name=Order NTK-123456 - Intandokazi Herbal
item_description=Imbiza Yamadoda x1, Bath Salt x2
email_confirmation=1
confirmation_address=john@example.com
signature=[MD5_HASH]
```

---

## Signature Generation

### Algorithm

Our signature is generated following PayFast specifications:

1. **Sort parameters alphabetically** (excluding `signature` field)
2. **URL encode** each value with:
   - Uppercase hex characters (e.g., `%3A` not `%3a`)
   - Spaces as `+` (not `%20`)
   - Trim whitespace from values
3. **Concatenate** as `key=value&key=value...`
4. **Append passphrase** at the end: `&passphrase=Intandokazi2026`
5. **Generate MD5 hash** (lowercase)

### Example Parameter String (Before Hashing)

```
amount=100.00&cancel_url=https%3A%2F%2Fintandokaziherbal.co.za%2Fstore%2Fcheckout&cell_number=0723456789&confirmation_address=john%40example.com&email_address=john%40example.com&email_confirmation=1&item_description=Imbiza+Yamadoda+x1%2C+Bath+Salt+x2&item_name=Order+NTK-123456+-+Intandokazi+Herbal&m_payment_id=NTK-123456&merchant_id=34249465&merchant_key=oktxmly5tlwxf&name_first=John&name_last=Doe&notify_url=https%3A%2F%2Fintandokaziherbal.co.za%2Fapi%2Fpayments%2Fpayfast%2Fwebhook&return_url=https%3A%2F%2Fintandokaziherbal.co.za%2Fstore%2Forder-confirmation&passphrase=Intandokazi2026
```

### Implementation (TypeScript/Node.js)

```typescript
generateSignature(data: Record<string, string>, passphrase?: string): string {
  // Helper function to encode with uppercase hex and spaces as +
  const pfEncode = (str: string): string => {
    return encodeURIComponent(str.trim())
      .replace(/%20/g, '+')
      .replace(/[!'()*]/g, (c) => '%' + c.charCodeAt(0).toString(16).toUpperCase())
      .replace(/%([0-9a-f]{2})/gi, (match, hex) => '%' + hex.toUpperCase());
  };
  
  // Create parameter string with alphabetically sorted keys
  let paramString = '';
  const sortedKeys = Object.keys(data).sort();
  
  for (const key of sortedKeys) {
    if (key !== 'signature') {
      paramString += `${key}=${pfEncode(data[key])}&`;
    }
  }
  
  // Remove last ampersand
  paramString = paramString.slice(0, -1);
  
  // Add passphrase if provided
  if (passphrase) {
    paramString += `&passphrase=${pfEncode(passphrase)}`;
  }
  
  // Generate MD5 hash (must be lowercase)
  return crypto.createHash('md5').update(paramString).digest('hex');
}
```

---

## Webhook Configuration

### ITN (Instant Transaction Notification) Endpoint

```
POST https://intandokaziherbal.co.za/api/payments/payfast/webhook
```

**Expected ITN Data:**
- `m_payment_id` - Our reference number
- `pf_payment_id` - PayFast payment ID
- `payment_status` - COMPLETE, FAILED, PENDING, or CANCELLED
- `amount_gross` - Payment amount
- `amount_fee` - PayFast fee
- `amount_net` - Net amount
- `signature` - PayFast signature for verification

**Webhook Response:**
- Returns HTTP 200 on successful processing
- Verifies signature before processing
- Updates order status in our database

---

## URLs

### Return URLs

**Success Return URL:**
```
https://intandokaziherbal.co.za/store/order-confirmation
```

**Cancel URL:**
```
https://intandokaziherbal.co.za/store/checkout
```

**Notify URL (ITN):**
```
https://intandokaziherbal.co.za/api/payments/payfast/webhook
```

---

## Issue Encountered

### Signature Mismatch Error (400 Bad Request)

**Error Message:**
```
Generated signature does not match submitted signature
```

**Root Cause:**
Initial implementation used lowercase URL encoding (e.g., `%3a`) instead of uppercase (e.g., `%3A`) as required by PayFast specification.

**Resolution:**
Updated signature generation to force uppercase hex characters in URL encoding, matching PayFast's exact requirements.

---

## Testing Information

### Test Transaction Details

- **Test Amount:** R5.00 - R100.00
- **Test Products:** Traditional herbal remedies (18 products available)
- **Average Order Value:** R150 - R500
- **Expected Transaction Volume:** 50-100 orders per month

### Verification Checklist

- [x] Merchant credentials configured (Production)
- [x] Passphrase set and matching
- [x] Signature generation using uppercase URL encoding
- [x] All parameters trimmed of whitespace
- [x] Parameters sorted alphabetically
- [x] MD5 hash generated in lowercase
- [x] Return URLs configured correctly
- [x] Webhook endpoint ready to receive ITN
- [x] SSL certificate valid on domain

---

## Technical Stack

- **Framework:** Next.js 14.2
- **Runtime:** Node.js 24.x
- **Language:** TypeScript
- **Hosting:** Hostinger (Production)
- **SSL:** Valid certificate on intandokaziherbal.co.za

---

## Contact Information

**Developer Contact:**
- **Email:** [Your email]
- **Phone:** [Your phone]

**Business Contact:**
- **Business Name:** Intandokazi Herbal Products
- **Email:** info@intandokaziherbal.co.za
- **Phone:** [Business phone]

---

## Support Request

We are experiencing a signature mismatch error when submitting payments to PayFast. We have:

1. ✅ Verified merchant credentials are correct
2. ✅ Confirmed passphrase matches exactly
3. ✅ Implemented signature generation per specification
4. ✅ Used uppercase URL encoding
5. ✅ Sorted parameters alphabetically
6. ✅ Trimmed all values
7. ✅ Generated MD5 hash in lowercase

**Request:**
Please verify our signature generation is correct and confirm our merchant account is properly configured for production payments.

---

**Generated:** March 31, 2026  
**Document Version:** 1.0
