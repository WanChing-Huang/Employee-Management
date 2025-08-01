import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useForm, Controller } from 'react-hook-form';

import {
  Box,
  Paper,
  Typography,
  Grid,
  Button,
  Divider,
  IconButton,
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
import {
  Edit,
  Save,
  Cancel,
  ExpandMore,
  Person,
  Phone,
  Home,
  Work,
  ContactPhone,
  InsertDriveFile,
  Download,
  Visibility,
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';

import { fetchMyProfile, updatePersonalInfo } from '../store/profileSlice';
import { fetchMyDocuments } from '../store/documentSlice';
import FormInput from '../components/FormInput';
import FileUpload from '../components/FileUpload';
import DocumentViewer from '../components/DocumentViewer';
import { GENDER_OPTIONS, STATES, EMERGENCY_CONTACT_RELATIONSHIPS } from '../utils/constants';
import { formatPhone, formatSSN, validatePhone, validateSSN, validateZipCode } from '../utils/validators';

const PersonalInfo = () => {
  const dispatch = useDispatch();
  const { profile, loading } = useSelector((state) => state.profile);
  const { documents, profilePicture } = useSelector((state) => state.document);
  const [editSection, setEditSection] = useState(null);
  const [confirmDialog, setConfirmDialog] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [viewDocument, setViewDocument] = useState(false);
                                 //initializing the form with backend data
  const { control, handleSubmit, reset, formState: { errors } } = useForm();
  
  // Fetch profile and documents while the component mounts
  useEffect(() => {
    dispatch(fetchMyProfile());
    dispatch(fetchMyDocuments());
  }, [dispatch]);
  
  // Reset form with profile data when it changes
useEffect(() => {
  if (profile) {
    const fallbackProfile = {
      ...profile,
      gender: profile.gender || '',
      dateOfBirth: profile.dateOfBirth ? new Date(profile.dateOfBirth) : null,
      address: {
        street: profile.address?.street || '',
        apt: profile.address?.apt || '',
        city: profile.address?.city || '',
        state: profile.address?.state || '',
        zipCode: profile.address?.zipCode || '',
      },
      emergencyContacts: (profile.emergencyContacts || []).map((contact) => ({
        firstName: contact.firstName || '',
        lastName: contact.lastName || '',
        phone: contact.phone || '',
        email: contact.email || '',
        relationship: contact.relationship || '',
      })),
    };

    reset(fallbackProfile);
  }
}, [profile, reset]);

 

  const handleEdit = (section) => {
    setEditSection(section);
    reset(profile);
  };

  const handleCancel = () => {
    if (Object.keys(errors).length > 0) {
      setConfirmDialog(true); //show dialog if there are errors
    } else {
      setEditSection(null);
      reset(profile);
    }
  };

  const handleConfirmCancel = () => {
    setConfirmDialog(false);
    setEditSection(null);
    reset(profile);
  };

  const handleSave = async (data) => {
    try {
      const sectionData = getSectionData(editSection, data);
      await dispatch(updatePersonalInfo({ section: editSection, data: sectionData })).unwrap();
      setEditSection(null);
    } catch (error) {
      console.error('Error updating personal info:', error);
    }
  };
  
  // Function to get the data for the specific section being edited
  const getSectionData = (section, data) => {
    switch (section) {
      case 'name':
        return {
          firstName: data.firstName,
          lastName: data.lastName,
          middleName: data.middleName,
          preferredName: data.preferredName,
          ssn: data.ssn,
          dateOfBirth: data.dateOfBirth,
          gender: data.gender,
        };
      case 'address':
        return data.address;
      case 'contact':
        return {
          cellPhone: data.cellPhone,
          workPhone: data.workPhone,
        };
      case 'employment':
        return {
          workAuthorization: data.workAuthorization,
        };
      case 'emergencyContacts':
        return {
          emergencyContacts: data.emergencyContacts,
        };
      default:
        return {};
    }
  };

  const handleViewDocument = (doc) => {
    setSelectedDocument(doc);
    setViewDocument(true);
  };

  const sections = [
    {
      id: 'name',
      title: 'Personal Information',
      icon: <Person />,
      fields: (
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <FormInput
              name="firstName"
              control={control}
              label="First Name"
              required
              disabled={editSection !== 'name'}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <FormInput
              name="lastName"
              control={control}
              label="Last Name"
              required
              disabled={editSection !== 'name'}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <FormInput
              name="middleName"
              control={control}
              label="Middle Name"
              disabled={editSection !== 'name'}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <FormInput
              name="preferredName"
              control={control}
              label="Preferred Name"
              disabled={editSection !== 'name'}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <FormInput
              name="ssn"
              control={control}
              label="SSN"
              required
              disabled={editSection !== 'name'}
              rules={{
                validate: (value) => validateSSN(value) || 'Invalid SSN format',
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
                  value={field.value ?? null}
                  label="Date of Birth"
                  disabled={editSection !== 'name'}
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
              disabled={editSection !== 'name'}
              options={GENDER_OPTIONS}
            />
          </Grid>
        </Grid>
      ),
    },
    {
      id: 'contact',
      title: 'Contact Information',
      icon: <Phone />,
      fields: (
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <FormInput
              name="cellPhone"
              control={control}
              label="Cell Phone"
              required
              disabled={editSection !== 'contact'}
              rules={{
                validate: (value) => validatePhone(value) || 'Invalid phone format',
              }}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <FormInput
              name="workPhone"
              control={control}
              label="Work Phone"
              disabled={editSection !== 'contact'}
            />
          </Grid>
          <Grid item xs={12}>
            <FormInput
              name="email"
              control={control}
              label="Email"
              disabled
            />
          </Grid>
        </Grid>
      ),
    },
    {
      id: 'address',
      title: 'Address',
      icon: <Home />,
      fields: (
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <FormInput
              name="address.street"
              control={control}
              label="Street Address"
              required
              disabled={editSection !== 'address'}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <FormInput
              name="address.apt"
              control={control}
              label="Apt/Suite/Unit"
              disabled={editSection !== 'address'}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <FormInput
              name="address.city"
              control={control}
              label="City"
              required
              disabled={editSection !== 'address'}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <FormInput
              name="address.state"
              control={control}
              label="State"
              select
              required
              disabled={editSection !== 'address'}
              options={STATES.map(state => ({ value: state, label: state }))}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <FormInput
              name="address.zipCode"
              control={control}
              label="ZIP Code"
              required
              disabled={editSection !== 'address'}
              rules={{
                validate: (value) => validateZipCode(value) || 'Invalid ZIP code',
              }}
            />
          </Grid>
        </Grid>
      ),
    },
    {
      id: 'employment',
      title: 'Employment Information',
      icon: <Work />,
      fields: (
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Work Authorization Status
            </Typography>
            {profile?.workAuthorization?.isPermanentResidentOrCitizen ? (
              <Typography>
                {profile.workAuthorization.residentType}
              </Typography>
            ) : (
              <>
                <Typography>
                  Visa Type: {profile?.workAuthorization?.visaType}
                </Typography>
                {profile?.workAuthorization?.visaTitle && (
                  <Typography>
                    Visa Title: {profile.workAuthorization.visaTitle}
                  </Typography>
                )}
                <Typography>
                  Valid from: {profile?.workAuthorization?.startDate && new Date(profile.workAuthorization.startDate).toLocaleDateString()} 
                  {' to '} 
                  {profile?.workAuthorization?.endDate && new Date(profile.workAuthorization.endDate).toLocaleDateString()}
                </Typography>
              </>
            )}
          </Grid>
        </Grid>
      ),
    },
    {
      id: 'emergencyContacts',
      title: 'Emergency Contacts',
      icon: <ContactPhone />,
      fields: (
        <Grid container spacing={2}>
          {profile?.emergencyContacts?.map((contact, index) => (
            <Grid item xs={12} key={index}>
              <Paper variant="outlined" sx={{ p: 2 }}>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={4}>
                    <FormInput
                      name={`emergencyContacts.${index}.firstName`}
                      control={control}
                      label="First Name"
                      required
                      disabled={editSection !== 'emergencyContacts'}
                    />
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <FormInput
                      name={`emergencyContacts.${index}.lastName`}
                      control={control}
                      label="Last Name"
                      required
                      disabled={editSection !== 'emergencyContacts'}
                    />
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <FormInput
                      name={`emergencyContacts.${index}.relationship`}
                      control={control}
                      label="Relationship"
                      select
                      required
                      disabled={editSection !== 'emergencyContacts'}
                      options={EMERGENCY_CONTACT_RELATIONSHIPS.map(rel => ({ value: rel, label: rel }))}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <FormInput
                      name={`emergencyContacts.${index}.phone`}
                      control={control}
                      label="Phone"
                      required
                      disabled={editSection !== 'emergencyContacts'}
                      rules={{
                        validate: (value) => validatePhone(value) || 'Invalid phone format',
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <FormInput
                      name={`emergencyContacts.${index}.email`}
                      control={control}
                      label="Email"
                      required
                      disabled={editSection !== 'emergencyContacts'}
                    />
                  </Grid>
                </Grid>
              </Paper>
            </Grid>
          ))}
        </Grid>
      ),
    },
  ];
 // Header with profile picture and nam
  return (
    <Box>
       
      <Box display="flex" alignItems="center" gap={2} mb={3}>
        <Avatar
          src={`${import.meta.env.VITE_API_URL.replace('/api', '')}/uploads/${profilePicture}`}
          sx={{ width: 80, height: 80 }}
        >
          {profile?.firstName?.[0]}{profile?.lastName?.[0]}
        </Avatar>
        <Typography variant="h4">
          {profile?.firstName} {profile?.lastName}
        </Typography>
      </Box>

      <form onSubmit={handleSubmit(handleSave)}>
        {sections.map((section) => (
          <Accordion key={section.id} defaultExpanded>
            <AccordionSummary expandIcon={<ExpandMore />}>
              <Box display="flex" alignItems="center" gap={1}>
                {section.icon}
                <Typography variant="h6">{section.title}</Typography>
              </Box>
            </AccordionSummary>
            <AccordionDetails>
              {section.fields}
              <Box display="flex" justifyContent="flex-end" gap={1} mt={2}>
                {editSection === section.id ? (
                  <>
                    <Button
                      startIcon={<Cancel />}
                      onClick={handleCancel}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      variant="contained"
                      startIcon={<Save />}
                    >
                      Save
                    </Button>
                  </>
                ) : (
                  <Button
                    startIcon={<Edit />}
                    onClick={() => handleEdit(section.id)}
                    disabled={editSection !== null}
                  >
                    Edit
                  </Button>
                )}
              </Box>
            </AccordionDetails>
          </Accordion>
        ))}
      </form>

      {/* Documents Section */}
      <Accordion defaultExpanded>
        <AccordionSummary expandIcon={<ExpandMore />}>
          <Box display="flex" alignItems="center" gap={1}>
            <InsertDriveFile />
            <Typography variant="h6">Documents</Typography>
          </Box>
        </AccordionSummary>
        <AccordionDetails>
          <List>
            {documents?.driverLicense && (
              <ListItem>
                <ListItemIcon>
                  <InsertDriveFile />
                </ListItemIcon>
                <ListItemText
                  primary="Driver's License"
                  secondary={`Uploaded on ${new Date(documents.driverLicense.uploadedAt).toLocaleDateString()}`}
                />
                <IconButton onClick={() => handleViewDocument(documents.driverLicense)}>
                  <Visibility />
                </IconButton>
              </ListItem>
            )}
            
            {documents?.visaDocuments?.map((doc) => (
              <ListItem key={doc._id}>
                <ListItemIcon>
                  <InsertDriveFile />
                </ListItemIcon>
                <ListItemText
                  primary={doc.type}
                  secondary={`Uploaded on ${new Date(doc.uploadedAt).toLocaleDateString()}`}
                />
                <IconButton onClick={() => handleViewDocument(doc)}>
                  <Visibility />
                </IconButton>
              </ListItem>
            ))}
          </List>
        </AccordionDetails>
      </Accordion>

      {/* Cancel Confirmation Dialog */}
      <Dialog open={confirmDialog} onClose={() => setConfirmDialog(false)}>
        <DialogTitle>Discard Changes?</DialogTitle>
        <DialogContent>
          <Typography>
            You have unsaved changes. Are you sure you want to discard them?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDialog(false)}>Keep Editing</Button>
          <Button onClick={handleConfirmCancel} color="error">
            Discard Changes
          </Button>
        </DialogActions>
      </Dialog>

      {/* Document Viewer */}
      {selectedDocument && (
        <DocumentViewer
          document={selectedDocument}
          open={viewDocument}
          onClose={() => {
            setViewDocument(false);
            setSelectedDocument(null);
          }}
        />
      )}
    </Box>
  );
};

export default PersonalInfo;