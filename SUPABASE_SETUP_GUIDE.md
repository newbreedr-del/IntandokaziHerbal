# 🚀 Supabase Production Setup Guide

## Step 1: Run SQL Schema in Supabase

1. Go to your Supabase project: https://oaeirdgffwodkbcstdfh.supabase.co
2. Navigate to **SQL Editor** in the left sidebar
3. Click **New Query**
4. Copy the entire contents of `supabase/schema.sql`
5. Paste into the SQL editor
6. Click **Run** (or press Ctrl+Enter)
7. Wait for completion (should take 10-30 seconds)

✅ **Expected Result:** All tables, indexes, policies, and functions created successfully.

---

## Step 2: Set Up Authentication

### Enable Email Authentication
1. Go to **Authentication** → **Providers**
2. Enable **Email** provider
3. Configure email templates (optional)

### Create Admin User
1. Go to **Authentication** → **Users**
2. Click **Add User**
3. Enter admin email and password
4. Click **Create User**
5. Copy the user ID

### Link Admin User to admin_users Table
Run this SQL (replace `YOUR_AUTH_USER_ID` with the copied ID):

```sql
INSERT INTO admin_users (auth_user_id, email, full_name, role, can_manage_settings)
VALUES (
  'YOUR_AUTH_USER_ID',
  '[email protected]',
  'Nthandokazi Mokoatle',
  'super_admin',
  true
);
```

---

## Step 3: Configure Storage for Product Images

1. Go to **Storage** in the left sidebar
2. Click **Create a new bucket**
3. Name it: `product-images`
4. Set to **Public bucket** (so images are accessible)
5. Click **Create bucket**

### Set Storage Policies
Run this SQL:

```sql
-- Allow public read access to product images
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING (bucket_id = 'product-images');

-- Allow authenticated users to upload
CREATE POLICY "Authenticated users can upload"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'product-images' 
  AND auth.role() = 'authenticated'
);
```

---

## Step 4: Update Environment Variables

### Local Development (.env.local)
```bash
NEXT_PUBLIC_SUPABASE_URL=https://oaeirdgffwodkbcstdfh.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY=sb_publishable_JyAloXV06F0SSKRf868Hsg_rAVV3_Bv
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

### Production (Vercel)
1. Go to Vercel project settings
2. Navigate to **Environment Variables**
3. Add the same variables above
4. Select **Production** environment
5. Click **Save**
6. **Redeploy** your site

---

## Step 5: Seed Initial Data

### Add Products
You can either:
- Use the admin dashboard to add products manually
- Or run this SQL to add sample products:

```sql
INSERT INTO products (name, slug, description, short_description, price, stock_quantity, category, is_active, is_featured)
VALUES
  ('Herbal Healing Tea', 'herbal-healing-tea', 'A soothing blend of traditional African herbs known for their healing properties.', 'Traditional healing tea blend', 89.99, 50, 'Teas', true, true),
  ('Natural Skin Cream', 'natural-skin-cream', 'Nourishing cream made from natural ingredients to rejuvenate your skin.', 'Organic skin nourishment', 149.99, 30, 'Skincare', true, true),
  ('Immune Boost Tonic', 'immune-boost-tonic', 'Powerful herbal tonic to strengthen your immune system naturally.', 'Natural immune support', 129.99, 40, 'Tonics', true, false);
```

---

## Step 6: Test Database Connection

### Test Query
Run this in your app or SQL editor:

```sql
SELECT * FROM products WHERE is_active = true;
```

### Test from Next.js
Create a test page or API route:

```typescript
import { createClient } from '@/utils/supabase/server';

export async function GET() {
  const supabase = await createClient();
  const { data, error } = await supabase.from('products').select('*');
  
  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
  
  return Response.json({ products: data });
}
```

---

## Database Tables Overview

### Core Tables
- **customers** - Customer information and profiles
- **addresses** - Shipping and billing addresses
- **products** - Product catalog
- **orders** - Order records
- **order_items** - Individual items in orders
- **payments** - Payment transactions
- **eft_confirmations** - EFT payment proof tracking

### Business Tools
- **invoices** - Invoice generation and tracking
- **quotes** - Quote management
- **quote_items** - Items in quotes
- **reviews** - Product reviews and ratings

### Admin
- **admin_users** - Admin user permissions
- **activity_log** - Audit trail of admin actions

### Reporting Views
- **sales_summary** - Daily sales analytics
- **product_performance** - Product sales metrics
- **customer_lifetime_value** - Customer value analysis

---

## Security Features

✅ **Row Level Security (RLS)** enabled on all tables
✅ **Policies** restrict access based on user roles
✅ **Indexes** for optimal query performance
✅ **Triggers** for automatic timestamp updates
✅ **Functions** for generating unique references

---

## Next Steps

1. ✅ Run schema.sql in Supabase
2. ✅ Create admin user
3. ✅ Set up storage bucket
4. ✅ Update environment variables
5. ✅ Test database connection
6. ✅ Seed initial products
7. ✅ Deploy to production

---

## Troubleshooting

### "relation does not exist" error
- Make sure you ran the entire schema.sql file
- Check that you're connected to the correct project

### "permission denied" error
- Check RLS policies are set correctly
- Verify user authentication is working
- Ensure service role key is used for admin operations

### Images not loading
- Verify storage bucket is public
- Check storage policies are set
- Confirm image URLs are correct

---

## Support

- **Supabase Docs:** https://supabase.com/docs
- **SQL Reference:** https://www.postgresql.org/docs/
- **Project Dashboard:** https://oaeirdgffwodkbcstdfh.supabase.co

---

**Last Updated:** March 31, 2026
**Database Version:** 1.0.0
**Status:** Production Ready ✅
