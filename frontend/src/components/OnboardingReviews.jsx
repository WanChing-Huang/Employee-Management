import { useState, useEffect } from 'react';
import axios from 'axios';

const OnboardingReviews = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [activeTab, setActiveTab] = useState('pending');
  const [reviewData, setReviewData] = useState({
    status: '',
    feedback: ''
  });

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      const response = await axios.get('/api/onboarding/');
      setApplications(response.data.userProfiles || []);
    } catch (error) {
      setError('Failed to load applications');
    } finally {
      setLoading(false);
    }
  };

  const handleViewApplication = (application) => {
    setSelectedApplication(application);
    setReviewData({
      status: application.status,
      feedback: application.feedback || ''
    });
    setShowModal(true);
  };

  const handleReviewSubmit = async () => {
    try {
      await axios.patch(`/api/onboarding/${selectedApplication._id}/status`, {
        status: reviewData.status,
        feedback: reviewData.feedback
      });
      
      // Update the application in the list
      setApplications(applications.map(app => 
        app._id === selectedApplication._id 
          ? { ...app, status: reviewData.status, feedback: reviewData.feedback }
          : app
      ));
      
      setShowModal(false);
      setSelectedApplication(null);
    } catch (error) {
      alert('Failed to update application status');
    }
  };

  const getFilteredApplications = () => {
    return applications.filter(app => {
      switch (activeTab) {
        case 'pending': return app.status === 'Pending';
        case 'approved': return app.status === 'Approved';
        case 'rejected': return app.status === 'Rejected';
        default: return true;
      }
    });
  };

  const filteredApplications = getFilteredApplications();

  if (loading) {
    return (
      <div className="card">
        <div className="card-body">
          <div className="loading">
            <div className="spinner"></div>
            <p>Loading applications...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card">
        <div className="card-body">
          <div className="alert alert-error">{error}</div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Onboarding Application Reviews</h2>
        </div>
        <div className="card-body">
          {/* Tabs */}
          <div className="mb-2">
            <div className="d-flex gap-1">
              <button 
                className={`btn ${activeTab === 'pending' ? 'btn-primary' : 'btn-outline'}`}
                onClick={() => setActiveTab('pending')}
              >
                Pending ({applications.filter(app => app.status === 'Pending').length})
              </button>
              <button 
                className={`btn ${activeTab === 'approved' ? 'btn-primary' : 'btn-outline'}`}
                onClick={() => setActiveTab('approved')}
              >
                Approved ({applications.filter(app => app.status === 'Approved').length})
              </button>
              <button 
                className={`btn ${activeTab === 'rejected' ? 'btn-primary' : 'btn-outline'}`}
                onClick={() => setActiveTab('rejected')}
              >
                Rejected ({applications.filter(app => app.status === 'Rejected').length})
              </button>
            </div>
          </div>

          {/* Applications List */}
          {filteredApplications.length === 0 ? (
            <div className="text-center p-2">
              <p>No {activeTab} applications found.</p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Submitted</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredApplications.map((application) => (
                    <tr key={application._id}>
                      <td>{application.firstName} {application.lastName}</td>
                      <td>{application.email}</td>
                      <td>{new Date(application.createdAt).toLocaleDateString()}</td>
                      <td>
                        <span className={`status-badge status-${application.status.toLowerCase()}`}>
                          {application.status}
                        </span>
                      </td>
                      <td>
                        <button
                          className="btn btn-primary btn-sm"
                          onClick={() => handleViewApplication(application)}
                        >
                          Review
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Review Modal */}
      {showModal && selectedApplication && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Review Application - {selectedApplication.firstName} {selectedApplication.lastName}</h2>
              <button className="btn btn-secondary btn-sm" onClick={() => setShowModal(false)}>
                ✕
              </button>
            </div>
            <div className="modal-body">
              {/* Application Details */}
              <div className="mb-2">
                <h3>Application Details</h3>
                
                <div className="form-row">
                  <div className="form-col">
                    <strong>Name:</strong> {selectedApplication.firstName} {selectedApplication.middleName} {selectedApplication.lastName}
                  </div>
                  <div className="form-col">
                    <strong>Preferred Name:</strong> {selectedApplication.preferredName || 'N/A'}
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-col">
                    <strong>Email:</strong> {selectedApplication.email}
                  </div>
                  <div className="form-col">
                    <strong>Phone:</strong> {selectedApplication.cellPhone || 'N/A'}
                  </div>
                </div>

                {selectedApplication.address && (
                  <div className="form-group">
                    <strong>Address:</strong><br />
                    {selectedApplication.address.buildingApt} {selectedApplication.address.streetName}<br />
                    {selectedApplication.address.city}, {selectedApplication.address.state} {selectedApplication.address.zip}
                  </div>
                )}

                <div className="form-row">
                  <div className="form-col">
                    <strong>Date of Birth:</strong> {selectedApplication.dateOfBirth ? new Date(selectedApplication.dateOfBirth).toLocaleDateString() : 'N/A'}
                  </div>
                  <div className="form-col">
                    <strong>Gender:</strong> {selectedApplication.gender || 'N/A'}
                  </div>
                </div>

                {selectedApplication.workAuthorization && (
                  <div className="form-group">
                    <strong>Work Authorization:</strong><br />
                    {selectedApplication.workAuthorization.isPermanentResidentOrCitizen 
                      ? `${selectedApplication.workAuthorization.residentType} (Permanent Resident/Citizen)`
                      : `${selectedApplication.workAuthorization.visaType} visa`
                    }
                    {selectedApplication.workAuthorization.startDate && (
                      <span>
                        <br />Valid: {new Date(selectedApplication.workAuthorization.startDate).toLocaleDateString()} - {new Date(selectedApplication.workAuthorization.endDate).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                )}

                {selectedApplication.emergencyContacts && selectedApplication.emergencyContacts.length > 0 && (
                  <div className="form-group">
                    <strong>Emergency Contact:</strong><br />
                    {selectedApplication.emergencyContacts[0].firstName} {selectedApplication.emergencyContacts[0].lastName}<br />
                    {selectedApplication.emergencyContacts[0].email} | {selectedApplication.emergencyContacts[0].phone || 'N/A'}<br />
                    Relationship: {selectedApplication.emergencyContacts[0].relationship}
                  </div>
                )}

                {selectedApplication.reference && selectedApplication.reference.firstName && (
                  <div className="form-group">
                    <strong>Reference:</strong><br />
                    {selectedApplication.reference.firstName} {selectedApplication.reference.lastName}<br />
                    {selectedApplication.reference.email} | {selectedApplication.reference.phone || 'N/A'}<br />
                    Relationship: {selectedApplication.reference.relationship}
                  </div>
                )}
              </div>

              {/* Review Section */}
              {activeTab === 'pending' && (
                <div className="form-section">
                  <h3 className="form-section-title">Review Decision</h3>
                  
                  <div className="form-group">
                    <label className="form-label">Status</label>
                    <select
                      className="form-control"
                      value={reviewData.status}
                      onChange={(e) => setReviewData({...reviewData, status: e.target.value})}
                    >
                      <option value="Pending">Pending</option>
                      <option value="Approved">Approved</option>
                      <option value="Rejected">Rejected</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Feedback {reviewData.status === 'Rejected' && <span className="text-danger">*</span>}</label>
                    <textarea
                      className="form-control"
                      rows="4"
                      placeholder="Provide feedback to the employee..."
                      value={reviewData.feedback}
                      onChange={(e) => setReviewData({...reviewData, feedback: e.target.value})}
                    />
                    <div className="form-text">
                      {reviewData.status === 'Rejected' 
                        ? 'Please provide feedback explaining what needs to be corrected.'
                        : 'Optional feedback for the employee.'
                      }
                    </div>
                  </div>

                  <div className="btn-group">
                    <button
                      className="btn btn-success"
                      onClick={handleReviewSubmit}
                      disabled={reviewData.status === 'Rejected' && !reviewData.feedback.trim()}
                    >
                      Submit Review
                    </button>
                    <button
                      className="btn btn-secondary"
                      onClick={() => setShowModal(false)}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              {/* Display feedback for non-pending applications */}
              {activeTab !== 'pending' && selectedApplication.feedback && (
                <div className="form-section">
                  <h3 className="form-section-title">HR Feedback</h3>
                  <div className="alert alert-info">
                    {selectedApplication.feedback}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OnboardingReviews; 