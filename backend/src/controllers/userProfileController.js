// backend/src/controllers/userProfile.controller.js
import UserProfile from '../models/UserProfile.js';
import Document from '../models/Document.js';
import { uploadFile } from '../services/uploadService.js';

// Get current user's profile/onboarding application
export const getMyProfile = async (req, res) => {
  try {
    const userProfile = await UserProfile.findOne({ user: req.user.userId })
      .populate('user', 'username email firstName lastName role');

    if (!userProfile) {
      return res.json({
        success: true,
        data: {
          status: 'Never Submitted',
          profile: null
        }
      });
    }

    // Get associated documents
    const documents = await Document.findOne({ userProfile: userProfile._id });

    res.json({

      status: userProfile.status,
      userProfile,
      documents

    });
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({
      error: 'Error fetching user profile',
      details: error.message
    });
  }
};

// Submit or update onboarding application
export const submitOnboardingApplication = async (req, res) => {
  try {
    const userId = req.user.userId;
    const profileData = req.body;

    // Check if profile exists
    let userProfile = await UserProfile.findOne({ user: userId });

    if (userProfile) {
      // Can only update if status is 'Never Submitted' or 'Rejected'
      if (userProfile.status === 'Approved') {
        return res.status(400).json({
          success: false,
          error: 'Cannot modify approved application'
        });
      }

      if (userProfile.status === 'Pending') {
        return res.status(400).json({
          success: false,
          error: 'Cannot modify pending application'
        });
      }

      // Update existing profile
      Object.assign(userProfile, profileData);
      userProfile.status = 'Pending';
      userProfile.feedback = ''; // Clear previous feedback
      await userProfile.save();
    } else {
      // Create new profile
      userProfile = await UserProfile.create({
        user: userId,
        ...profileData,
        status: 'Pending'
      });
    }

    // Handle file uploads if any
    if (req.files) {
      let documents = await Document.findOne({ userProfile: userProfile._id });
      if (!documents) {
        documents = await Document.create({ userProfile: userProfile._id });
      }

      // Profile picture
      if (req.files.profilePicture) {
        const profilePicPath = await uploadFile(req.files.profilePicture, 'profiles');
        userProfile.profilePicture = profilePicPath;
        await userProfile.save();
      }

      // Driver's license
      if (req.files.driverLicense) {
        const driverLicensePath = await uploadFile(req.files.driverLicense, 'documents/driver-licenses');
        documents.driverLicense = {
          file: driverLicensePath,
          uploadedAt: new Date()
        };
      }

      // Work authorization documents
      if (req.files.workAuthorization) {
        const workAuthPath = await uploadFile(req.files.workAuthorization, 'documents/work-authorizations');

        // Determine document type based on visa type
        const visaType = profileData.workAuthorization?.visaType;
        if (visaType === 'F1(CPT/OPT)') {
          documents.visaDocuments.push({
            type: 'OPT Receipt',
            file: workAuthPath,
            status: 'Pending'
          });
        }
      }

      await documents.save();
    }

    res.json({
      message: 'Onboarding application submitted successfully',
      profile: userProfile,
      status: userProfile.status

    });
  } catch (error) {
    console.error('Error submitting onboarding application:', error);
    res.status(500).json({
      error: 'Error submitting onboarding application',
      details: error.message
    });
  }
};

// Update personal information (for approved users)
export const updatePersonalInfo = async (req, res) => {
  try {
    const userId = req.user.userId;
    const section = req.params.section;
    const updates = req.body;

    const userProfile = await UserProfile.findOne({ user: userId });

    if (!userProfile) {
      return res.status(404).json({
        success: false,
        error: 'Profile not found'
      });
    }

    if (userProfile.status !== 'Approved') {
      return res.status(400).json({
        success: false,
        error: 'Can only update personal information after onboarding is approved'
      });
    }

    // Update specific section
    const allowedSections = ['name', 'address', 'contact', 'employment', 'emergencyContacts'];
    if (!allowedSections.includes(section)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid section'
      });
    }

    // Handle different sections
    switch (section) {
      case 'name':
        userProfile.firstName = updates.firstName || userProfile.firstName;
        userProfile.lastName = updates.lastName || userProfile.lastName;
        userProfile.middleName = updates.middleName || userProfile.middleName;
        userProfile.preferredName = updates.preferredName || userProfile.preferredName;
        userProfile.ssn = updates.ssn || userProfile.ssn;
        userProfile.dateOfBirth = updates.dateOfBirth || userProfile.dateOfBirth;
        userProfile.gender = updates.gender || userProfile.gender;
        break;

      case 'address':
        userProfile.address = { ...userProfile.address, ...updates };
        break;

      case 'contact':
        userProfile.cellPhone = updates.cellPhone || userProfile.cellPhone;
        userProfile.workPhone = updates.workPhone || userProfile.workPhone;
        break;

      case 'employment':
        userProfile.workAuthorization = {
          ...userProfile.workAuthorization,
          ...updates.workAuthorization
        };
        break;

      case 'emergencyContacts':
        userProfile.emergencyContacts = updates.emergencyContacts;
        break;
    }

    await userProfile.save();

    res.json({
      message: 'Personal information updated successfully',
      userProfile
    });
  } catch (error) {
    console.error('Error updating personal information:', error);
    res.status(500).json({
      error: 'Error updating personal information',
      details: error.message
    });
  }
};

// Get all employee profiles (HR only)
export const getAllProfiles = async (req, res) => {
  try {
    const { search, page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    // Build search query
    let query = {};
    if (search) {
      const searchRegex = new RegExp(search, 'i');
      query = {
        $or: [
          { firstName: searchRegex },
          { lastName: searchRegex },
          { preferredName: searchRegex },
          { email: searchRegex }
        ]
      };
    }

    const profiles = await UserProfile.find(query)
      .populate('user', 'username email role')
      .sort('lastName firstName')
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    const total = await UserProfile.countDocuments(query);

    res.json({

      profiles,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / limit),
        limit: parseInt(limit)
      }

    });
  } catch (error) {
    console.error('Error fetching employee profiles:', error);
    res.status(500).json({
      error: 'Error fetching employee profiles',
      details: error.message
    });
  }
};

// Get specific employee profile (HR only)
export const getEmployeeProfile = async (req, res) => {
  try {

    const { profileId } = req.params;

    const profile = await UserProfile.findById(profileId)
      .populate('user', 'username email role firstName lastName');

    if (!profile) {
      return res.status(404).json({
        success: false,
        error: 'Profile not found'
      });
    }

    // Get documents
    const documents = await Document.findOne({ userProfile: profile._id });

    res.json({
      profile,
      documents
    });
  } catch (error) {
    console.error('Error fetching employee profile:', error);
    res.status(500).json({
      error: 'Error fetching employee profile',
      details: error.message
    });
  }
};

// Review onboarding application (HR only)
export const reviewApplication = async (req, res) => {
  try {

    const { profileId } = req.params;
    const { action, feedback } = req.body;

    if (!['approve', 'reject'].includes(action)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid action. Must be "approve" or "reject"'
      });
    }

    const profile = await UserProfile.findById(profileId);
    if (!profile) {
      return res.status(404).json({
        success: false,
        error: 'Profile not found'
      });
    }

    if (profile.status !== 'Pending') {
      return res.status(400).json({
        success: false,
        error: 'Can only review pending applications'
      });
    }

    // Update status
    profile.status = action === 'approve' ? 'Approved' : 'Rejected';
    profile.feedback = feedback || '';
    await profile.save();

    // If approved and has F1(CPT/OPT), initialize visa documents
    if (action === 'approve' && profile.workAuthorization?.visaType === 'F1(CPT/OPT)') {
      const documents = await Document.findOne({ userProfile: profile._id });
      if (documents && documents.visaDocuments.length > 0) {
        // Approve the OPT Receipt if it exists
        const optReceipt = documents.visaDocuments.find(doc => doc.type === 'OPT Receipt');
        if (optReceipt) {
          optReceipt.status = 'Approved';
          await documents.save();
        }
      }
    }

    res.json({
      message: `Application ${action}d successfully`,
      profile
    });
  } catch (error) {
    console.error('Error reviewing application:', error);
    res.status(500).json({
      error: 'Error reviewing application',
      details: error.message
    });
  }
};

// Get applications by status (HR only)
export const getApplicationsByStatus = async (req, res) => {
  try {
    if (req.user.role !== 'hr') {
      return res.status(403).json({
        success: false,
        error: 'Access denied'
      });
    }

    const { status } = req.params;
    const validStatuses = ['Pending', 'Approved', 'Rejected'];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid status'
      });
    }

    const profiles = await UserProfile.find({ status })
      .populate('user', 'username email firstName lastName')
      .sort('-updatedAt')
      .lean();

    res.json(profiles);
  } catch (error) {
    console.error('Error fetching applications by status:', error);
    res.status(500).json({
      error: 'Error fetching applications by status',
      details: error.message
    });
  }
};