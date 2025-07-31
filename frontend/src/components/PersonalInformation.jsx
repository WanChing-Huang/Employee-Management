import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';

const PersonalInformation = () => {
  const { user } = useAuth();
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      const response = await axios.get(`/api/onboarding/user/${user.id}`);
      setUserProfile(response.data);
    } catch (error) {
      setError('Failed to load profile data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
        <p>Loading profile...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <div className="page-header">
          <h1 className="page-title">Personal Information</h1>
        </div>
        <div className="alert alert-error">
          {error}
        </div>
      </div>
    );
  }

  if (!userProfile) {
    return (
      <div>
        <div className="page-header">
          <h1 className="page-title">Personal Information</h1>
        </div>
        <div className="card">
          <div className="card-body text-center">
            <h2>No Profile Found</h2>
            <p>Please complete your onboarding application first.</p>
            <a href="/onboarding" className="btn btn-primary">
              Start Onboarding
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Personal Information</h1>
        <span className={`status-badge status-${userProfile.status.toLowerCase()}`}>
          {userProfile.status}
        </span>
      </div>

      {/* Basic Information */}
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Basic Information</h2>
        </div>
        <div className="card-body">
          <div className="form-row">
            <div className="form-col">
              <strong>First Name:</strong> {userProfile.firstName}
            </div>
            <div className="form-col">
              <strong>Last Name:</strong> {userProfile.lastName}
            </div>
          </div>
          <div className="form-row">
            <div className="form-col">
              <strong>Middle Name:</strong> {userProfile.middleName || 'N/A'}
            </div>
            <div className="form-col">
              <strong>Preferred Name:</strong> {userProfile.preferredName || 'N/A'}
            </div>
          </div>
          <div className="form-group">
            <strong>Email:</strong> {userProfile.email}
          </div>
        </div>
      </div>

      {/* Address */}
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Address</h2>
        </div>
        <div className="card-body">
          <p>
            {userProfile.address.buildingApt} {userProfile.address.streetName}<br />
            {userProfile.address.city}, {userProfile.address.state} {userProfile.address.zip}
          </p>
        </div>
      </div>

      {/* Contact Information */}
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Contact Information</h2>
        </div>
        <div className="card-body">
          <div className="form-row">
            <div className="form-col">
              <strong>Cell Phone:</strong> {userProfile.cellPhone || 'N/A'}
            </div>
            <div className="form-col">
              <strong>Work Phone:</strong> {userProfile.workPhone || 'N/A'}
            </div>
          </div>
        </div>
      </div>

      {/* Personal Details */}
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Personal Details</h2>
        </div>
        <div className="card-body">
          <div className="form-row">
            <div className="form-col">
              <strong>Date of Birth:</strong> {userProfile.dateOfBirth ? new Date(userProfile.dateOfBirth).toLocaleDateString() : 'N/A'}
            </div>
            <div className="form-col">
              <strong>Gender:</strong> {userProfile.gender || 'N/A'}
            </div>
          </div>
          <div className="form-group">
            <strong>SSN:</strong> ***-**-{userProfile.ssn?.slice(-4) || '****'}
          </div>
        </div>
      </div>

      {/* Work Authorization */}
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Work Authorization</h2>
        </div>
        <div className="card-body">
          {userProfile.workAuthorization?.isPermanentResidentOrCitizen ? (
            <div>
              <strong>Status:</strong> {userProfile.workAuthorization.residentType}
            </div>
          ) : (
            <div>
              <div className="form-row">
                <div className="form-col">
                  <strong>Visa Type:</strong> {userProfile.workAuthorization?.visaType}
                </div>
                <div className="form-col">
                  <strong>Valid:</strong> {userProfile.workAuthorization?.startDate ? new Date(userProfile.workAuthorization.startDate).toLocaleDateString() : 'N/A'} - {userProfile.workAuthorization?.endDate ? new Date(userProfile.workAuthorization.endDate).toLocaleDateString() : 'N/A'}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Emergency Contacts */}
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Emergency Contacts</h2>
        </div>
        <div className="card-body">
          {userProfile.emergencyContacts?.map((contact, index) => (
            <div key={index} className="p-1" style={{ border: '1px solid #e1e8ed', borderRadius: '6px', marginBottom: '10px' }}>
              <h4 style={{ margin: '0 0 10px 0', fontSize: '14px', fontWeight: '600' }}>
                Contact {index + 1}
              </h4>
              <div className="form-row">
                <div className="form-col">
                  <strong>Name:</strong> {contact.firstName} {contact.lastName}
                </div>
                <div className="form-col">
                  <strong>Relationship:</strong> {contact.relationship}
                </div>
              </div>
              <div className="form-row">
                <div className="form-col">
                  <strong>Phone:</strong> {contact.phone || 'N/A'}
                </div>
                <div className="form-col">
                  <strong>Email:</strong> {contact.email}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Reference */}
      {userProfile.reference?.firstName && (
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Reference</h2>
          </div>
          <div className="card-body">
            <div className="form-row">
              <div className="form-col">
                <strong>Name:</strong> {userProfile.reference.firstName} {userProfile.reference.lastName}
              </div>
              <div className="form-col">
                <strong>Relationship:</strong> {userProfile.reference.relationship}
              </div>
            </div>
            <div className="form-row">
              <div className="form-col">
                <strong>Phone:</strong> {userProfile.reference.phone || 'N/A'}
              </div>
              <div className="form-col">
                <strong>Email:</strong> {userProfile.reference.email}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="card">
        <div className="card-body text-center">
          {userProfile.status === 'Rejected' && (
            <a href="/onboarding" className="btn btn-primary">
              Update Application
            </a>
          )}
          {userProfile.status === 'Pending' && (
            <p>Your application is being reviewed by HR.</p>
          )}
          {userProfile.status === 'Approved' && (
            <p>Your profile has been approved and is ready for use.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default PersonalInformation; 