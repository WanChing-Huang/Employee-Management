import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useForm, Controller } from 'react-hook-form';


import {
  Box,
  Stepper,
  Step,
  StepLabel,
  Button,
  Typography,
  Paper,
  Grid,
  TextField,
  MenuItem,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  Alert,
  CircularProgress,
  Divider,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';

import { fetchMyProfile, submitOnboarding } from '../store/profileSlice';
import FormInput from '../components/FormInput';
import FileUpload from '../components/FileUpload';
import StatusBadge from '../components/StatusBadge';
import { VISA_TYPES, GENDER_OPTIONS, STATES, EMERGENCY_CONTACT_RELATIONSHIPS } from '../utils/constants';
import { validatePhone, validateSSN, validateZipCode, formatPhone, formatSSN } from '../utils/validators';

// Steps for the onboarding form
const steps = ['Personal Information', 'Contact & Address', 'Work Authorization', 'Emergency Contacts', 'Review & Submit'];

const Onboarding = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { profile, status, loading, error } = useSelector((state) => state.profile);

  const [activeStep, setActiveStep] = useState(0);
  const [files, setFiles] = useState({
    profilePicture: null,
    driverLicense: null,
    workAuthorization: null,
  });

  const { control, handleSubmit, formState: { errors: _errors }, watch, setValue, trigger, reset } = useForm({
    defaultValues: {
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      middleName: '',
      preferredName: '',
      ssn: '',
      dateOfBirth: null,
      gender: '',
      address: {
        buildingApt: '',
        streetName: '',
        city: '',
        state: '',
        zip: '',
      },
      cellPhone: '',
      workPhone: '',
      email: user?.email || '',
      workAuthorization: {
        isPermanentResidentOrCitizen: false,
        residentType: '',
        visaType: '',
        visaTitle: '',
        startDate: null,
        endDate: null,
      },
      reference: {
        firstName: '',
        lastName: '',
        middleName: '',
        phone: '',
        email: '',
        relationship: '',
      },
      emergencyContacts: [{
        firstName: '',
        lastName: '',
        middleName: '',
        phone: '',
        email: '',
        relationship: '',
      }],
    },
  });
  const [hasNavigated, setHasNavigated] = useState(false);
  // const isPermanentResident = watch('workAuthorization.isPermanentResidentOrCitizen');
  const isPermanentResident = watch('workAuthorization.isPermanentResidentOrCitizen');
  const visaType = watch('workAuthorization.visaType');

  //initially fetch the profile data
  useEffect(() => {
    dispatch(fetchMyProfile());
  }, [dispatch]);



  useEffect(() => {
    if (isPermanentResident) {
      setValue('workAuthorization.visaType', '');
      setValue('workAuthorization.visaTitle', '');
    } else {
      setValue('workAuthorization.residentType', '');
    }
  }, [isPermanentResident, setValue]);
  // Redirect if the user is already finish onboarding
  useEffect(() => {
    if (status === 'Approved' && !hasNavigated) {
      setHasNavigated(true); // Prevent multiple redirects
      navigate('/dashboard', { replace: true });
    }
  }, [status, navigate, hasNavigated]);

  // Populate form with existing profile data if available
  useEffect(() => {
    if (profile && (status === 'Rejected' || status === 'Pending')) {
      const fallbackProfile = {
        ...profile,
        gender: profile.gender || '',
        dateOfBirth: profile.dateOfBirth ? new Date(profile.dateOfBirth) : null,
        address: {
          streetName: profile.address?.streetName || '',
          city: profile.address?.city || '',
          state: profile.address?.state || '',
          zip: profile.address?.zip || '',
          buildingApt: profile.address?.buildingApt || '',
        },
        emergencyContacts: (profile.emergencyContacts || []).map((c) => ({
          ...c,
          relationship: c.relationship || '',
        })),
        workAuthorization: {
          ...profile.workAuthorization,
          isPermanentResidentOrCitizen: profile.workAuthorization?.isPermanentResidentOrCitizen ?? false,
          residentType: profile.workAuthorization?.residentType || '',
          visaType: profile.workAuthorization?.visaType || '',
          startDate: profile.workAuthorization?.startDate ? new Date(profile.workAuthorization?.startDate) : null,
          endDate: profile.workAuthorization?.endDate ? new Date(profile.workAuthorization?.endDate) : null,
        },
      };

      reset(fallbackProfile);
    }
  }, [profile, status, reset]);


  const handleNext = async () => {
    const isValid = await trigger();// Validate current step
    if (isValid) {
      setActiveStep((prevStep) => prevStep + 1);
    }
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  //
  const onSubmit = async (data) => {
    try {
      const cleanedData = { ...data };
      if (cleanedData.workAuthorization?.isPermanentResidentOrCitizen) {
        delete cleanedData.workAuthorization.visaType;
        delete cleanedData.workAuthorization.visaTitle;
        delete cleanedData.workAuthorization.startDate;
        delete cleanedData.workAuthorization.endDate;
      } else {
        delete cleanedData.workAuthorization.residentType;
      }

      const formData = {
        ...cleanedData,
        status: 'Pending',
        files, // sent to  profile.js 
      };
      console.log('Submitting formData:', formData); // check the form data before submission

      await dispatch(submitOnboarding(formData)).unwrap();
      navigate('/dashboard');
    } catch (error) {
      console.error('Onboarding submission error:', error);
    }
  };
  // const onSubmit = async (data) => {
  //   try {
  //     const formData = {
  //       ...data,
  //       files,
  //     };
  //     console.log('Submitting formData:', formData);
  //     await dispatch(submitOnboarding(formData)).unwrap(); //submit the form data
  //     navigate('/dashboard');
  //   } catch (error) {
  //     console.error('Onboarding submission error:', error);
  //   }
  // };

  const renderStepContent = (step) => {
    switch (step) {
      case 0: // Personal Information
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Personal Information
              </Typography>
            </Grid>

            <Grid item xs={12} md={6}>
              <FormInput
                name="firstName"
                control={control}
                label="First Name"
                required
                disabled={status === 'Pending'}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <FormInput
                name="lastName"
                control={control}
                label="Last Name"
                required
                disabled={status === 'Pending'}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <FormInput
                name="middleName"
                control={control}
                label="Middle Name"
                disabled={status === 'Pending'}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <FormInput
                name="preferredName"
                control={control}
                label="Preferred Name"
                disabled={status === 'Pending'}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <FormInput
                name="ssn"
                control={control}
                label="SSN"
                required
                disabled={status === 'Pending'}
                rules={{
                  validate: (value) => validateSSN(value) || 'Invalid SSN format (XXX-XX-XXXX)',
                }}
                onChange={(e) => {
                  const formatted = formatSSN(e.target.value);
                  setValue('ssn', formatted);
                }}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <Controller
                name="dateOfBirth"
                control={control}
                rules={{ required: 'Date of birth is required' }}
                render={({ field, fieldState: { error } }) => (
                  <DatePicker
                    {...field}
                    label="Date of Birth"
                    disabled={status === 'Pending'}
                    slotProps={{
                      textField: {
                        fullWidth: true,
                        error: !!error,
                        helperText: error?.message,
                        required: true,
                      },
                    }}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <FormInput
                name="gender"
                control={control}
                label="Gender"
                select
                required
                disabled={status === 'Pending'}
                options={GENDER_OPTIONS}
              />
            </Grid>

            <Grid item xs={12}>
              <FileUpload
                label="Profile Picture"
                accept="image/*"
                value={files.profilePicture}
                onChange={(file) => setFiles({ ...files, profilePicture: file })}
                disabled={status === 'Pending'}
              />
            </Grid>
          </Grid>
        );

      case 1: // Contact & Address
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Contact Information
              </Typography>
            </Grid>

            <Grid item xs={12} md={6}>
              <FormInput
                name="cellPhone"
                control={control}
                label="Cell Phone"
                required
                disabled={status === 'Pending'}
                rules={{
                  validate: (value) => validatePhone(value) || 'Invalid phone format (XXX-XXX-XXXX)',
                }}
                onChange={(e) => {
                  const formatted = formatPhone(e.target.value);
                  setValue('cellPhone', formatted);
                }}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <FormInput
                name="workPhone"
                control={control}
                label="Work Phone"
                disabled={status === 'Pending'}
                rules={{
                  validate: (value) => !value || validatePhone(value) || 'Invalid phone format',
                }}
              />
            </Grid>

            <Grid item xs={12}>
              <FormInput
                name="email"
                control={control}
                label="Email"
                required
                disabled
              />
            </Grid>

            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                Address
              </Typography>
            </Grid>

            <Grid item xs={12}>
              <FormInput
                name="address.streetName"
                control={control}
                label="Street Address"
                required
                disabled={status === 'Pending'}
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <FormInput
                name="address.buildingApt"
                control={control}
                label="Apt/Suite/Unit"
                disabled={status === 'Pending'}
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <FormInput
                name="address.city"
                control={control}
                label="City"
                required
                disabled={status === 'Pending'}
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <FormInput
                name="address.state"
                control={control}
                label="State"
                select
                required
                disabled={status === 'Pending'}
                options={STATES.map(state => ({ value: state, label: state }))}
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <FormInput
                name="address.zip"
                control={control}
                label="ZIP Code"
                required
                disabled={status === 'Pending'}
                rules={{
                  validate: (value) => validateZipCode(value) || 'Invalid ZIP code',
                }}
              />
            </Grid>
          </Grid>
        );

      case 2: // Work Authorization
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Work Authorization
              </Typography>
            </Grid>

            <Grid item xs={12}>
              <Controller
                name="workAuthorization.isPermanentResidentOrCitizen"
                control={control}
                render={({ field }) => (
                  <FormControl component="fieldset" disabled={status === 'Pending'}>
                    <FormLabel component="legend" required>
                      Are you a permanent resident or citizen of the US?
                    </FormLabel>
                    <RadioGroup
                      value={field.value ? 'yes' : 'no'}
                      onChange={(e) => field.onChange(e.target.value === 'yes')}
                    >
                      <FormControlLabel
                        value="yes"
                        control={<Radio />}
                        label="Yes"
                        onChange={() => field.onChange(true)}
                      />
                      <FormControlLabel
                        value="no"
                        control={<Radio />}
                        label="No"
                        onChange={() => field.onChange(false)}
                      />
                    </RadioGroup>
                  </FormControl>
                )}
              />
            </Grid>

            {isPermanentResident ? (
              <Grid item xs={12} md={6}>
                <FormInput
                  name="workAuthorization.residentType"
                  control={control}
                  label="Type"
                  select
                  required
                  disabled={status === 'Pending'}
                  options={[
                    { value: 'Green Card', label: 'Green Card' },
                    { value: 'Citizen', label: 'Citizen' },
                  ]}
                />
              </Grid>
            ) : (
              <>
                <Grid item xs={12} md={6}>
                  <FormInput
                    name="workAuthorization.visaType"
                    control={control}
                    label="Visa Type"
                    select
                    required
                    disabled={status === 'Pending'}
                    options={VISA_TYPES.map(type => ({ value: type, label: type }))}
                  />
                </Grid>

                {visaType === 'Other' && (
                  <Grid item xs={12} md={6}>
                    <FormInput
                      name="workAuthorization.visaTitle"
                      control={control}
                      label="Visa Title"
                      required
                      disabled={status === 'Pending'}
                    />
                  </Grid>
                )}

                <Grid item xs={12} md={6}>
                  <Controller
                    name="workAuthorization.startDate"
                    control={control}
                    rules={{ required: 'Start date is required' }}
                    render={({ field, fieldState: { error } }) => (
                      <DatePicker
                        {...field}
                        label="Start Date"
                        disabled={status === 'Pending'}
                        slotProps={{
                          textField: {
                            fullWidth: true,
                            error: !!error,
                            helperText: error?.message,
                            required: true,
                          },
                        }}
                      />
                    )}
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <Controller
                    name="workAuthorization.endDate"
                    control={control}
                    rules={{ required: 'End date is required' }}
                    render={({ field, fieldState: { error } }) => (
                      <DatePicker
                        {...field}
                        label="End Date"
                        disabled={status === 'Pending'}
                        slotProps={{
                          textField: {
                            fullWidth: true,
                            error: !!error,
                            helperText: error?.message,
                            required: true,
                          },
                        }}
                      />
                    )}
                  />
                </Grid>

                <Grid item xs={12}>
                  <FileUpload
                    label="Work Authorization Document"
                    accept="application/pdf,image/*"
                    value={files.workAuthorization}
                    onChange={(file) => setFiles({ ...files, workAuthorization: file })}
                    required
                    disabled={status === 'Pending'}
                  />
                </Grid>
              </>
            )}

            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
              <Typography variant="h6" gutterBottom>
                Driver's License
              </Typography>
            </Grid>

            <Grid item xs={12}>
              <FileUpload
                label="Driver's License"
                accept="application/pdf,image/*"
                value={files.driverLicense}
                onChange={(file) => setFiles({ ...files, driverLicense: file })}
                required
                disabled={status === 'Pending'}
              />
            </Grid>
          </Grid>
        );

      case 3: // Emergency Contacts
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Reference
              </Typography>
            </Grid>

            <Grid item xs={12} md={4}>
              <FormInput
                name="reference.firstName"
                control={control}
                label="First Name"
                required
                disabled={status === 'Pending'}
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <FormInput
                name="reference.lastName"
                control={control}
                label="Last Name"
                required
                disabled={status === 'Pending'}
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <FormInput
                name="reference.middleName"
                control={control}
                label="Middle Name"
                disabled={status === 'Pending'}
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <FormInput
                name="reference.phone"
                control={control}
                label="Phone"
                required
                disabled={status === 'Pending'}
                rules={{
                  validate: (value) => validatePhone(value) || 'Invalid phone format',
                }}
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <FormInput
                name="reference.email"
                control={control}
                label="Email"
                required
                disabled={status === 'Pending'}
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <FormInput
                name="reference.relationship"
                control={control}
                label="Relationship"
                required
                disabled={status === 'Pending'}
              />
            </Grid>

            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
              <Typography variant="h6" gutterBottom>
                Emergency Contact
              </Typography>
            </Grid>

            <Grid item xs={12} md={4}>
              <FormInput
                name="emergencyContacts.0.firstName"
                control={control}
                label="First Name"
                required
                disabled={status === 'Pending'}
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <FormInput
                name="emergencyContacts.0.lastName"
                control={control}
                label="Last Name"
                required
                disabled={status === 'Pending'}
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <FormInput
                name="emergencyContacts.0.middleName"
                control={control}
                label="Middle Name"
                disabled={status === 'Pending'}
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <FormInput
                name="emergencyContacts.0.phone"
                control={control}
                label="Phone"
                required
                disabled={status === 'Pending'}
                rules={{
                  validate: (value) => validatePhone(value) || 'Invalid phone format',
                }}
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <FormInput
                name="emergencyContacts.0.email"
                control={control}
                label="Email"
                required
                disabled={status === 'Pending'}
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <FormInput
                name="emergencyContacts.0.relationship"
                control={control}
                label="Relationship"
                select
                required
                disabled={status === 'Pending'}
                options={EMERGENCY_CONTACT_RELATIONSHIPS.map(rel => ({ value: rel, label: rel }))}
              />
            </Grid>
          </Grid>
        );

      case 4: // Review & Submit
        {
          const formData = watch();
          return (
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>
                  Review Your Information
                </Typography>
                {status === 'Pending' && (
                  <Alert severity="info" sx={{ mb: 2 }}>
                    Your application is currently under review. You cannot make changes at this time.
                  </Alert>
                )}
              </Grid>

              <Grid item xs={12}>
                <Paper variant="outlined" sx={{ p: 2 }}>
                  <Typography variant="subtitle1" gutterBottom>
                    Personal Information
                  </Typography>
                  <Typography variant="body2">
                    Name: {formData.firstName} {formData.middleName} {formData.lastName}
                  </Typography>
                  <Typography variant="body2">
                    Preferred Name: {formData.preferredName || 'N/A'}
                  </Typography>
                  <Typography variant="body2">
                    SSN: {formData.ssn ? `***-**-${formData.ssn.slice(-4)}` : 'N/A'}
                  </Typography>
                </Paper>
              </Grid>

              <Grid item xs={12}>
                <Paper variant="outlined" sx={{ p: 2 }}>
                  <Typography variant="subtitle1" gutterBottom>
                    Contact Information
                  </Typography>
                  <Typography variant="body2">
                    Email: {formData.email}
                  </Typography>
                  <Typography variant="body2">
                    Cell Phone: {formData.cellPhone}
                  </Typography>
                  <Typography variant="body2">
                    Address: {formData.address.streetName}, {formData.address.city}, {formData.address.state} {formData.address.zip}
                  </Typography>
                </Paper>
              </Grid>

              <Grid item xs={12}>
                <Paper variant="outlined" sx={{ p: 2 }}>
                  <Typography variant="subtitle1" gutterBottom>
                    Work Authorization
                  </Typography>
                  <Typography variant="body2">
                    {formData.workAuthorization.isPermanentResidentOrCitizen
                      ? `Type: ${formData.workAuthorization.residentType}`
                      : `Visa Type: ${formData.workAuthorization.visaType}`}
                  </Typography>
                </Paper>
              </Grid>

              <Grid item xs={12}>
                <Paper variant="outlined" sx={{ p: 2 }}>
                  <Typography variant="subtitle1" gutterBottom>
                    Documents
                  </Typography>
                  <Typography variant="body2">
                    Profile Picture: {files.profilePicture ? '✓ Uploaded' : '✗ Not uploaded'}
                  </Typography>
                  <Typography variant="body2">
                    Driver's License: {files.driverLicense ? '✓ Uploaded' : '✗ Not uploaded'}
                  </Typography>
                  {!formData.workAuthorization.isPermanentResidentOrCitizen && (
                    <Typography variant="body2">
                      Work Authorization: {files.workAuthorization ? '✓ Uploaded' : '✗ Not uploaded'}
                    </Typography>
                  )}
                </Paper>
              </Grid>
            </Grid>
          );
        }

      default:
        return null;
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h4">Onboarding Application</Typography>
          <StatusBadge status={status} size="large" />
        </Box>

        {status === 'Rejected' && profile?.feedback && (
          <Alert severity="error" sx={{ mb: 2 }}>
            <Typography variant="subtitle2" gutterBottom>
              HR Feedback:
            </Typography>
            {profile.feedback}
          </Alert>
        )}

        <Stepper activeStep={activeStep} sx={{ mb: 3 }}>
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

        <form onSubmit={handleSubmit(onSubmit)}>
          {renderStepContent(activeStep)}

          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
            <Button
              disabled={activeStep === 0}
              onClick={handleBack}
              sx={{ mr: 1 }}
            >
              Back
            </Button>

            <Box>
              {activeStep === steps.length - 1 ? (
                <Button
                  variant="contained"
                  type="submit"
                  disabled={status === 'Pending' || loading}
                >
                  {loading ? <CircularProgress size={24} /> : 'Submit Application'}
                </Button>
              ) : (
                <Button
                  variant="contained"
                  onClick={handleNext}
                  disabled={status === 'Pending'}
                >
                  Next
                </Button>
              )}
            </Box>
          </Box>
        </form>
      </Paper>
    </Box>
  );
};

export default Onboarding;