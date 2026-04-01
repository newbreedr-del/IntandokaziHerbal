# Supabase Admin Users Setup Guide

## 🚀 How to Make Supabase Recognize Admin Emails

### Method 1: Manual Setup (Recommended)

#### Step 1: Create Auth Users in Supabase Dashboard

1. **Go to Supabase Dashboard**
   - Navigate to your project
   - Go to **Authentication** → **Users**

2. **Create Each Admin User**
   - Click **"Add user"** or **"Invite user"**
   - Enter email and set password
   - Make sure **"Auto confirm"** is checked

3. **Create these users:**
   - **Email:** `admin@intandokaziherbal.co.za`
   - **Password:** `Intandokazi@2024`
   
   - **Email:** `nthandokazi@intandokaziherbal.co.za`
   - **Password:** `Nthandokazi@2024`
   
   - **Email:** `manager@intandokaziherbal.co.za`
   - **Password:** `Manager@2024`

#### Step 2: Run SQL Script

1. **Go to Supabase SQL Editor**
2. **Copy and paste** the contents of `supabase/create-admin-auth-users.sql`
3. **Click "Run"** to execute

#### Step 3: Verify Setup

Run this query to verify:
```sql
SELECT * FROM admin_users WHERE email IN (
  'admin@intandokaziherbal.co.za',
  'nthandokazi@intandokaziherbal.co.za',
  'manager@intandokaziherbal.co.za'
);
```

### Method 2: Using Supabase CLI (Advanced)

If you have the Supabase CLI installed:

```bash
# Create auth users
supabase auth create-user --email admin@intandokaziherbal.co.za --password Intandokazi@2024
supabase auth create-user --email nthandokazi@intandokaziherbal.co.za --password Nthandokazi@2024
supabase auth create-user --email manager@intandokaziherbal.co.za --password Manager@2024

# Run the SQL script
supabase db push supabase/create-admin-auth-users.sql
```

### 🔐 Important Security Notes

#### Password Requirements
- Use strong passwords (as specified)
- Enable **"Auto confirm"** to avoid email verification
- Store passwords securely

#### User Roles
- **super_admin:** Full access to everything
- **admin:** Full access except system settings
- Both roles have product, order, and customer management

### 🛠️ Troubleshooting

#### If Users Can't Login:

1. **Check Auth Users Table:**
   ```sql
   SELECT * FROM auth.users WHERE email IN (
     'admin@intandokaziherbal.co.za',
     'nthandokazi@intandokaziherbal.co.za',
     'manager@intandokaziherbal.co.za'
   );
   ```

2. **Check Admin Users Table:**
   ```sql
   SELECT * FROM admin_users WHERE email IN (
     'admin@intandokaziherbal.co.za',
     'nthandokazi@intandokaziherbal.co.za',
     'manager@intandokaziherbal.co.za'
   );
   ```

3. **Verify RLS Policies:**
   Make sure Row Level Security allows admin users to access the admin_users table.

#### Common Issues:

- **"User not found"**: User not created in auth.users
- **"401 Unauthorized"**: Wrong password or user not in admin_users table
- **"Permission denied"**: RLS policies blocking access

### 📋 Final Verification

After setup, test each admin account:

1. **Go to:** `https://intandokaziherbal.co.za/admin/login`
2. **Test each email/password combination**
3. **Verify dashboard access**
4. **Check permissions work correctly**

### 🎯 Expected Result

All three admin accounts should:
- ✅ **Login successfully**
- ✅ **Access admin dashboard**
- ✅ **Have proper permissions**
- ✅ **Manage products, orders, customers**

---

**Next Steps:** Once users are created in Supabase Auth and the SQL script is run, your admin login system will be fully functional with the strong passwords you specified.
