// api-test.js
// Run with: node api-test.js

import axios from 'axios';
import FormData from 'form-data';
import fs from 'fs';

const BASE_URL = 'http://localhost:5001/api';
let hrToken = '';
let employeeToken = '';
let registrationToken = '';
let profileId = '';
let documentId = '';

// Test data
const testData = {
  hr: {
    email: 'hr@company.com',
    password: 'HRPassword123!'
  },
  newEmployee: {
    email: `test.employee.${Date.now()}@company.com`,
    username: `testuser${Date.now()}`,
    password: 'TestPassword123!',
    firstName: 'Test',
    lastName: 'Employee'
  }
};

// Helper function to log results
const log = (testName, success, data = null) => {
  console.log(`\n${success ? '✅' : '❌'} ${testName}`);
  if (data) {
    console.log('Response:', JSON.stringify(data, null, 2).substring(0, 200) + '...');
  }
};

// Helper function to make requests
const request = async (method, endpoint, data = null, token = null, isFormData = false) => {
  try {
    const config = {
      method,
      url: `${BASE_URL}${endpoint}`,
      headers: {}
    };

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    if (data) {
      if (isFormData) {
        config.data = data;
        config.headers = { ...config.headers, ...data.getHeaders() };
      } else {
        config.data = data;
        config.headers['Content-Type'] = 'application/json';
      }
    }

    const response = await axios(config);
    return { success: true, data: response.data };
  } catch (error) {
    return { 
      success: false, 
      error: error.response?.data || error.message 
    };
  }
};

// Test functions
async function testHRLogin() {
  const result = await request('POST', '/auth/login', testData.hr);
  if (result.success) {
    hrToken = result.data.token;
  }
  log('HR Login', result.success, result.data || result.error);
  return result.success;
}

async function testGenerateRegistrationToken() {
  const result = await request(
    'POST', 
    '/auth/generate-token', 
    { email: testData.newEmployee.email },
    hrToken
  );
  if (result.success) {
    registrationToken = result.data.token || 'test-token'; // Adjust based on actual response
  }
  log('Generate Registration Token', result.success, result.data || result.error);
  return result.success;
}

async function testValidateToken() {
  const result = await request('GET', `/auth/validate-token/${registrationToken}`);
  log('Validate Registration Token', result.success, result.data || result.error);
  return result.success;
}

async function testEmployeeRegistration() {
  const result = await request('POST', '/auth/register', {
    token: registrationToken,
    ...testData.newEmployee
  });
  log('Employee Registration', result.success, result.data || result.error);
  return result.success;
}

async function testEmployeeLogin() {
  const result = await request('POST', '/auth/login', {
    email: testData.newEmployee.email,
    password: testData.newEmployee.password
  });
  if (result.success) {
    employeeToken = result.data.token;
  }
  log('Employee Login', result.success, result.data || result.error);
  return result.success;
}

async function testGetMyProfile() {
  const result = await request('GET', '/profiles/my-profile', null, employeeToken);
  if (result.success && result.data.userProfile) {
    profileId = result.data.userProfile._id;
  }
  log('Get My Profile', result.success, result.data || result.error);
  return result.success;
}

async function testSubmitOnboarding() {
  const formData = new FormData();
  
  // Add basic profile data
  formData.append('firstName', 'Test');
  formData.append('lastName', 'Employee');
  formData.append('email', testData.newEmployee.email);
  formData.append('address[buildingApt]', '123');
  formData.append('address[streetName]', 'Test Street');
  formData.append('address[city]', 'Test City');
  formData.append('address[state]', 'NY');
  formData.append('address[zip]', '10001');
  formData.append('cellPhone', '(555) 123-4567');
  formData.append('ssn', '123456789');
  formData.append('dateOfBirth', '1990-01-01');
  formData.append('gender', 'male');
  
  // Work authorization
  formData.append('workAuthorization[isPermanentResidentOrCitizen]', 'false');
  formData.append('workAuthorization[visaType]', 'F1(CPT/OPT)');
  formData.append('workAuthorization[startDate]', '2024-01-01');
  formData.append('workAuthorization[endDate]', '2026-01-01');
  
  // Reference
  formData.append('reference[firstName]', 'Jane');
  formData.append('reference[lastName]', 'Doe');
  formData.append('reference[phone]', '(555) 111-2222');
  formData.append('reference[email]', 'jane@example.com');
  formData.append('reference[relationship]', 'Manager');
  
  // Emergency contact
  formData.append('emergencyContacts[0][firstName]', 'Emergency');
  formData.append('emergencyContacts[0][lastName]', 'Contact');
  formData.append('emergencyContacts[0][phone]', '(555) 999-8888');
  formData.append('emergencyContacts[0][email]', 'emergency@example.com');
  formData.append('emergencyContacts[0][relationship]', 'Spouse');

  const result = await request('POST', '/profiles/onboarding', formData, employeeToken, true);
  log('Submit Onboarding', result.success, result.data || result.error);
  return result.success;
}

async function testGetPendingApplications() {
  const result = await request('GET', '/profiles/status/Pending', null, hrToken);
  log('Get Pending Applications', result.success, result.data || result.error);
  return result.success;
}

async function testReviewApplication() {
  const result = await request(
    'POST', 
    `/profiles/${profileId}/review`,
    {
      action: 'approve',
      feedback: 'Application approved for testing'
    },
    hrToken
  );
  log('Review Application (Approve)', result.success, result.data || result.error);
  return result.success;
}

async function testUploadDocument() {
  const formData = new FormData();
  formData.append('type', 'OPT Receipt');
  
  // Create a dummy file for testing
  const dummyContent = Buffer.from('This is a test OPT Receipt document');
  formData.append('document', dummyContent, {
    filename: 'opt-receipt.pdf',
    contentType: 'application/pdf'
  });

  const result = await request('POST', '/documents/upload', formData, employeeToken, true);
  if (result.success && result.data.documents?.visaDocuments?.length > 0) {
    documentId = result.data.documents.visaDocuments[0]._id;
  }
  log('Upload Document (OPT Receipt)', result.success, result.data || result.error);
  return result.success;
}

async function testGetMyDocuments() {
  const result = await request('GET', '/documents/my-documents', null, employeeToken);
  log('Get My Documents', result.success, result.data || result.error);
  return result.success;
}

async function testGetVisaStatus() {
  const result = await request('GET', '/documents/visa-status', null, employeeToken);
  log('Get Visa Status', result.success, result.data || result.error);
  return result.success;
}

async function testHRDashboardStats() {
  const result = await request('GET', '/hr/dashboard/stats', null, hrToken);
  log('HR Dashboard Stats', result.success, result.data || result.error);
  return result.success;
}

async function testGetVisaStatusInProgress() {
  const result = await request('GET', '/hr/visa-status/in-progress', null, hrToken);
  log('Get Visa Status In Progress', result.success, result.data || result.error);
  return result.success;
}

async function testReviewVisaDocument() {
  if (!documentId) {
    log('Review Visa Document', false, { error: 'No document ID available' });
    return false;
  }
  
  const result = await request(
    'POST',
    `/documents/visa/${documentId}/review`,
    {
      action: 'approve',
      feedback: 'OPT Receipt approved'
    },
    hrToken
  );
  log('Review Visa Document', result.success, result.data || result.error);
  return result.success;
}

async function testSearchEmployees() {
  const result = await request('GET', '/hr/employees/search?query=test', null, hrToken);
  log('Search Employees', result.success, result.data || result.error);
  return result.success;
}

async function testLogout() {
  const result = await request('POST', '/auth/logout', null, employeeToken);
  log('Employee Logout', result.success, result.data || result.error);
  return result.success;
}

// Main test runner
async function runTests() {
  console.log('🚀 Starting API Tests...\n');
  console.log(`Base URL: ${BASE_URL}`);
  console.log(`Test Employee Email: ${testData.newEmployee.email}\n`);
  
  const tests = [
    // Authentication Flow
    { name: 'HR Login', fn: testHRLogin },
    { name: 'Generate Registration Token', fn: testGenerateRegistrationToken },
    { name: 'Validate Token', fn: testValidateToken },
    { name: 'Employee Registration', fn: testEmployeeRegistration },
    { name: 'Employee Login', fn: testEmployeeLogin },
    
    // Profile Management
    { name: 'Get My Profile', fn: testGetMyProfile },
    { name: 'Submit Onboarding', fn: testSubmitOnboarding },
    { name: 'Get Pending Applications (HR)', fn: testGetPendingApplications },
    { name: 'Review Application (HR)', fn: testReviewApplication },
    
    // Document Management
    { name: 'Upload Document', fn: testUploadDocument },
    { name: 'Get My Documents', fn: testGetMyDocuments },
    { name: 'Get Visa Status', fn: testGetVisaStatus },
    { name: 'Review Visa Document (HR)', fn: testReviewVisaDocument },
    
    // HR Features
    { name: 'HR Dashboard Stats', fn: testHRDashboardStats },
    { name: 'Get Visa Status In Progress', fn: testGetVisaStatusInProgress },
    { name: 'Search Employees', fn: testSearchEmployees },
    
    // Cleanup
    { name: 'Logout', fn: testLogout }
  ];
  
  let passed = 0;
  let failed = 0;
  
  for (const test of tests) {
    try {
      const success = await test.fn();
      if (success) passed++;
      else failed++;
    } catch (error) {
      failed++;
      log(test.name, false, { error: error.message });
    }
    
    // Add small delay between tests
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  console.log('\n📊 Test Summary:');
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`📝 Total: ${tests.length}`);
  
  if (failed === 0) {
    console.log('\n🎉 All tests passed!');
  } else {
    console.log('\n⚠️  Some tests failed. Please check the logs above.');
  }
}

// Run the tests
runTests().catch(console.error);

// Export for use in other test files
export { request, testData, BASE_URL };