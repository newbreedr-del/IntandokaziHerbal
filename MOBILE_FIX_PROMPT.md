# MOBILE FIX PROMPT — Intandokazi Herbal Products v2.0

The majority of customers use phones. This prompt fixes mobile responsiveness across the entire site.
Read CLAUDE.md first before making any changes.

---

## Ground Rules

- **Mobile-first:** design for 375px–430px screens first, then scale up
- **No horizontal scroll** on any page at any screen size
- **Touch targets** must be minimum 44px tall (buttons, links, inputs)
- **Text** must be readable without zooming — minimum 14px body text on mobile
- **Forms** must be easy to fill on a phone keyboard — full-width inputs, proper input types
- **Modals** must not overflow the screen — use `max-h-[90vh] overflow-y-auto`
- Do NOT change colours, brand identity or desktop layouts that already work

---

## Fix 1 — BookingCalendar Component (PRIORITY)

**File:** `src/components/BookingCalendar.tsx`

Read the full file first. Then fix:

1. **Modal container** — must be scrollable on mobile:
```tsx
// Wrap the modal content in:
<div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
  <div className="bg-white w-full sm:max-w-lg sm:rounded-2xl rounded-t-2xl max-h-[92vh] overflow-y-auto">
```
On mobile this slides up from the bottom (sheet style). On desktop it's a centered modal.

2. **Step indicator** — the "1 Date & Time · 2 Your Details · 3 Pay" row is being cut off on mobile. Make it scroll horizontally or reduce text:
```tsx
<div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
```
Or replace step labels with just numbers on mobile:
```tsx
<span className="hidden sm:inline">Date & Time</span>
<span className="sm:hidden">Date</span>
```

3. **Date picker grid** — dates should be in a 4-column grid on mobile, not 7:
```tsx
className="grid grid-cols-4 sm:grid-cols-7 gap-1"
```

4. **Time slot buttons** — use a 2-column grid on mobile:
```tsx
className="grid grid-cols-2 sm:grid-cols-3 gap-2"
```

5. **Form inputs** — all inputs must be `w-full`, labels above (not inline), and use proper input types:
- Phone: `type="tel"`
- Email: `type="email"`
- Name: `type="text" autoComplete="name"`

6. **PayFast submit button** — must be `w-full` on mobile, clearly visible without scrolling

---

## Fix 2 — Store Page Mobile Layout

**File:** `src/app/store/page.tsx`

1. **Category filter row** — on mobile, make it horizontally scrollable, not wrapping:
```tsx
<div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none -mx-4 px-4">
  {/* category buttons — add flex-shrink-0 to each */}
```

2. **Product grid** — on mobile should be 2 columns, not 1 or 3:
```tsx
className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4"
```

3. **Hero/banner section** — if there is one, ensure text is readable on mobile (min text-base, padding px-4)

4. **Footer** — ensure footer columns stack vertically on mobile:
```tsx
className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8"
```

---

## Fix 3 — ProductCard Mobile

**File:** `src/components/store/ProductCard.tsx`

1. The flip-card hover effect does NOT work on touch devices. On mobile, show a simple card with:
   - Product image (full width)
   - Product name, price below
   - An "Add to Cart" button always visible at the bottom of the card

2. Detect mobile by adding a button on the front face that's visible only on touch:
```tsx
<button
  onClick={(e) => { e.stopPropagation(); addToCart(product); }}
  className="block sm:hidden w-full mt-2 py-2 rounded-lg text-sm font-medium text-white bg-brand-600"
>
  Add to Cart — R{product.price}
</button>
```

3. Card image height: use `h-36 sm:h-48` so cards aren't too tall on small screens

---

## Fix 4 — ProductModal Mobile

**File:** `src/components/store/ProductModal.tsx`

Read the file. The modal must:
1. Open as a **bottom sheet on mobile**, centered modal on desktop:
```tsx
<div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
  <div className="bg-white w-full sm:max-w-2xl sm:rounded-2xl rounded-t-2xl max-h-[90vh] overflow-y-auto">
```

2. Image should be `w-full h-48 sm:h-64 object-cover` — not too tall on mobile

3. Buttons (Add to Cart, Buy Now) must be `w-full` on mobile, side by side on desktop:
```tsx
className="flex flex-col sm:flex-row gap-2"
```

---

## Fix 5 — CartDrawer Mobile

**File:** `src/components/store/CartDrawer.tsx`

Read the file. Ensure:
1. Drawer takes `w-full sm:w-96` — full width on mobile
2. Checkout button is `w-full` and at least 48px tall
3. Item quantity controls have min 44px touch targets
4. Price text is readable (min text-sm)

---

## Fix 6 — Checkout Page Mobile

**File:** `src/app/store/checkout/page.tsx`

Read the full file. Fix:
1. Form layout — all inputs `w-full`, stacked vertically
2. PEP store selector — if it's a dropdown, ensure it's `w-full`
3. Order summary — should appear ABOVE the form on mobile (swap order), or be collapsible
4. Payment buttons — `w-full`, clearly spaced
5. Step indicator — same horizontal scroll fix as BookingCalendar

---

## Fix 7 — Admin Pages Mobile (Basic)

Admin pages don't need to be perfect on mobile but should be usable.

For each admin page that has a data table:
- Wrap tables in `<div className="overflow-x-auto">` so they scroll horizontally instead of breaking layout
- Ensure the sidebar collapses on mobile if it doesn't already

Check these files:
- `src/app/admin/dashboard/page.tsx`
- `src/app/admin/orders/page.tsx`
- `src/app/admin/bookings/page.tsx`
- `src/components/Sidebar.tsx` or `src/components/AdminShell.tsx`

---

## Fix 8 — Global CSS Touch Improvements

**File:** `src/app/globals.css`

Add these at the bottom:
```css
/* Hide scrollbars but keep scrolling */
.scrollbar-none {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
.scrollbar-none::-webkit-scrollbar {
  display: none;
}

/* Smooth scrolling everywhere */
html {
  scroll-behavior: smooth;
  -webkit-text-size-adjust: 100%;
}

/* Better tap highlight on mobile */
* {
  -webkit-tap-highlight-color: transparent;
}

/* Prevent text selection on buttons */
button {
  user-select: none;
  -webkit-user-select: none;
}
```

---

## Fix 9 — Meta Viewport and PWA Tags

**File:** `src/app/layout.tsx`

Ensure the viewport meta tag is present in the metadata:
```tsx
export const metadata: Metadata = {
  // ... existing
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1',
};
```

---

## Testing Checklist

After making all changes, manually check each of these at 375px width (iPhone SE size):

- [ ] Store page loads without horizontal scroll
- [ ] Category filter scrolls horizontally
- [ ] Product grid shows 2 columns
- [ ] Tapping a product card shows the modal as a bottom sheet
- [ ] "Add to Cart" button is visible and tappable on mobile product card
- [ ] Cart drawer opens full-width
- [ ] Checkout form is easy to fill (inputs full-width, proper keyboard types)
- [ ] Booking calendar modal opens as bottom sheet, step indicator not cut off
- [ ] Nav hamburger menu drops down cleanly without overlap
- [ ] No page has horizontal scroll at 375px

---

## Build and Commit

```bash
npm run build
npm run lint
git add .
git commit -m "feat: mobile-first responsive improvements across store, modals, booking, checkout"
git push
```

Build must pass clean before committing.
