# Backend API Integration Updates - Gender Enum Fix

## Changes Made

### 1. Gender Enum Alignment

**Backend Gender Enum:**

```java
public enum Gender {
    UNKNOWN(0, "user.png"),
    MALE(1, "user_male.png"),
    FEMALE(2, "user_female.png");
}
```

**Frontend Updated To Match:**

#### Gender Mapping (userProfile.js)

```javascript
// API → Frontend
const GENDER_MAP = {
  MALE: 1,
  FEMALE: 2,
  UNKNOWN: 0,
};

// Frontend → API
const GENDER_REVERSE_MAP = {
  0: 'UNKNOWN',
  1: 'MALE',
  2: 'FEMALE',
};
```

#### Gender Codes (auth.js)

```javascript
const GENDER_CODES = {
  male: 1,
  female: 2,
  unknown: 0,
};
```

**Removed:** `PREFER_NOT_TO_SAY` / `prefer_not_to_say` / `other` options

---

### 2. Profile Update Response Structure

**Updated API Response Format:**

```json
{
  "code": 200,
  "message": "Profile updated successfully",
  "data": {
    "profile": {
      "uuid": "...",
      "email": "...",
      "username": "...",
      "avatarUrl": "user_male.png",
      "gender": "UNKNOWN"
      // ... other fields
    },
    "emailChanged": false,
    "accessToken": null,
    "refreshToken": null,
    "tokenType": null,
    "expiresIn": null
  }
}
```

**When Email Changes:**

```json
{
  "code": 200,
  "message": "Profile updated successfully",
  "data": {
    "profile": {
      /* ... */
    },
    "emailChanged": true,
    "accessToken": "new_access_token",
    "refreshToken": "new_refresh_token",
    "tokenType": "Bearer",
    "expiresIn": 900000
  }
}
```

---

### 3. Files Modified

#### `src/services/userProfile.js` ✅

**Changes:**

- Removed `PREFER_NOT_TO_SAY` from gender mappings
- Updated `updateProfile()` to handle nested response structure
- Extracts `data.profile` instead of just `data`
- Returns `emailChanged`, `accessToken`, `refreshToken` flags

**Code:**

```javascript
if (response.data.code === 200 && response.data.data) {
  // Backend returns data.profile instead of just data
  const profileData = response.data.data.profile || response.data.data;
  return {
    ...response.data,
    data: transformUserData(profileData),
    emailChanged: response.data.data.emailChanged,
    accessToken: response.data.data.accessToken,
    refreshToken: response.data.data.refreshToken,
  };
}
```

#### `src/services/auth.js` ✅

**Changes:**

- Updated `GENDER_CODES` to match backend enum
- `male: 1`, `female: 2`, `unknown: 0`
- Removed `other` and `prefer_not_to_say`

#### `src/utils/imageUtils.js` ✅

**Changes:**

- Updated `getGenderBasedAvatar()` function comments
- Clarified gender value handling (0, 1, 2 only)
- UNKNOWN defaults to `user.png`

**Logic:**

```javascript
switch (gender) {
  case 1:
    return userMaleImage; // MALE
  case 2:
    return userFemaleImage; // FEMALE
  case 0:
  default:
    return userDefaultImage; // UNKNOWN
}
```

#### `src/pages/editprofile/editprofile.jsx` ✅

**Changes:**

- Imported `authService` for token updates
- Updated gender dropdown: `male`, `female`, `unknown`
- Removed `prefer_not_to_say` option
- Updated gender mapping: `'unknown'` → `0`
- Added token update logic when email changes

**Email Change Handling:**

```javascript
if (response.emailChanged && response.accessToken && response.refreshToken) {
  authService.setTokens(response.accessToken, response.refreshToken, response.expiresIn);
  message.success(
    'Profile updated successfully! Email changed and you have been re-authenticated.'
  );
} else {
  message.success('Profile updated successfully!');
}
```

#### `src/components/auth/auth-form.jsx` ✅

**Changes:**

- Updated registration gender dropdown
- Changed from `prefer_not_to_say` to `unknown`
- Options: `male`, `female`, `unknown`

---

### 4. Email Change Flow

**Process:**

1. **User Changes Email in Edit Profile**

   ```
   User enters new email → Form field updates
   ```

2. **User Clicks "Send verify email"**

   ```
   → Validates email format
   → POST /users/send-email-change-verification
   → 5-minute countdown starts
   → OTP sent to new email
   ```

3. **User Enters OTP**

   ```
   User types 6-digit OTP → Form field updates
   ```

4. **User Clicks "SAVE CHANGES"**

   ```
   → Validates form
   → Checks: emailChanged && otpEmpty?
      YES → Show error, require OTP
      NO  → Continue
   → PUT /users/{id}/profile with verificationCode
   → Backend validates OTP
   → Backend issues new tokens (email is part of JWT)
   → Response includes new accessToken & refreshToken
   ```

5. **Frontend Handles Response**
   ```
   → Check if emailChanged === true
   → If yes, update tokens via authService.setTokens()
   → Update Redux store with new profile
   → Show success message
   → Navigate to profile page
   ```

**Why New Tokens?**

- Email is part of the JWT payload
- Changing email requires new tokens with updated email claim
- Old tokens become invalid after email change

---

### 5. Gender Options Comparison

| Option            | Old Frontend              | New Frontend    | Backend         |
| ----------------- | ------------------------- | --------------- | --------------- |
| Male              | ✅ `male: 1`              | ✅ `male: 1`    | ✅ `MALE(1)`    |
| Female            | ✅ `female: 2`            | ✅ `female: 2`  | ✅ `FEMALE(2)`  |
| Unknown           | ❌ N/A                    | ✅ `unknown: 0` | ✅ `UNKNOWN(0)` |
| Prefer Not to Say | ❌ `prefer_not_to_say: 3` | ❌ Removed      | ❌ N/A          |
| Other             | ❌ `other: 2`             | ❌ Removed      | ❌ N/A          |

---

### 6. Avatar Fallback Mapping

| Gender  | Code | Fallback Image    |
| ------- | ---- | ----------------- |
| MALE    | 1    | `user_male.png`   |
| FEMALE  | 2    | `user_female.png` |
| UNKNOWN | 0    | `user.png`        |

**Matches Backend Enum:**

```java
UNKNOWN(0, "user.png"),
MALE(1, "user_male.png"),
FEMALE(2, "user_female.png");
```

---

## Testing Checklist

### Gender Options

- [ ] Registration shows: Male, Female, Unknown
- [ ] Edit profile shows: Male, Female, Unknown
- [ ] Gender value 0 → "Unknown" selected in dropdown
- [ ] Gender value 1 → "Male" selected in dropdown
- [ ] Gender value 2 → "Female" selected in dropdown
- [ ] Gender 0 → user.png fallback
- [ ] Gender 1 → user_male.png fallback
- [ ] Gender 2 → user_female.png fallback

### Email Change Flow

- [ ] Change email field
- [ ] Click "Send verify email"
- [ ] Countdown starts (5 minutes)
- [ ] OTP sent to new email
- [ ] Enter OTP in form
- [ ] Click "SAVE CHANGES"
- [ ] Profile updates successfully
- [ ] New tokens issued (check localStorage)
- [ ] Success message mentions re-authentication
- [ ] User remains logged in

### Profile Update Response

- [ ] Profile update returns nested structure
- [ ] `response.data.data.profile` extracted correctly
- [ ] `emailChanged` flag read correctly
- [ ] New tokens extracted when email changes
- [ ] Redux store updates with profile data
- [ ] No errors in console

---

## API Endpoints

### PUT /users/{uuid}/profile

**URL:** `https://yushan-backend-staging.up.railway.app/api/users/{uuid}/profile`

**Request (FormData):**

```
username: "admin"
email: "newemail@example.com"
gender: "MALE"  // String: UNKNOWN, MALE, or FEMALE
profileDetail: "Bio text"
avatar: (binary file)
verificationCode: "123456"  // Required if email changed
```

**Response (Email NOT Changed):**

```json
{
  "code": 200,
  "data": {
    "profile": {
      /* user data */
    },
    "emailChanged": false,
    "accessToken": null,
    "refreshToken": null
  }
}
```

**Response (Email Changed):**

```json
{
  "code": 200,
  "data": {
    "profile": {
      /* user data */
    },
    "emailChanged": true,
    "accessToken": "new_token",
    "refreshToken": "new_refresh_token",
    "expiresIn": 900000
  }
}
```

---

## OTP Flow Comparison

### Registration OTP

- **Endpoint:** `POST /auth/send-email`
- **Purpose:** Verify email during registration
- **Duration:** 5 minutes
- **Field Name:** `code` (in registration request)

### Email Change OTP

- **Endpoint:** `POST /users/send-email-change-verification`
- **Purpose:** Verify new email when changing
- **Duration:** 5 minutes
- **Field Name:** `verificationCode` (in profile update request)

**Both Use Same UI Pattern:**

- Send OTP button
- 5-minute countdown
- 6-digit OTP input
- Required when email changes

---

## Migration Notes

### Breaking Changes

- ❌ `prefer_not_to_say` option removed
- ❌ `other` gender option removed
- ✅ `unknown` option added (maps to 0)

### Data Migration

Existing users with old gender values should be migrated in backend:

- `prefer_not_to_say: 3` → `UNKNOWN: 0`
- `other: 2` → `UNKNOWN: 0`

### Backward Compatibility

Frontend now only accepts:

- `0` / `"UNKNOWN"` → Unknown
- `1` / `"MALE"` → Male
- `2` / `"FEMALE"` → Female

Any other values will default to `UNKNOWN (0)`

---

## Summary

✅ **Gender enum aligned with backend (3 options: UNKNOWN, MALE, FEMALE)**
✅ **Profile update handles nested response structure**
✅ **Email change triggers token refresh**
✅ **OTP flow integrated with 5-minute countdown**
✅ **Avatar fallbacks match backend enum**
✅ **All forms updated (register + edit profile)**
✅ **Token update automatic when email changes**
✅ **Success messages differentiate email vs non-email updates**

**Status:** Ready for testing with backend
**Backend Enum:** Fully aligned
**Token Refresh:** Automatic on email change
