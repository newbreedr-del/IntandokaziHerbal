# 🚀 Launch Instructions - Nthandokazi Herbal Platform

## Quick Start Guide

### Step 1: Install Dependencies
```bash
npm install
```

### Step 2: Configure Environment Variables
Your `.env.local` file is already set up with placeholders. You need to add your actual credentials:

#### Required for Stitch Payments:
```env
STITCH_CLIENT_ID=your_actual_client_id
STITCH_CLIENT_SECRET=your_actual_client_secret
STITCH_ENVIRONMENT=sandbox  # Keep as sandbox for testing
```

#### Required for Respond.io WhatsApp:
```env
RESPONDIO_API_KEY=your_actual_api_key
RESPONDIO_CHANNEL_ID=your_whatsapp_channel_id
NEXT_PUBLIC_RESPONDIO_WORKSPACE_ID=your_workspace_id
```

#### Update Bank Account Details:
Edit `src/lib/stitch.ts` around line 130:
```typescript
beneficiaryName: 'Nthandokazi Herbal',
beneficiaryBankId: 'fnb', // Your bank: fnb, absa, nedbank, capitec, etc.
beneficiaryAccountNumber: 'YOUR_ACCOUNT_NUMBER',
```

### Step 3: Start Development Server
```bash
npm run dev
```

Visit: http://localhost:3000

### Step 4: Test the Platform

#### Test Store & Checkout:
1. Go to `/store` - Browse products
2. Add items to cart
3. Proceed to checkout
4. Fill in test details
5. Select "Instant EFT (Stitch)" payment
6. Complete test payment (sandbox mode)

#### Test WhatsApp Integration:
1. Look for chat widget (bottom-right corner)
2. Send a test message
3. Check Respond.io dashboard

#### Test Admin Dashboard:
1. Go to `/` - Main dashboard
2. View business metrics
3. Manage products, sales, clients

## Git Setup & Push

### Initialize Git Repository
```bash
git init
```

### Add All Files
```bash
git add .
```

### Create Initial Commit
```bash
git commit -m "🚀 Initial commit: World-class e-commerce platform with Stitch payments and Respond.io integration

✅ Features:
- Stitch instant EFT payment integration
- Respond.io WhatsApp Business integration
- Modern UI with Framer Motion animations
- Complete e-commerce store with checkout
- Business management dashboard
- Error handling and loading states
- Comprehensive documentation

📦 Dependencies added:
- framer-motion, axios, zod, react-hot-toast
- @headlessui/react, clsx, tailwind-merge

🔧 Configuration:
- Environment variables set up
- API routes for payments and messaging
- Webhook handlers implemented
- Health check endpoint added"
```

### Add Remote Repository
```bash
# Replace with your actual repository URL
git remote add origin https://github.com/yourusername/nthandokazi-herbal.git
```

### Push to GitHub
```bash
git push -u origin main
```

## What's Been Built

### 🛍️ E-commerce Platform
- **Product Catalog** - Beautiful product cards with animations
- **Shopping Cart** - Real-time cart updates
- **Multi-step Checkout** - Modern checkout flow
- **Order Management** - Complete order tracking

### 💳 Payment Integration
- **Stitch Instant EFT** - Bank-level secure payments
- **Multiple Payment Methods** - EFT, Card, Mobile, Cash
- **Webhook Handling** - Automatic payment status updates
- **Sandbox Testing** - Safe testing environment

### 💬 Customer Communication
- **WhatsApp Integration** - Via Respond.io
- **Live Chat Widget** - Embedded on store pages
- **Automated Notifications** - Order confirmations
- **Auto-responses** - Common questions

### 🎨 Modern UI/UX
- **Framer Motion** - Smooth animations everywhere
- **Loading States** - Beautiful branded spinners
- **Toast Notifications** - Real-time feedback
- **Error Boundaries** - Graceful error handling
- **Responsive Design** - Works on all devices

### 📊 Business Management
- **Dashboard** - Real-time metrics and analytics
- **Sales Tracking** - Complete sales management
- **Client Management** - Customer database
- **Inventory Management** - Stock tracking
- **Bookkeeping** - Financial reports

## Important Files

| File | Purpose |
|------|---------|
| `src/lib/stitch.ts` | Stitch payment integration |
| `src/lib/respondio.ts` | Respond.io messaging integration |
| `src/hooks/useStitchPayment.ts` | Payment handling hook |
| `src/app/store/checkout/page.tsx` | Enhanced checkout flow |
| `.env.local` | Environment variables |
| `INTEGRATION_GUIDE.md` | Detailed setup instructions |
| `README.md` | Complete documentation |

## Environment Variables Explained

```env
# AI Chatbot (Already configured)
GEMINI_API_KEY=AIzaSyCKzsID--6ockxc_RdxKFfIXiNqGGwXITo

# Stitch Payments (Add your credentials)
STITCH_CLIENT_ID=your_stitch_client_id
STITCH_CLIENT_SECRET=your_stitch_client_secret
STITCH_ENVIRONMENT=sandbox
STITCH_WEBHOOK_SECRET=your_webhook_secret

# Respond.io WhatsApp (Add your credentials)
RESPONDIO_API_KEY=your_respondio_api_key
RESPONDIO_CHANNEL_ID=your_whatsapp_channel_id
NEXT_PUBLIC_RESPONDIO_WORKSPACE_ID=your_workspace_id

# Application
NEXT_PUBLIC_BASE_URL=http://localhost:3000
NODE_ENV=development
```

## Testing Checklist

### Before Going Live:
- [ ] Install dependencies: `npm install`
- [ ] Start server: `npm run dev`
- [ ] Test store functionality
- [ ] Test checkout flow (sandbox mode)
- [ ] Test chat widget
- [ ] Verify admin dashboard
- [ ] Check all animations and transitions

### Production Setup:
- [ ] Get Stitch production credentials
- [ ] Complete KYC verification
- [ ] Set up WhatsApp Business via Respond.io
- [ ] Update webhook URLs to production domain
- [ ] Switch `STITCH_ENVIRONMENT` to `production`
- [ ] Update `NEXT_PUBLIC_BASE_URL` to production URL
- [ ] Deploy and test thoroughly

## Troubleshooting

### Common Issues:
1. **Module not found errors** → Run `npm install`
2. **Payment not working** → Check Stitch credentials
3. **Chat widget not showing** → Verify Respond.io workspace ID
4. **Environment variables not working** → Restart server after changes

### Health Check:
Visit http://localhost:3000/api/health to see integration status.

## Next Steps

1. **Immediate:** Run `npm install` and `npm run dev`
2. **Testing:** Test all features in sandbox mode
3. **Setup:** Get Stitch and Respond.io credentials
4. **Production:** Complete KYC and go live

## Support

- 📖 Read `INTEGRATION_GUIDE.md` for detailed setup
- 📖 Check `README.md` for full documentation
- 🐛 Check browser console for errors
- 📧 Contact support for help

---

**Ready to launch! 🚀 Run the commands above to get started.**
