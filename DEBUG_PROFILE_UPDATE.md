# Quick Debug Test - Profile Update

## Open Browser DevTools Console

When you click "SAVE CHANGES" in Edit Profile, you should see:

```
=== UPDATE PROFILE DEBUG ===
User ID: 5e68a39e-32e6-435a-baac-013f1944196b
username: admin
email: admin@yushan.com
gender: MALE                    ← Should be STRING "MALE", not number 1
profileDetail: Hello I am Admin.
avatar: File(avatar.jpg, image/jpeg, 45632 bytes)  ← If file uploaded
verificationCode: 123456        ← Only if email changed
===========================
```

## What to Check:

### ✅ Gender Should Be:

- `"MALE"` (string) for male selection
- `"FEMALE"` (string) for female selection
- `"UNKNOWN"` (string) for unknown selection

### ❌ NOT:

- `1` (number)
- `2` (number)
- `0` (number)

### ✅ Avatar Should Be:

- `File(...)` object if you uploaded a file
- Not present if you didn't upload

### ❌ NOT:

- `"user_male.png"` (string)
- Any URL string

---

## Network Tab Verification

### 1. Open Network Tab

- Chrome/Edge: F12 → Network tab
- Filter: XHR or Fetch

### 2. Click "SAVE CHANGES"

### 3. Find Request:

```
PUT /api/users/5e68a39e-32e6-435a-baac-013f1944196b/profile
```

### 4. Check Headers:

```
Content-Type: multipart/form-data; boundary=----WebKitFormBoundary...
```

### 5. Check Payload Tab:

Should show FormData with:

```
username: admin
email: admin@yushan.com
gender: MALE              ← STRING
profileDetail: Hello I am Admin.
avatar: (binary)          ← If uploaded
verificationCode: 123456  ← If email changed
```

### 6. Check Response Tab:

```json
{
  "code": 200,
  "data": {
    "profile": {
      "gender": "MALE"    ← Should match what you sent
    },
    "emailChanged": false
  }
}
```

---

## Expected vs Actual

### Manual Test (via Postman):

**Sent:** `gender: 1` (wrong - number)  
**Result:** `gender: "UNKNOWN"` ❌

### Frontend Test (via UI):

**Sent:** `gender: "MALE"` (correct - string)  
**Result:** TBD - **PLEASE TEST AND REPORT**

---

## Action for You:

1. **Clear browser cache/localStorage:**

   ```javascript
   localStorage.clear();
   location.reload();
   ```

2. **Login again**

3. **Go to Edit Profile**

4. **Open DevTools Console + Network Tab**

5. **Select gender = "Male"**

6. **Click "SAVE CHANGES"**

7. **Report back:**
   - What does console show for `gender:` field?
   - What does Network tab Payload show?
   - What does Response show for `profile.gender`?

---

## If Gender Still Returns UNKNOWN:

This confirms it's a **backend issue**, not frontend:

- Frontend sends correct string format ✅
- Backend receives it but doesn't save it ❌
- Need backend team to investigate

---

## Debug Code Added:

Check `src/services/userProfile.js` - added console logging before API call.

You can remove this later by deleting lines with:

```javascript
console.log('=== UPDATE PROFILE DEBUG ===');
```
