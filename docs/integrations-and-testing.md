# Glow with Rubi integrations and testing guide

This guide documents the notification, payment, realtime, customer portal, analytics, team-permission, validation, and new-user quick-start work in this repository. It keeps the existing booking state machine, database settings, Supabase auth model, Razorpay flow, and public UI behavior intact.

## 1. What is integrated

### Existing functionality preserved

- Public booking remains a server-validated request. Prices, availability, discounts, hold duration, and status are recalculated on the server.
- The booking state machine remains:

  ```text
  REQUESTED → HELD → ADMIN_APPROVED → PAYMENT_PENDING → CONFIRMED
  ```

- Alternative status paths remain available where defined in [state-machine.ts](../src/lib/booking/state-machine.ts): rejection, expiry, cancellation, and completion.
- Razorpay remains server verified. The browser never decides that a payment succeeded.
- UPI remains available from the booking confirmation page when the existing payment setting contains a UPI ID.
- Existing business, booking, payment, service, notification template, and WhatsApp settings remain the source of truth.
- Existing admin auth uses Supabase Auth plus the active row in `admins`.
- Existing customer login and `/account` authentication redirects remain unchanged.

### Added functionality

| Area | Implementation | Current behavior |
|---|---|---|
| Admin new-booking alerts | `src/lib/notifications/orchestrator.ts` | Sends the customer receipt and alerts active admins. WhatsApp is primary; email is used when WhatsApp is not sent. |
| Email backup | `src/lib/notifications/email.ts` | Uses the Resend HTTPS API when configured. Every attempt is recorded as `EMAIL`. |
| Critical SMS | `src/lib/notifications/sms.ts` | Uses the Twilio REST API for `CONFIRMED`, `REJECTED`, and `CANCELLED`. Every attempt is recorded as `SMS`. |
| Delivery log | `src/lib/data/notifications.ts` and `/admin/settings/notifications` | Reads real records from `notifications`; it does not fabricate provider percentages. |
| Live status | `src/components/account/booking-status-realtime.tsx` and `src/components/admin/admin-realtime.tsx` | Uses Supabase Postgres Changes. Customer status and admin booking data refresh while connected. |
| Customer portal | `/account` | Shows the nearest upcoming appointment first, then expandable booking history. |
| Analytics | `/admin` | Aggregates real bookings and captured payments for 7, 30, or 90 days. |
| Multi-admin permissions | `src/lib/auth/permissions.ts` and `/admin/settings/team` | Owner/staff capabilities are enforced by server actions, not only hidden in the sidebar. |
| Validation feedback | `src/components/ui/feedback-dialog.tsx` | Provider, payment, status, login, contact, booking, cookie, and team failures use an accessible popup. Booking fields also show inline correction messages. |
| New-user guide | `src/components/onboarding/quick-start-guide.tsx` | First visit on `/` shows three arrow-guided steps for packages, booking, and WhatsApp. It is dismissed after completion/skip/Escape. |

## 2. Production setup

### 2.1 Apply the Supabase migration

Apply the newest migration after the existing migrations:

```text
supabase/migrations/20260830000001_notifications_realtime_permissions.sql
```

It adds:

- `notifications.recipient_email`
- `notifications.provider`
- `notifications.provider_message_id`
- notification indexes
- a unique partial index for customer auth linkage
- `bookings` to the `supabase_realtime` publication when it is not already present
- a customer-only `SELECT` policy for bookings linked through `customers.auth_user_id`

After applying it, verify the publication and policy in the Supabase SQL editor:

```sql
select *
from pg_publication_tables
where pubname = 'supabase_realtime'
  and schemaname = 'public'
  and tablename = 'bookings';

select policyname, cmd
from pg_policies
where tablename = 'bookings';
```

The customer policy must only allow rows where the booking customer has `auth_user_id = auth.uid()`.

### 2.2 Required existing environment variables

These remain required for the existing database/auth behavior:

```env
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

Razorpay remains optional in local development and required for online payment tests:

```env
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_...
RAZORPAY_KEY_ID=rzp_test_...
RAZORPAY_KEY_SECRET=...
RAZORPAY_WEBHOOK_SECRET=...
```

### 2.3 Optional notification providers

No new npm package is required. Providers are called through server-side HTTPS requests only.

```env
# Meta WhatsApp Cloud API
WHATSAPP_API_TOKEN=...
WHATSAPP_PHONE_NUMBER_ID=...
WHATSAPP_API_VERSION=v19.0

# Resend email backup
RESEND_API_KEY=re_...
RESEND_FROM_EMAIL=bookings@your-verified-domain.example

# Twilio critical SMS
TWILIO_ACCOUNT_SID=AC...
TWILIO_AUTH_TOKEN=...
TWILIO_FROM_NUMBER=+1...
```

Provider variables are optional. If a provider is not configured:

- the booking/status/payment mutation still succeeds;
- the attempt is logged as `PENDING` for that channel when there is a recipient;
- the admin delivery view shows `Sending` or `Delivery status is unavailable` rather than claiming delivery;
- email is only attempted when a customer/admin email exists;
- SMS is only attempted for the critical statuses listed above.

Never put service-role, WhatsApp, Resend, Twilio, or Razorpay secret values in `NEXT_PUBLIC_*` variables.

## 3. Notification behavior

### New booking

`POST /api/bookings` performs this sequence:

1. Validate the request with `createBookingSchema`.
2. Load the active package, add-ons, settings, coupon, and availability.
3. Recalculate price, advance, balance, end time, and hold expiry.
4. Link an authenticated customer through `customers.auth_user_id` when a session exists; otherwise create a guest customer.
5. Insert the booking and booking items.
6. Send the customer `booking_received` template through WhatsApp.
7. If WhatsApp is not `SENT` and the customer supplied an email, send the same receipt through Resend.
8. Resolve active admin emails plus the business WhatsApp/phone setting.
9. Send `admin_new_request` to the business WhatsApp/phone.
10. If admin WhatsApp is not `SENT`, send email to each unique active admin/business email.

Notification failures are isolated from booking creation. Inspect `notifications` for the result of each channel.

### Admin status change

The admin booking detail action calls `PATCH /api/bookings/[id]` and validates the transition against the current database status.

- `REQUESTED` or `HELD` → `ADMIN_APPROVED`
- `ADMIN_APPROVED` → `PAYMENT_PENDING` when an online Razorpay order is created
- `PAYMENT_PENDING` → `CONFIRMED` after verified payment
- `CONFIRMED` → `COMPLETED` or `CANCELLED`
- `REQUESTED`/`HELD` → `REJECTED` where the state machine permits it

The status notification uses WhatsApp first and email backup second. Critical statuses also attempt SMS.

If the transition is invalid, the API returns HTTP 400 and the admin sees the accessible “Status update failed” popup. It no longer produces an uncaught 500 from a server-action form.

### Payment notification

A verified payment emits:

- `payment_received` through WhatsApp, with email fallback;
- `booking_confirmed` through WhatsApp, with email fallback;
- a critical `CONFIRMED` SMS attempt.

Both the browser verification endpoint and the Razorpay webhook use the same notification orchestration. The webhook remains protected by the existing Razorpay signature check.

## 4. Payment test matrix

Use Razorpay test-mode credentials for real gateway tests. Do not use production credentials in local development.

### Test data setup

1. Apply all Supabase migrations, including the latest notification/realtime migration.
2. Seed the catalogue or confirm that at least one active fixed-price package exists.
3. Create one customer account through `/signup`.
4. Create one admin auth user and insert its matching active row into `admins` using `supabase/create_admin.sql`.
5. In Supabase, confirm the business setting has an admin phone/WhatsApp and email if you want to test all fallbacks.
6. Start the app:

   ```powershell
   npm run dev
   ```

7. Keep these pages available in separate browser tabs:
   - customer booking page: `http://localhost:3000/book`
   - customer confirmation page after booking
   - customer account: `http://localhost:3000/account`
   - admin login: `http://localhost:3000/admin/login`
   - admin dashboard: `http://localhost:3000/admin`
   - admin delivery log: `http://localhost:3000/admin/settings/notifications`

### Scenario A — booking validation fails before database writes

**Action**

- Submit `/api/bookings` with a missing/invalid `package_id`, invalid date, invalid time, invalid phone, or a home booking without address/pincode.
- In the UI, attempt to submit the final booking step with a short name or invalid phone.

**Expected**

- HTTP API returns `400` with `{ error: "Invalid input", details: ... }`.
- The UI keeps the user on the form.
- Invalid fields have inline messages.
- The user sees the “Check your details” or “Booking could not be submitted” popup.
- No booking or customer row is created.

### Scenario B — invalid coupon or unavailable slot

**Action**

- Use an inactive/expired coupon or a coupon outside its package/date/usage rules.
- Open the same availability slot in two browser sessions and submit both.

**Expected**

- Invalid coupon returns HTTP `400`.
- A race for a held/active slot returns HTTP `409` with “Selected time slot is no longer available”.
- The user sees the booking failure popup.
- Server-side price and availability remain authoritative.

### Scenario C — successful guest booking with providers disabled

**Action**

- Remove/leave blank WhatsApp, Resend, and Twilio variables.
- Submit a fixed-price guest booking with a valid phone and optional email.

**Expected**

- Booking succeeds with `HELD` status and a confirmation URL.
- The customer is not blocked by provider configuration.
- WhatsApp is recorded as `PENDING` when a phone recipient exists.
- Email is recorded as `PENDING` only if an email recipient exists.
- Admin delivery view does not show fabricated delivery success.
- Console logs state that providers are not configured.

### Scenario D — admin WhatsApp primary delivery

**Setup**

- Configure valid Meta WhatsApp Cloud API credentials.
- Set the business `whatsapp` or `phone` site setting.

**Action**

- Submit a new booking.

**Expected**

- Customer receives `booking_received` on WhatsApp.
- Admin receives `admin_new_request` on the configured admin number.
- Corresponding `notifications` rows have `channel = 'WHATSAPP'`, `status = 'SENT'`, and `sent_at`.
- Email backup is not sent for that recipient when WhatsApp returns `SENT`.

### Scenario E — email backup after WhatsApp failure

**Setup**

- Configure Resend with a verified sender and recipient email.
- Use an invalid/expired WhatsApp token, or leave WhatsApp unconfigured.

**Action**

- Submit a new booking or update a booking status.

**Expected**

- The booking/status update still succeeds.
- WhatsApp row is `FAILED` or `PENDING`.
- Email row is created for the customer/admin email with `SENT` when Resend succeeds.
- The UI delivery log shows the WhatsApp problem and the email result separately.

### Scenario F — Razorpay gateway unavailable

**Setup**

- Leave Razorpay server variables blank.
- Move a booking to `ADMIN_APPROVED`.

**Action**

- Click the payment CTA on the confirmation page.

**Expected**

- `/api/payments/create-order` returns HTTP `503` with “Payment gateway not configured”.
- The payment UI opens the “Payment could not be completed” popup.
- No payment row is created.
- Booking remains `ADMIN_APPROVED`.

### Scenario G — approve and create a Razorpay test order

**Setup**

- Configure Razorpay test credentials.
- Start from a `HELD` booking.

**Action**

1. In admin, open the booking.
2. Click **Approve**.
3. Confirm the booking changes from `HELD` to `ADMIN_APPROVED`.
4. Open the customer confirmation page.
5. Start payment.

**Expected**

- The first admin action succeeds; it does not attempt the invalid `HELD → PAYMENT_PENDING` transition.
- Creating the online order inserts a `payments` row with `PENDING` and the Razorpay order ID.
- The booking changes from `ADMIN_APPROVED` to `PAYMENT_PENDING`.
- The payment widget opens with the advance amount calculated from the existing payment settings.

### Scenario H — successful Razorpay test payment

**Action**

- Use Razorpay’s official test card/UPI details in the checkout widget.

**Expected**

- The browser receives Razorpay response fields.
- `/api/payments/verify` validates the HMAC signature.
- The payment row becomes `CAPTURED`.
- The booking becomes `CONFIRMED` and `hold_expires_at` is cleared.
- Customer receives payment and confirmation notifications according to provider availability.
- The customer confirmation page shows “Confirmed”.
- `/account` shows the booking under the upcoming appointment.
- Admin analytics includes the captured payment in revenue.

### Scenario I — missing payment fields

**Action**

Send a request without one or more required fields:

```powershell
$body = '{"booking_id":"BOOKING_UUID","razorpay_order_id":"order_test"}'
Invoke-RestMethod -Uri http://localhost:3000/api/payments/verify -Method Post -ContentType 'application/json' -Body $body
```

**Expected**

- HTTP `400` with “Missing payment fields”.
- The payment record and booking status are unchanged.
- The payment UI displays its feedback popup when the same failure occurs through the browser.

### Scenario J — invalid payment signature

**Action**

- Submit all fields but replace `razorpay_signature` with a random value.

**Expected**

- HTTP `400` with “Invalid payment signature”.
- Booking does not become `CONFIRMED`.
- Payment does not become `CAPTURED`.
- No success notification is sent.
- The browser shows the payment failure popup.

### Scenario K — payment record not found

**Action**

- Use a valid-looking signed request with an order ID not present in `payments`.

**Expected**

- HTTP `404` with “Payment record not found”.
- No booking update occurs.
- The error is visible in the payment UI if triggered there.

### Scenario L — invalid webhook signature

**Action**

- POST any body to `/api/webhooks/razorpay` with an incorrect `x-razorpay-signature`.

**Expected**

- HTTP `401` with “Invalid signature”.
- No payment or booking status changes.
- No notification is sent.

### Scenario M — valid `payment.captured` webhook

**Setup**

- Have a pending Razorpay payment row with the matching `order_id`.
- Generate the signature using the configured webhook secret and the exact raw JSON body.

**Action**

- POST a Razorpay `payment.captured` event.

**Expected**

- A `payment_events` row is inserted.
- The matching payment becomes `CAPTURED`.
- The matching booking becomes `CONFIRMED`.
- Payment/confirmation notifications are attempted.
- Customer Realtime listeners receive the booking update when the migration/publication/RLS setup is active.

### Scenario N — duplicate payment callback safety check

**Action**

- Send the same successful browser verification or webhook payload twice.

**Expected with current code**

- The second request must be observed and reviewed because the current implementation updates the existing payment by `order_id` and re-runs notification orchestration.
- Confirm the booking remains `CONFIRMED` and the payment remains `CAPTURED`.
- Check the delivery log for duplicate notification rows.

If strict exactly-once notifications are required, add an idempotency key/unique provider event constraint before production. This guide does not silently change that existing payment behavior.

### Scenario O — payment amount/settings integrity

**Action**

- Change the admin payment setting between bookings (percentage vs fixed advance).
- Try to manipulate the browser request body amount; the current payment order endpoint only accepts `booking_id`.

**Expected**

- The server uses the stored booking `advance`, not a browser-supplied amount.
- The Razorpay order amount matches the server-calculated advance.
- The UI displays the same advance amount.

## 5. Realtime test scenarios

### Customer status update

1. Sign in as a customer in Browser A.
2. Open `/account` or a booking confirmation page.
3. Sign in as admin in Browser B.
4. Change the booking status through the allowed transition.
5. Watch Browser A.

Expected:

- The status text/progression updates without a manual page refresh.
- A polite screen-reader announcement is emitted.
- If Supabase is unavailable, the page says “Updates paused. Reconnecting…” rather than pretending it is live.

### Admin booking refresh

1. Open `/admin`.
2. Create or update a booking from another session.
3. Watch today’s booking ledger.

Expected:

- The Supabase subscription reports live updates.
- The admin router refreshes server data.
- The booking list/filter counts update.

## 6. Customer portal test scenarios

- New account with no bookings: shows “You don’t have any bookings yet” and a booking CTA.
- One future booking: shows the appointment folio first and the live status track.
- Multiple bookings: the nearest non-terminal future booking is upcoming; remaining rows appear in the history ledger.
- Completed/cancelled/rejected/expired bookings: appear in history and do not become the upcoming appointment.
- Missing package: displays “Custom booking”.
- Missing notes or totals: displays an em dash/omits notes; no invented data is shown.
- Customer isolation: sign in as Customer A and verify Customer B’s bookings are absent. Confirm the migration’s customer RLS policy is applied.

## 7. Analytics and notification delivery tests

### Analytics

1. Add captured payments on known dates and bookings with known statuses.
2. Open `/admin?range=7d`, `/admin?range=30d`, and `/admin?range=90d`.
3. Compare the displayed values with SQL totals.

```sql
select coalesce(sum(amount), 0) as captured_revenue
from payments
where status = 'CAPTURED';

select status, count(*)
from bookings
group by status;
```

Expected:

- Revenue is based on captured payments.
- Booking count excludes cancelled bookings from the active booking count.
- Cancelled count is shown separately.
- Empty periods show a baseline message, not fake trend percentages.

### Delivery health

1. Trigger one successful, one pending/unconfigured, and one failed provider attempt.
2. Open `/admin/settings/notifications`.
3. Confirm each channel is a separate row with its actual status, recipient, and timestamp.

Expected status mapping:

- `SENT` → Delivered
- `PENDING` → Sending
- `FAILED` → Failed

## 8. Multi-admin permission tests

### Owner

- Can open Settings, Team & permissions, and Notification delivery.
- Can run catalogue, content, calendar, enquiry, booking, coupon, and settings mutations.
- Can assign an active admin as Owner or Staff.

### Staff

- Can view dashboard and booking/enquiry operations allowed by the permission map.
- Cannot mutate coupons, settings, or team roles.
- Direct server-action/API calls must return a permission error even if a hidden control is manually invoked.
- Team page is read-only.

### Final-owner protection

1. Create/keep exactly one active owner.
2. Try to change that owner to Staff.

Expected:

- The action fails with “Assign another owner before changing this role”.
- The role remains Owner.
- The team UI shows the error in a popup.

## 9. Validation and popup tests

- Booking name shorter than two characters: inline field error plus popup on submit.
- Booking phone outside the supported Indian format: inline field error plus popup.
- Invalid optional email: inline field error plus popup.
- Home booking with no address or non-six-digit pincode: API `400` with field details.
- Admin status transition error: in-app status popup, no native alert.
- Payment gateway/provider error: payment popup, no uncaught browser alert.
- Admin login failure: sign-in popup with Escape/Close support.
- Contact submission failure: error popup and inline error retained.
- Cookie settings save: success feedback dialog instead of `window.alert`.
- Team role failure: permission/final-owner popup.

Check that no native alert remains:

```powershell
rg --fixed-strings 'alert(' src
```

The command should return no matches. Existing destructive confirmation flows may still use their own confirmation UI; do not bypass a destructive action silently.

## 10. Quick-start guide test

1. Open `/` in a fresh browser context or clear the guide key:

   ```js
   localStorage.removeItem('glow-with-rubi:quick-start-seen')
   ```

2. Wait for the guide to appear.
3. Verify Step 1 highlights **View Packages** and the arrow/callout stays within the viewport.
4. Click **Next** and verify Step 2 highlights **Book Your Date**.
5. Click **Next** and verify Step 3 highlights the header WhatsApp control.
6. Test **Back**, **Skip**, **Got it**, `Escape`, `ArrowLeft`, and `ArrowRight`.
7. Reload the page.

Expected:

- The guide is dismissed after Skip or Got it.
- It does not return after reload in the same browser.
- Clearing the key makes it appear again.
- Resizing or scrolling repositions the highlighted target and arrow.
- The underlying home page remains unchanged after dismissal.

## 11. Repository checks

Run these commands from the repository root. PowerShell commands are deliberately separate:

```powershell
npm run typecheck
npm run lint
npm run build
```

Current expected baseline:

- TypeScript must complete without errors.
- ESLint must complete without errors; existing non-blocking warnings may remain in older files.
- Production build must complete successfully.

## 12. Production-readiness notes

Before enabling real customer traffic:

- Apply and verify the latest Supabase migration.
- Configure and test at least one admin email recipient so WhatsApp outages have a backup.
- Verify Resend sender-domain authentication and Twilio sender/country permissions.
- Confirm WhatsApp templates are approved if switching from free-form text to Meta template messages.
- Test Razorpay in test mode end-to-end before switching keys.
- Decide whether duplicate Razorpay callbacks require strict idempotency; the current behavior is documented in Scenario N rather than changed implicitly.
- Confirm business timezone/date formatting with real studio settings.
- Re-test customer RLS with two different customer accounts.
