# Registration Flow Update - Student vs Vendor

## Overview
Updated the registration process to allow users to choose between creating a **Student** account or a **Vendor** account during signup. This addresses the requirement that some vendors may not be students.

## Changes Made

### Registration Flow (3 Steps)

#### Step 1: Basic Account Information
- First Name, Last Name
- Email Address
- Phone Number (optional)
- Password & Confirm Password

**No changes from previous version**

#### Step 2: Account Type Selection (NEW)
Users must choose one of two account types:

**🎓 Student Account:**
- For university students
- Access to courses, Kuppi sessions, marketplace
- Can become a tutor later (requires admin approval)
- Must complete student profile in Step 3

**🏪 Vendor Account:**
- For sellers who want to use the marketplace
- Not necessarily students
- Can create shop listings and manage sales
- Redirected to vendor profile completion after signup

**Key Points:**
- **Mutually exclusive choice** - Can only select one type during registration
- Visual cards with checkboxes for selection
- Default selection: Student
- Detailed descriptions of what each account type includes

#### Step 3: Profile Completion or Review

**For Student Accounts:**
- University selection (dropdown)
- Department & Degree/Course
- Studying Area (optional)
- Current Year & Semester
- Student ID (optional)
- Current Address (optional)
- Terms & Conditions checkbox

**For Vendor Accounts:**
- Informational screen explaining next steps
- Visual preview of what vendor profile setup requires:
  - Shop name and description
  - Business contact details
  - Address information
  - Bank account for payments
- Terms & Conditions checkbox
- After account creation, **automatically redirected to `/student/become-vendor`**

### Technical Implementation

#### Form Data Structure
```typescript
interface FormData {
  // Basic Info
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  phoneNumber: string;
  
  // Account Type Selection (NEW)
  accountType: 'student' | 'vendor';
  
  // Student Profile (only for students)
  universityName: string;
  department: string;
  degreeOrCourse: string;
  studyingArea: string;
  currentYear: number;
  currentSemester: number;
  studentIdNumber: string;
  currentAddress: string;
}
```

#### Registration Logic
```typescript
// All users are created with 'student' role in database initially
// (Vendor role/profile added separately via vendor profile completion)
const registerData = {
  firstName: formData.firstName,
  lastName: formData.lastName,
  email: formData.email,
  password: formData.password,
  roles: ['student'], // Everyone starts as student in DB
  primaryRole: 'student',
  phoneNumber: formData.phoneNumber || undefined,
  studentProfile: formData.accountType === "student"
    ? { /* student profile data */ }
    : undefined,
};

const result = await register(registerData);

if (result.success) {
  if (formData.accountType === 'vendor') {
    // Redirect to vendor profile completion
    router.push('/student/become-vendor');
  } else {
    // Student - go to dashboard
    router.push(dashboardPath);
  }
}
```

#### Validation Changes
- **Step 2**: No validation needed (accountType has default value)
- **Step 3**: Student profile fields only required if `accountType === 'student'`
- Terms & Conditions checkbox required for both types

### User Experience Flow

#### Student Registration Path:
1. **Step 1**: Enter basic account info → Next
2. **Step 2**: Select "Student" → Next
3. **Step 3**: Fill university & student details → Create Account
4. **Redirect**: Student dashboard

#### Vendor Registration Path:
1. **Step 1**: Enter basic account info → Next
2. **Step 2**: Select "Vendor" → Next
3. **Step 3**: Review vendor setup requirements → Create Account
4. **Redirect**: Vendor profile form (`/student/become-vendor`)
5. Complete vendor profile (shop name, contact, address, bank details)
6. **Redirect**: Vendor dashboard

### UI/UX Improvements

#### Visual Design
- Large, card-based selection for account types
- Color-coded borders (Ocean blue for Student, Amber for Vendor)
- Checkmark indicators for selected type
- Detailed feature lists for each account type
- Emoji icons for visual recognition

#### Informational Elements
- Step 2: Clear explanation that marketplace is available to both types
- Step 3 (Vendor): Visual preview of vendor setup requirements
- Bullet points listing what information will be needed
- Context-aware headings and descriptions

#### Progress Indicators
- Updated step labels: "Account" → "Type" → "Confirm"
- Dynamic headings based on account type selection
- Context-aware button text

### Files Modified

**Frontend:**
- `src/app/auth/register/page.tsx` - Complete registration flow rewrite

**Key Functions Updated:**
- `FormData` interface - Replaced `roles` array with `accountType`
- `handleAccountTypeSelect()` - New function for account type selection
- `validateStep2()` - Simplified (no validation needed)
- `validateStep3()` - Conditional validation based on account type
- `handleSubmit()` - Different redirect logic for student vs vendor

### Benefits

1. **Clear Intent**: Users explicitly declare their purpose (student or vendor)
2. **Simplified UX**: Single choice instead of multi-role selection
3. **Guided Flow**: Vendors know upfront they'll need to complete shop profile
4. **Flexible**: Non-students can create vendor accounts
5. **Maintainable**: Clean separation between student and vendor paths

### Future Considerations

- Students can still become vendors later via "Become a Vendor" page
- Students can also become tutors (requires admin approval)
- Vendors could potentially add student profile later if they want to take courses
- Admin panel can manage and approve vendor accounts

### Testing Checklist

- [ ] Student registration completes successfully
- [ ] Student profile fields are validated properly
- [ ] Vendor registration creates basic account
- [ ] Vendor redirect to `/student/become-vendor` works
- [ ] Terms checkbox is required for both types
- [ ] Password validation works
- [ ] Email validation works
- [ ] Progress indicators show correct step
- [ ] Back button works at all steps
- [ ] Form data persists when navigating back
- [ ] Error messages display correctly
- [ ] Account type selection is visually clear
- [ ] Mobile responsive design works

### Migration Notes

**Existing Users:**
- No database changes required
- All existing users remain unchanged
- Users with 'student' role can still become vendors via existing flow

**New Users:**
- Vendor-first users will have basic student account initially
- Vendor profile completion makes them functional vendors
- `isVendorProfileComplete` flag determines vendor access

## Summary

The registration flow now provides a clear, guided experience for both students and vendors. Students complete their profile during registration, while vendors are directed to a dedicated vendor setup flow after basic account creation. This maintains flexibility while providing clear separation of concerns and explicit user intent declaration.
