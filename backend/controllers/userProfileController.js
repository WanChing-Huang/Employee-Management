import UserProfile from '../models/UserProfile.js';
import User from '../models/User.js';
import RegistrationToken from '../models/RegistrationToken.js';

// Create new user profile record
export const createUserProfile = async (req, res) => {
  try {
    const {
      token, // registration token
      firstName,
      lastName,
      middleName,
      preferredName,
      address,
      cellPhone,
      workPhone,
      ssn,
      dateOfBirth,
      gender,
      workAuthorization,
      reference,
      emergencyContacts,
      documents
    } = req.body;

    // Validate registration token and get user info
    const registrationToken = await RegistrationToken.findOne({ token, used: false });
    if (!registrationToken) {
      return res.status(400).json({ error: 'Invalid or expired registration token' });
    }

    // Get user from token email
    const user = await User.findOne({ email: registrationToken.email });
    if (!user) {
      return res.status(400).json({ error: 'User not found' });
    }

    // Create user profile record with pre-filled data from registration token
    const userProfileData = {
      user: user._id,
      email: user.email, // pre-filled from registration token
      firstName: firstName || user.firstName, // pre-filled if available
      lastName: lastName || user.lastName, // pre-filled if available
      middleName,
      preferredName,
      address,
      cellPhone,
      workPhone,
      ssn,
      dateOfBirth,
      gender,
      workAuthorization,
      reference,
      emergencyContacts,
      documents
    };

    const userProfile = new UserProfile(userProfileData);
    await userProfile.save();

    // Mark token as used
    registrationToken.used = true;
    await registrationToken.save();

    res.status(201).json({
      message: 'User profile created successfully',
      userProfile
    });

  } catch (error) {
    console.error('Error creating user profile:', error);
    res.status(400).json({ 
      error: 'Failed to create user profile',
      details: error.message 
    });
  }
};

// Get user profile by user ID
export const getUserProfileByUser = async (req, res) => {
  try {
    const { userId } = req.params;
    
    const userProfile = await UserProfile.findOne({ user: userId })
      .populate('user', 'email firstName lastName');
    
    if (!userProfile) {
      return res.status(404).json({ error: 'User profile not found' });
    }

    res.json(userProfile);
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({ error: 'Failed to fetch user profile' });
  }
};

// Update user profile
export const updateUserProfile = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Don't allow updating pre-filled fields
    delete updateData.email;
    delete updateData.firstName;
    delete updateData.lastName;

    const userProfile = await UserProfile.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!userProfile) {
      return res.status(404).json({ error: 'User profile not found' });
    }

    res.json({
      message: 'User profile updated successfully',
      userProfile
    });
  } catch (error) {
    console.error('Error updating user profile:', error);
    res.status(400).json({ 
      error: 'Failed to update user profile',
      details: error.message 
    });
  }
};

// Handle file uploads for user profile
export const uploadUserProfileDocument = async (req, res) => {
  try {
    const { id } = req.params;
    const { documentType } = req.body; // 'profilePicture', 'optReceipt', 'driverLicense', 'workAuthorization'
    
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const userProfile = await UserProfile.findById(id);
    if (!userProfile) {
      return res.status(404).json({ error: 'User profile not found' });
    }

    // Update the appropriate field based on document type
    switch (documentType) {
      case 'profilePicture':
        userProfile.profilePicture = req.file.filename;
        break;
      case 'optReceipt':
        userProfile.workAuthorization.optReceipt = req.file.filename;
        break;
      case 'driverLicense':
        userProfile.documents.driverLicense = req.file.filename;
        break;
      case 'workAuthorization':
        userProfile.documents.workAuthorization = req.file.filename;
        break;
      default:
        return res.status(400).json({ error: 'Invalid document type' });
    }

    await userProfile.save();

    res.json({
      message: 'Document uploaded successfully',
      filename: req.file.filename
    });
  } catch (error) {
    console.error('Error uploading document:', error);
    res.status(500).json({ error: 'Failed to upload document' });
  }
};

// Get all user profiles (for HR/admin)
export const getAllUserProfiles = async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    
    const filter = {};
    if (status) filter.status = status;

    const userProfiles = await UserProfile.find(filter)
      .populate('user', 'email firstName lastName')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await UserProfile.countDocuments(filter);

    res.json({
      userProfiles,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Error fetching user profiles:', error);
    res.status(500).json({ error: 'Failed to fetch user profiles' });
  }
};

// Update user profile status (for HR/admin)
export const updateUserProfileStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, feedback } = req.body;

    const userProfile = await UserProfile.findByIdAndUpdate(
      id,
      { status, feedback },
      { new: true, runValidators: true }
    );

    if (!userProfile) {
      return res.status(404).json({ error: 'User profile not found' });
    }

    res.json({
      message: 'User profile status updated successfully',
      userProfile
    });
  } catch (error) {
    console.error('Error updating user profile status:', error);
    res.status(400).json({ error: 'Failed to update user profile status' });
  }
}; 