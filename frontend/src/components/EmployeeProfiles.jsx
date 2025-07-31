import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';

const EmployeeProfiles = () => {
  const { user } = useAuth();
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      const response = await axios.get('/api/users/');
      setEmployees(response.data.filter(emp => emp.role === 'employee'));
    } catch (error) {
      setError('Failed to load employees');
    } finally {
      setLoading(false);
    }
  };

  const handleViewProfile = async (employeeId) => {
    try {
      // Get user profile details
      const profileResponse = await axios.get(`/api/onboarding/user/${employeeId}`);
      setSelectedEmployee(profileResponse.data);
      setShowModal(true);
    } catch (error) {
      console.error('Error fetching employee profile:', error);
      // If no profile exists, show basic user info
      const employee = employees.find(emp => emp._id === employeeId);
      setSelectedEmployee({ ...employee, noProfile: true });
      setShowModal(true);
    }
  };

  const handleDeleteEmployee = async (employeeId) => {
    if (window.confirm('Are you sure you want to delete this employee?')) {
      try {
        await axios.delete(`/api/users/${employeeId}`);
        setEmployees(employees.filter(emp => emp._id !== employeeId));
      } catch (error) {
        alert('Failed to delete employee');
      }
    }
  };

  const handleUpdateRole = async (employeeId, newRole) => {
    try {
      await axios.patch(`/api/users/${employeeId}/role`, { role: newRole });
      fetchEmployees(); // Refresh list
    } catch (error) {
      alert('Failed to update role');
    }
  };

  const filteredEmployees = employees.filter(employee =>
    employee.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    employee.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    employee.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    employee.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
        <p>Loading employees...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <div className="page-header">
          <h1 className="page-title">Employee Profiles</h1>
        </div>
        <div className="alert alert-error">{error}</div>
      </div>
    );
  }

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Employee Profiles</h1>
        <p className="page-subtitle">Manage employee information ({employees.length} employees)</p>
      </div>

      {/* Search Bar */}
      <div className="card">
        <div className="card-body">
          <div className="search-box">
            <input
              type="text"
              className="form-control search-input"
              placeholder="Search employees by name, username, or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <span className="search-icon">🔍</span>
          </div>
          {searchTerm && (
            <div className="form-text">
              Found {filteredEmployees.length} employee(s) matching "{searchTerm}"
            </div>
          )}
        </div>
      </div>

      {/* Employee List */}
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Employee Directory</h2>
        </div>
        <div className="card-body">
          {filteredEmployees.length === 0 ? (
            <div className="text-center">
              <p>{searchTerm ? 'No employees found matching your search.' : 'No employees found.'}</p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Username</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Joined</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredEmployees.map((employee) => (
                    <tr key={employee._id}>
                      <td>
                        {employee.firstName || employee.lastName 
                          ? `${employee.firstName || ''} ${employee.lastName || ''}`.trim()
                          : 'Not provided'
                        }
                      </td>
                      <td>{employee.username}</td>
                      <td>{employee.email}</td>
                      <td>
                        <select
                          className="form-control btn-sm"
                          value={employee.role}
                          onChange={(e) => handleUpdateRole(employee._id, e.target.value)}
                        >
                          <option value="employee">Employee</option>
                          <option value="hr">HR</option>
                        </select>
                      </td>
                      <td>{new Date(employee.createdAt).toLocaleDateString()}</td>
                      <td>
                        <div className="btn-group">
                          <button
                            className="btn btn-primary btn-sm"
                            onClick={() => handleViewProfile(employee._id)}
                          >
                            View
                          </button>
                          <button
                            className="btn btn-danger btn-sm"
                            onClick={() => handleDeleteEmployee(employee._id)}
                            disabled={employee._id === user.id}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Employee Profile Modal */}
      {showModal && selectedEmployee && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Employee Profile</h2>
              <button className="btn btn-secondary btn-sm" onClick={() => setShowModal(false)}>
                ✕
              </button>
            </div>
            <div className="modal-body">
              {selectedEmployee.noProfile ? (
                <div className="text-center">
                  <h3>Basic Information</h3>
                  <p><strong>Username:</strong> {selectedEmployee.username}</p>
                  <p><strong>Email:</strong> {selectedEmployee.email}</p>
                  <p><strong>Role:</strong> {selectedEmployee.role}</p>
                  <p><strong>Joined:</strong> {new Date(selectedEmployee.createdAt).toLocaleDateString()}</p>
                  <div className="alert alert-info">
                    This employee has not completed their onboarding application yet.
                  </div>
                </div>
              ) : (
                <div>
                  <div className="form-row">
                    <div className="form-col">
                      <strong>Name:</strong> {selectedEmployee.firstName} {selectedEmployee.lastName}
                    </div>
                    <div className="form-col">
                      <strong>Status:</strong> 
                      <span className={`status-badge status-${selectedEmployee.status?.toLowerCase()}`}>
                        {selectedEmployee.status}
                      </span>
                    </div>
                  </div>
                  <div className="form-row">
                    <div className="form-col">
                      <strong>Email:</strong> {selectedEmployee.email}
                    </div>
                    <div className="form-col">
                      <strong>Phone:</strong> {selectedEmployee.cellPhone || 'Not provided'}
                    </div>
                  </div>
                  {selectedEmployee.address && (
                    <div className="form-group">
                      <strong>Address:</strong><br />
                      {selectedEmployee.address.buildingApt} {selectedEmployee.address.streetName}<br />
                      {selectedEmployee.address.city}, {selectedEmployee.address.state} {selectedEmployee.address.zip}
                    </div>
                  )}
                  {selectedEmployee.workAuthorization && (
                    <div className="form-group">
                      <strong>Work Authorization:</strong><br />
                      {selectedEmployee.workAuthorization.isPermanentResidentOrCitizen 
                        ? selectedEmployee.workAuthorization.residentType 
                        : selectedEmployee.workAuthorization.visaType
                      }
                    </div>
                  )}
                  {selectedEmployee.emergencyContacts && selectedEmployee.emergencyContacts.length > 0 && (
                    <div className="form-group">
                      <strong>Emergency Contact:</strong><br />
                      {selectedEmployee.emergencyContacts[0].firstName} {selectedEmployee.emergencyContacts[0].lastName}<br />
                      {selectedEmployee.emergencyContacts[0].email} | {selectedEmployee.emergencyContacts[0].phone}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeeProfiles; 