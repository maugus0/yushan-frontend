# User Profile API Integration

## Overview

Integrated real backend API for user profile functionality, replacing the mocked data with actual API calls.

## API Endpoints Integrated

### 1. **GET /users/me** - Get Current User Profile

- **URL**: `https://yushan-backend-staging.up.railway.app/api/users/me`
- **Method**: GET
- **Auth**: Required (JWT token in header)
- **Response**:

```json
{
  "code": 200,
  "message": "User profile retrieved successfully",
  "data": {
    "uuid": "5e68a39e-32e6-435a-baac-013f1944196b",
    "email": "admin@yushan.com",
    "username": "admin",
    "avatarUrl": "user.png",
    "profileDetail": null,
    "birthday": null,
    "gender": "UNKNOWN", // String: UNKNOWN, MALE, FEMALE
    "isAuthor": true,
    "isAdmin": true,
    "level": 1,
    "exp": 20.0,
    "readTime": 0.0,
    "readBookNum": 0,
    "status": "SUSPENDED",
    "createTime": "2025-10-12T06:24:55Z",
    "updateTime": "2025-10-12T06:24:55Z",
    "lastActive": "2025-10-12T18:41:58Z"
  }
}
```

### 2. **POST /users/send-email-change-verification** - Send Email Verification

- **URL**: `https://yushan-backend-staging.up.railway.app/api/users/send-email-change-verification`
- **Method**: POST
- **Auth**: Required
- **Request Body**:

```json
{
  "email": "newemail@example.com"
}
```

### 3. **PUT /users/{id}/profile** - Update User Profile

- **URL**: `https://yushan-backend-staging.up.railway.app/api/users/{uuid}/profile`
- **Method**: PUT
- **Auth**: Required
- **Content-Type**: `multipart/form-data`
- **Request Body**:

```json
{
  "username": "admin",
  "email": "admin@yushan.com",
  "avatarUrl": "user_male.png",
  "profileDetail": "Hello I am Admin.",
  "gender": 1, // 0=UNKNOWN, 1=MALE, 2=FEMALE, 3=PREFER_NOT_TO_SAY
  "verificationCode": "123456" // Required if email changed
}
```

## Files Modified

### 1. `src/utils/imageUtils.js` ✅

**New Features:**

- Added gender-based avatar fallback images
- `getGenderBasedAvatar(gender)` - Returns appropriate default avatar based on gender
- `processUserAvatar(avatarUrl, gender, baseUrl)` - Processes user avatar with gender fallback

**Gender-Based Fallbacks:**

- `MALE` (1) → `user_male.png`
- `FEMALE` (2) → `user_female.png`
- `UNKNOWN` (0) / `PREFER_NOT_TO_SAY` (3) → `user.png`

**Handles:**

- Base64 encoded images (validates format)
- HTTP URLs (full paths)
- Relative paths (constructs with base URL)
- Invalid/missing avatars (falls back to gender-specific default)

### 2. `src/services/userProfile.js` ✅

**Completely Refactored:**

**Data Transformation:**

- Converts API string gender (`"MALE"`, `"FEMALE"`, `"UNKNOWN"`) to numeric (1, 2, 0)
- Converts numeric gender back to string for API updates
- Formats `createTime` to display-friendly date
- Wraps all data in consistent structure

**Service Methods:**

```javascript
// Get current user profile
getCurrentUser()
  → Calls GET /users/me
  → Transforms response data
  → Returns formatted user data

// Update user profile
updateProfile(userId, profileData)
  → Builds FormData with all fields
  → Handles avatar file upload
  → Converts gender format
  → Calls PUT /users/{id}/profile
  → Returns updated user data

// Send email verification
sendEmailChangeVerification(email)
  → Calls POST /users/send-email-change-verification
  → Returns verification response
```

**Gender Mapping:**

```javascript
// API → Frontend
{
  MALE: 1,
  FEMALE: 2,
  UNKNOWN: 0,
  PREFER_NOT_TO_SAY: 3
}

// Frontend → API
{
  0: 'UNKNOWN',
  1: 'MALE',
  2: 'FEMALE',
  3: 'PREFER_NOT_TO_SAY'
}
```

### 3. `src/pages/profile/profile.jsx` ✅

**Changes:**

**New Functionality:**

- Fetches real user data from API on component mount
- Updates Redux store with fresh data
- Processes avatar URL with gender-based fallback
- Shows loading spinner while fetching data
- Handles avatar loading errors gracefully

**Added:**

```javascript
// State
const [loading, setLoading] = useState(false);
const [avatarSrc, setAvatarSrc] = useState('');

// Fetch user data on mount
useEffect(() => {
  fetchUserProfile(); // Calls API
}, []);

// Process avatar with gender fallback
useEffect(() => {
  processUserAvatar(user.avatarUrl, user.gender);
}, [user]);

// Handle avatar errors
handleAvatarError(e); // Falls back to gender-based default
```

**UI Updates:**

- Loading state with spinner
- Default bio text if null: "No bio yet."
- Safe date formatting for createDate
- Avatar with error handling

### 4. `src/pages/editprofile/editprofile.jsx` ✅

**Major Refactor:**

**New Features:**

- Real API integration for profile updates
- Real email verification OTP sending
- Avatar file validation (type, size)
- Avatar preview before upload
- Loading states during save
- Proper error handling

**Avatar Handling:**

```javascript
// State
const [avatarFile, setAvatarFile] = useState(null);
const [avatarPreview, setAvatarPreview] = useState('');
const [isSaving, setIsSaving] = useState(false);

// Initialize preview with processed avatar
useEffect(() => {
  setAvatarPreview(processUserAvatar(...))
}, [user]);

// Handle file selection
handleAvatarChange(e) {
  - Validates file type (image/*)
  - Validates file size (max 5MB)
  - Creates preview
  - Stores file for upload
}

// Handle avatar error
handleAvatarError(e) // Falls back to gender-based default
```

**Save Process:**

```javascript
handleSave() {
  1. Validate form fields
  2. Check email change + OTP requirement
  3. Build profile data object
  4. Call userProfileService.updateProfile()
  5. Update Redux store on success
  6. Navigate to profile page
  7. Show loading state throughout
}
```

**Send OTP:**

```javascript
handleSendOtp() {
  - Validates email format
  - Calls userProfileService.sendEmailChangeVerification()
  - Starts 300s countdown
  - Shows success/error message
}
```

**UI Improvements:**

- Save button shows loading spinner
- Save/Cancel buttons disabled while saving
- Better error messages from API
- Avatar preview updates immediately

## Data Flow

### Profile Page Load

```
User navigates to /profile
    ↓
Component mounts
    ↓
fetchUserProfile() called
    ↓
GET /users/me
    ↓
Response: { code: 200, data: {...} }
    ↓
transformUserData(apiData)
    - Convert gender string → number
    - Format dates
    - Add display fields
    ↓
dispatch(updateUser(transformedData))
    ↓
Redux store updated
    ↓
Component re-renders with new data
    ↓
processUserAvatar(avatarUrl, gender)
    - Check if base64 → validate
    - Check if HTTP URL → use as is
    - Check if relative → construct with base
    - Fallback → gender-based default
    ↓
Display profile with processed avatar
```

### Profile Update

```
User edits profile fields
    ↓
User selects new avatar (optional)
    ↓
Avatar validated & previewed
    ↓
User clicks "SAVE CHANGES"
    ↓
Form validation
    ↓
Email changed? Check for OTP
    ↓
Build profileData object
    {
      username,
      email,
      gender (converted to number),
      profileDetail,
      avatarFile (if selected),
      verificationCode (if email changed)
    }
    ↓
userProfileService.updateProfile(userId, profileData)
    ↓
Build FormData with all fields
    ↓
PUT /users/{id}/profile (multipart/form-data)
    ↓
Response: { code: 200, data: {...} }
    ↓
transformUserData(response.data)
    ↓
dispatch(updateUser(transformedData))
    ↓
Redux store updated
    ↓
message.success('Profile updated!')
    ↓
navigate('/profile')
```

### Avatar Handling Flow

```
Avatar URL from API
    ↓
processUserAvatar(avatarUrl, gender, baseUrl)
    ↓
Is avatarUrl empty/null?
    YES → getGenderBasedAvatar(gender)
    NO  → Continue
    ↓
Is base64? (starts with "data:image/")
    YES → isValidBase64Image(avatarUrl)?
          ✓ Valid → Use base64
          ✗ Invalid → Gender fallback
    NO  → Continue
    ↓
Is HTTP URL? (starts with "http")
    YES → Use URL as is
    NO  → Continue
    ↓
Has base URL for relative path?
    YES → Construct: baseUrl + "/" + avatarUrl
    NO  → Is simple filename?
          YES → Gender fallback
          NO  → Use as is
    ↓
Set as avatar source
    ↓
Image loads successfully?
    YES → Display
    NO  → onError triggered
          → getGenderBasedAvatar(gender)
          → Display gender-based fallback
```

## Gender Mapping

### API Response Format

Backend returns gender as **string**:

- `"MALE"`
- `"FEMALE"`
- `"UNKNOWN"`
- `"PREFER_NOT_TO_SAY"`

### Frontend Internal Format

Frontend uses gender as **number**:

- `0` = UNKNOWN
- `1` = MALE
- `2` = FEMALE
- `3` = PREFER_NOT_TO_SAY

### Transformation

```javascript
// API → Frontend (in userProfile.js)
const GENDER_MAP = {
  MALE: 1,
  FEMALE: 2,
  UNKNOWN: 0,
  PREFER_NOT_TO_SAY: 3,
};

// Frontend → API (in userProfile.js)
const GENDER_REVERSE_MAP = {
  0: 'UNKNOWN',
  1: 'MALE',
  2: 'FEMALE',
  3: 'PREFER_NOT_TO_SAY',
};
```

## Avatar Fallback Images

### Location

`src/assets/images/`

### Files

- `user_male.png` - Male avatar default
- `user_female.png` - Female avatar default
- `user.png` - Unknown/Prefer not to say default

### Selection Logic

```javascript
getGenderBasedAvatar(gender) {
  if (gender === 'MALE' || gender === 1)
    return user_male.png

  if (gender === 'FEMALE' || gender === 2)
    return user_female.png

  return user.png  // UNKNOWN or PREFER_NOT_TO_SAY
}
```

## Error Handling

### Profile Loading

```javascript
try {
  const response = await userProfileService.getCurrentUser();
  // Update store
} catch (error) {
  console.error('Failed to fetch user profile:', error);
  message.error('Failed to load profile data');
}
```

### Profile Update

```javascript
try {
  const response = await userProfileService.updateProfile(...);
  // Success handling
} catch (error) {
  console.error('Save profile error:', error);
  message.error(error.response?.data?.message || 'Failed to update profile');
}
```

### Email Verification

```javascript
try {
  await userProfileService.sendEmailChangeVerification(email);
  message.success('Verification email sent!');
} catch (error) {
  console.error('Send OTP error:', error);
  message.error(error.response?.data?.message || 'Failed to send verification email');
}
```

### Avatar Validation

```javascript
// File type check
if (!file.type.startsWith('image/')) {
  message.error('Please select an image file');
  return;
}

// File size check (max 5MB)
if (file.size > 5 * 1024 * 1024) {
  message.error('Image size should not exceed 5MB');
  return;
}
```

## Testing Checklist

### Profile Page

- [ ] Profile loads on navigation
- [ ] Loading spinner shows while fetching
- [ ] User data displays correctly
- [ ] Avatar displays (or gender-based fallback)
- [ ] Stats show correct values (readTime, readBookNum)
- [ ] EXP displays correctly
- [ ] Join date formats correctly
- [ ] Bio shows "No bio yet." if null
- [ ] Gender icon displays correctly
- [ ] Level icon displays correctly
- [ ] Author badge shows if isAuthor = true

### Edit Profile Page

- [ ] Form pre-fills with current user data
- [ ] Avatar shows current image (or fallback)
- [ ] Camera icon opens file picker
- [ ] Avatar validates file type
- [ ] Avatar validates file size
- [ ] Avatar preview updates on selection
- [ ] Save button disabled until changes made
- [ ] Save button shows loading during save
- [ ] Email validation works
- [ ] Send OTP button works
- [ ] OTP countdown shows correctly
- [ ] Gender dropdown works
- [ ] Bio text area works
- [ ] Save updates profile successfully
- [ ] Cancel navigates back to profile
- [ ] Success message shows on save
- [ ] Error messages show on failure

### Avatar Handling

- [ ] Base64 avatars display correctly
- [ ] HTTP URL avatars display correctly
- [ ] Invalid avatars fall back to gender default
- [ ] Male gender → user_male.png
- [ ] Female gender → user_female.png
- [ ] Unknown gender → user.png
- [ ] Avatar error triggers fallback
- [ ] Avatar upload works (multipart/form-data)

### API Integration

- [ ] GET /users/me called on profile load
- [ ] PUT /users/{id}/profile called on save
- [ ] POST /send-email-change-verification called on Send OTP
- [ ] Authorization header included in requests
- [ ] Errors handled gracefully
- [ ] Success responses update Redux store
- [ ] Gender transformed correctly (string ↔ number)

## Environment Configuration

### Required Environment Variable

```env
REACT_APP_API_URL=https://yushan-backend-staging.up.railway.app/api
```

### Image Base URL (Optional)

For non-base64 avatars, images are expected at:

```
https://yushan-backend-staging.up.railway.app/images/{avatarUrl}
```

## Known Limitations

1. **Avatar Upload Size**: Limited to 5MB
2. **Avatar Format**: Images only (image/\*)
3. **Email Verification**: Required when changing email
4. **OTP Timeout**: 5 minutes (300 seconds)

## Future Improvements

1. **Proactive Validation**: Validate fields as user types
2. **Image Cropping**: Allow users to crop/resize avatars
3. **Avatar Cache**: Cache processed avatars to reduce transformations
4. **Optimistic Updates**: Update UI before API confirmation
5. **Birthday Field**: Add birthday editing functionality
6. **Password Change**: Integrate password change flow

## Summary

✅ **All three API endpoints integrated**
✅ **Gender-based avatar fallbacks implemented**
✅ **Base64 image handling with validation**
✅ **Real-time profile data fetching**
✅ **Profile update with file upload**
✅ **Email verification OTP flow**
✅ **Error handling and loading states**
✅ **Data transformation (string ↔ number gender)**
✅ **No breaking changes to design**

The profile system now uses real backend data instead of mocked data, with robust error handling and gender-specific avatar fallbacks.
