# Glow with Rubi - System Documentation

## Current Booking Notification Flow

### When User Books:

1. **User submits booking** via `/api/bookings` route
2. **Customer receives WhatsApp notification** immediately:
   - Template: `booking_received`
   - Content: Confirmation of booking request with details
3. **Admin notification**: Currently NOT automatically sent to admin on new booking
   - Admin needs to check dashboard or enquiries manually
   - **Improvement needed**: Add admin notification on new booking

### Booking Status Changes:

When admin changes booking status:
- **CONFIRMED**: Customer gets WhatsApp notification
- **CANCELLED**: Customer gets WhatsApp notification  
- **COMPLETED**: Customer gets review request via WhatsApp

### Payment Flow:

1. **User selects package** → Booking created with status "HELD"
2. **User proceeds to payment** → Razorpay order created
3. **Payment successful** → Booking status changes to "CONFIRMED"
4. **Customer receives**:
   - Payment confirmation notification
   - Booking confirmation notification

## WhatsApp Integration Setup

### Required Environment Variables:

```env
WHATSAPP_API_TOKEN=your_access_token
WHATSAPP_PHONE_NUMBER_ID=your_phone_number_id
WHATSAPP_API_VERSION=v19.0  # optional, defaults to v19.0
```

### Setup Steps:

1. **Get Meta Business Account**
   - Go to developers.facebook.com
   - Create a Meta Business Account
   - Create a WhatsApp Business App

2. **Get API Credentials**
   - From your WhatsApp Business App settings
   - Copy: Access Token and Phone Number ID

3. **Add to Environment**
   - Add the credentials to your `.env.local` file
   - Restart the development server

4. **Test Integration**
   - The system logs all notifications to database
   - Check `/admin` dashboard for notification status
   - Even without credentials, messages are logged for testing

### Current WhatsApp Features:

- ✅ Booking confirmation to customers
- ✅ Payment confirmation notifications
- ✅ Status change notifications
- ✅ Contact form notifications
- ✅ Review request notifications
- ✅ Template-based messaging system
- ✅ Error handling and logging

## Payment Flow

### Current Implementation:

**Payment Gateway**: Razorpay (configured but optional)

**Flow**:
1. User selects package and fills booking form
2. Booking created with status "HELD" (slot reserved for X minutes)
3. If payment enabled:
   - Razorpay order created
   - User redirected to payment page
   - On success: Booking status → "CONFIRMED"
4. If payment disabled/manual:
   - Booking remains "HELD" until admin confirms
   - Admin can change status manually

**Payment Settings** (in admin panel):
- Mode: "disabled" | "razorpay" | "manual"
- Advance percentage or fixed amount
- UPI ID for manual payments

### Payment Status:

- **HELD**: Slot reserved, awaiting payment
- **CONFIRMED**: Payment received/admin approved
- **CANCELLED**: Booking cancelled
- **COMPLETED**: Service delivered

## User vs Admin Roles & Responsibilities

### User (Customer):

**Can:**
- Browse packages and services
- Submit booking requests
- Select date/time slots
- Apply coupon codes
- Make payments (if enabled)
- Submit contact enquiries
- View portfolio and testimonials
- Read FAQ and policy pages

**Cannot:**
- Access admin dashboard
- Modify booking status
- Manage other users' bookings
- Change prices or packages
- View other customers' data

### Admin:

**Can:**
- Access full admin dashboard (`/admin`)
- Manage bookings (approve, cancel, complete)
- View calendar with all bookings
- Block/unblock dates
- Manage services and packages
- Create and manage add-ons
- Create and manage coupons
- Manage portfolio items
- Manage testimonials
- View and respond to enquiries
- Configure business settings
- Configure payment settings
- Configure booking rules
- View audit logs
- Send manual notifications

**Responsibilities:**
- Review and approve booking requests
- Manage calendar availability
- Update package prices and details
- Handle customer enquiries
- Monitor payment status
- Update business information
- Manage marketing content (portfolio, testimonials)

## Technical Architecture

### Database Tables:

- `bookings` - All booking records
- `customers` - Customer information
- `packages` - Service packages
- `services` - Service categories
- `addons` - Optional extras
- `coupons` - Discount codes
- `enquiries` - Contact form submissions
- `portfolio_items` - Portfolio images
- `testimonials` - Customer reviews
- `notifications` - Notification logs
- `blocked_dates` - Unavailable dates
- `availability_rules` - Time slot rules

### Key API Routes:

- `/api/bookings` - Create/manage bookings
- `/api/payments/verify` - Verify Razorpay payments
- `/api/contact` - Contact form submissions
- `/api/availability` - Check time slot availability

### Admin Routes:

- `/admin` - Dashboard
- `/admin/bookings` - Booking management
- `/admin/calendar` - Calendar view
- `/admin/enquiries` - Enquiry management
- `/admin/services` - Service management
- `/admin/packages` - Package management
- `/admin/addons` - Add-on management
- `/admin/coupons` - Coupon management
- `/admin/portfolio` - Portfolio management
- `/admin/testimonials` - Review management
- `/admin/settings` - Configuration

## Security Features:

- Row Level Security (RLS) on Supabase
- Admin authentication required for admin routes
- Customer data isolation
- API rate limiting (recommended)
- Secure payment verification
- Audit logging for admin actions

## Recommended Improvements:

1. **Admin Notifications**: Add automatic WhatsApp notification to admin on new bookings
2. **Email Notifications**: Add email as backup channel
3. **SMS Integration**: Add SMS for critical updates
4. **Real-time Updates**: Add WebSocket for live booking status
5. **Customer Portal**: Allow customers to view their booking history
6. **Analytics Dashboard**: Add revenue and booking analytics
7. **Multi-admin Support**: Add role-based permissions for multiple admins