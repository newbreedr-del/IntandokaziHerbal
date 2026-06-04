# FIX PROMPT — Intandokazi Herbal Products v2.0

Paste this entire prompt into Claude Code or Cursor. Read CLAUDE.md first before starting.

---

## Context

You are fixing and completing the Intandokazi Herbal Products v2.0 app. This is a Next.js 14 (App Router) e-commerce and AI agent platform for a South African traditional herbal remedies business. The app is live at `https://intandokaziherbal.co.za` on Vercel.

Read `CLAUDE.md` before touching any file. It contains all conventions, database structure, and env variable references.

**WhatsApp send utility:** Always use `sendWhatsAppText(phone, message)` and `sendDispatchAlert(message)` from `src/lib/whatsapp.ts`. Never write inline fetch calls to Evolution API.

**Nthandokazi's WhatsApp number (admin/owner):** `27768435876` — use this for all admin/owner notifications.

---

## Fix 1 — Booking WhatsApp Notifications (HIGHEST PRIORITY)

**File:** `src/app/api/bookings/route.ts`

When a booking is created (POST), replace the stub `sendAdminNotification()` call with real WhatsApp messages:

```typescript
import { sendWhatsAppText } from '@/lib/whatsapp';
```

After the booking is successfully created in Supabase, add:

```typescript
// Notify Nthandokazi (admin)
const bookingDate = new Date(slot.date).toLocaleDateString('en-ZA', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', timeZone: 'Africa/Johannesburg' });
const adminMsg =
  `📅 *New Consultation Booking!*\n\n` +
  `👤 *Client:* ${body.clientName}\n` +
  `📱 *Phone:* ${body.clientPhone}\n` +
  `📧 *Email:* ${body.clientEmail || 'Not provided'}\n` +
  `🗓️ *Date:* ${bookingDate}\n` +
  `🕐 *Time:* ${slot.start_time} – ${slot.end_time}\n` +
  `📞 *Type:* ${body.consultationType || 'WhatsApp'}\n` +
  `💰 *Amount:* R${body.amount || 1500}\n` +
  `🔖 *Ref:* ${paymentReference}`;
await sendWhatsAppText('27768435876', adminMsg).catch(() => {});

// Notify the client
const clientMsg =
  `✅ *Booking Confirmed!*\n\n` +
  `Sawubona ${body.clientName?.split(' ')[0]}! Your consultation with Nthandokazi has been booked.\n\n` +
  `🗓️ *Date:* ${bookingDate}\n` +
  `🕐 *Time:* ${slot.start_time}\n` +
  `📞 *Type:* ${body.consultationType || 'WhatsApp'}\n` +
  `💰 *Fee:* R${body.amount || 1500}\n` +
  `🔖 *Ref:* ${paymentReference}\n\n` +
  `Please complete payment to confirm your slot. We look forward to speaking with you! 🌿`;
await sendWhatsAppText(body.clientPhone, clientMsg).catch(() => {});
```

Remove all calls to the stub functions from `src/lib/notifications.ts` in this route — they do nothing.

---

## Fix 2 — Booking Payment Confirmed WhatsApp Notification

**File:** `src/app/api/bookings/payment/notify/route.ts`

After a successful PayFast ITN updates the booking payment status to `paid`, add WhatsApp notifications using the same pattern as `src/app/api/payments/payfast/notify/route.ts`.

```typescript
import { sendWhatsAppText } from '@/lib/whatsapp';
```

After confirming the booking payment:

```typescript
// Notify client — payment received
if (booking.client_phone) {
  await sendWhatsAppText(booking.client_phone,
    `✅ *Payment Received!*\n\n` +
    `Hi ${booking.client_name?.split(' ')[0]}! Your payment of *R${booking.amount}* for your consultation has been received.\n\n` +
    `🗓️ *Date:* ${booking.booking_date}\n` +
    `🕐 *Time:* ${booking.start_time}\n` +
    `Nthandokazi will contact you shortly to confirm the details. 🌿`
  ).catch(() => {});
}

// Notify Nthandokazi — payment confirmed
await sendWhatsAppText('27768435876',
  `💰 *Consultation Payment Confirmed*\n\n` +
  `👤 *Client:* ${booking.client_name}\n` +
  `📱 *Phone:* ${booking.client_phone}\n` +
  `🗓️ *Date:* ${booking.booking_date}\n` +
  `🕐 *Time:* ${booking.start_time}\n` +
  `💰 *Amount:* R${booking.amount}`
).catch(() => {});
```

---

## Fix 3 — Fix `/book/[agentId]/page.tsx` Booking Reference Bug

**File:** `src/app/book/[agentId]/page.tsx`

Find the line that sets the booking reference after a successful booking API response. It currently reads `data.booking.reference` but the API returns `data.paymentReference`. Change it to:

```typescript
setBookingRef(data.paymentReference || data.booking?.id || 'Confirmed');
```

---

## Fix 4 — Fix Mobile Add-to-Cart on ProductCard

**File:** `src/components/store/ProductCard.tsx`

The flip card only works on hover (desktop). Mobile users cannot add to cart. Add touch support:

1. Find the card's front face JSX
2. Add an "Add to Cart" button that is visible on mobile (`block md:hidden`) on the front face of the card
3. The existing back-face button can stay for desktop hover

Example approach — add this button to the front face of the card:

```tsx
<button
  onClick={(e) => { e.stopPropagation(); addToCart(product); }}
  className="block md:hidden mt-2 w-full py-2 rounded-lg text-sm font-medium text-white"
  style={{ background: '#2d5a27' }}
>
  Add to Cart
</button>
```

---

## Fix 5 — Fix `/admin/orders` Page (Currently Always Empty)

**File:** `src/app/admin/orders/page.tsx`

The page has `const orders: Order[] = []` hardcoded. Replace it with a real data fetch:

```typescript
const [orders, setOrders] = useState<Order[]>([]);
const [loading, setLoading] = useState(true);

useEffect(() => {
  fetch('/api/admin/orders')
    .then(r => r.json())
    .then(data => { setOrders(data.orders || []); setLoading(false); })
    .catch(() => setLoading(false));
}, []);
```

Remove the hardcoded empty array.

---

## Fix 6 — Fix Free Delivery Logic

**File:** `src/app/store/checkout/page.tsx`

Find where `deliveryFee` is set (currently always R110). Change it to:

```typescript
const DELIVERY_FEE = subtotal >= 500 ? 0 : 110;
```

Update the UI to show "FREE" when the cart is over R500, and show the customer how much more they need to spend to qualify for free delivery when under R500:

```tsx
{subtotal < 500 && (
  <p className="text-xs text-green-600">
    Add R{(500 - subtotal).toFixed(2)} more for FREE delivery!
  </p>
)}
```

---

## Fix 7 — Fix Category Filter Mismatch

**File:** `src/app/store/page.tsx`

The store hardcodes categories that don't match the database. Find the `PRODUCT_CATEGORIES` constant or the hardcoded category array and replace it with dynamic categories derived from the fetched products:

```typescript
const categories = ['All', ...Array.from(new Set(products.map(p => p.category).filter(Boolean)))];
```

Use `categories` for the category filter tabs instead of the hardcoded list. This ensures the filter always matches exactly what's in the database.

---

## Fix 8 — Fix "Ntankokazi" Typo Throughout

Search the entire codebase for `Ntankokazi` (misspelling) and replace every instance with `Nthandokazi`. Also check for `Ntandokazi` (missing 'h') and fix those too.

Files confirmed to contain the misspelling:
- `src/app/store/checkout/page.tsx` — nav bar
- `src/app/store/order-confirmation/page.tsx` — multiple instances
- Any other files returned by the search

```bash
grep -r "Ntankokazi" src/ --include="*.tsx" --include="*.ts" -l
grep -r "Ntandokazi" src/ --include="*.tsx" --include="*.ts" -l
```

Fix all instances.

---

## Fix 9 — Add Out-of-Stock Guard

**File:** `src/components/store/ProductCard.tsx` and `src/components/store/ProductModal.tsx`

1. In `ProductCard`, when `product.stock_quantity === 0`:
   - Add an "Out of Stock" badge overlay on the card image
   - Disable the "Add to Cart" button (greyed out, `disabled` attribute, no onClick)

2. In `ProductModal`, when `product.stock_quantity === 0`:
   - Disable the "Add to Cart" / "Buy Now" button
   - Show "Out of Stock — notify me" text instead

Example badge:
```tsx
{product.stock_quantity === 0 && (
  <div className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full z-10">
    Out of Stock
  </div>
)}
```

---

## Fix 10 — Wire Up "Notify Customer" on Dispatch Shipped

**File:** `src/app/admin/dispatch/page.tsx`

Find the `notifyCustomer()` function — it currently only does `console.log`. Replace it with a server-side API call:

```typescript
const notifyCustomer = async (order: Order) => {
  await fetch('/api/admin/notify-shipment', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ orderId: order.id })
  });
};
```

Then create the API route **`src/app/api/admin/notify-shipment/route.ts`**:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { sendWhatsAppText } from '@/lib/whatsapp';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { orderId } = await req.json();
  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

  const { data: order } = await supabase
    .from('orders')
    .select('*')
    .eq('id', orderId)
    .single();

  if (!order) return NextResponse.json({ error: 'Order not found' }, { status: 404 });

  if (order.customer_phone) {
    await sendWhatsAppText(order.customer_phone,
      `📦 *Your Order Has Been Dispatched!*\n\n` +
      `Hi ${order.customer_name?.split(' ')[0]}! Your Intandokazi Herbal order *${order.order_reference}* is on its way.\n\n` +
      `📍 *Collection:* ${order.pep_store_name || 'Your selected PAXI point'}\n` +
      `🚚 Your order will be ready for collection in 2–5 business days.\n\n` +
      `Thank you for your order! 🌿 Reply to this message if you have any questions.`
    );
  }

  return NextResponse.json({ success: true });
}
```

---

## After All Fixes

Run these commands in order:

```bash
npm run lint
npm run build
```

Both must pass clean. Fix any TypeScript or lint errors before stopping.

Then report back:
1. Build output (pass/fail)
2. List of all files changed
3. Confirmation each of the 10 fixes is complete
4. Any issues encountered and how you resolved them
