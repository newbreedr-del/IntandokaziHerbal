# 🗄️ Supabase Database Cleanup Guide

**Date:** April 13, 2026  
**Purpose:** Remove all WhatsApp and messaging-related tables from Supabase

---

## 📋 Overview

This guide will help you clean up your Supabase database by removing all WhatsApp, Respond.io, and messaging-related tables and columns, keeping only the **store**, **admin**, and **booking** functionality.

---

## 🎯 What Will Be Removed

### ❌ **Tables to Delete**
1. `contacts` - WhatsApp contacts database
2. `conversation_history` - WhatsApp chat history
3. `message_queue_log` - WhatsApp message queue
4. `whatsapp_messages` - Any WhatsApp message tables
5. `chat_messages` - Generic chat messages
6. `respondio_messages` - Respond.io messages

### ❌ **Columns to Remove**
1. `customers.whatsapp_notifications` - WhatsApp notification preference
2. `booking_settings.send_whatsapp_notifications` - WhatsApp notification setting
3. Update `consultation_bookings.consultation_type` - Remove 'whatsapp' option
4. Update `eft_confirmations.proof_type` - Remove 'whatsapp' option

---

## ✅ What Will Remain

### **Store Tables**
- ✅ `customers` - Customer accounts
- ✅ `addresses` - Shipping/billing addresses
- ✅ `products` - Product catalog
- ✅ `orders` - Order management
- ✅ `order_items` - Order line items
- ✅ `payments` - Payment tracking
- ✅ `eft_confirmations` - EFT proof uploads
- ✅ `reviews` - Product reviews

### **Admin Tables**
- ✅ `admin_users` - Admin accounts
- ✅ `activity_log` - Admin activity tracking

### **Booking Tables**
- ✅ `available_slots` - Available booking times
- ✅ `consultation_bookings` - Consultation bookings
- ✅ `booking_payments` - Booking payments
- ✅ `booking_notifications` - Email notifications
- ✅ `booking_settings` - Booking configuration

---

## 🚀 Step-by-Step Cleanup Process

### **Option 1: Run Cleanup Script (Recommended)**

1. **Open Supabase Dashboard**
   - Go to https://supabase.com/dashboard
   - Select your project: `oaeirdgffwodkbcstdfh`

2. **Open SQL Editor**
   - Click on "SQL Editor" in the left sidebar
   - Click "New query"

3. **Run Cleanup Script**
   - Open the file: `supabase/cleanup-whatsapp-tables.sql`
   - Copy the entire contents
   - Paste into Supabase SQL Editor
   - Click **"Run"**

4. **Verify Results**
   - Check the output for success messages
   - Review the list of remaining tables
   - Ensure no WhatsApp tables remain

### **Option 2: Fresh Schema (Nuclear Option)**

If you want to start completely fresh:

1. **Backup Your Data First!**
   ```sql
   -- Export important data
   SELECT * FROM products;
   SELECT * FROM customers;
   SELECT * FROM orders;
   ```

2. **Drop All Tables**
   ```sql
   -- WARNING: This deletes EVERYTHING
   DROP SCHEMA public CASCADE;
   CREATE SCHEMA public;
   ```

3. **Run Clean Schema**
   - Open `supabase/CLEAN-STORE-SCHEMA.sql`
   - Copy and paste into SQL Editor
   - Click **"Run"**

4. **Re-import Your Data**
   - Import products from backup
   - Import customers from backup
   - Import orders from backup

---

## 📊 Verification Checklist

After running the cleanup, verify:

### **Tables Check**
```sql
-- List all tables
SELECT tablename 
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY tablename;
```

**Expected tables (18 total):**
- [ ] addresses
- [ ] activity_log
- [ ] admin_users
- [ ] available_slots
- [ ] booking_notifications
- [ ] booking_payments
- [ ] booking_settings
- [ ] consultation_bookings
- [ ] customers
- [ ] eft_confirmations
- [ ] order_items
- [ ] orders
- [ ] payments
- [ ] products
- [ ] reviews

**Should NOT see:**
- [ ] ❌ contacts
- [ ] ❌ conversation_history
- [ ] ❌ message_queue_log
- [ ] ❌ whatsapp_messages

### **Columns Check**
```sql
-- Check customers table
SELECT column_name 
FROM information_schema.columns 
WHERE table_name = 'customers';
```

**Should NOT see:**
- [ ] ❌ whatsapp_notifications

```sql
-- Check booking_settings table
SELECT column_name 
FROM information_schema.columns 
WHERE table_name = 'booking_settings';
```

**Should NOT see:**
- [ ] ❌ send_whatsapp_notifications

### **Constraints Check**
```sql
-- Check consultation_bookings constraints
SELECT constraint_name, check_clause
FROM information_schema.check_constraints
WHERE constraint_name LIKE '%consultation_bookings%';
```

**consultation_type should only allow:**
- [ ] ✅ 'video'
- [ ] ✅ 'phone'
- [ ] ✅ 'in-person'
- [ ] ❌ NOT 'whatsapp'

---

## 🔧 Manual Cleanup (If Needed)

If the script doesn't work or you need to do it manually:

### **1. Drop WhatsApp Tables**
```sql
DROP TABLE IF EXISTS contacts CASCADE;
DROP TABLE IF EXISTS conversation_history CASCADE;
DROP TABLE IF EXISTS message_queue_log CASCADE;
DROP TABLE IF EXISTS whatsapp_messages CASCADE;
```

### **2. Remove WhatsApp Columns**
```sql
-- Remove from customers
ALTER TABLE customers 
DROP COLUMN IF EXISTS whatsapp_notifications CASCADE;

-- Remove from booking_settings
ALTER TABLE booking_settings 
DROP COLUMN IF EXISTS send_whatsapp_notifications CASCADE;
```

### **3. Update Constraints**
```sql
-- Update consultation bookings
UPDATE consultation_bookings 
SET consultation_type = 'phone' 
WHERE consultation_type = 'whatsapp';

ALTER TABLE consultation_bookings 
DROP CONSTRAINT IF EXISTS consultation_bookings_consultation_type_check;

ALTER TABLE consultation_bookings
ADD CONSTRAINT consultation_bookings_consultation_type_check 
CHECK (consultation_type IN ('video', 'phone', 'in-person'));

-- Update EFT confirmations
UPDATE eft_confirmations 
SET proof_type = 'upload' 
WHERE proof_type = 'whatsapp';

ALTER TABLE eft_confirmations 
DROP CONSTRAINT IF EXISTS eft_confirmations_proof_type_check;

ALTER TABLE eft_confirmations
ADD CONSTRAINT eft_confirmations_proof_type_check 
CHECK (proof_type IN ('email', 'upload'));
```

---

## 📝 Post-Cleanup Tasks

### **1. Update Application Code**

The following files may need updates to remove WhatsApp references:

- ✅ Already cleaned: `src/lib/notifications.ts`
- ✅ Already cleaned: `src/app/store/layout.tsx`
- ✅ Already removed: `src/components/RespondIOWidget.tsx`
- ✅ Already removed: `src/lib/respondio.ts`

### **2. Test Application**

1. **Test Store Functionality**
   - Browse products
   - Add to cart
   - Complete checkout
   - Verify order creation

2. **Test Admin Dashboard**
   - View orders
   - Manage products
   - Check customer list
   - Review bookings

3. **Test Booking System**
   - Create a booking
   - Process payment
   - Verify booking appears in admin

### **3. Monitor for Errors**

Check browser console and server logs for:
- Missing table errors
- Missing column errors
- Failed queries
- 404 errors on API routes

---

## 🆘 Troubleshooting

### **Error: "relation does not exist"**
This means a table is being referenced that doesn't exist.
- Check your application code for references to deleted tables
- Update queries to use correct table names

### **Error: "column does not exist"**
Your code is trying to access a deleted column.
- Search codebase for references to `whatsapp_notifications`
- Remove or update those references

### **Data Loss Concerns**
If you're worried about losing data:
1. Export all tables before cleanup
2. Store backups in CSV format
3. Keep backups for 30 days

---

## 📞 Support

If you encounter issues:

1. **Check Supabase Logs**
   - Dashboard → Logs → Database

2. **Review Error Messages**
   - Copy full error text
   - Check which table/column is causing issues

3. **Rollback if Needed**
   - Restore from backup
   - Re-run cleanup script with fixes

---

## ✅ Cleanup Complete!

Once you've completed all steps:

- [ ] All WhatsApp tables removed
- [ ] All WhatsApp columns removed
- [ ] Constraints updated
- [ ] Application tested
- [ ] No errors in logs
- [ ] Database is clean and optimized

**Your Supabase database is now focused solely on e-commerce and bookings!** 🎉
