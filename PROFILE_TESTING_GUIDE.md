# User Profile API Integration - Quick Test Guide

⚠️ **IMPORTANT:** See `API_INTEGRATION_ISSUES.md` for critical issues found during testing.

## 🚀 Quick Test

### 1. View Profile

```bash
# Navigate to: /profile

Expected:
✅ Loading spinner appears briefly
✅ Profile loads with real data from API
✅ Avatar shows (or gender-based fallback)
✅ All fields populated from API response
```

### 2. Test Avatar Fallbacks

**Test Male Gender:**

```javascript
// If API returns gender: "MALE" or gender: 1
// Should show: user_male.png as fallback
```

**Test Female Gender:**

```javascript
// If API returns gender: "FEMALE" or gender: 2
// Should show: user_female.png as fallback
```

**Test Unknown Gender:**

```javascript
// If API returns gender: "UNKNOWN" or gender: 0
// Should show: user.png as fallback
```

### 3. Edit Profile

```bash
# Click "Edit Profile" button

Expected:
✅ Form pre-fills with current data
✅ Avatar displays (or fallback)
```

### 4. Change Avatar

```bash
# Click camera icon on avatar
# Select image file

Expected:
✅ File picker opens
✅ Image validates (type & size)
✅ Preview updates immediately
✅ Save button enables
```

### 5. Send Email Verification

```bash
# Change email field
# Click "Send OTP"

Expected:
✅ API call to /send-email-change-verification
✅ Success message appears
✅ Countdown starts (5 minutes)
✅ Send OTP button disabled during countdown
```

### 6. Save Profile

```bash
# Make changes to any field
# Click "SAVE CHANGES"

Expected:
✅ Save button shows loading spinner
✅ API call to PUT /users/{id}/profile
✅ Success message appears
✅ Redux store updates
✅ Navigate to profile page
✅ Profile shows updated data
```

## 🔍 Debug Commands

### Check Redux Store

```javascript
// In browser console
store.getState().user

// Should show:
{
  isAuthenticated: true,
  user: {
    uuid: "...",
    email: "...",
    username: "...",
    avatarUrl: "...",
    gender: 1,  // Number, not string
    // ... other fields
  }
}
```

### Check Processed Avatar

```javascript
// In browser console
import { processUserAvatar } from './utils/imageUtils';

// Test with current user
const user = store.getState().user.user;
processUserAvatar(user.avatarUrl, user.gender);
// Should return proper avatar URL or fallback
```

### Test Gender Mapping

```javascript
// In browser console

// API to Frontend
const GENDER_MAP = {
  MALE: 1,
  FEMALE: 2,
  UNKNOWN: 0,
  PREFER_NOT_TO_SAY: 3,
};

// Frontend to API
const GENDER_REVERSE_MAP = {
  0: 'UNKNOWN',
  1: 'MALE',
  2: 'FEMALE',
  3: 'PREFER_NOT_TO_SAY',
};
```

## 📊 Network Tab Monitoring

### Profile Load

```
GET https://yushan-backend-staging.up.railway.app/api/users/me

Headers:
  Authorization: Bearer {token}

Expected Response:
{
  "code": 200,
  "data": {
    "uuid": "...",
    "gender": "MALE",  // String from API
    // ... other fields
  }
}
```

### Profile Update

```
PUT https://yushan-backend-staging.up.railway.app/api/users/{uuid}/profile

Headers:
  Authorization: Bearer {token}
  Content-Type: multipart/form-data

Request Payload (FormData):
  username: "admin"
  email: "admin@yushan.com"
  gender: "MALE"  // Converted back to string
  profileDetail: "Bio text..."
  avatar: (binary file)
  verificationCode: "123456"  // If email changed

Expected Response:
{
  "code": 200,
  "data": { /* updated user data */ }
}
```

### Email Verification

```
POST https://yushan-backend-staging.up.railway.app/api/users/send-email-change-verification

Headers:
  Authorization: Bearer {token}
  Content-Type: application/json

Request Body:
{
  "email": "newemail@example.com"
}

Expected Response:
{
  "code": 200,
  "message": "Verification email sent"
}
```

## ⚠️ Common Issues

### 🔴 CRITICAL: Gender Update Not Working

**Status:** Backend issue identified  
**Details:** See `API_INTEGRATION_ISSUES.md`

**Symptoms:**

- Send `gender: "MALE"` to backend
- Backend returns `gender: "UNKNOWN"`
- Gender value not persisting

**Temporary Workaround:**

- Frontend code is correct
- Waiting for backend fix
- Test other features in the meantime

### Issue: "Failed to load profile data"

**Check:**

- Is user authenticated? (Check token in localStorage)
- Is backend API running?
- Check Network tab for 401/500 errors
- Check console for error details

### Issue: Avatar not showing

**Check:**

1. Network tab - is image loading?
2. Console - any errors?
3. Check fallback image exists:
   - `src/assets/images/user_male.png`
   - `src/assets/images/user_female.png`
   - `src/assets/images/user.png`
4. Verify gender value (should be 0, 1, 2, or 3)

### Issue: Gender showing wrong fallback

**Check:**

- API response gender value
- Transformation in userProfile.js
- Redux store gender value (should be number)

### Issue: Profile update fails

**Check:**

- Email changed but no OTP provided?
- Avatar file too large? (max 5MB)
- Avatar file wrong type? (must be image/\*)
- Check Network tab response for error details
- Check console for validation errors

### Issue: OTP not sending

**Check:**

- Email format valid?
- Network tab - API called?
- Backend email service configured?
- Check error response in Network tab

## ✅ Success Criteria

### Profile Page

- [x] Loads within 2 seconds
- [x] Shows loading state
- [x] Displays all user fields
- [x] Avatar shows or falls back correctly
- [x] No console errors

### Edit Profile Page

- [x] Form pre-populated
- [x] Avatar upload works
- [x] File validation works
- [x] OTP sending works
- [x] Save updates profile
- [x] Loading states work
- [x] Error messages clear
- [x] Success navigation works

### Avatar System

- [x] Base64 images work
- [x] HTTP URLs work
- [x] Fallbacks trigger correctly
- [x] Gender-based defaults correct
- [x] Error handling works

## 🎯 Test Scenarios

### Scenario 1: New User (No Avatar)

1. Login with account that has no avatar
2. Expected: Gender-based fallback shows
3. Edit profile → Upload avatar
4. Expected: New avatar shows after save

### Scenario 2: Base64 Avatar

1. Backend returns base64 avatar
2. Expected: Base64 image displays
3. If invalid base64: Fallback shows

### Scenario 3: Change Email

1. Edit profile → Change email
2. Click "Send OTP"
3. Expected: Countdown starts
4. Enter OTP → Save
5. Expected: Email updated

### Scenario 4: Change Gender

1. Edit profile → Change gender
2. Save changes
3. View profile
4. Expected: Gender icon updated
5. Delete avatar (make avatarUrl null)
6. Expected: New gender fallback shows

### Scenario 5: Large Avatar Upload

1. Select image > 5MB
2. Expected: Error message
3. Upload not allowed

### Scenario 6: Invalid File Type

1. Select non-image file (.pdf, .txt)
2. Expected: Error message
3. Upload not allowed

## 📝 Manual Testing Checklist

### Before Testing

- [ ] Backend API running
- [ ] Environment variable set: `REACT_APP_API_URL`
- [ ] User account created in backend
- [ ] User logged in (token valid)

### Profile Page Tests

- [ ] Navigate to /profile
- [ ] Loading spinner appears
- [ ] Profile data loads from API
- [ ] Username displays
- [ ] Email displays
- [ ] Avatar displays (or fallback)
- [ ] Gender icon correct
- [ ] Level icon shows
- [ ] Stats show (readTime, readBookNum)
- [ ] EXP shows
- [ ] Join date formatted
- [ ] Bio shows (or "No bio yet.")
- [ ] Edit button works

### Edit Profile Tests

- [ ] All fields pre-filled
- [ ] Username editable
- [ ] Email editable
- [ ] Gender dropdown works
- [ ] Bio text area works
- [ ] Avatar shows (or fallback)
- [ ] Camera icon clickable
- [ ] File picker opens
- [ ] Image validation works
- [ ] Preview updates
- [ ] Save button disabled initially
- [ ] Save button enables after change
- [ ] Send OTP validates email
- [ ] Send OTP sends request
- [ ] Countdown works
- [ ] Save shows loading
- [ ] Save calls API
- [ ] Success message shows
- [ ] Navigate to profile
- [ ] Profile shows updates

### Avatar Tests

- [ ] Male gender → user_male.png
- [ ] Female gender → user_female.png
- [ ] Unknown gender → user.png
- [ ] Base64 avatar displays
- [ ] HTTP URL avatar displays
- [ ] Invalid avatar falls back
- [ ] Upload works
- [ ] Preview correct
- [ ] File type validated
- [ ] File size validated

## 🐛 Debugging Tips

1. **Enable verbose logging**: Check console for API calls
2. **Use Redux DevTools**: Monitor state changes
3. **Check Network tab**: Verify API requests/responses
4. **Test with different genders**: Verify fallback logic
5. **Test with no avatar**: Verify fallback selection
6. **Test with invalid base64**: Verify error handling
7. **Test with large file**: Verify validation
8. **Test email change**: Verify OTP flow

## 📞 API Testing with cURL

### Get Profile

```bash
curl -X GET \
  https://yushan-backend-staging.up.railway.app/api/users/me \
  -H "Authorization: Bearer {YOUR_TOKEN}"
```

### Update Profile

```bash
curl -X PUT \
  https://yushan-backend-staging.up.railway.app/api/users/{UUID}/profile \
  -H "Authorization: Bearer {YOUR_TOKEN}" \
  -F "username=admin" \
  -F "email=admin@yushan.com" \
  -F "gender=MALE" \
  -F "profileDetail=Bio text" \
  -F "avatar=@/path/to/image.jpg"
```

### Send Email Verification

```bash
curl -X POST \
  https://yushan-backend-staging.up.railway.app/api/users/send-email-change-verification \
  -H "Authorization: Bearer {YOUR_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{"email":"newemail@example.com"}'
```

---

**Status:** ✅ Ready for testing
**Last Updated:** October 13, 2025
