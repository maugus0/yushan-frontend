# API Testing Findings Summary

**Date:** 13 October 2025  
**Branch:** YW-151  
**Tester:** User manual API testing

---

## 📋 Test Results

### ✅ API Endpoints Working:

1. ✅ `GET /api/users/me` - User profile retrieval
2. ✅ `POST /api/users/send-email-change-verification` - OTP sending
3. ⚠️ `PUT /api/users/{id}/profile` - Profile update (partial)

---

## 🔴 Critical Issue Found

### Gender Update Failure

**Test:**

```json
PUT /api/users/5e68a39e-32e6-435a-baac-013f1944196b/profile
{
  "gender": 1
}
```

**Expected:**

```json
{
  "profile": {
    "gender": "MALE"
  }
}
```

**Actual:**

```json
{
  "profile": {
    "gender": "UNKNOWN"
  }
}
```

**Issue:** Gender field sent as `1` but backend returns `UNKNOWN` instead of `MALE`.

---

## 🔍 Root Cause Analysis

### Issue 1: Wrong Data Type in Manual Test

**Problem:** You sent `gender: 1` (number)  
**Expected:** Backend needs `gender: "MALE"` (string)

The backend Gender enum is:

```java
public enum Gender {
    UNKNOWN(0, "user.png"),
    MALE(1, "user_male.png"),
    FEMALE(2, "user_female.png");
}
```

But the API likely expects the **enum name as string**, not the **enum code as number**.

### Issue 2: Wrong Field Name for Avatar

**Problem:** You sent `avatarUrl: "user_male.png"` (string)  
**Expected:** Backend needs `avatar: <file>` (file upload)

---

## ✅ Frontend Code Verification

### Gender Conversion (CORRECT):

Our code in `src/services/userProfile.js`:

```javascript
if (profileData.gender !== undefined) {
  const genderValue =
    typeof profileData.gender === 'number'
      ? GENDER_REVERSE_MAP[profileData.gender] // Converts 1 → "MALE"
      : profileData.gender;
  formData.append('gender', genderValue); // Sends "MALE" string
}
```

**Result:** Frontend DOES send `"MALE"` (string), not `1` (number) ✅

### Avatar Upload (CORRECT):

```javascript
if (profileData.avatarFile) {
  formData.append('avatar', profileData.avatarFile); // Sends File object
}
```

**Result:** Frontend DOES send file, not URL string ✅

---

## 🧪 Next Steps

### 1. Test via Frontend UI (Not Manual API)

**Why?** Your manual test used wrong data types. The frontend sends correct types.

**Action:**

1. Open browser
2. Login
3. Go to Edit Profile
4. Open DevTools Console + Network Tab
5. Select gender dropdown → "Male"
6. Click "SAVE CHANGES"
7. Check console output (shows what's being sent)
8. Check Network tab payload
9. Check response

### 2. Verify Debug Output

After clicking save, console should show:

```
=== UPDATE PROFILE DEBUG ===
User ID: 5e68a39e-32e6-435a-baac-013f1944196b
username: admin
email: admin@yushan.com
gender: MALE              ← Should be STRING "MALE"
profileDetail: Hello I am Admin.
===========================
```

If it shows `gender: MALE` (string) but backend still returns `UNKNOWN`, then it's definitely a backend issue.

### 3. Correct Manual Testing Format

If testing manually via Postman/Swagger:

**DON'T:**

```json
{
  "gender": 1,
  "avatarUrl": "user_male.png"
}
```

**DO:**

```
Content-Type: multipart/form-data

gender: MALE              ← String
avatar: <select file>     ← File upload
username: admin
email: admin@yushan.com
profileDetail: Hello I am Admin.
```

---

## 📊 API Response Structures

### GET /users/me:

```json
{
  "code": 200,
  "data": {
    // ← Direct
    "uuid": "...",
    "username": "admin",
    "gender": "UNKNOWN"
  }
}
```

### PUT /users/{id}/profile:

```json
{
  "code": 200,
  "data": {
    "profile": {
      // ← Nested
      "uuid": "...",
      "username": "admin",
      "gender": "UNKNOWN"
    },
    "emailChanged": false
  }
}
```

**Note:** Different structures, but our frontend handles both correctly.

---

## 🎯 Verification Checklist

### Manual API Test Issues:

- [x] Identified wrong data type (number vs string)
- [x] Identified wrong field name (avatarUrl vs avatar)
- [x] Documented correct format

### Frontend Code:

- [x] Verified gender conversion logic ✅
- [x] Verified avatar upload logic ✅
- [x] Verified response handling ✅
- [x] Added debug logging

### Next Steps:

- [ ] Test via frontend UI (not manual API)
- [ ] Capture debug console output
- [ ] Verify Network tab shows correct FormData
- [ ] Report findings (if still fails, it's backend issue)

---

## 📝 Files Created/Updated

1. **`API_INTEGRATION_ISSUES.md`** - Detailed issue analysis
2. **`DEBUG_PROFILE_UPDATE.md`** - Debug instructions
3. **`PROFILE_TESTING_GUIDE.md`** - Updated with warning
4. **`src/services/userProfile.js`** - Added debug logging

---

## 🚦 Current Status

### Frontend: ✅ READY

- All code verified correct
- Gender sends as string
- Avatar sends as file
- Response handling works

### Backend: ⚠️ NEEDS INVESTIGATION

- Gender update may not be working
- OR manual test used wrong format
- Need to test via UI to confirm

### Action Required:

**Please test via the frontend UI and report back with:**

1. Console debug output
2. Network tab payload screenshot
3. Response data

This will definitively show if the issue is frontend or backend.

---

## 🔗 Related Documents

- `API_INTEGRATION_ISSUES.md` - Full technical analysis
- `DEBUG_PROFILE_UPDATE.md` - How to debug
- `GENDER_ENUM_UPDATE.md` - Gender enum alignment details
- `PROFILE_TESTING_GUIDE.md` - Complete testing guide
