# Onboarding Model Usage Guide

## Overview
The Onboarding model provides a comprehensive system for managing employee onboarding with conditional fields, file uploads, and validation. This guide shows you how to use all the features.

## Backend Setup

### 1. Install Dependencies
```bash
cd backend
npm install multer
```

### 2. Add Routes to Your Main App
```javascript
// In your main app.js or server.js
import onboardingRoutes from './routes/onboardingRoutes.js';

app.use('/api/onboarding', onboardingRoutes);
```

### 3. Create Uploads Directory
```bash
mkdir backend/uploads
```

## API Endpoints

### Create Onboarding Record
```javascript
POST /api/onboarding
Content-Type: application/json

{
  "token": "registration-token-here",
  "firstName": "John",
  "lastName": "Doe",
  "middleName": "Michael",
  "preferredName": "Johnny",
  "address": {
    "buildingApt": "Apt 101",
    "streetName": "123 Main St",
    "city": "New York",
    "state": "NY",
    "zip": "10001"
  },
  "cellPhone": "(555) 123-4567",
  "workPhone": "(555) 987-6543",
  "ssn": "123-45-6789",
  "dateOfBirth": "1990-01-15",
  "gender": "male",
  "workAuthorization": {
    "isPermanentResidentOrCitizen": false,
    "visaType": "F1(CPT/OPT)",
    "optReceipt": "filename.pdf",
    "startDate": "2024-01-01",
    "endDate": "2024-12-31"
  }
}
```

### Upload Documents
```javascript
POST /api/onboarding/:id/upload
Content-Type: multipart/form-data

Form data:
- document: [file]
- documentType: "optReceipt" | "profilePicture" | "driverLicense" | "workAuthorization"
```

### Get Onboarding by User
```javascript
GET /api/onboarding/user/:userId
```

### Update Onboarding
```javascript
PUT /api/onboarding/:id
Content-Type: application/json

{
  "address": {
    "city": "Los Angeles"
  },
  "cellPhone": "(555) 999-8888"
}
```

### Get All Onboarding Records (Admin)
```javascript
GET /api/onboarding?status=Pending&page=1&limit=10
```

### Update Status (Admin)
```javascript
PATCH /api/onboarding/:id/status
Content-Type: application/json

{
  "status": "Approved",
  "feedback": "All documents look good!"
}
```

## Frontend Usage

### Basic Form Component
```jsx
import React, { useState } from 'react';
import axios from 'axios';

const OnboardingForm = ({ token }) => {
  const [formData, setFormData] = useState({
    token: token,
    firstName: '',
    lastName: '',
    // ... other fields
    workAuthorization: {
      isPermanentResidentOrCitizen: null,
      residentType: '',
      visaType: '',
      optReceipt: '',
      otherVisaTitle: '',
      startDate: '',
      endDate: ''
    }
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('/api/onboarding', formData);
      console.log('Success:', response.data);
    } catch (error) {
      console.error('Error:', error.response.data);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Your form fields here */}
    </form>
  );
};
```

## Key Features

### 1. Pre-filled Fields from Registration Token
- `email`, `firstName`, `lastName` are automatically populated from the registration token
- These fields cannot be edited by the user
- The system validates that these fields are present

### 2. Address Validation
All address fields are required and validated:
- `buildingApt`: Required
- `streetName`: Required
- `city`: Required
- `state`: Required, exactly 2 characters
- `zip`: Required, format: 12345 or 12345-1234

### 3. Phone Number Validation
Phone numbers accept multiple formats:
- `(123) 456-7890`
- `123-456-7890`
- `123.456.7890`
- `123 456 7890`

### 4. Conditional Work Authorization
The form dynamically shows fields based on user selections:

#### If Permanent Resident/Citizen (Yes):
- Shows: Resident Type dropdown (Green Card/Citizen)
- Hides: Visa type, dates, documents

#### If Not Permanent Resident/Citizen (No):
- Shows: Work Authorization Type dropdown
- Required fields: Start Date, End Date

#### Conditional Fields Based on Visa Type:
- **F1(CPT/OPT)**: Requires OPT Receipt upload
- **Other**: Requires custom visa title input
- **H1-B, L2, H4**: No additional fields required

### 5. File Upload Support
Supported document types:
- Profile Picture
- OPT Receipt (for F1 visa holders)
- Driver License
- Work Authorization documents

File restrictions:
- Formats: PDF, JPG, PNG
- Size limit: 5MB
- Automatic filename generation

### 6. Status Management
Onboarding records have three statuses:
- `Pending`: Default status for new submissions
- `Approved`: HR has approved the onboarding
- `Rejected`: HR has rejected with feedback

## Validation Examples

### Valid Data
```javascript
{
  "address": {
    "buildingApt": "Apt 101",
    "streetName": "123 Main St",
    "city": "New York",
    "state": "NY",
    "zip": "10001"
  },
  "cellPhone": "(555) 123-4567",
  "workAuthorization": {
    "isPermanentResidentOrCitizen": false,
    "visaType": "F1(CPT/OPT)",
    "startDate": "2024-01-01",
    "endDate": "2024-12-31"
  }
}
```

### Invalid Data (will be rejected)
```javascript
{
  "address": {
    "buildingApt": "", // Missing required field
    "state": "NEW YORK", // Too long (should be 2 chars)
    "zip": "123" // Invalid format
  },
  "cellPhone": "555-123", // Invalid phone format
  "workAuthorization": {
    "isPermanentResidentOrCitizen": false,
    "visaType": "F1(CPT/OPT)",
    // Missing required startDate and endDate
  }
}
```

## Error Handling

### Validation Errors
The API returns detailed validation errors:
```json
{
  "error": "Failed to create onboarding record",
  "details": {
    "address.buildingApt": "Building/Apt # is required",
    "cellPhone": "Phone number must be in format (XXX) XXX-XXXX or XXX-XXX-XXXX",
    "workAuthorization.startDate": "Start date is required for work authorization"
  }
}
```

### File Upload Errors
```json
{
  "error": "Failed to upload document",
  "message": "Only PDF, JPG, and PNG files are allowed"
}
```

## Testing

### Test with Blank PDFs
For testing file uploads, you can create blank PDFs:
```bash
# Create a blank PDF for testing
echo "%PDF-1.4" > test.pdf
```

### Test the Conditional Logic
1. Test with `isPermanentResidentOrCitizen: true`
   - Should require `residentType`
   - Should not allow `visaType`

2. Test with `isPermanentResidentOrCitizen: false`
   - Should require `visaType`, `startDate`, `endDate`
   - If `visaType: "F1(CPT/OPT)"`, should require `optReceipt`
   - If `visaType: "Other"`, should require `otherVisaTitle`

## Security Considerations

1. **File Upload Security**: Only allow specific file types and sizes
2. **Data Validation**: All inputs are validated on both frontend and backend
3. **Token Validation**: Registration tokens are validated and marked as used
4. **Pre-filled Data Protection**: Critical fields cannot be modified after creation

## Integration Tips

1. **Registration Token Flow**: Ensure users receive a valid registration token before accessing the onboarding form
2. **File Upload UI**: Provide clear feedback during file uploads
3. **Progress Indicators**: Show form completion progress for long forms
4. **Error Display**: Display validation errors clearly to users
5. **Status Updates**: Notify users when their onboarding status changes

This comprehensive system provides a robust foundation for employee onboarding with all the features you requested! 