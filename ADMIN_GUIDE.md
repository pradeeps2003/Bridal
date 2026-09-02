# Admin Dashboard Guide - Glow with Rubi

## 🔐 How to Change Admin Password in Supabase

### Method 1: Via Supabase Dashboard (Recommended for Admin)
1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Select your project: **glow-with-rubi**
3. Navigate to: **Authentication** → **Users**
4. Find the admin user (by email)
5. Click on the user row
6. Click **Reset Password** button
7. Supabase will send a password reset email
8. Admin clicks the email link and sets new password

### Method 2: Via Admin's Account Settings (If Feature Exists)
Currently, the app doesn't have a built-in password change page. You could add one, or use Method 1.

### Method 3: Using Supabase CLI
```bash
# If you have Supabase CLI installed
supabase auth admin create-user --email admin@example.com --password "new-password"
```

---

## 👨‍💼 Admin Authentication System

### How Admin Login Works:
1. Admin goes to `/admin/login`
2. Enters email and password
3. System verifies:
   - ✅ Credentials are correct (via Supabase Auth)
   - ✅ User has `is_active = true` in `admins` table
   - ✅ User record exists in `admins` table
4. On success: Redirects to `/admin` (dashboard)
5. On failure: Shows error and logs out

### Admin Table Structure (Supabase):
```sql
CREATE TABLE admins (
  id UUID PRIMARY KEY (references auth.users.id),
  email TEXT UNIQUE,
  full_name TEXT,
  role TEXT DEFAULT 'admin',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

---

## 📊 Admin Dashboard Features

### 1. **Dashboard** (`/admin`)
**What it shows:**
- Today's bookings count
- Pending requests (REQUESTED, HELD, ADMIN_APPROVED, PAYMENT_PENDING)
- Confirmed bookings
- Upcoming bookings (future confirmed dates)
- Revenue captured (all paid bookings)
- Quick links to other sections

---

### 2. **📅 Bookings Management** (`/admin/bookings`)
**Features:**
- View all bookings with filters:
  - By status (REQUESTED, HELD, CONFIRMED, COMPLETED, CANCELLED)
  - By date range
  - By customer
- Edit booking details
- Update booking status → triggers WhatsApp notification
- Add admin notes
- View customer contact info
- See package details and pricing
- Mark as COMPLETED → sends review request via WhatsApp

**Status Flow:**
```
REQUESTED → HELD → ADMIN_APPROVED → PAYMENT_PENDING → CONFIRMED → COMPLETED
                                                    ↓
                                              CANCELLED
```

**Individual Booking Details** (`/admin/bookings/[id]`):
- Full booking information
- Customer details
- Package and addon selections
- Payment info
- Timeline of status changes
- Option to update status with notes

---

### 3. **📆 Calendar View** (`/admin/calendar`)
**Features:**
- Visual calendar of all bookings
- Color-coded by status
- Click to view/edit booking
- See availability at a glance

---

### 4. **🎨 Services** (`/admin/services`)
**Features:**
- Create/edit/delete services (e.g., "Bridal Makeup", "Party Makeup")
- Set display order
- Add descriptions
- Activate/deactivate services

---

### 5. **💄 Packages/Looks** (`/admin/packages`)
**Features:**
- Create/edit/delete packages within each service
- Set pricing:
  - **FIXED**: Set price (e.g., ₹5000)
  - **STARTING_FROM**: Show minimum price (e.g., "From ₹3000")
  - **CUSTOM_QUOTE**: Show "Quote" instead of price
- Add package inclusions (e.g., "HD makeup", "Airbrush", "Stickers")
- Set duration in minutes
- Upload package image
- Activate/deactivate packages

---

### 6. **➕ Add-ons** (`/admin/addons`)
**Features:**
- Create/edit/delete add-ons (e.g., "Hair Extensions", "Jewelry")
- Set pricing
- Mark as:
  - **Negotiable**: Price quoted after consultation (e.g., Hair Extensions)
  - **Fixed Price**: Set price (e.g., "Stickers - ₹500")
- Add descriptions
- Set display order

---

### 7. **🎯 Availability Rules** (`/admin/availability`)
**Features:**
- Set minimum advance booking hours (e.g., "Book at least 24 hours ahead")
- Set buffer time between bookings (e.g., "30 minutes between bookings")
- Block specific dates (e.g., holidays, personal time off)
- Add reason for blocked dates
- View all blocked dates

---

### 8. **📸 Portfolio** (`/admin/portfolio`)
**Features:**
- Upload portfolio images
- Add captions/descriptions
- Set display order
- Organize by service category
- Activate/deactivate images

---

### 9. **⭐ Testimonials** (`/admin/testimonials`)
**Features:**
- Review submitted customer testimonials
- Approve/reject testimonials
- View customer name and event type
- Edit before publishing
- Delete inappropriate reviews
- Publish to website (only published ones show)

---

### 10. **🏷️ Coupons** (`/admin/coupons`)
**Features:**
- Create discount codes
- Set discount type:
  - **Percentage Off**: e.g., "20% off"
  - **Fixed Amount**: e.g., "₹500 off"
- Set minimum order value
- Set expiration date
- Limit max uses
- Restrict to specific packages
- Activate/deactivate codes

**Example:**
```
Code: SUMMER20
Type: Percentage Off
Value: 20%
Min Order: ₹3000
Valid: June 1 - Aug 31
Max Uses: 100
```

---

### 11. **⚙️ Settings** (`/admin/settings`)

#### **Business Info**
- Business name
- Phone number
- WhatsApp number (for booking updates)
- Instagram handle
- Email address
- Address
- Google Review URL (for review requests after bookings)

#### **Booking Rules**
- Minimum advance hours (how far ahead customers must book)
- Hold duration (how long a booking is "held" without payment)
- Buffer between bookings (gap needed between appointments)
- Cancellation policy text (shown to customers)

#### **Payment Settings**
- **UPI ID**: Customer pays via GPay, PhonePe, Paytm, etc.
  - Zero transaction fees (FREE!)
- **Advance Payment Mode**:
  - Percentage of total: e.g., 50% advance
  - Fixed amount: e.g., ₹2000 advance
- Define advance percentage or amount

---

## 🔔 Admin Actions Trigger

### When Admin Updates Booking Status → **COMPLETED**:
1. ✅ Status updated in database
2. 📲 WhatsApp message sent to customer:
   - Thanks message
   - Link to Google Review
   - Link to submit testimonial (with unique token)
3. 📧 Email notification (optional)

### When Customer Submits Testimonial:
1. 💾 Testimonial saved (unpublished by default)
2. 📧 Admin notified (optional)
3. ⏳ Waiting for admin approval

---

## 🛡️ Admin Security Features

### Authentication:
- ✅ Email + password login
- ✅ Supabase Auth handles session security
- ✅ Admin status verified on every page load
- ✅ Inactive admins cannot log in

### Authorization:
- Only users in `admins` table with `is_active = true` can access
- All admin operations are server-side (secure)
- No client-side data exposure

---

## 📱 Admin UI Components

All admin pages use:
- **AdminShell**: Navigation sidebar, logout button
- **Cards**: Grouped content sections
- **Tables**: Data listings
- **Forms**: Edit/create records
- **Status badges**: Visual status indicators

---

## 🚀 Quick Admin Workflows

### Approve a New Booking:
1. Go to `/admin/bookings`
2. Click on REQUESTED booking
3. Change status to ADMIN_APPROVED
4. Add notes if needed
5. Save → Customer gets payment link

### Confirm a Paid Booking:
1. Go to `/admin/bookings`
2. Click booking in PAYMENT_PENDING
3. Verify payment in Razorpay
4. Change status to CONFIRMED
5. Customer gets confirmation

### Mark Booking as Completed:
1. Go to `/admin/bookings`
2. Click booking
3. Change status to COMPLETED
4. ✨ WhatsApp review request sent automatically

### Block Dates:
1. Go to `/admin/availability`
2. Click "Block Date"
3. Select date
4. Add reason (e.g., "Personal time off")
5. Save → Customers can't book those dates

### Create Discount Code:
1. Go to `/admin/coupons`
2. Enter code (e.g., "SUMMER20")
3. Set discount (e.g., 20% or ₹500)
4. Set expiration
5. Activate

---

## 📞 Troubleshooting

### Admin Can't Log In:
- ❌ Check email/password in Supabase
- ❌ Verify `is_active = true` in `admins` table
- ❌ Check that user exists in `auth.users` and `admins`

### WhatsApp Notifications Not Sending:
- ❌ Check WhatsApp number in settings
- ❌ Verify Twilio/WhatsApp API credentials
- ❌ Check booking has customer phone

### Bookings Not Showing:
- ❌ Check Supabase connection (`.env.local`)
- ❌ Verify admin has query permissions on `bookings` table

---

## 📚 Database Tables Used by Admin

| Table | Purpose |
|-------|---------|
| `admins` | Admin user records |
| `bookings` | All customer bookings |
| `services` | Service categories (Bridal, Party, etc.) |
| `packages` | Makeup packages within services |
| `addons` | Optional extras (extensions, jewelry) |
| `package_items` | Items included in a package |
| `payments` | Payment records for bookings |
| `coupons` | Discount codes |
| `testimonials` | Customer reviews |
| `blocked_dates` | Dates unavailable for booking |
| `site_settings` | Business info, booking rules, payment settings |

---

## 🎯 Key Metrics on Dashboard

| Metric | Definition |
|--------|-----------|
| **Today's Bookings** | Bookings scheduled for today |
| **Pending Requests** | REQUESTED, HELD, ADMIN_APPROVED, PAYMENT_PENDING |
| **Confirmed** | Status = CONFIRMED (will happen) |
| **Upcoming** | Confirmed bookings in the future |
| **Revenue Captured** | Total amount paid (CAPTURED payments) |

---

## 💡 Pro Tips

1. **Set realistic availability**: Adjust buffer time based on travel time between locations
2. **Use coupons strategically**: Limited coupons create urgency
3. **Review testimonials quickly**: Publish good ones to build social proof
4. **Monitor blocked dates**: Don't accidentally block dates customers need
5. **Backup settings**: Supabase auto-backs up, but note important info
6. **Check WhatsApp settings**: Ensure phone/WhatsApp numbers are correct

---

*Last Updated: August 26, 2026*
