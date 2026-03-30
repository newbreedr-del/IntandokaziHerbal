# 🔧 Stitch Express Activation Steps

## Current Issue

Your credentials from the dashboard are showing:
```
Client ID: test-4c7f8693-3514-4953-5d88-d8f90c116731
Client Secret: sfyBVeqMpSNaaWzaLL7xHrg2j2QRsHJYK6wjG27gf3Q8cw4uTCYeHJQLm5Q
```

But they're returning: `UNAUTHENTICATED: Token is missing, expired or malformed`

---

## 🎯 Possible Reasons & Solutions

### 1. Credentials Need Activation

**In your Stitch dashboard, check for:**
- [ ] An "Activate API" button
- [ ] "Enable Test Mode" toggle
- [ ] "Verify Account" requirement
- [ ] "Accept Terms" checkbox

**Look in these sections:**
- Settings → API Details
- API Details → Status
- Account → Verification

### 2. Redirect URLs Required

**You might need to add redirect URLs first:**

1. In your dashboard, look for **"Redirect URLs"** section
2. Add these URLs:
   ```
   http://localhost:3000/store/order-confirmation
   http://localhost:3000/store/checkout
   ```
3. Save the redirect URLs
4. Then try the credentials again

### 3. Business/Banking Details Required

**Check if you need to complete:**
- [ ] Business details (Name, Address) - I see "Get Verified" button
- [ ] Banking details - I see "Awaiting documents"
- [ ] Identity verification
- [ ] Terms acceptance

### 4. Wrong API Product

**Verify you're using Stitch Express (not other products):**
- ✅ Should say "Stitch Express" or "Payment Links"
- ❌ Not "Stitch Payments"
- ❌ Not "Stitch GraphQL"

---

## 🔍 What to Check in Your Dashboard

### Step 1: Look at the "Get Verified" Buttons
I see orange "Get Verified" buttons in your screenshot for:
- Business details
- Banking details

**These might need to be completed first!**

### Step 2: Check API Status
Look for:
- API Status: Active/Inactive
- Test Mode: Enabled/Disabled
- Credentials: Valid/Pending

### Step 3: Check for Activation Steps
Look for any:
- Setup wizard
- Onboarding checklist
- Required actions
- Pending verifications

---

## 💡 Quick Actions to Try

### Action 1: Add Redirect URLs
1. In dashboard, find "Redirect URLs" (might be in API Details section)
2. Click "+ Add" or similar
3. Add: `http://localhost:3000/store/order-confirmation`
4. Save
5. Try credentials again

### Action 2: Check Verification Status
1. Click the orange "Get Verified" buttons
2. See what information is needed
3. You might not need full verification for TEST credentials

### Action 3: Look for "Test Mode" Toggle
1. Find a toggle or checkbox for "Test Mode" or "Sandbox"
2. Make sure it's ENABLED
3. This might activate the test credentials

### Action 4: Check Email
1. Look for email from Stitch
2. Subject might be: "Activate your API" or "Complete setup"
3. There might be an activation link

---

## 🆘 Contact Stitch Support

Since you have dashboard access but credentials aren't working:

**Email:** express-support@stitch.money

**Message Template:**
```
Subject: Test API Credentials Not Authenticating

Hi Stitch Team,

I'm setting up Stitch Express integration and my test credentials 
are returning authentication errors.

Client ID: test-4c7f8693-3514-4953-5d88-d8f90c116731

Error: "UNAUTHENTICATED: Token is missing, expired or malformed"

I can access the dashboard and see the credentials, but they don't 
work when calling /api/v1/token endpoint.

Could you please:
1. Verify if these test credentials are activated
2. Let me know if I need to complete any setup steps
3. Confirm I'm using the correct API endpoint

Thank you!
```

---

## 🎯 Next Steps

### Immediate:
1. **Check your dashboard** for any "Activate" or "Enable" buttons
2. **Add redirect URLs** if there's a section for that
3. **Look for verification requirements** that might block test mode

### If Still Not Working:
1. **Email Stitch support** with the template above
2. **Ask them to activate** your test credentials
3. **Request confirmation** that test mode is enabled

---

## 💭 Alternative: Mock Mode

While waiting for Stitch to activate your credentials, I can create a **mock payment mode** that:
- Simulates the entire payment flow
- Works without real credentials
- Perfect for development and demos
- Can be switched to real Stitch instantly when ready

**Want me to enable mock mode?** Just say "yes" and I'll implement it!

---

## 📞 What I Need From You

Can you check in your dashboard:

1. **Is there a "Test Mode" toggle?** (Turn it ON if exists)
2. **Is there a "Redirect URLs" section?** (Add localhost URLs)
3. **Do the "Get Verified" buttons block API access?** (Click them to see)
4. **Is there an API Status indicator?** (Should show "Active")

Let me know what you find and we'll get this working! 🚀
