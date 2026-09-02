# Admin Login Verification Checklist

## ✅ Configuration Status

### Supabase Keys Present:
- ✅ NEXT_PUBLIC_SUPABASE_URL: `iemryusynvhybhqorbje.supabase.co`
- ✅ NEXT_PUBLIC_SUPABASE_ANON_KEY: Configured (hidden)
- ✅ SUPABASE_SERVICE_ROLE_KEY: Configured (hidden)

### Optional Integrations:
- ⚠️ NEXT_PUBLIC_RAZORPAY_KEY_ID: Not configured (payments optional)
- ⚠️ WHATSAPP_API_TOKEN: Not configured (optional for messaging)

## 🔐 Admin Login Requirements

### Database Setup Needed:

1. **Create `admins` table in Supabase:**
   ```sql
   CREATE TABLE admins (
     id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
     email TEXT UNIQUE,
     full_name TEXT,
     role TEXT DEFAULT 'admin',
     is_active BOOLEAN DEFAULT true,
     created_at TIMESTAMP DEFAULT now(),
     updated_at TIMESTAMP DEFAULT now()
   );
   ```

2. **Create admin user in Supabase Auth:**
   - Go to: Supabase Dashboard → Authentication → Users
   - Click "Add user"
   - Email: your-email@example.com
   - Password: your-password
   - Click "Create user"

3. **Add user to `admins` table:**
   ```sql
   INSERT INTO admins (id, email, full_name, is_active)
   VALUES (
     'user-id-from-step-2',
     'your-email@example.com',
     'Your Name',
     true
   );
   ```

## 📝 SQL Queries to Run in Supabase

### 1. Check if `admins` table exists:
```sql
SELECT EXISTS (
   SELECT FROM information_schema.tables 
   WHERE table_schema = 'public' 
   AND table_name = 'admins'
);
```

### 2. List all admin users:
```sql
SELECT id, email, full_name, role, is_active, created_at
FROM admins
ORDER BY created_at DESC;
```

### 3. Check auth users:
```sql
SELECT id, email, email_confirmed_at, created_at
FROM auth.users
WHERE email LIKE '%@%'
ORDER BY created_at DESC;
```

### 4. If admin table doesn't exist, create it:
```sql
CREATE TABLE IF NOT EXISTS admins (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE,
  full_name TEXT,
  role TEXT DEFAULT 'admin',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

-- Create index for faster lookups
CREATE INDEX idx_admins_is_active ON admins(is_active);
CREATE INDEX idx_admins_email ON admins(email);
```

### 5. To create an admin user (if auth.users entry exists):
```sql
INSERT INTO admins (id, email, full_name, role, is_active)
SELECT id, email, email, 'admin', true
FROM auth.users
WHERE email = 'admin@example.com'
AND NOT EXISTS (
  SELECT 1 FROM admins WHERE id = auth.users.id
);
```

## 🧪 Test Admin Login

### Step 1: Verify in Supabase
- Go to Supabase Dashboard
- Check Authentication → Users (admin user exists)
- Check SQL Editor → Run "List all admin users" query
- Verify `is_active = true`

### Step 2: Test in App
- URL: http://localhost:3001/admin/login
- Enter admin email & password
- Should redirect to: http://localhost:3001/admin

### Step 3: Expected Success Flow
1. ✅ Form submits
2. ✅ Supabase authenticates email/password
3. ✅ System checks `admins` table
4. ✅ If `is_active = true`, redirects to dashboard
5. ✅ Dashboard loads with booking stats

### Step 4: If It Fails
Check error message:
- "Invalid credentials" → Wrong email/password in auth.users
- "Not authorized for admin access" → Not in admins table or is_active = false
- "Supabase is not configured" → Missing env keys (but you have them)

## 🚀 Quick Fix Commands

### If admin table missing:
```sql
-- Create everything at once
CREATE TABLE IF NOT EXISTS admins (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  email TEXT UNIQUE,
  full_name TEXT,
  role TEXT DEFAULT 'admin',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);
```

### If admin user needs to be activated:
```sql
UPDATE admins 
SET is_active = true, updated_at = now()
WHERE email = 'admin@example.com';
```

### If admin user doesn't exist in admins table:
```sql
INSERT INTO admins (id, email, full_name, is_active)
VALUES (
  'user-uuid-from-auth-users',
  'admin@example.com',
  'Admin Name',
  true
);
```

## 📊 Admin Login Code Flow

```
User enters credentials
        ↓
AdminLoginForm submits
        ↓
Supabase.auth.signInWithPassword()
        ↓
✅ Auth successful → User ID returned
        ↓
Check admins table for user ID
        ↓
✅ Found & is_active=true → Redirect to /admin ✅
❌ Not found or is_active=false → Sign out & show error ❌
        ↓
Dashboard loads with:
  - Booking stats
  - Navigation menu
  - Admin features
```

## ✅ Final Checklist

Before testing admin login:

- [ ] Supabase project connected (.env.local has keys)
- [ ] `admins` table exists in Supabase
- [ ] Admin user exists in auth.users
- [ ] Admin user exists in admins table with is_active=true
- [ ] Dev server running on http://localhost:3001
- [ ] No console errors in browser

Once all checked: **Admin login should work!** ✅

---

**Next**: Go to Supabase Dashboard and verify/create the admin setup above.
