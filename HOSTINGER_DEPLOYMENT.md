# Hostinger Deployment Guide for Intandokazi Herbal Products

## Prerequisites

1. **Hostinger Account** with Node.js hosting support
2. **Domain**: intandokaziherbal.co.za (already configured)
3. **PayFast Account** with credentials ready

## Environment Variables Setup

Add these environment variables in your Hostinger control panel:

```bash
# PayFast Payment Gateway
PAYFAST_MERCHANT_ID=34249465
PAYFAST_MERCHANT_KEY=oktxmly5tlwxf
PAYFAST_PASSPHRASE=IIntandokazi2026
PAYFAST_ENVIRONMENT=production

# Application Configuration
NEXT_PUBLIC_BASE_URL=https://intandokaziherbal.co.za
NODE_ENV=production

# Gemini AI (for chatbot)
GEMINI_API_KEY=AIzaSyCKzsID--6ockxc_RdxKFfIXiNqGGwXITo

# NextAuth (for admin authentication)
NEXTAUTH_URL=https://intandokaziherbal.co.za
NEXTAUTH_SECRET=generate_a_random_secret_string_here

# Optional: Respond.io (WhatsApp integration)
RESPONDIO_API_KEY=your_respondio_api_key
RESPONDIO_CHANNEL_ID=your_whatsapp_channel_id
RESPONDIO_BASE_URL=https://api.respond.io
RESPONDIO_WEBHOOK_SECRET=your_webhook_secret
NEXT_PUBLIC_RESPONDIO_WORKSPACE_ID=your_workspace_id
```

## Deployment Steps

### 1. Connect Git Repository

1. Log into Hostinger control panel
2. Navigate to **Git** section
3. Connect your GitHub repository: `newbreedr-del/Nthandokazi`
4. Select branch: `main`

### 2. Configure Build Settings

**Build Command:**
```bash
npm install && npm run build
```

**Start Command:**
```bash
npm start
```

**Node.js Version:**
```
24.x
```

**Output Directory:**
```
.next
```

### 3. Set Environment Variables

1. Go to **Environment Variables** section
2. Add all variables listed above
3. Save changes

### 4. Deploy

1. Click **Deploy** button
2. Wait for build to complete (5-10 minutes)
3. Check deployment logs for any errors

### 5. Configure Domain

1. Ensure DNS points to Hostinger servers
2. Enable SSL certificate (Let's Encrypt)
3. Force HTTPS redirect

### 6. Verify PayFast Integration

1. Test checkout flow on live site
2. Verify PayFast redirects work correctly
3. Check webhook URL is accessible: `https://intandokaziherbal.co.za/api/payments/payfast/webhook`

## PayFast Webhook Configuration

1. Log into PayFast dashboard: https://www.payfast.co.za
2. Go to **Settings** → **Integration**
3. Set **Notify URL**: `https://intandokaziherbal.co.za/api/payments/payfast/webhook`
4. Enable **Instant Transaction Notifications (ITN)**
5. Save settings

## Testing Checklist

- [ ] Homepage loads correctly
- [ ] Product catalog displays all 18 products
- [ ] Product images load
- [ ] Shopping cart works
- [ ] Checkout form validates
- [ ] PayFast payment redirect works
- [ ] Payment success returns to site
- [ ] Payment failure returns to site
- [ ] Order confirmation page displays
- [ ] Admin dashboard accessible

## Troubleshooting

### Build Fails

- Check Node.js version is 24.x
- Verify all dependencies are in package.json
- Check build logs for specific errors

### PayFast Not Working

- Verify merchant ID and key are correct
- Check passphrase matches PayFast settings
- Ensure webhook URL is publicly accessible
- Check PayFast environment (production vs sandbox)

### Images Not Loading

- Verify images are in `public/images/products/`
- Check file permissions
- Clear CDN cache if using one

### Environment Variables Not Working

- Restart application after adding variables
- Check variable names match exactly (case-sensitive)
- Verify no extra spaces in values

## Support

- **Hostinger Support**: https://www.hostinger.com/support
- **PayFast Support**: support@payfast.co.za
- **Next.js Docs**: https://nextjs.org/docs

## Post-Deployment

1. Monitor PayFast transactions
2. Check error logs regularly
3. Test payment flow weekly
4. Keep dependencies updated
5. Backup database regularly (when implemented)
