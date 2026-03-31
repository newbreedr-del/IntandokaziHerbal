# 🔐 Admin Portal Guide

Complete guide to using the Nthandokazi Herbal admin portal with authentication, invoicing, and tracking.

## Table of Contents
- [Getting Started](#getting-started)
- [Authentication](#authentication)
- [Dashboard Overview](#dashboard-overview)
- [Invoicing System](#invoicing-system)
- [Tracking System](#tracking-system)
- [PAXI Integration](#paxi-integration)
- [PARGO Integration](#pargo-integration)

---

## Getting Started

### Access the Admin Portal
Navigate to: `http://localhost:3000/admin/login`

### Default Credentials
```
Email: admin@nthandokazi.co.za
Password: admin123
```

⚠️ **Important:** Change these credentials in production by updating `src/lib/auth.ts`

---

## Authentication

### How It Works
- Built with **NextAuth.js** for secure authentication
- JWT-based sessions (30-day expiry)
- Protected routes using middleware
- Automatic redirect to login if not authenticated

### Protected Routes
- `/admin/dashboard` - Main admin dashboard
- `/admin/invoices/*` - Invoice management
- `/admin/tracking/*` - Shipment tracking

### Changing Admin Password

1. Generate a new password hash:
```bash
node -e "const bcrypt = require('bcryptjs'); console.log(bcrypt.hashSync('your_new_password', 10));"
```

2. Update `src/lib/auth.ts`:
```typescript
const ADMIN_USERS = [
  {
    id: '1',
    email: 'admin@nthandokazi.co.za',
    name: 'Admin',
    password: 'YOUR_NEW_HASH_HERE',
    role: 'admin'
  }
];
```

### Adding More Admin Users
Edit the `ADMIN_USERS` array in `src/lib/auth.ts` and add new user objects.

---

## Dashboard Overview

### Key Metrics
- **Total Orders** - All orders in the system
- **Total Revenue** - Sum of all paid orders
- **Pending Orders** - Orders awaiting processing
- **Shipped Today** - Orders shipped in the last 24 hours

### Quick Actions
- **Manage Invoices** - Generate and download invoices
- **Track Shipments** - View real-time tracking for PAXI/PARGO
- **View Store** - Navigate to customer-facing store

### Orders Table
View and manage all orders with:
- Search by order reference or customer name
- Filter by status (pending, processing, shipped, delivered, cancelled)
- Quick actions: Generate invoice, track shipment, view details

---

## Invoicing System

### Features
- **PDF Generation** - Professional invoices with QR codes
- **Email Invoices** - Send directly to customers
- **Print Support** - Print-ready format
- **Customizable** - Edit invoice details and branding

### Generating an Invoice

1. From the dashboard, click the download icon next to an order
2. Or navigate to `/admin/invoices/[orderId]`
3. Click "Download PDF" to save locally
4. Click "Print" to print directly
5. Click "Email" to send to customer

### Invoice Details Include
- Business information with VAT number
- Customer billing details
- Itemized product list with quantities and prices
- Subtotal, delivery, discounts, and total
- Payment method and status
- QR code for verification
- Terms and conditions

### Customizing Invoices
Edit `src/lib/invoice.ts` to customize:
- Colors and branding
- Logo placement
- Terms and conditions
- Footer text

---

## Tracking System

### Supported Couriers
- **PAXI** - Counter-to-counter delivery
- **PARGO** - Click & collect pickup points

### Viewing Tracking Information

1. From dashboard, click the truck icon next to an order
2. Or navigate to `/admin/tracking/[trackingNumber]`
3. View real-time status and location
4. See complete tracking history
5. Get pickup point details (for PAXI/PARGO)

### Tracking Statuses
- **Registered** - Parcel registered in system
- **Collected** - Picked up by courier
- **In Transit** - On the way to destination
- **At Pickup Point** - Ready for customer collection
- **Delivered** - Successfully delivered
- **Cancelled** - Order cancelled

### Tracking Features
- Real-time status updates
- Location history timeline
- Estimated delivery dates
- Pickup point information (name, address, hours)
- Refresh tracking data

---

## PAXI Integration

### What is PAXI?
PAXI is South Africa's largest counter-to-counter parcel delivery service with 2800+ pickup points at PEP stores nationwide.

### Setup

1. **Register for PAXI Business**
   - Visit: https://www.paxi.co.za/business-tools
   - Sign up for a business account
   - Get API credentials

2. **Configure Environment Variables**
   ```env
   PAXI_API_KEY=your_api_key
   PAXI_BUSINESS_ID=your_business_id
   PAXI_ENVIRONMENT=sandbox  # or 'production'
   ```

3. **Test Integration**
   - Use sandbox mode for testing
   - Register test parcels
   - Verify tracking works

### PAXI Features
- **Point Locator** - Find nearest PAXI points
- **Parcel Registration** - Register parcels via API
- **Tracking** - Real-time tracking updates
- **Insurance** - Optional parcel insurance (R10 for R2500 cover, R20 for R5000)
- **Pricing** - Affordable flat rates based on weight

### PAXI Pricing (Approximate)
- Up to 2kg: R60
- Up to 5kg: R75
- Up to 10kg: R95
- Up to 20kg: R120
- Over 20kg: R150

### Using PAXI in Code
```typescript
import { getPaxiClient } from '@/lib/paxi';

const paxi = getPaxiClient();

// Register a parcel
const result = await paxi.registerParcel({
  reference: 'NTH-2024-001',
  senderName: 'Nthandokazi Herbal',
  senderPhone: '+27 11 123 4567',
  senderEmail: 'info@nthandokazi.co.za',
  recipientName: 'Thandi Mokoena',
  recipientPhone: '+27 72 345 6789',
  recipientEmail: 'thandi@email.com',
  paxiPointId: 'PEP_HATFIELD',
  weight: 2,
  value: 500,
  description: 'Herbal products',
  insurance: true
});

// Track a parcel
const tracking = await paxi.trackParcel('PX123456789');
```

---

## PARGO Integration

### What is PARGO?
PARGO is Africa's largest click-and-collect network with 4000+ pickup points including stores and lockers.

### Setup

1. **Register for PARGO**
   - Visit: https://pargo.co.za/business-sign-up
   - Create business account
   - Get API credentials

2. **Configure Environment Variables**
   ```env
   PARGO_API_KEY=your_api_key
   PARGO_STORE_ID=your_store_id
   PARGO_ENVIRONMENT=sandbox  # or 'production'
   ```

3. **Test Integration**
   - Use sandbox mode for testing
   - Create test deliveries
   - Verify collection codes work

### PARGO Features
- **4000+ Pickup Points** - Stores, lockers, and pickup points
- **100% Delivery Success** - First-attempt success rate
- **Flat Rates** - Consistent pricing nationwide
- **Drop-off Returns** - Easy returns process
- **Collection Codes** - Unique codes for customer pickup

### PARGO Pricing
- Flat rate: ~R65 (verify with actual API)
- Free shipping on orders over R500

### Using PARGO in Code
```typescript
import { getPargoClient } from '@/lib/pargo';

const pargo = getPargoClient();

// Create a delivery
const result = await pargo.createDelivery({
  orderNumber: 'NTH-2024-001',
  customerName: 'Thandi Mokoena',
  customerPhone: '+27 72 345 6789',
  customerEmail: 'thandi@email.com',
  pargoPointCode: 'PARGO_JHB_001',
  items: [
    { name: 'Immune Booster Tea', quantity: 2, value: 300 }
  ],
  totalValue: 500,
  collectionInstructions: 'Present ID for collection'
});

// Track a delivery
const tracking = await pargo.trackDelivery('PG987654321');
```

---

## Best Practices

### Security
- ✅ Change default admin password immediately
- ✅ Use strong, unique passwords
- ✅ Keep `NEXTAUTH_SECRET` secure and random
- ✅ Never commit `.env.local` to version control
- ✅ Use HTTPS in production

### Order Management
- ✅ Process orders within 24 hours
- ✅ Generate invoices for all paid orders
- ✅ Send tracking information to customers
- ✅ Update order status regularly

### Courier Integration
- ✅ Test in sandbox mode before going live
- ✅ Verify tracking numbers are correct
- ✅ Monitor delivery success rates
- ✅ Keep customer informed of delays

### Invoice Management
- ✅ Generate invoices for all orders
- ✅ Email invoices to customers automatically
- ✅ Keep digital copies for records
- ✅ Include all required tax information

---

## Troubleshooting

### Can't Login
- Verify credentials are correct
- Check `NEXTAUTH_SECRET` is set
- Clear browser cookies and try again
- Check browser console for errors

### Invoices Not Generating
- Ensure `jspdf` and `jspdf-autotable` are installed
- Check browser console for errors
- Verify invoice data is complete
- Try downloading instead of printing

### Tracking Not Working
- Verify API credentials are correct
- Check courier environment (sandbox vs production)
- Ensure tracking number format is correct
- Check API rate limits

### Orders Not Showing
- Check database connection
- Verify order data exists
- Check filter settings
- Clear search and try again

---

## API Endpoints

### Authentication
- `POST /api/auth/signin` - Sign in
- `POST /api/auth/signout` - Sign out
- `GET /api/auth/session` - Get current session

### Health Check
- `GET /api/health` - Check system status and integrations

---

## Support

For technical support or questions:
- 📧 Email: support@nthandokazi.co.za
- 📖 Documentation: See `README.md` and `INTEGRATION_GUIDE.md`
- 🐛 Issues: Check browser console for errors

---

**Built with ❤️ for Nthandokazi Herbal**
