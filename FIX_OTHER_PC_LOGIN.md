# Fix Login Issue on Other PC

Since INT00137 login works on one PC but not the other, the issue is **configuration**, not the database.

## The Problem

The frontend on the other PC is trying to connect to `http://localhost:8000`, but:
- If the backend is on a **different machine**, `localhost` won't work
- The frontend needs to point to the **actual backend machine's IP address**

## Quick Fix (3 Steps)

### Step 1: Find the Backend Machine's IP Address

On the PC where the backend is running (the one that works):

**Windows:**
```cmd
ipconfig
```
Look for **"IPv4 Address"** - it will be something like:
- `192.168.1.100`
- `10.0.0.5`
- `192.168.0.50`

**Example output:**
```
IPv4 Address. . . . . . . . . . . : 192.168.1.100
```

### Step 2: Update Frontend Configuration on the Other PC

On the **other PC** (where login is not working):

1. Open the file: `frontend/src/environments/environment.ts`
2. Change this line:
   ```typescript
   apiUrl: 'http://localhost:8000'  // ❌ Wrong - only works on same machine
   ```
   
   To this (use the IP from Step 1):
   ```typescript
   apiUrl: 'http://192.168.1.100:8000'  // ✅ Correct - replace with your backend IP
   ```

3. **Save the file**

### Step 3: Restart Frontend on the Other PC

On the other PC, restart the Angular dev server:

```bash
# Stop the current server (Ctrl+C)
# Then restart:
cd frontend
ng serve --host 0.0.0.0
```

The `--host 0.0.0.0` allows access from other machines.

## Verify It's Working

1. **Check Backend is Running:**
   - On the backend PC, make sure the server is running
   - Open browser: `http://localhost:8000/docs` (should show FastAPI docs)

2. **Test Connection:**
   - On the other PC, open browser: `http://<backend-ip>:8000/docs`
   - If you see the FastAPI docs, connection is working ✅
   - If you get "connection refused", check firewall/network

3. **Try Login:**
   - Go to login page on the other PC
   - Enter: INT00137 and your password
   - Should work now! ✅

## Common Issues

### Issue 1: "Connection Refused" or Network Error

**Cause:** Backend not accessible from other PC

**Fix:**
1. Make sure backend server is running on the backend PC
2. Check Windows Firewall on backend PC:
   - Open Windows Defender Firewall
   - Allow port 8000 through firewall
   - Or temporarily disable firewall to test

3. Verify both PCs are on the same network

### Issue 2: Still Getting 401 Unauthorized

**Cause:** Frontend still using old configuration

**Fix:**
1. Make sure you saved `environment.ts` after changing it
2. **Hard refresh** the browser (Ctrl+Shift+R or Ctrl+F5)
3. Clear browser cache
4. Check browser console (F12) - look for the actual API URL being called
5. Verify the URL in console matches the backend IP

### Issue 3: CORS Errors

**Cause:** Backend CORS not allowing the other PC's origin

**Fix:**
1. Make sure backend server was restarted after our CORS updates
2. Backend should now allow all origins in development
3. If still having issues, check backend console for CORS errors

## Example Configuration

**Backend PC (IP: 192.168.1.100):**
- Backend running on: `http://0.0.0.0:8000` ✅
- Accessible from network ✅

**Other PC:**
- `environment.ts` should have:
  ```typescript
  apiUrl: 'http://192.168.1.100:8000'
  ```
- Frontend running with: `ng serve --host 0.0.0.0` ✅

## Still Not Working?

1. **Check Browser Console (F12):**
   - Look at the Network tab
   - See what URL the login request is going to
   - Check for any error messages

2. **Check Backend Logs:**
   - Look at the backend server console
   - You should see: `Login attempt for username: INT00137`
   - If you don't see this, the request isn't reaching the backend

3. **Test Network Connectivity:**
   ```cmd
   ping 192.168.1.100  # Replace with your backend IP
   ```
   - If ping fails, it's a network issue
   - If ping works, it's a configuration issue

4. **Verify Database:**
   - INT00137 is in admins table ✅ (we saw this in pgAdmin)
   - User exists in users table
   - Password is correct

## Quick Checklist

- [ ] Backend server is running on backend PC
- [ ] Found backend PC's IP address
- [ ] Updated `environment.ts` on other PC with backend IP
- [ ] Restarted frontend on other PC
- [ ] Both PCs on same network
- [ ] Firewall allows port 8000
- [ ] Can access `http://<backend-ip>:8000/docs` from other PC
- [ ] Browser console shows correct API URL





