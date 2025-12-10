# Fix Admin Login Issue for INT00137

If you're getting a 401 Unauthorized error when trying to login with INT00137, follow these steps:

## Quick Fix

### Step 1: Run the Diagnostic Script

Open a terminal in the `backend` folder and run:

```bash
python check_and_fix_admin.py INT00137 your_password
```

Replace `your_password` with the password you want to use for INT00137.

**Example:**
```bash
python check_and_fix_admin.py INT00137 admin123
```

This script will:
- ✅ Check if INT00137 exists in the users table
- ✅ Create the user if it doesn't exist
- ✅ Check if the admins table exists (create it if needed)
- ✅ Add INT00137 to the admins table if not already there
- ✅ Update the password if provided

### Step 2: Verify the Setup

After running the script, you should see:
```
✅ User 'INT00137' exists in users table.
✅ User 'INT00137' is now an admin.
🎉 Setup complete! User 'INT00137' can now login as admin.
```

### Step 3: Try Logging In Again

1. Make sure the backend server is running
2. Go to the login page
3. Enter:
   - **Username:** INT00137
   - **Password:** (the password you set in Step 1)
4. Click "Log In"

## Alternative: Manual Setup

If the script doesn't work, you can manually set up the admin user:

### Option A: Register and Make Admin (Recommended)

```bash
python register_and_make_admin.py INT00137 your_password system
```

### Option B: Add Existing User as Admin

If INT00137 already exists as a user:

```bash
python add_admin_user.py INT00137 system
```

## Troubleshooting

### Still Getting 401 Error?

1. **Check Backend Logs:**
   - Look at the backend server console
   - You should see log messages like: `Login attempt for username: INT00137`
   - Check for any error messages

2. **Verify User Exists:**
   - The script will tell you if the user exists
   - If not, make sure you provide a password when running the script

3. **Verify Admin Status:**
   - The script will tell you if the user is in the admins table
   - If not, it will add them automatically

4. **Check Password:**
   - Make sure you're using the correct password
   - The script will update the password if you provide one

5. **Check Database Connection:**
   - Make sure the backend can connect to the database
   - Check `backend/app/database.py` for database configuration

### Check Backend Server Logs

When you try to login, check the backend server console. You should see:
- `Login attempt for username: INT00137`
- `User 'INT00137' authenticated successfully`
- `User 'INT00137' is an admin`
- `Login successful for 'INT00137' with role: admin`

If you see "User not found" or "Invalid password", the diagnostic script will fix it.

## What the Script Does

The `check_and_fix_admin.py` script:

1. **Checks User Table:**
   - Verifies INT00137 exists in the `users` table
   - Creates the user if missing (requires password)

2. **Checks Admins Table:**
   - Verifies the `admins` table exists
   - Creates it if missing

3. **Checks Admin Status:**
   - Verifies INT00137 is in the `admins` table
   - Adds them if missing

4. **Updates Password:**
   - Updates the password if provided
   - Uses secure bcrypt hashing

## After Fixing

Once the setup is complete:
- ✅ INT00137 will be able to login
- ✅ They will be redirected to the admin dashboard
- ✅ They will have full admin privileges





