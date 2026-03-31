# 📦 PAXI & PARGO Courier Setup Guide

Complete guide to integrating PAXI and PARGO courier services with your Nthandokazi Herbal e-commerce platform.

## Overview

Your platform now supports two major South African courier services:
- **PAXI** - 2800+ counter-to-counter pickup points at PEP stores
- **PARGO** - 4000+ click-and-collect points (stores, lockers, pickup points)

Both integrations are fully functional with API support, tracking, and automated notifications.

---

## PAXI Integration

### About PAXI
- **Network:** 2800+ PEP stores nationwide
- **Service:** Counter-to-counter delivery
- **Pricing:** R60-R150 based on weight
- **Insurance:** Optional (R10 for R2500, R20 for R5000)
- **Delivery Time:** 2-5 business days

### Setup Steps

#### 1. Register for PAXI Business
1. Visit: https://www.paxi.co.za/business-tools
2. Click "Contact Us" for API integration
3. Provide business details and requirements
4. Wait for approval and credentials

#### 2. Get API Credentials
Once approved, you'll receive:
- **API Key** - Your authentication key
- **Business ID** - Your unique business identifier
- **Webhook Secret** - For secure webhook verification

#### 3. Configure Environment Variables
Add to your `.env.local`:
```env
PAXI_API_KEY=your_actual_api_key
PAXI_BUSINESS_ID=your_actual_business_id
PAXI_ENVIRONMENT=sandbox  # Change to 'production' when ready
```

#### 4. Test in Sandbox Mode
```typescript
import { getPaxiClient } from '@/lib/paxi';

const paxi = getPaxiClient();

// Register a test parcel
const result = await paxi.registerParcel({
  reference: 'TEST-001',
  senderName: 'Nthandokazi Herbal',
  senderPhone: '+27 11 123 4567',
  senderEmail: 'info@nthandokazi.co.za',
  recipientName: 'Test Customer',
  recipientPhone: '+27 72 345 6789',
  recipientEmail: 'test@email.com',
  paxiPointId: 'TEST_POINT',
  weight: 2,
  value: 500,
  description: 'Test parcel',
  insurance: false
});

console.log('Tracking Number:', result.trackingNumber);
console.log('QR Code:', result.qrCode);
```

#### 5. Find PAXI Points
```typescript
// Find PAXI points in a city
const points = await paxi.findPaxiPoints('Pretoria', 'Gauteng');

points.forEach(point => {
  console.log(`${point.name} - ${point.address}`);
  console.log(`Hours: ${point.hours}`);
  console.log(`Phone: ${point.phone}`);
});
```

#### 6. Track Parcels
```typescript
const tracking = await paxi.trackParcel('PX123456789');

console.log('Status:', tracking.status);
console.log('Location:', tracking.paxiPointName);
console.log('Estimated Delivery:', tracking.estimatedDelivery);
```

### PAXI Features in Your Platform

✅ **Automatic Registration** - Parcels auto-registered when order is placed  
✅ **Real-time Tracking** - Track parcels in admin dashboard  
✅ **Customer Notifications** - SMS/WhatsApp updates via Respond.io  
✅ **Point Locator** - Customers can choose nearest PAXI point  
✅ **Insurance Options** - Optional parcel insurance  
✅ **QR Codes** - Generated for easy parcel identification  

### PAXI Pricing Calculator
```typescript
const cost = await paxi.calculateShipping(
  weight: 3,      // kg
  value: 750,     // ZAR
  insurance: true // optional
);
// Returns: R85 (R75 base + R10 insurance)
```

---

## PARGO Integration

### About PARGO
- **Network:** 4000+ pickup points nationwide
- **Service:** Click & collect, drop-off returns
- **Pricing:** Flat rate ~R65 (free over R500)
- **Success Rate:** 100% first-attempt delivery
- **Delivery Time:** 2-5 business days

### Setup Steps

#### 1. Register for PARGO
1. Visit: https://pargo.co.za/business-sign-up
2. Fill in business registration form
3. Connect your online store
4. Get API credentials

#### 2. Get API Credentials
You'll receive:
- **API Key** - Your authentication token
- **Store ID** - Your unique store identifier
- **Webhook URL** - For delivery notifications

#### 3. Configure Environment Variables
Add to your `.env.local`:
```env
PARGO_API_KEY=your_actual_api_key
PARGO_STORE_ID=your_actual_store_id
PARGO_ENVIRONMENT=sandbox  # Change to 'production' when ready
```

#### 4. Test in Sandbox Mode
```typescript
import { getPargoClient } from '@/lib/pargo';

const pargo = getPargoClient();

// Create a test delivery
const result = await pargo.createDelivery({
  orderNumber: 'TEST-001',
  customerName: 'Test Customer',
  customerPhone: '+27 72 345 6789',
  customerEmail: 'test@email.com',
  pargoPointCode: 'TEST_POINT',
  items: [
    { name: 'Immune Booster Tea', quantity: 2, value: 300 }
  ],
  totalValue: 500,
  collectionInstructions: 'Present ID for collection'
});

console.log('Tracking Number:', result.trackingNumber);
console.log('Collection Code:', result.collectionCode);
```

#### 5. Find PARGO Points
```typescript
// Find PARGO points in a city
const points = await pargo.findPargoPoints(
  'Johannesburg', 
  'Gauteng',
  'store' // or 'locker' or 'pickup_point'
);

points.forEach(point => {
  console.log(`${point.name} (${point.type})`);
  console.log(`${point.address}`);
  console.log(`Hours: ${point.hours}`);
});
```

#### 6. Track Deliveries
```typescript
const tracking = await pargo.trackDelivery('PG987654321');

console.log('Status:', tracking.status);
console.log('Pickup Point:', tracking.pargoPointName);
console.log('Collection Code:', tracking.collectionCode);
console.log('Estimated Arrival:', tracking.estimatedArrival);
```

### PARGO Features in Your Platform

✅ **Click & Collect** - Customers collect at convenient locations  
✅ **Collection Codes** - Unique codes for secure pickup  
✅ **Real-time Tracking** - Track deliveries in admin dashboard  
✅ **Drop-off Returns** - Easy returns process  
✅ **Multiple Point Types** - Stores, lockers, pickup points  
✅ **Automated Notifications** - Collection ready alerts  

### PARGO Pricing Calculator
```typescript
const cost = await pargo.calculateShipping(
  totalValue: 450,
  destination: 'Johannesburg'
);
// Returns: R65 (or R0 if totalValue >= 500)
```

---

## Integration Workflow

### Order Processing Flow

1. **Customer Places Order**
   - Selects PAXI or PARGO as delivery method
   - Chooses nearest pickup point
   - Completes payment

2. **System Processes Order**
   - Order saved to database
   - Payment verified (Stitch)
   - Invoice generated automatically

3. **Courier Registration**
   ```typescript
   // Automatically triggered after payment
   if (order.courier === 'paxi') {
     const paxi = getPaxiClient();
     const result = await paxi.registerParcel({
       reference: order.orderRef,
       // ... other details
     });
     order.trackingNumber = result.trackingNumber;
   } else if (order.courier === 'pargo') {
     const pargo = getPargoClient();
     const result = await pargo.createDelivery({
       orderNumber: order.orderRef,
       // ... other details
     });
     order.trackingNumber = result.trackingNumber;
     order.collectionCode = result.collectionCode;
   }
   ```

4. **Customer Notification**
   - WhatsApp message via Respond.io
   - Email with tracking number
   - SMS with collection code (PARGO)

5. **Tracking Updates**
   - Webhook receives status updates
   - Admin dashboard shows real-time status
   - Customer receives delivery notifications

6. **Collection/Delivery**
   - Customer collects from PAXI/PARGO point
   - Presents collection code or ID
   - Order marked as delivered

---

## Admin Dashboard Usage

### Viewing Shipments
1. Login to admin portal: `/admin/login`
2. Navigate to dashboard: `/admin/dashboard`
3. View orders table with tracking info
4. Click truck icon to view tracking details

### Tracking a Shipment
1. Click tracking number or truck icon
2. View real-time status and location
3. See complete tracking history
4. Get pickup point details
5. Refresh for latest updates

### Managing Orders
- **Filter by courier:** PAXI, PARGO, or none
- **Search by tracking number**
- **View delivery status**
- **Generate shipping labels**

---

## Customer Experience

### Choosing Delivery Method
Customers see delivery options at checkout:
- **PAXI Courier** - Counter-to-counter (2800+ points)
- **PARGO Click & Collect** - Pickup points (4000+ locations)
- **Standard Delivery** - Direct to address

### Finding Pickup Points
- Interactive map showing nearest points
- Filter by distance, hours, facilities
- See point details (address, phone, hours)
- Get directions

### Tracking Orders
Customers can track via:
- Email link with tracking number
- WhatsApp message with tracking link
- Order confirmation page
- "Track Order" page on website

---

## Webhooks

### PAXI Webhooks
Configure webhook URL in PAXI dashboard:
```
https://yourdomain.com/api/couriers/paxi/webhook
```

Events received:
- `parcel.registered` - Parcel registered
- `parcel.collected` - Picked up by courier
- `parcel.in_transit` - On the way
- `parcel.at_paxi_point` - Ready for collection
- `parcel.delivered` - Collected by customer
- `parcel.cancelled` - Order cancelled

### PARGO Webhooks
Configure webhook URL in PARGO dashboard:
```
https://yourdomain.com/api/couriers/pargo/webhook
```

Events received:
- `delivery.created` - Delivery created
- `delivery.in_transit` - On the way
- `delivery.at_pargo_point` - Ready for collection
- `delivery.collected` - Collected by customer
- `delivery.returned` - Returned to sender

---

## Troubleshooting

### PAXI Issues

**Problem:** Parcel registration fails  
**Solution:** 
- Verify API credentials are correct
- Check weight and value are within limits
- Ensure PAXI point ID is valid
- Review error message in console

**Problem:** Tracking not updating  
**Solution:**
- Verify webhook URL is configured
- Check webhook secret matches
- Review webhook logs
- Contact PAXI support

### PARGO Issues

**Problem:** Delivery creation fails  
**Solution:**
- Verify API credentials
- Check PARGO point code is valid
- Ensure all required fields are provided
- Review API response for errors

**Problem:** Collection code not received  
**Solution:**
- Check customer contact details
- Verify notification settings
- Resend via admin dashboard
- Contact PARGO support

### General Issues

**Problem:** Courier integration not working  
**Solution:**
- Check environment variables are set
- Verify you're using correct environment (sandbox/production)
- Run `npm install` to ensure dependencies are installed
- Check API rate limits

---

## Going Live Checklist

### PAXI Production
- [ ] Complete PAXI business verification
- [ ] Get production API credentials
- [ ] Update `PAXI_ENVIRONMENT=production`
- [ ] Configure production webhook URL
- [ ] Test with real parcels
- [ ] Monitor first few deliveries

### PARGO Production
- [ ] Complete PARGO business verification
- [ ] Get production API credentials
- [ ] Update `PARGO_ENVIRONMENT=production`
- [ ] Configure production webhook URL
- [ ] Test with real deliveries
- [ ] Monitor collection success rate

### General
- [ ] Update business details in courier profiles
- [ ] Set up automated notifications
- [ ] Train staff on admin dashboard
- [ ] Create customer support procedures
- [ ] Monitor delivery success rates
- [ ] Collect customer feedback

---

## Support & Resources

### PAXI
- Website: https://www.paxi.co.za
- Business Tools: https://www.paxi.co.za/business-tools
- Support: 086 000 7294
- Email: business@paxi.co.za

### PARGO
- Website: https://pargo.co.za
- Business Signup: https://pargo.co.za/business-sign-up
- Support: Available 7 days a week
- Email: support@pargo.co.za

### Your Platform
- Admin Guide: See `ADMIN_GUIDE.md`
- Integration Guide: See `INTEGRATION_GUIDE.md`
- API Documentation: See code comments in `src/lib/paxi.ts` and `src/lib/pargo.ts`

---

**Ready to ship! 📦 Your courier integrations are fully functional and ready for testing.**
