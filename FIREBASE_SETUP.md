# Firebase Setup Checklist

## Current Configuration

- **Firebase Project**: `samvad-c126a`
- **Backend GCP Project**: `brdsys`
- **Firebase Auth Domain**: `samvad-c126a.firebaseapp.com`

## Critical Steps to Fix Signup/Login

### 1. Authorized Domains (MOST IMPORTANT)

Go to: **Firebase Console → Authentication → Settings → Authorized domains**

**Add these domains:**
- `localhost` (for local development)
- `127.0.0.1` (for local development)
- Your Vercel domain (e.g., `your-app.vercel.app`)
- Your custom domain (if any)

**Current domain to add:** Check browser console for `Hostname:` value

### 2. Google Sign-In Provider

Go to: **Firebase Console → Authentication → Sign-in method**

**Verify:**
- ✅ Google provider is **Enabled**
- ✅ Support email is set
- ✅ Project support email is configured

### 3. Project Linking (Optional but Recommended)

If you want Firebase Auth and Firestore in the same project:

**Option A: Use Firebase project for everything**
1. Go to Firebase Console → Project Settings → General
2. Link Firebase project `samvad-c126a` to GCP project `brdsys`
3. Update backend to use Firestore in `samvad-c126a` instead of `brdsys`

**Option B: Keep them separate (current setup)**
- Firebase Auth in `samvad-c126a` ✅ (works fine)
- Firestore in `brdsys` ✅ (works fine)
- Just ensure domains are authorized

### 4. Redirect URL Configuration

Firebase automatically handles redirects, but verify:

1. **Check redirect URL in browser:**
   - After clicking Sign Up, check the URL Google redirects to
   - Should be: `https://YOUR-DOMAIN/__/auth/handler?...`
   - Or: `https://YOUR-DOMAIN/?apiKey=...&authType=...`

2. **If redirect goes to wrong domain:**
   - Add that domain to Authorized domains
   - Or update Firebase Auth domain configuration

## Testing Steps

1. **Clear browser cache and sessionStorage:**
   ```javascript
   // In browser console:
   sessionStorage.clear();
   localStorage.clear();
   ```

2. **Check current domain:**
   - Open browser console
   - Look for: `Hostname: localhost` or your domain
   - Add that exact domain to Firebase Authorized domains

3. **Test signup flow:**
   - Click "Sign Up with Google"
   - Complete Google authentication
   - Check console for redirect logs
   - Verify URL after redirect contains auth parameters

## Common Issues

### Issue: Redirect returns but user not authenticated
**Solution:** Domain not in authorized list → Add domain to Firebase Console

### Issue: 404 error from Firebase
**Solution:** Usually harmless SDK check, but verify authorized domains

### Issue: Redirect goes to wrong URL
**Solution:** Check Firebase Auth domain matches your app domain

## Quick Fix Command

After adding your domain to Firebase Console:
1. Hard refresh browser (Ctrl+Shift+R or Cmd+Shift+R)
2. Clear sessionStorage: `sessionStorage.clear()` in console
3. Try signup again
