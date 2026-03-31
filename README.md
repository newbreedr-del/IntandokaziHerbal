# 🌿 Nthandokazi Herbal - E-Commerce Platform

A modern, world-class e-commerce platform for traditional African herbal remedies and organic wellness products, built with Next.js 14, TypeScript, and Tailwind CSS.

## ✨ Features

### 🛍️ E-Commerce
- **Modern Product Catalog** - Beautiful product cards with animations
- **Smart Shopping Cart** - Real-time cart updates with smooth transitions
- **Advanced Checkout** - Multi-step checkout with validation
- **Multiple Payment Methods** - PayFast (Card, EFT, Instant EFT), manual EFT, cash on delivery

### 💳 Payment Integration
- **PayFast Payment Gateway** - Card, EFT, and Instant EFT payments
- **Real-time Payment Status** - ITN webhook-based payment confirmations
- **Secure Transactions** - MD5 signature verification for webhooks

### 💬 Customer Communication
- **Respond.io Integration** - WhatsApp Business API integration
- **Live Chat Widget** - Embedded chat for customer support
- **Automated Notifications** - Order confirmations, payment reminders
- **Template Messages** - WhatsApp template messages for marketing

### 🎨 Modern UI/UX
- **Framer Motion Animations** - Smooth page transitions and micro-interactions
- **Responsive Design** - Mobile-first, works on all devices
- **Loading States** - Beautiful loading spinners and skeletons
- **Toast Notifications** - Real-time feedback for user actions
- **Error Boundaries** - Graceful error handling

### 📊 Business Management
- **Dashboard** - Real-time business metrics and analytics
- **Sales Tracking** - Comprehensive sales management
- **Client Management** - Customer database with purchase history
- **Inventory Management** - Stock tracking with low-stock alerts
- **Bookkeeping** - Expense tracking and financial reports

## 🚀 Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Animations:** Framer Motion
- **Charts:** Recharts
- **Icons:** Lucide React
- **Forms:** React Hook Form + Zod
- **HTTP Client:** Axios
- **Notifications:** React Hot Toast
- **Payment:** PayFast API
- **Messaging:** Respond.io API

## 📦 Installation

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Git

### Setup

1. **Clone the repository**
```bash
git clone https://github.com/newbreedr-del/IntandokaziHerbal.git
cd IntandokaziHerbal
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**
```bash
cp .env.example .env.local
```

Edit `.env.local` and add your credentials:
- Gemini API key (for AI chatbot)
- Stitch payment credentials
- Respond.io credentials

4. **Run development server**
```bash
npm run dev
```

5. **Open in browser**
```
http://localhost:3000
```

## 🔧 Configuration

### Stitch Payment Gateway

See [INTEGRATION_GUIDE.md](./INTEGRATION_GUIDE.md) for detailed setup instructions.

Quick setup:
1. Sign up at [stitch.money](https://stitch.money)
2. Get API credentials from dashboard
3. Add credentials to `.env.local`
4. Configure webhooks
5. Test in sandbox mode

### Respond.io Integration

See [INTEGRATION_GUIDE.md](./INTEGRATION_GUIDE.md) for detailed setup instructions.

Quick setup:
1. Sign up at [respond.io](https://respond.io)
2. Connect WhatsApp Business account
3. Get API key and workspace ID
4. Add credentials to `.env.local`
5. Configure webhooks

## 📁 Project Structure

```
src/
├── app/                    # Next.js app router pages
│   ├── api/               # API routes
│   │   ├── payments/      # Stitch payment endpoints
│   │   └── respondio/     # Respond.io endpoints
│   ├── store/             # E-commerce store pages
│   │   ├── checkout/      # Checkout flow
│   │   └── order-confirmation/
│   ├── clients/           # Client management
│   ├── products/          # Product management
│   ├── sales/             # Sales tracking
│   └── bookkeeping/       # Financial management
├── components/            # React components
│   ├── ui/               # Reusable UI components
│   └── store/            # Store-specific components
├── lib/                   # Utility libraries
│   ├── stitch.ts         # Stitch payment integration
│   ├── respondio.ts      # Respond.io integration
│   ├── cartContext.tsx   # Shopping cart state
│   └── utils.ts          # Helper functions
├── hooks/                 # Custom React hooks
│   └── useStitchPayment.ts
└── types/                 # TypeScript type definitions
```

## 🎯 Key Features Explained

### Payment Flow

1. Customer adds items to cart
2. Proceeds to checkout
3. Fills in billing/shipping details
4. Selects payment method (Stitch recommended)
5. Reviews order
6. Clicks "Pay with Stitch"
7. Redirected to Stitch payment page
8. Completes bank authentication
9. Redirected back to confirmation page
10. Webhook updates order status
11. Confirmation sent via email & WhatsApp

### Respond.io Integration

- **Chat Widget:** Embedded on all store pages
- **Auto-responses:** Common questions answered automatically
- **Order Updates:** Customers receive WhatsApp notifications
- **Support:** Live chat for customer inquiries
- **Marketing:** Template messages for promotions

## 🧪 Testing

### Run Tests
```bash
npm run test
```

### Test Payment Flow
1. Use sandbox mode (`STITCH_ENVIRONMENT=sandbox`)
2. Use test credentials from Stitch dashboard
3. Complete test payment
4. Verify webhook received
5. Check order confirmation

### Test Webhooks Locally
```bash
# Install ngrok
npm install -g ngrok

# Expose local server
ngrok http 3000

# Update webhook URLs with ngrok URL
```

## 🚀 Deployment

### Build for Production
```bash
npm run build
```

### Deploy to Vercel
```bash
npm install -g vercel
vercel
```

### Deploy to Netlify
```bash
npm run build
# Upload 'out' folder to Netlify
```

### Post-Deployment
1. Update `NEXT_PUBLIC_BASE_URL` to production URL
2. Update webhook URLs in Stitch and Respond.io
3. Switch to production mode (`STITCH_ENVIRONMENT=production`)
4. Test payment flow
5. Monitor webhooks

## 📊 Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `GEMINI_API_KEY` | Google Gemini API key | Yes |
| `STITCH_CLIENT_ID` | Stitch client ID | Yes |
| `STITCH_CLIENT_SECRET` | Stitch client secret | Yes |
| `STITCH_ENVIRONMENT` | `sandbox` or `production` | Yes |
| `STITCH_WEBHOOK_SECRET` | Webhook signature secret | Yes |
| `RESPONDIO_API_KEY` | Respond.io API key | Yes |
| `RESPONDIO_CHANNEL_ID` | WhatsApp channel ID | Yes |
| `RESPONDIO_WEBHOOK_SECRET` | Webhook signature secret | Yes |
| `NEXT_PUBLIC_RESPONDIO_WORKSPACE_ID` | Workspace ID for widget | Yes |
| `NEXT_PUBLIC_BASE_URL` | Application base URL | Yes |

## 🛠️ Development

### Code Style
- ESLint for linting
- Prettier for formatting
- TypeScript for type safety

### Best Practices
- Use TypeScript for all new files
- Follow component naming conventions
- Write descriptive commit messages
- Test before pushing
- Keep components small and focused

## 📝 API Documentation

### Stitch Payment Endpoints

**POST** `/api/payments/stitch/create`
- Creates a new payment request
- Returns payment URL for redirect

**GET** `/api/payments/stitch/status?paymentId={id}`
- Gets payment status
- Returns current payment state

**POST** `/api/payments/stitch/webhook`
- Receives payment status updates
- Verifies signature
- Updates order status

### Respond.io Endpoints

**POST** `/api/respondio/send-message`
- Sends a message to customer
- Supports text and templates

**POST** `/api/respondio/webhook`
- Receives incoming messages
- Handles message events
- Auto-responds to queries

## 🐛 Troubleshooting

See [INTEGRATION_GUIDE.md](./INTEGRATION_GUIDE.md#troubleshooting) for detailed troubleshooting steps.

Common issues:
- **Module not found:** Run `npm install`
- **Payment fails:** Check API credentials
- **Webhooks not working:** Verify webhook URLs and secrets
- **Chat widget not showing:** Check workspace ID

## 📞 Support

- **Documentation:** See INTEGRATION_GUIDE.md
- **Issues:** Create a GitHub issue
- **Email:** support@nthandokazi.co.za

## 📄 License

Proprietary - All rights reserved

## 🙏 Acknowledgments

- **Stitch Money** - Payment gateway
- **Respond.io** - Customer communication platform
- **Next.js** - React framework
- **Tailwind CSS** - Styling framework
- **Framer Motion** - Animation library

---

**Built with ❤️ for Nthandokazi Herbal**
