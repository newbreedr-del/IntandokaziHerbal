# 🚀 Complete Supabase Setup Guide - World-Class E-Commerce Platform

## 📋 Overview

This guide will help you set up a complete, production-ready e-commerce platform with:
- ✅ Full database with all 18 products
- ✅ Product image storage with automatic naming
- ✅ Admin authentication and role-based access
- ✅ Order management and tracking
- ✅ Payment integration (PayFast + EFT)
- ✅ Complete bookkeeping system
- ✅ Customer authentication
- ✅ Financial reporting and analytics

---

## 🎯 Step 1: Run Database Schema (10 minutes)

### 1.1 Access Supabase SQL Editor
1. Go to: https://oaeirdgffwodkbcstdfh.supabase.co
2. Click **SQL Editor** in left sidebar
3. Click **New Query**

### 1.2 Execute Schema
1. Open file: `supabase/complete_schema_with_products.sql`
2. Copy **entire contents** (it's large - 2000+ lines)
3. Paste into SQL Editor
4. Click **Run** (or Ctrl+Enter)
5. Wait 30-60 seconds for completion

### 1.3 Verify Installation
Run this query to verify:
```sql
SELECT 
  (SELECT COUNT(*) FROM products) as total_products,
  (SELECT COUNT(*) FROM chart_of_accounts) as total_accounts,
  (SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public') as total_tables;
```

Expected result:
- total_products: 18
- total_accounts: 27
- total_tables: 25+

---

## 🖼️ Step 2: Set Up Product Image Storage (5 minutes)

### 2.1 Create Storage Bucket
1. Go to **Storage** in left sidebar
2. Click **New bucket**
3. Name: `product-images`
4. **Public bucket**: ✅ YES (images need to be publicly accessible)
5. Click **Create bucket**

### 2.2 Set Storage Policies
Go to **Storage** → **Policies** → **product-images** → **New Policy**

**Policy 1: Public Read Access**
```sql
CREATE POLICY "Public can view product images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'product-images');
```

**Policy 2: Authenticated Upload**
```sql
CREATE POLICY "Authenticated users can upload images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'product-images');
```

**Policy 3: Authenticated Update**
```sql
CREATE POLICY "Authenticated users can update images"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'product-images');
```

**Policy 4: Authenticated Delete**
```sql
CREATE POLICY "Authenticated users can delete images"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'product-images');
```

### 2.3 Upload Product Images

**Image Naming Convention:**
- Main image: `{slug}.jpg` (e.g., `imbiza-yamadoda.jpg`)
- Gallery images: `{slug}-1.jpg`, `{slug}-2.jpg`, etc.

**Required Images (18 products):**
```
1.  imbiza-yamadoda.jpg
2.  imbiza-yokuchatha.jpg
3.  stop-nonsense.jpg
4.  imbiza-yomhlume.jpg
5.  umabulala-idliso.jpg
6.  umhlabelo.jpg
7.  imbiza-yama-ulcer.jpg
8.  umvusa-nkunzi.jpg
9.  zakhanya-liquid.jpg
10. yokuthandeka.jpg
11. inhlanhla-emhlophe.jpg
12. umakhiphi-isichitho.jpg
13. tissue-oil-eyenenhlannhla.jpg
14. tissue-oil-yesichitho.jpg
15. shower-gel-ikhipha-isichitho.jpg
16. shower-gel-yokuthandeka.jpg
17. umkhanyakude-jelly-vaseline.jpg
18. umakhiphi-isichitho-vaseline.jpg
```

**Upload Process:**
1. Rename your product images to match the slugs above
2. Go to **Storage** → **product-images**
3. Click **Upload file**
4. Select all 18 images
5. Upload

### 2.4 Update Image URLs in Database
After uploading, run this SQL to update all product image URLs:

```sql
UPDATE products 
SET image_url = 'https://oaeirdgffwodkbcstdfh.supabase.co/storage/v1/object/public/product-images/' || slug || '.jpg'
WHERE image_url IS NOT NULL;
```

Verify:
```sql
SELECT name, image_url FROM products LIMIT 5;
```

---

## 🔐 Step 3: Set Up Admin Authentication (5 minutes)

### 3.1 Enable Email Authentication
1. Go to **Authentication** → **Providers**
2. Enable **Email** provider
3. **Confirm email**: Toggle OFF (for faster testing)
4. **Secure email change**: Toggle ON
5. Save

### 3.2 Create Your Admin Account
1. Go to **Authentication** → **Users**
2. Click **Add user** → **Create new user**
3. Enter your email (e.g., `admin@intandokazi.co.za`)
4. Enter a strong password
5. Click **Create user**
6. **Copy the User ID** (you'll need this next)

### 3.3 Link Admin to Database
Run this SQL (replace `YOUR_USER_ID` with the copied ID):

```sql
INSERT INTO admin_users (
  auth_user_id,
  email,
  full_name,
  role,
  can_manage_products,
  can_manage_orders,
  can_manage_customers,
  can_view_financials,
  can_manage_settings,
  is_active
) VALUES (
  'YOUR_USER_ID',
  'admin@intandokazi.co.za',
  'Nthandokazi Mokoatle',
  'super_admin',
  true,
  true,
  true,
  true,
  true,
  true
);
```

Verify:
```sql
SELECT email, role, is_active FROM admin_users;
```

---

## 🔑 Step 4: Get API Keys (2 minutes)

### 4.1 Get Supabase Keys
1. Go to **Settings** → **API**
2. Copy these keys:

**ANON Key (Public):**
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Service Role Key (Secret):**
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 4.2 Update Environment Variables

**Local (.env.local):**
```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://oaeirdgffwodkbcstdfh.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# PayFast
PAYFAST_MERCHANT_ID=34249465
PAYFAST_MERCHANT_KEY=oktxmly5tlwxf
PAYFAST_PASSPHRASE=Intandokazi2026
PAYFAST_ENVIRONMENT=production

# App
NEXT_PUBLIC_BASE_URL=http://localhost:3000
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=generate_random_secret_here

# Gemini (Optional)
GEMINI_API_KEY=your_gemini_key_here
```

**Production (Vercel):**
Add the same variables to Vercel → Settings → Environment Variables

---

## 🧪 Step 5: Test Everything (5 minutes)

### 5.1 Test Database Connection
Visit: `http://localhost:3000/api/test-db`

Expected response:
```json
{
  "status": "success",
  "message": "Database connection successful",
  "data": {
    "totalProducts": 18,
    "sampleProducts": [...]
  }
}
```

### 5.2 Test Products API
Visit: `http://localhost:3000/api/products`

Expected: Array of 18 products with image URLs

### 5.3 Test Store Page
Visit: `http://localhost:3000/store`

Expected: All 18 products displayed with images

### 5.4 Test Admin Login
Visit: `http://localhost:3000/admin/login`

Login with your admin credentials

---

## 📊 Step 6: Understanding the Database Structure

### Core Tables

**Products Management:**
- `products` - All product data with images
- `product_categories` - Category management
- `reviews` - Customer reviews

**Customer Management:**
- `customers` - Customer accounts
- `addresses` - Shipping/billing addresses

**Order Management:**
- `orders` - Order records
- `order_items` - Items in each order
- `payments` - Payment transactions
- `eft_confirmations` - EFT proof tracking

**Business Tools:**
- `invoices` - Invoice generation
- `quotes` - Quote management
- `quote_items` - Quote line items

**Bookkeeping:**
- `chart_of_accounts` - Account structure
- `journal_entries` - All financial transactions
- `journal_entry_lines` - Transaction details
- `expenses` - Expense tracking
- `bank_transactions` - Bank reconciliation

**Admin:**
- `admin_users` - Admin accounts with permissions
- `activity_log` - Audit trail

---

## 🎨 Image Management Best Practices

### Naming Convention
- **Slugs are auto-generated** from product names
- **Images must match slug exactly**
- Use lowercase, hyphens for spaces
- File extension: `.jpg` (preferred) or `.png`

### Image Specifications
- **Main product image:** 800x800px minimum
- **Gallery images:** 800x800px minimum
- **Format:** JPEG (optimized for web)
- **File size:** < 500KB per image
- **Background:** White or transparent

### Adding New Products
1. Create product in admin (generates slug)
2. Upload image named `{slug}.jpg`
3. Image URL auto-populates

---

## 💼 Bookkeeping System Overview

### Chart of Accounts
Pre-configured with 27 accounts:
- **Assets:** Cash, Receivables, Inventory
- **Liabilities:** Payables, Deposits
- **Equity:** Capital, Retained Earnings
- **Revenue:** Sales, Shipping
- **Expenses:** COGS, Marketing, Shipping, Fees

### Automatic Journal Entries
The system automatically creates journal entries for:
- ✅ Product sales
- ✅ Payments received
- ✅ Expenses recorded
- ✅ Refunds processed

### Financial Reports Available
- Profit & Loss Statement
- Balance Sheet
- Cash Flow Statement
- Sales by Product
- Sales by Category
- Customer Lifetime Value

---

## 🔒 Security Features

### Row Level Security (RLS)
- ✅ Enabled on all tables
- ✅ Customers can only see their own data
- ✅ Admins have role-based permissions
- ✅ Public can only view active products

### Admin Permissions
- `can_manage_products` - Add/edit/delete products
- `can_manage_orders` - View/update orders
- `can_manage_customers` - View customer data
- `can_view_financials` - Access bookkeeping
- `can_manage_settings` - System configuration

### Authentication
- Email-based authentication via Supabase Auth
- Password reset functionality
- Email verification (optional)
- Session management

---

## 🚀 Next Steps

### For Immediate Use:
1. ✅ Upload all 18 product images
2. ✅ Create admin account
3. ✅ Test store functionality
4. ✅ Process test order

### For Production:
1. Enable email verification
2. Configure email templates
3. Set up custom domain
4. Configure backup strategy
5. Set up monitoring

### For Growth:
1. Add more products via admin
2. Create customer accounts
3. Generate invoices and quotes
4. Track expenses
5. Run financial reports

---

## 📞 Support & Resources

**Supabase Dashboard:**
https://oaeirdgffwodkbcstdfh.supabase.co

**Documentation:**
- Supabase Docs: https://supabase.com/docs
- Storage Guide: https://supabase.com/docs/guides/storage
- Auth Guide: https://supabase.com/docs/guides/auth

**Test Endpoints:**
- Database: `/api/test-db`
- Products: `/api/products`
- Store: `/store`
- Admin: `/admin/login`

---

## ✅ Checklist

### Database Setup
- [ ] Run complete_schema_with_products.sql
- [ ] Verify 18 products created
- [ ] Verify 27 chart of accounts created
- [ ] Verify all tables created

### Storage Setup
- [ ] Create product-images bucket
- [ ] Set storage policies
- [ ] Upload all 18 product images
- [ ] Update image URLs in database

### Authentication Setup
- [ ] Enable email authentication
- [ ] Create admin user
- [ ] Link admin to admin_users table
- [ ] Test admin login

### Environment Setup
- [ ] Add ANON key to .env.local
- [ ] Add SERVICE_ROLE key to .env.local
- [ ] Add all keys to Vercel
- [ ] Test database connection

### Testing
- [ ] Test /api/test-db endpoint
- [ ] Test /api/products endpoint
- [ ] Test /store page
- [ ] Test admin login
- [ ] Place test order

---

**🎉 Your world-class e-commerce platform is ready!**

All 18 products are in the database, ready for images and live sales!
