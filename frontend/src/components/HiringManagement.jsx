import { useState } from 'react';
import axios from 'axios';
import OnboardingReviews from './OnboardingReviews';

const HiringManagement = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleGenerateToken = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setError('');

    try {
      const response = await axios.post('/api/users/generate-token', { email });
      setMessage(`Registration token sent to ${email} successfully!`);
      setEmail('');
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to generate token');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Hiring Management</h1>
        <p className="page-subtitle">Generate registration tokens and review applications</p>
      </div>

      {/* Generate Registration Token */}
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Generate Registration Token</h2>
        </div>
        <div className="card-body">
          {message && (
            <div className="alert alert-success">
              {message}
            </div>
          )}
          {error && (
            <div className="alert alert-error">
              {error}
            </div>
          )}
          
          <form onSubmit={handleGenerateToken}>
            <div className="form-group">
              <label className="form-label">Employee Email</label>
              <input
                type="email"
                className="form-control"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter employee email address"
                required
              />
              <div className="form-text">
                A registration link will be sent to this email address. The link will expire in 3 hours.
              </div>
            </div>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? 'Sending...' : 'Generate Token & Send Email'}
            </button>
          </form>
        </div>
      </div>

      {/* Onboarding Application Reviews */}
      <OnboardingReviews />

      {/* Token History */}
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Token History</h2>
        </div>
        <div className="card-body text-center">
          <h3>🚧 Coming Soon</h3>
          <p>Token history tracking is under development.</p>
        </div>
      </div>
    </div>
  );
};

export default HiringManagement; 