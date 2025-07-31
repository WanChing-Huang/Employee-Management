import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, useSearchParams } from 'react-router-dom';

const Register = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();
  const { register, validateToken, loading } = useAuth();

  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    token: token || ''
  });
  const [errors, setErrors] = useState({});
  const [tokenValid, setTokenValid] = useState(false);
  const [tokenLoading, setTokenLoading] = useState(true);

  // Validate token on component mount
  useEffect(() => {
    const checkToken = async () => {
      if (!token) {
        setErrors({ token: 'Registration token is required' });
        setTokenLoading(false);
        return;
      }

      try {
        const result = await validateToken(token);
        setTokenValid(true);
        setFormData(prev => ({
          ...prev,
          email: result.email,
          token: token
        }));
      } catch (error) {
        setErrors({ token: error.message });
      } finally {
        setTokenLoading(false);
      }
    };

    checkToken();
  }, [token, validateToken]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.username) {
      newErrors.username = 'Username is required';
    } else if (formData.username.length < 3) {
      newErrors.username = 'Username must be at least 3 characters';
    } else if (formData.username.length > 30) {
      newErrors.username = 'Username must not exceed 30 characters';
    }

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    const result = await register({
      username: formData.username,
      email: formData.email,
      password: formData.password,
      token: formData.token
    });
    
    if (result.success) {
      // Redirect to onboarding after successful registration
      navigate('/onboarding');
    } else {
      setErrors({ submit: result.error });
    }
  };

  if (tokenLoading) {
    return (
      <div className="auth-container">
        <div className="auth-card text-center">
          <div className="loading">
            <div className="spinner"></div>
          </div>
          <p>Validating registration token...</p>
        </div>
      </div>
    );
  }

  if (!tokenValid) {
    return (
      <div className="auth-container">
        <div className="auth-card text-center">
          <h1 className="auth-title">Invalid Registration Token</h1>
          <div className="alert alert-error">
            {errors.token || 'The registration token is invalid or has expired.'}
          </div>
          <p>Please contact HR for a new registration link.</p>
          <a href="/login" className="auth-link">Go to Login</a>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1 className="auth-title">Create Account</h1>
        <p className="text-center mb-2">Complete your registration</p>

        {errors.submit && (
          <div className="alert alert-error">
            {errors.submit}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email" className="form-label">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              className="form-control"
              value={formData.email}
              readOnly
              style={{ backgroundColor: '#f8f9fa' }}
            />
            <div className="form-text">This email was provided by HR</div>
          </div>

          <div className="form-group">
            <label htmlFor="username" className="form-label">Username</label>
            <input
              type="text"
              id="username"
              name="username"
              className={`form-control ${errors.username ? 'error' : ''}`}
              value={formData.username}
              onChange={handleChange}
              placeholder="Choose a username"
            />
            {errors.username && <div className="form-error">{errors.username}</div>}
            <div className="form-text">3-30 characters, will be used for login</div>
          </div>

          <div className="form-group">
            <label htmlFor="password" className="form-label">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              className={`form-control ${errors.password ? 'error' : ''}`}
              value={formData.password}
              onChange={handleChange}
              placeholder="Create a password"
            />
            {errors.password && <div className="form-error">{errors.password}</div>}
            <div className="form-text">Minimum 6 characters</div>
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword" className="form-label">Confirm Password</label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              className={`form-control ${errors.confirmPassword ? 'error' : ''}`}
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Confirm your password"
            />
            {errors.confirmPassword && <div className="form-error">{errors.confirmPassword}</div>}
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-lg"
            disabled={loading}
            style={{ width: '100%' }}
          >
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>

        <div className="text-center mt-2">
          <p>
            Already have an account? <a href="/login" className="auth-link">Sign in</a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register; 