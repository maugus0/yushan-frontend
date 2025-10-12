# API Integration Issues Found

**Date:** 13 October 2025  
**Branch:** YW-151  
**Status:** 🔴 **Critical Issues Found**

---

## Issue 1: Gender Not Updating via PUT API ⚠️

### Test Data Sent:

```json
PUT /api/users/5e68a39e-32e6-435a-baac-013f1944196b/profile
{
  "username": "admin",
  "email": "admin@yushan.com",
  "gender": 1,  // ← Sent as MALE (1)
  "profileDetail": "Hello I am Admin.",
  "verificationCode": "string"
}
```

### Response Received:

```json
{
  "code": 200,
  "message": "Profile updated successfully",
  "data": {
    "profile": {
      "gender": "UNKNOWN" // ← Returned as UNKNOWN instead of MALE
    }
  }
}
```

### Problem:

- **Sent:** `gender: 1` (numeric MALE)
- **Expected:** Backend saves as `MALE` and returns `"gender": "MALE"`
- **Actual:** Backend returns `"gender": "UNKNOWN"`

### Root Cause Analysis:

**Issue 1A: Backend expects STRING, not NUMBER**

Looking at the request, you sent:

```json
"gender": 1
```

But the backend Gender enum expects a **STRING**:

```java
public enum Gender {
    UNKNOWN(0, "user.png"),
    MALE(1, "user_male.png"),
    FEMALE(2, "user_female.png");
}
```

The backend likely expects:

```json
"gender": "MALE"  // String, not number
```

**Our frontend code IS sending the correct format:**

```javascript
// userProfile.js line 73-79
if (profileData.gender !== undefined) {
  const genderValue =
    typeof profileData.gender === 'number'
      ? GENDER_REVERSE_MAP[profileData.gender] // Converts 1 → "MALE"
      : profileData.gender;
  formData.append('gender', genderValue); // Sends "MALE"
}
```

**So the issue is NOT in our code, but in the test request you sent manually.**

### Solution:

When testing manually via Postman/Swagger, send:

```json
{
  "gender": "MALE" // Not 1
}
```

OR

```json
{
  "gender": "FEMALE" // Not 2
}
```

OR

```json
{
  "gender": "UNKNOWN" // Not 0
}
```

---

## Issue 2: Wrong Field Name for Avatar ⚠️

### Test Data Sent:

```json
{
  "avatarUrl": "user_male.png" // ← Wrong field name
}
```

### Problem:

- You sent `avatarUrl` as a **string**
- Backend expects `avatar` as a **file upload** (multipart/form-data)

### Frontend Implementation (CORRECT):

```javascript
// userProfile.js line 86-88
if (profileData.avatarFile) {
  formData.append('avatar', profileData.avatarFile); // ✅ Correct
}
```

### Backend Expected Format:

```
Content-Type: multipart/form-data

avatar: <binary file data>
```

### Solution:

When testing manually:

1. Use **multipart/form-data** content type
2. Upload actual file for `avatar` field
3. Don't send `avatarUrl` as string

---

## Issue 3: API Response Structure Inconsistency ⚠️

### GET /users/me Response:

```json
{
  "code": 200,
  "data": {
    // ← data directly
    "uuid": "...",
    "username": "admin",
    "gender": "UNKNOWN"
  }
}
```

### PUT /users/{id}/profile Response:

```json
{
  "code": 200,
  "data": {
    "profile": {
      // ← data.profile nested
      "uuid": "...",
      "username": "admin",
      "gender": "UNKNOWN"
    },
    "emailChanged": false
  }
}
```

### Problem:

Two different response structures for similar user data:

- **GET** returns `data` directly
- **PUT** returns `data.profile` nested

### Frontend Code Handles This:

```javascript
// getCurrentUser() - handles GET /users/me
if (response.data.code === 200 && response.data.data) {
  return {
    ...response.data,
    data: transformUserData(response.data.data), // Direct access
  };
}

// updateProfile() - handles PUT /users/{id}/profile
if (response.data.code === 200 && response.data.data) {
  const profileData = response.data.data.profile || response.data.data; // Handles both
  return {
    ...response.data,
    data: transformUserData(profileData),
    emailChanged: response.data.data.emailChanged,
  };
}
```

### Status:

✅ **Frontend handles both structures correctly**

---

## Issue 4: Avatar URL Response Mismatch 🤔

### GET /users/me Response:

```json
{
  "avatarUrl": "user.png" // ← Generic default
}
```

### PUT /users/{id}/profile Response:

```json
{
  "profile": {
    "avatarUrl": "user_male.png" // ← Gender-specific after update
  }
}
```

### Observation:

After sending update with `gender: 1` (MALE):

- Gender returned as `UNKNOWN` ❌
- But avatarUrl shows `user_male.png` (MALE avatar) ✅

### Questions for Backend Team:

1. Why does gender update fail but avatar updates correctly?
2. Is there a relationship between gender and avatarUrl on the backend?
3. Should avatarUrl automatically change when gender changes?

---

## Summary of Issues

| Issue               | Severity  | Frontend Code    | Backend API              | Status                  |
| ------------------- | --------- | ---------------- | ------------------------ | ----------------------- |
| Gender not updating | 🔴 High   | ✅ Correct       | ❌ Returns UNKNOWN       | **Backend Issue**       |
| Avatar field name   | 🟡 Medium | ✅ Uses "avatar" | ⚠️ Test used wrong field | **Test Error**          |
| Response structure  | 🟢 Low    | ✅ Handles both  | ⚠️ Inconsistent          | **Frontend Handles**    |
| Avatar URL mismatch | 🟡 Medium | ✅ Correct       | 🤔 Unclear logic         | **Needs Clarification** |

---

## Correct Request Format for Manual Testing

### PUT /users/{uuid}/profile (FormData)

**Content-Type:** `multipart/form-data`

**Fields:**

```
username: "admin"
email: "admin@yushan.com"
gender: "MALE"                    // ← STRING: "MALE", "FEMALE", or "UNKNOWN"
profileDetail: "Hello I am Admin."
avatar: <select file>             // ← FILE upload, not string
verificationCode: "123456"        // ← Only if email changed
```

**NOT:**

```json
{
  "gender": 1, // ❌ Don't send number
  "avatarUrl": "user_male.png" // ❌ Don't send string URL
}
```

---

## Frontend Code Verification

### ✅ Gender Conversion (Correct)

```javascript
// editprofile.jsx line 128-132
let genderValue = null;
if (values.gender === 'male') genderValue = 1;
else if (values.gender === 'female') genderValue = 2;
else genderValue = 0; // unknown

// userProfile.js line 73-79
if (profileData.gender !== undefined) {
  const genderValue =
    typeof profileData.gender === 'number'
      ? GENDER_REVERSE_MAP[profileData.gender] // 1 → "MALE"
      : profileData.gender;
  formData.append('gender', genderValue); // Sends "MALE"
}
```

**Result:** Frontend sends `"MALE"` (string), not `1` (number) ✅

### ✅ Avatar Upload (Correct)

```javascript
// userProfile.js line 86-88
if (profileData.avatarFile) {
  formData.append('avatar', profileData.avatarFile); // File object
}
```

**Result:** Frontend sends actual file, not URL string ✅

### ✅ Response Handling (Correct)

```javascript
// Handles both nested and direct data structures
const profileData = response.data.data.profile || response.data.data;
return {
  ...response.data,
  data: transformUserData(profileData),
  emailChanged: response.data.data.emailChanged,
  accessToken: response.data.data.accessToken,
  refreshToken: response.data.data.refreshToken,
};
```

**Result:** Frontend handles both GET and PUT response structures ✅

---

## Action Items

### For Frontend (Us):

- [x] Verify gender conversion code ✅ **Confirmed correct**
- [x] Verify avatar upload code ✅ **Confirmed correct**
- [x] Verify response handling ✅ **Confirmed correct**
- [ ] Test with actual file upload via UI
- [ ] Monitor console for FormData contents

### For Backend Team:

- [ ] **CRITICAL:** Investigate why gender update returns UNKNOWN instead of MALE
- [ ] Clarify relationship between gender field and avatarUrl field
- [ ] Consider standardizing response structures (GET vs PUT)
- [ ] Verify FormData parsing for gender field

### For Testing:

- [ ] Test manual API call with correct format:
  - gender: "MALE" (string, not number)
  - avatar: file upload (not URL string)
- [ ] Test via frontend UI with file upload
- [ ] Check backend logs for incoming request data

---

## Next Steps

1. **Verify Frontend Sends Correct Data:**

   - Add console.log to see FormData before sending
   - Check Network tab in DevTools
   - Verify Content-Type is multipart/form-data

2. **Test Backend API Manually:**

   - Use correct format (gender: "MALE", not 1)
   - Upload actual file for avatar
   - Check backend logs

3. **Report to Backend Team:**
   - Gender update not working
   - Avatar/gender relationship unclear
   - Response structure inconsistency

---

## Test Script for DevTools Console

Add this temporarily to `userProfile.js` to debug:

```javascript
// Before line 94 (before axios.put)
console.log('=== UPDATE PROFILE DEBUG ===');
for (let [key, value] of formData.entries()) {
  console.log(`${key}:`, value);
}
console.log('===========================');
```

This will show exactly what's being sent to the backend.

---

**Status:** Waiting for backend investigation on gender update issue
**Priority:** High - Gender functionality is core feature
**Blocker:** Cannot fully test profile edit until gender update works
