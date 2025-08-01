import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useForm } from 'react-hook-form';
import {
  Container,
  Paper,
  Box,
  Typography,
  TextField,
  Button,
  Alert,
  CircularProgress,
  Stepper,
  Step,
  StepLabel,
} from '@mui/material';
import { register as registerUser, validateToken, clearError } from '../store/authSlice';
import {  validatePassword, validateUsername } from '../utils/validators';

const Register = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [searchParams] = useSearchParams();
  const { loading, error } = useSelector((state) => state.auth);
  
  const [activeStep, setActiveStep] = useState(0);
  const [tokenData, setTokenData] = useState(null);
  const [validatingToken, setValidatingToken] = useState(true);

  const token = searchParams.get('token');

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm();

  const password = watch('password');

  useEffect(() => {
    dispatch(clearError());
    validateRegistrationToken();
  }, [dispatch, token]);

  const validateRegistrationToken = async () => {
    if (!token) {
      setValidatingToken(false);
      return;
    }

    try {
      const result = await dispatch(validateToken(token)).unwrap();
      if (result.valid) {
        setTokenData(result);
        setValue('email', result.email);
        setActiveStep(1);
      }
    } catch (error) {
      console.error('Token validation error:', error);
    } finally {
      setValidatingToken(false);
    }
  };

  const onSubmit = async (data) => {
    try {
      await dispatch(registerUser({
        token,
        email: data.email,
        username: data.username,
        password: data.password,
        firstName: data.firstName,
        lastName: data.lastName,
      })).unwrap();
      
      navigate('/onboarding');
    } catch (error) {
      console.error('Registration error:', error);
    }
  };

  if (validatingToken) {
    return (
      <Container component="main" maxWidth="sm">
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (!token || !tokenData) {
    return (
      <Container component="main" maxWidth="sm">
        <Box sx={{ marginTop: 8 }}>
          <Paper elevation={3} sx={{ padding: 4 }}>
            <Alert severity="error">
              Invalid or missing registration token. Please use the link sent to your email.
            </Alert>
            <Box textAlign="center" mt={2}>
              <Link to="/login" style={{ textDecoration: 'none' }}>
                <Button variant="outlined">Back to Login</Button>
              </Link>
            </Box>
          </Paper>
        </Box>
      </Container>
    );
  }

  const steps = ['Validate Token', 'Create Account'];

  return (
    <Container component="main" maxWidth="sm">
      <Box sx={{ marginTop: 4 }}>
        <Paper elevation={3} sx={{ padding: 4 }}>
          <Typography component="h1" variant="h4" align="center" gutterBottom>
            Employee Registration
          </Typography>
          
          <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="Email Address"
              name="email"
              autoComplete="email"
              disabled
              value={tokenData?.email || ''}
              {...register('email')}
            />
            
            <TextField
              margin="normal"
              required
              fullWidth
              id="username"
              label="Username"
              name="username"
              autoComplete="username"
              autoFocus
              error={!!errors.username}
              helperText={errors.username?.message}
              {...register('username', {
                required: 'Username is required',
                validate: (value) => validateUsername(value) || 'Username must be 3-30 characters',
              })}
            />
            
            <TextField
              margin="normal"
              required
              fullWidth
              id="firstName"
              label="First Name"
              name="firstName"
              autoComplete="given-name"
              error={!!errors.firstName}
              helperText={errors.firstName?.message}
              {...register('firstName', {
                required: 'First name is required',
              })}
            />
            
            <TextField
              margin="normal"
              required
              fullWidth
              id="lastName"
              label="Last Name"
              name="lastName"
              autoComplete="family-name"
              error={!!errors.lastName}
              helperText={errors.lastName?.message}
              {...register('lastName', {
                required: 'Last name is required',
              })}
            />
            
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Password"
              type="password"
              id="password"
              autoComplete="new-password"
              error={!!errors.password}
              helperText={errors.password?.message}
              {...register('password', {
                required: 'Password is required',
                validate: (value) => validatePassword(value) || 'Password must be at least 6 characters',
              })}
            />
            
            <TextField
              margin="normal"
              required
              fullWidth
              name="confirmPassword"
              label="Confirm Password"
              type="password"
              id="confirmPassword"
              error={!!errors.confirmPassword}
              helperText={errors.confirmPassword?.message}
              {...register('confirmPassword', {
                required: 'Please confirm your password',
                validate: (value) => value === password || 'Passwords do not match',
              })}
            />
            
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} /> : 'Create Account'}
            </Button>
            
            <Box textAlign="center">
              <Typography variant="body2" color="text.secondary">
                Already have an account?{' '}
                <Link to="/login" style={{ textDecoration: 'none' }}>
                  Sign in
                </Link>
              </Typography>
            </Box>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default Register;