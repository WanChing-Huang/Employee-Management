import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import FileUpload from './FileUpload';

const OnboardingForm = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [existingProfile, setExistingProfile] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [documents, setDocuments] = useState(null);
  const [uploadMessage, setUploadMessage] = useState('');

  const [formData, setFormData] = useState({
    // Basic Information
    firstName: '',
    lastName: '',
    middleName: '',
    preferredName: '',
    email: user?.email || '',
    
    // Address
    address: {
      buildingApt: '',
      streetName: '',
      city: '',
      state: '',
      zip: ''
    },
    
    // Contact
    cellPhone: '',
    workPhone: '',
    
    // Personal Details
    ssn: '',
    dateOfBirth: '',
    gender: '',
    
    // Work Authorization
    workAuthorization: {
      isPermanentResidentOrCitizen: null,
      residentType: '',
      visaType: '',
      otherVisaTitle: '',
      startDate: '',
      endDate: ''
    },
    
    // Reference
    reference: {
      firstName: '',
      lastName: '',
      middleName: '',
      phone: '',
      email: '',
      relationship: ''
    },
    
    // Emergency Contacts
    emergencyContacts: [
      {
        firstName: '',
        lastName: '',
        middleName: '',
        phone: '',
        email: '',
        relationship: ''
      }
    ]
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    fetchExistingProfile();
  }, []);

  const fetchExistingProfile = async () => {
    try {
      console.log('🔍 Fetching profile for user ID:', user.id);
      const response = await axios.get(`/api/onboarding/user/${user.id}`);
      console.log('✅ Profile response:', response.data);
      setExistingProfile(response.data);
      setFormData(response.data);
      setIsEditing(true);
      
      // Fetch documents if profile exists
      if (response.data && response.data.id) {
        console.log('📄 Fetching documents for profile ID:', response.data.id);
        fetchDocuments(response.data.id);
      } else {
        console.log('❌ No profile ID found in response');
      }
    } catch (error) {
      if (error.response?.status !== 404) {
        console.error('Error fetching profile:', error);
      } else {
        console.log('📝 No existing profile found (404)');
      }
    }
  };

  const fetchDocuments = async (profileId) => {
    try {
      const response = await axios.get(`/api/documents/${profileId}`);
      console.log('📂 Documents response:', response.data);
      setDocuments(response.data);
    } catch (error) {
      console.error('❌ Error fetching documents:', error);
    }
  };

  // Phone number formatting function
  const formatPhoneNumber = (value) => {
    // Remove all non-digits
    const digits = value.replace(/\D/g, '');
    
    // Format as (XXX) XXX-XXXX
    if (digits.length >= 10) {
      return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6, 10)}`;
    } else if (digits.length >= 6) {
      return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
    } else if (digits.length >= 3) {
      return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
    } else {
      return digits;
    }
  };

  // ZIP code formatting function
  const formatZipCode = (value) => {
    // Remove all non-digits
    const digits = value.replace(/\D/g, '');
    
    // Format as 12345 or 12345-1234
    if (digits.length > 5) {
      return `${digits.slice(0, 5)}-${digits.slice(5, 9)}`;
    } else {
      return digits;
    }
  };

  const handleChange = (section, field, value, index = null) => {
    // Format phone numbers automatically
    if (field === 'cellPhone' || field === 'workPhone' || field === 'phone') {
      value = formatPhoneNumber(value);
    }
    
    // Format ZIP code automatically
    if (field === 'zip') {
      value = formatZipCode(value);
    }

    setFormData(prev => {
      if (section === 'emergencyContacts') {
        const contacts = [...prev.emergencyContacts];
        contacts[index] = { ...contacts[index], [field]: value };
        return { ...prev, emergencyContacts: contacts };
      } else if (section) {
        return {
          ...prev,
          [section]: { ...prev[section], [field]: value }
        };
      } else {
        return { ...prev, [field]: value };
      }
    });

    // Clear errors when user starts typing
    if (errors[`${section}.${field}`] || errors[field]) {
      setErrors(prev => ({
        ...prev,
        [`${section}.${field}`]: '',
        [field]: ''
      }));
    }
  };

  const addEmergencyContact = () => {
    setFormData(prev => ({
      ...prev,
      emergencyContacts: [
        ...prev.emergencyContacts,
        {
          firstName: '',
          lastName: '',
          middleName: '',
          phone: '',
          email: '',
          relationship: ''
        }
      ]
    }));
  };

  const removeEmergencyContact = (index) => {
    if (formData.emergencyContacts.length > 1) {
      setFormData(prev => ({
        ...prev,
        emergencyContacts: prev.emergencyContacts.filter((_, i) => i !== index)
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Basic information validation
    if (!formData.firstName) newErrors.firstName = 'First name is required';
    if (!formData.lastName) newErrors.lastName = 'Last name is required';
    if (!formData.email) newErrors.email = 'Email is required';

    // Address validation
    if (!formData.address.buildingApt) newErrors['address.buildingApt'] = 'Building/Apt # is required';
    if (!formData.address.streetName) newErrors['address.streetName'] = 'Street name is required';
    if (!formData.address.city) newErrors['address.city'] = 'City is required';
    if (!formData.address.state) newErrors['address.state'] = 'State is required';
    if (!formData.address.zip) {
      newErrors['address.zip'] = 'ZIP code is required';
    } else if (!/^\d{5}(-\d{4})?$/.test(formData.address.zip)) {
      newErrors['address.zip'] = 'ZIP code must be in format 12345 or 12345-1234';
    }

    // Personal details validation
    if (!formData.ssn) newErrors.ssn = 'SSN is required';
    if (!formData.dateOfBirth) newErrors.dateOfBirth = 'Date of birth is required';
    if (!formData.gender) newErrors.gender = 'Gender is required';

    // Work authorization validation
    if (formData.workAuthorization.isPermanentResidentOrCitizen === null) {
      newErrors['workAuth'] = 'Please specify your residence status';
    } else if (formData.workAuthorization.isPermanentResidentOrCitizen) {
      if (!formData.workAuthorization.residentType) {
        newErrors['workAuth'] = 'Please select your resident type';
      }
    } else {
      if (!formData.workAuthorization.visaType) {
        newErrors['workAuth'] = 'Please select your visa type';
      }
      if (!formData.workAuthorization.startDate) {
        newErrors['workAuth'] = 'Work authorization start date is required';
      }
      if (!formData.workAuthorization.endDate) {
        newErrors['workAuth'] = 'Work authorization end date is required';
      }
      if (formData.workAuthorization.visaType === 'Other' && !formData.workAuthorization.otherVisaTitle) {
        newErrors['workAuth'] = 'Please specify the visa title';
      }
    }

    // Emergency contact validation
    formData.emergencyContacts.forEach((contact, index) => {
      if (!contact.firstName) newErrors[`ec${index}.firstName`] = 'First name is required';
      if (!contact.lastName) newErrors[`ec${index}.lastName`] = 'Last name is required';
      if (!contact.email) newErrors[`ec${index}.email`] = 'Email is required';
      if (!contact.relationship) newErrors[`ec${index}.relationship`] = 'Relationship is required';
      // Phone is optional, but if provided, must be in correct format
      if (contact.phone && !/^\(\d{3}\) \d{3}-\d{4}$/.test(contact.phone)) {
        newErrors[`ec${index}.phone`] = 'Phone must be in format (XXX) XXX-XXXX';
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleUploadSuccess = (response) => {
    setUploadMessage(`${response.documentType} uploaded successfully!`);
    // Refresh documents after successful upload
    if (existingProfile && existingProfile.id) {
      fetchDocuments(existingProfile.id);
    }
    // Clear message after 3 seconds
    setTimeout(() => setUploadMessage(''), 3000);
  };

  const handleUploadError = (error) => {
    setUploadMessage(error);
    // Clear message after 5 seconds
    setTimeout(() => setUploadMessage(''), 5000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Remove any token from formData since backend now uses authentication
      const { token, ...submitData } = formData;
      
      // Clean up workAuthorization data based on selection
      if (submitData.workAuthorization.isPermanentResidentOrCitizen === true) {
        // Clear visa-related fields for permanent residents/citizens
        submitData.workAuthorization = {
          ...submitData.workAuthorization,
          visaType: undefined,
          otherVisaTitle: undefined,
          startDate: undefined,
          endDate: undefined
        };
      } else if (submitData.workAuthorization.isPermanentResidentOrCitizen === false) {
        // Clear resident-specific fields for non-residents
        submitData.workAuthorization = {
          ...submitData.workAuthorization,
          residentType: undefined
        };
      }
      
      // Clean up empty phone numbers - set to undefined instead of empty string
      if (submitData.cellPhone === '') {
        delete submitData.cellPhone;
      }
      if (submitData.workPhone === '') {
        delete submitData.workPhone;
      }
      
      // Clean up emergency contacts - remove empty phone numbers
      submitData.emergencyContacts = submitData.emergencyContacts.map(contact => {
        const cleanContact = { ...contact };
        if (cleanContact.phone === '') {
          delete cleanContact.phone;
        }
        return cleanContact;
      });
      
      // Clean up reference phone
      if (submitData.reference && submitData.reference.phone === '') {
        delete submitData.reference.phone;
      }
      
      if (isEditing) {
        await axios.put(`/api/onboarding/${existingProfile._id}`, submitData);
      } else {
        await axios.post('/api/onboarding', submitData);
      }
      
      navigate('/dashboard');
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to submit application');
    } finally {
      setLoading(false);
    }
  };

  const canEdit = !existingProfile || existingProfile.status === 'Rejected' || existingProfile.status === 'Pending';

  // Show approved status message but continue to show document upload section
  const showApprovedMessage = existingProfile && existingProfile.status === 'Approved';

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">
          {showApprovedMessage ? 'Onboarding Application' : (isEditing ? 'Update Onboarding Application' : 'Onboarding Application')}
        </h1>
        {!showApprovedMessage && (
          <p className="page-subtitle">Complete your employee onboarding information</p>
        )}
        {existingProfile && (
          <span className={`status-badge status-${existingProfile.status.toLowerCase()}`}>
            {existingProfile.status}
          </span>
        )}
      </div>

      {/* Approved Status Message */}
      {showApprovedMessage && (
        <div className="card" style={{ marginBottom: '20px' }}>
          <div className="card-body text-center">
            <h2>🎉 Congratulations!</h2>
            <p>Your onboarding application has been approved.</p>
            <div className="btn-group">
              <button 
                className="btn btn-primary"
                onClick={() => navigate('/personal-info')}
              >
                View Your Profile
              </button>
              <button 
                className="btn btn-outline"
                onClick={() => {
                  console.log('📄 Scrolling to documents section...');
                  console.log('🔍 Debug info:');
                  console.log('   existingProfile:', !!existingProfile);
                  console.log('   existingProfile.id:', existingProfile?.id);
                  console.log('   documents:', !!documents);
                  
                  // Try to find the documents section by ID first
                  const documentsSection = document.getElementById('documents-section');
                  console.log('   documents-section element:', !!documentsSection);
                  
                  // List all form-section elements
                  const allSections = document.querySelectorAll('.form-section');
                  console.log('   All form sections found:', allSections.length);
                  allSections.forEach((section, index) => {
                    const title = section.querySelector('h3');
                    console.log(`   Section ${index}:`, title?.textContent || 'No title');
                  });
                  
                  if (documentsSection) {
                    console.log('✅ Found documents section by ID, scrolling...');
                    documentsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  } else {
                    console.log('❌ Documents section not found, trying alternative method...');
                    // Fallback: try to find by class name
                    const fallbackSection = document.querySelector('.form-section h3.form-section-title');
                    if (fallbackSection && fallbackSection.textContent.includes('Documents')) {
                      console.log('✅ Found documents section by title, scrolling...');
                      fallbackSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    } else {
                      console.log('❌ Still not found, scrolling to bottom...');
                      // Last resort: scroll to bottom
                      window.scrollTo({ 
                        top: Math.max(document.body.scrollHeight, document.documentElement.scrollHeight), 
                        behavior: 'smooth' 
                      });
                    }
                  }
                }}
              >
                📄 Manage Documents
              </button>
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="alert alert-error">
          {error}
        </div>
      )}

      {existingProfile?.feedback && existingProfile.status === 'Rejected' && (
        <div className="alert alert-warning">
          <strong>HR Feedback:</strong> {existingProfile.feedback}
        </div>
      )}

      {/* For approved users, show a summary instead of full form */}
      {showApprovedMessage ? (
        <div className="card">
          <div className="card-body">
            <h3>📋 Application Summary</h3>
            <div className="form-row">
              <div className="form-col">
                <strong>Name:</strong> {existingProfile.firstName} {existingProfile.lastName}
              </div>
              <div className="form-col">
                <strong>Email:</strong> {existingProfile.email}
              </div>
            </div>
            <div className="form-row">
              <div className="form-col">
                <strong>Phone:</strong> {existingProfile.cellPhone}
              </div>
              <div className="form-col">
                <strong>Work Authorization:</strong> {existingProfile.workAuthorization?.visaType}
              </div>
            </div>
            <p className="text-muted" style={{ marginTop: '15px' }}>
              ✅ Your application has been approved. You can now upload and manage your documents below.
            </p>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
        {/* Basic Information */}
        <div className="form-section">
          <h3 className="form-section-title">Basic Information</h3>
          <div className="form-row">
            <div className="form-col">
              <label className="form-label">First Name *</label>
              <input
                type="text"
                className={`form-control ${errors.firstName ? 'error' : ''}`}
                value={formData.firstName}
                onChange={(e) => handleChange(null, 'firstName', e.target.value)}
                disabled={!canEdit}
              />
              {errors.firstName && <div className="form-error">{errors.firstName}</div>}
            </div>
            <div className="form-col">
              <label className="form-label">Last Name *</label>
              <input
                type="text"
                className={`form-control ${errors.lastName ? 'error' : ''}`}
                value={formData.lastName}
                onChange={(e) => handleChange(null, 'lastName', e.target.value)}
                disabled={!canEdit}
              />
              {errors.lastName && <div className="form-error">{errors.lastName}</div>}
            </div>
          </div>
          <div className="form-row">
            <div className="form-col">
              <label className="form-label">Middle Name</label>
              <input
                type="text"
                className="form-control"
                value={formData.middleName}
                onChange={(e) => handleChange(null, 'middleName', e.target.value)}
                disabled={!canEdit}
              />
            </div>
            <div className="form-col">
              <label className="form-label">Preferred Name</label>
              <input
                type="text"
                className="form-control"
                value={formData.preferredName}
                onChange={(e) => handleChange(null, 'preferredName', e.target.value)}
                disabled={!canEdit}
              />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Email *</label>
            <input
              type="email"
              className="form-control"
              value={formData.email}
              disabled
              style={{ backgroundColor: '#f8f9fa' }}
            />
            <div className="form-text">Email cannot be changed</div>
          </div>
        </div>

        {/* Address */}
        <div className="form-section">
          <h3 className="form-section-title">Address</h3>
          <div className="form-row">
            <div className="form-col">
              <label className="form-label">Building/Apt # *</label>
              <input
                type="text"
                className={`form-control ${errors['address.buildingApt'] ? 'error' : ''}`}
                value={formData.address.buildingApt}
                onChange={(e) => handleChange('address', 'buildingApt', e.target.value)}
                disabled={!canEdit}
              />
              {errors['address.buildingApt'] && <div className="form-error">{errors['address.buildingApt']}</div>}
            </div>
            <div className="form-col">
              <label className="form-label">Street Name *</label>
              <input
                type="text"
                className={`form-control ${errors['address.streetName'] ? 'error' : ''}`}
                value={formData.address.streetName}
                onChange={(e) => handleChange('address', 'streetName', e.target.value)}
                disabled={!canEdit}
              />
              {errors['address.streetName'] && <div className="form-error">{errors['address.streetName']}</div>}
            </div>
          </div>
          <div className="form-row">
            <div className="form-col">
              <label className="form-label">City *</label>
              <input
                type="text"
                className={`form-control ${errors['address.city'] ? 'error' : ''}`}
                value={formData.address.city}
                onChange={(e) => handleChange('address', 'city', e.target.value)}
                disabled={!canEdit}
              />
              {errors['address.city'] && <div className="form-error">{errors['address.city']}</div>}
            </div>
            <div className="form-col">
              <label className="form-label">State *</label>
              <input
                type="text"
                className={`form-control ${errors['address.state'] ? 'error' : ''}`}
                value={formData.address.state}
                onChange={(e) => handleChange('address', 'state', e.target.value)}
                maxLength="2"
                disabled={!canEdit}
              />
              {errors['address.state'] && <div className="form-error">{errors['address.state']}</div>}
            </div>
            <div className="form-col">
              <label className="form-label">ZIP Code *</label>
              <input
                type="text"
                className={`form-control ${errors['address.zip'] ? 'error' : ''}`}
                value={formData.address.zip}
                onChange={(e) => handleChange('address', 'zip', e.target.value)}
                disabled={!canEdit}
              />
              {errors['address.zip'] && <div className="form-error">{errors['address.zip']}</div>}
            </div>
          </div>
        </div>

        {/* Contact Information */}
        <div className="form-section">
          <h3 className="form-section-title">Contact Information</h3>
          <div className="form-row">
            <div className="form-col">
              <label className="form-label">Cell Phone</label>
              <input
                type="tel"
                className="form-control"
                value={formData.cellPhone}
                onChange={(e) => handleChange(null, 'cellPhone', e.target.value)}
                placeholder="(123) 456-7890"
                disabled={!canEdit}
              />
            </div>
            <div className="form-col">
              <label className="form-label">Work Phone</label>
              <input
                type="tel"
                className="form-control"
                value={formData.workPhone}
                onChange={(e) => handleChange(null, 'workPhone', e.target.value)}
                placeholder="(123) 456-7890"
                disabled={!canEdit}
              />
            </div>
          </div>
        </div>

        {/* Personal Details */}
        <div className="form-section">
          <h3 className="form-section-title">Personal Details</h3>
          <div className="form-row">
            <div className="form-col">
              <label className="form-label">SSN *</label>
              <input
                type="text"
                className={`form-control ${errors.ssn ? 'error' : ''}`}
                value={formData.ssn}
                onChange={(e) => handleChange(null, 'ssn', e.target.value)}
                placeholder="XXX-XX-XXXX"
                disabled={!canEdit}
              />
              {errors.ssn && <div className="form-error">{errors.ssn}</div>}
            </div>
            <div className="form-col">
              <label className="form-label">Date of Birth *</label>
              <input
                type="date"
                className={`form-control ${errors.dateOfBirth ? 'error' : ''}`}
                value={formData.dateOfBirth}
                onChange={(e) => handleChange(null, 'dateOfBirth', e.target.value)}
                disabled={!canEdit}
              />
              {errors.dateOfBirth && <div className="form-error">{errors.dateOfBirth}</div>}
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Gender *</label>
            <select
              className={`form-control ${errors.gender ? 'error' : ''}`}
              value={formData.gender}
              onChange={(e) => handleChange(null, 'gender', e.target.value)}
              disabled={!canEdit}
            >
              <option value="">Select gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="prefer not to say">Prefer not to say</option>
            </select>
            {errors.gender && <div className="form-error">{errors.gender}</div>}
          </div>
        </div>

        {/* Work Authorization */}
        <div className="form-section">
          <h3 className="form-section-title">Work Authorization</h3>
          {errors.workAuth && <div className="form-error mb-1">{errors.workAuth}</div>}
          
          <div className="form-group">
            <label className="form-label">Are you a permanent resident or citizen of the U.S.? *</label>
            <div style={{ display: 'flex', gap: '20px', marginTop: '10px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <input
                  type="radio"
                  name="isPermanentResident"
                  checked={formData.workAuthorization.isPermanentResidentOrCitizen === true}
                  onChange={() => handleChange('workAuthorization', 'isPermanentResidentOrCitizen', true)}
                  disabled={!canEdit}
                />
                Yes
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <input
                  type="radio"
                  name="isPermanentResident"
                  checked={formData.workAuthorization.isPermanentResidentOrCitizen === false}
                  onChange={() => handleChange('workAuthorization', 'isPermanentResidentOrCitizen', false)}
                  disabled={!canEdit}
                />
                No
              </label>
            </div>
          </div>

          {formData.workAuthorization.isPermanentResidentOrCitizen === true && (
            <div className="form-group">
              <label className="form-label">Resident Type *</label>
              <select
                className="form-control"
                value={formData.workAuthorization.residentType}
                onChange={(e) => handleChange('workAuthorization', 'residentType', e.target.value)}
                disabled={!canEdit}
              >
                <option value="">Select type</option>
                <option value="Green Card">Green Card</option>
                <option value="Citizen">Citizen</option>
              </select>
            </div>
          )}

          {formData.workAuthorization.isPermanentResidentOrCitizen === false && (
            <>
              <div className="form-group">
                <label className="form-label">Visa Type *</label>
                <select
                  className="form-control"
                  value={formData.workAuthorization.visaType}
                  onChange={(e) => handleChange('workAuthorization', 'visaType', e.target.value)}
                  disabled={!canEdit}
                >
                  <option value="">Select visa type</option>
                  <option value="H1-B">H1-B</option>
                  <option value="L2">L2</option>
                  <option value="F1(CPT/OPT)">F1(CPT/OPT)</option>
                  <option value="H4">H4</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              {formData.workAuthorization.visaType === 'Other' && (
                <div className="form-group">
                  <label className="form-label">Specify Visa Title *</label>
                  <input
                    type="text"
                    className="form-control"
                    value={formData.workAuthorization.otherVisaTitle}
                    onChange={(e) => handleChange('workAuthorization', 'otherVisaTitle', e.target.value)}
                    disabled={!canEdit}
                  />
                </div>
              )}

              <div className="form-row">
                <div className="form-col">
                  <label className="form-label">Start Date *</label>
                  <input
                    type="date"
                    className="form-control"
                    value={formData.workAuthorization.startDate}
                    onChange={(e) => handleChange('workAuthorization', 'startDate', e.target.value)}
                    disabled={!canEdit}
                  />
                </div>
                <div className="form-col">
                  <label className="form-label">End Date *</label>
                  <input
                    type="date"
                    className="form-control"
                    value={formData.workAuthorization.endDate}
                    onChange={(e) => handleChange('workAuthorization', 'endDate', e.target.value)}
                    disabled={!canEdit}
                  />
                </div>
              </div>
            </>
          )}
        </div>

        {/* Reference */}
        <div className="form-section">
          <h3 className="form-section-title">Reference</h3>
          <div className="form-row">
            <div className="form-col">
              <label className="form-label">First Name</label>
              <input
                type="text"
                className="form-control"
                value={formData.reference.firstName}
                onChange={(e) => handleChange('reference', 'firstName', e.target.value)}
                disabled={!canEdit}
              />
            </div>
            <div className="form-col">
              <label className="form-label">Last Name</label>
              <input
                type="text"
                className="form-control"
                value={formData.reference.lastName}
                onChange={(e) => handleChange('reference', 'lastName', e.target.value)}
                disabled={!canEdit}
              />
            </div>
          </div>
          <div className="form-row">
            <div className="form-col">
              <label className="form-label">Phone</label>
              <input
                type="tel"
                className="form-control"
                value={formData.reference.phone}
                onChange={(e) => handleChange('reference', 'phone', e.target.value)}
                disabled={!canEdit}
              />
            </div>
            <div className="form-col">
              <label className="form-label">Email</label>
              <input
                type="email"
                className="form-control"
                value={formData.reference.email}
                onChange={(e) => handleChange('reference', 'email', e.target.value)}
                disabled={!canEdit}
              />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Relationship</label>
            <input
              type="text"
              className="form-control"
              value={formData.reference.relationship}
              onChange={(e) => handleChange('reference', 'relationship', e.target.value)}
              disabled={!canEdit}
            />
          </div>
        </div>

        {/* Emergency Contacts */}
        <div className="form-section">
          <div className="d-flex justify-between align-center">
            <h3 className="form-section-title">Emergency Contacts</h3>
            {canEdit && (
              <button
                type="button"
                className="btn btn-outline btn-sm"
                onClick={addEmergencyContact}
              >
                Add Contact
              </button>
            )}
          </div>
          
          {formData.emergencyContacts.map((contact, index) => (
            <div key={index} style={{ border: '1px solid #e1e8ed', borderRadius: '6px', padding: '15px', marginBottom: '15px' }}>
              <div className="d-flex justify-between align-center mb-1">
                <h4 style={{ margin: 0, fontSize: '14px', fontWeight: '600' }}>
                  Emergency Contact {index + 1}
                </h4>
                {canEdit && formData.emergencyContacts.length > 1 && (
                  <button
                    type="button"
                    className="btn btn-danger btn-sm"
                    onClick={() => removeEmergencyContact(index)}
                  >
                    Remove
                  </button>
                )}
              </div>
              
              <div className="form-row">
                <div className="form-col">
                  <label className="form-label">First Name *</label>
                  <input
                    type="text"
                    className={`form-control ${errors[`ec${index}.firstName`] ? 'error' : ''}`}
                    value={contact.firstName}
                    onChange={(e) => handleChange('emergencyContacts', 'firstName', e.target.value, index)}
                    disabled={!canEdit}
                  />
                  {errors[`ec${index}.firstName`] && <div className="form-error">{errors[`ec${index}.firstName`]}</div>}
                </div>
                <div className="form-col">
                  <label className="form-label">Last Name *</label>
                  <input
                    type="text"
                    className={`form-control ${errors[`ec${index}.lastName`] ? 'error' : ''}`}
                    value={contact.lastName}
                    onChange={(e) => handleChange('emergencyContacts', 'lastName', e.target.value, index)}
                    disabled={!canEdit}
                  />
                  {errors[`ec${index}.lastName`] && <div className="form-error">{errors[`ec${index}.lastName`]}</div>}
                </div>
              </div>
              
              <div className="form-row">
                <div className="form-col">
                  <label className="form-label">Phone</label>
                  <input
                    type="tel"
                    className="form-control"
                    value={contact.phone}
                    onChange={(e) => handleChange('emergencyContacts', 'phone', e.target.value, index)}
                    disabled={!canEdit}
                  />
                </div>
                <div className="form-col">
                  <label className="form-label">Email *</label>
                  <input
                    type="email"
                    className={`form-control ${errors[`ec${index}.email`] ? 'error' : ''}`}
                    value={contact.email}
                    onChange={(e) => handleChange('emergencyContacts', 'email', e.target.value, index)}
                    disabled={!canEdit}
                  />
                  {errors[`ec${index}.email`] && <div className="form-error">{errors[`ec${index}.email`]}</div>}
                </div>
              </div>
              
              <div className="form-group">
                <label className="form-label">Relationship *</label>
                <input
                  type="text"
                  className={`form-control ${errors[`ec${index}.relationship`] ? 'error' : ''}`}
                  value={contact.relationship}
                  onChange={(e) => handleChange('emergencyContacts', 'relationship', e.target.value, index)}
                  disabled={!canEdit}
                />
                {errors[`ec${index}.relationship`] && <div className="form-error">{errors[`ec${index}.relationship`]}</div>}
              </div>
            </div>
          ))}
        </div>

        {/* Debug Information */}
        {process.env.NODE_ENV === 'development' && (
          <div className="alert alert-info" style={{ marginBottom: '20px' }}>
            <h4>🔧 Debug Information</h4>
            <p><strong>User ID:</strong> {user?.id || 'Not available'}</p>
            <p><strong>Existing Profile:</strong> {existingProfile ? 'Yes' : 'No'}</p>
            <p><strong>Profile ID:</strong> {existingProfile?.id || 'Not available'}</p>
            <p><strong>Is Editing:</strong> {isEditing ? 'Yes' : 'No'}</p>
            <p><strong>Documents:</strong> {documents ? 'Loaded' : 'Not loaded'}</p>
            <p><strong>Show Upload Buttons:</strong> {(existingProfile && existingProfile.id) ? 'Yes' : 'No'}</p>
            <button 
              type="button" 
              className="btn btn-outline btn-sm"
              onClick={() => {
                console.log('🔄 Manual refresh triggered');
                fetchExistingProfile();
              }}
            >
              🔄 Refresh Data
            </button>
          </div>
        )}



        {/* Submit Button */}
        {canEdit && (
          <div className="card">
            <div className="card-body text-center">
              <button
                type="submit"
                className="btn btn-primary btn-lg"
                disabled={loading}
                style={{ minWidth: '200px' }}
              >
                {loading ? 'Submitting...' : (isEditing ? 'Update Application' : 'Submit Application')}
              </button>
              <div className="form-text mt-1">
                Please review all information before submitting
              </div>
            </div>
          </div>
        )}

        {existingProfile && existingProfile.status === 'Pending' && (
          <div className="card">
            <div className="card-body text-center">
              <p>Your application has been submitted and is awaiting HR review.</p>
              <button 
                type="button"
                className="btn btn-secondary"
                onClick={() => navigate('/dashboard')}
              >
                Back to Dashboard
              </button>
            </div>
          </div>
        )}
              </form>
      )}

      {/* Document Upload Section - Outside of form, available to all users */}
      {existingProfile && existingProfile.id ? (
        <div className="form-section" id="documents-section">
          <h3 className="form-section-title">Documents</h3>
          
          {uploadMessage && (
            <div className={`alert ${uploadMessage.includes('successfully') ? 'alert-success' : 'alert-error'}`}>
              {uploadMessage}
            </div>
          )}

          {/* Profile Picture */}
          <div className="document-item">
            <h4 className="document-title">Profile Picture</h4>
            <FileUpload
              userProfileId={existingProfile.id}
              documentType="profilePicture"
              currentFile={documents?.profilePicture}
              onUploadSuccess={handleUploadSuccess}
              onUploadError={handleUploadError}
              accept=".jpg,.jpeg,.png"
              label="Upload Profile Picture"
            />
          </div>

          {/* Driver's License */}
          <div className="document-item">
            <h4 className="document-title">Driver's License</h4>
            <FileUpload
              userProfileId={existingProfile.id}
              documentType="driverLicense"
              currentFile={documents?.document?.driverLicense?.file}
              onUploadSuccess={handleUploadSuccess}
              onUploadError={handleUploadError}
              accept=".pdf,.jpg,.jpeg,.png"
              label="Upload Driver's License"
            />
          </div>

          {/* Work Authorization Documents */}
          {existingProfile.workAuthorization?.visaType && (
            <div className="document-item">
              <h4 className="document-title">Work Authorization Documents</h4>
              
              {/* OPT Receipt */}
              {existingProfile.workAuthorization.visaType === 'F1(CPT/OPT)' && (
                <div className="mb-2">
                  <FileUpload
                    userProfileId={existingProfile.id}
                    documentType="optReceipt"
                    currentFile={documents?.document?.visaDocuments?.find(doc => doc.type === 'OPT Receipt')?.file}
                    onUploadSuccess={handleUploadSuccess}
                    onUploadError={handleUploadError}
                    accept=".pdf,.jpg,.jpeg,.png"
                    label="Upload OPT Receipt"
                  />
                </div>
              )}
              
              {/* Other visa documents can be added here */}
            </div>
          )}
        </div>
      ) : (
        <div className="form-section" id="documents-section">
          <h3 className="form-section-title">Documents</h3>
          <div className="alert alert-info">
            <p><strong>📋 Document Upload Information</strong></p>
            <p>After submitting your onboarding application, you'll be able to upload the following documents:</p>
            <ul>
              <li>Profile Picture</li>
              <li>Driver's License</li>
              <li>Work Authorization Documents (if applicable)</li>
            </ul>
            <p><em>Please complete and submit the form above first.</em></p>
          </div>
        </div>
      )}
    </div>
  );
};

export default OnboardingForm; 