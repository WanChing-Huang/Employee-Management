import User from '../models/User.js';
import UserProfile from '../models/UserProfile.js';
import RegistrationToken from '../models/RegistrationToken.js';
import { sendEmail } from '../services/emailService.js';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';

// Generate registration token and send email 
// (HR only)
export const generateRegistrationToken = async (req, res) => {
  try {
    const { email } = req.body;
    const hrUser = req.user;

    // Check if user is HR
    if (hrUser.role !== 'hr') {
      return res.status(403).json({ error: 'Only HR representatives can generate registration tokens' });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    // Check if user already exists
    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      return res.status(400).json({ error: 'User with this email already exists' });
    }

    // Check if token already exists for this email
    const existingToken = await RegistrationToken.findOne({ email });
    if (existingToken) {
      return res.status(400).json({ error: 'Registration token already exists for this email' });
    }

    // Generate unique token
    const token = crypto.randomBytes(32).toString('hex');

    // Set expiration (3 hours from now)
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 3);

    // Create registration token
    const registrationToken = new RegistrationToken({
      email,
      token,
      expiresAt,
      used: false
    });

    await registrationToken.save();

    // Create registration link  
    // //TODO:frontend route
    const registrationLink = `${process.env.FRONTEND_URL}/register?token=${token}`;

    // Email content

     await sendEmail({
      to: email,
      subject: 'Employee Registration Invitation',
      html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Welcome to Our Company!</h2>
          <p>You have been invited to join our employee management system.</p>
          <p>Please click the link below to complete your registration:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${registrationLink}" 
               style="background-color: #007bff; color: white; padding: 12px 24px; 
                      text-decoration: none; border-radius: 5px; display: inline-block;">
              Complete Registration
            </a>
          </div>
          <p><strong>Important:</strong></p>
          <ul>
            <li>This link will expire in 3 hours</li>
            <li>You can only use this link once</li>
            <li>Please complete your registration before the link expires</li>
          </ul>
          <p>If you have any questions, please contact HR.</p>
          <hr>
          <p style="font-size: 12px; color: #666;">
            This is an automated message. Please do not reply to this email.
          </p>
        </div>
      ` 
    });
    
    res.status(201).json({
      message: 'Registration token generated and email sent successfully',
      email,
      expiresAt
    });

  } catch (error) {
    console.error('Error generating registration token:', error);
    res.status(500).json({
      error: 'Failed to generate registration token',
      details: error.message
    });
  }
};

// Validate registration token
export const validateRegistrationToken = async (req, res) => {
  try {
    const { token } = req.params;

    const registrationToken = await RegistrationToken.findOne({
      token,
      used: false,
      expiresAt: { $gt: new Date() }
    });

    if (!registrationToken) {
      return res.status(400).json({ error: 'Invalid or expired registration token' });
    }

    res.json({
      valid: true,
      email: registrationToken.email
    });

  } catch (error) {
    console.error('Error validating registration token:', error);
    res.status(500).json({ error: 'Failed to validate registration token' });
  }
};

// Register new user with token
export const registerUser = async (req, res) => {
  try {
    const { token, email, username, password, firstName, lastName } = req.body;

    // Validate registration token
    const registrationToken = await RegistrationToken.findOne({
      token,
      used: false,
      expiresAt: { $gt: new Date() }
    });

    if (!registrationToken) {
      return res.status(400).json({ error: 'Invalid or expired registration token' });
    }

    // Check if email matches token
    if (registrationToken.email !== email) {
      return res.status(400).json({ error: 'Email does not match registration token' });
    }

    // Check if username is unique
    const usernameExists = await User.usernameExists(username);
    if (usernameExists) {
      return res.status(400).json({ error: 'Username already exists' });
    }

    // Check if email is unique
    const emailExists = await User.emailExists(email);
    if (emailExists) {
      return res.status(400).json({ error: 'Email already exists' });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    // Validate password
    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    // Validate username
    if (username.length < 3 || username.length > 30) {
      return res.status(400).json({ error: 'Username must be between 3 and 30 characters' });
    }

    // Create new user
    const user = new User({
      username,
      email,
      password,
      firstName,
      lastName,
      role: 'employee' // Default role for new registrations
    });

    await user.save();

    // Create user profile automatically
    const userProfile = new UserProfile({
      user: user._id,
      email: user.email,
      firstName: firstName || user.lastName||'',
      lastName: lastName || user.lastName||'',
      status: 'Pending'
    });

    await userProfile.save();

    // Mark token as used
    registrationToken.used = true;
    await registrationToken.save();

    // Generate JWT token for the new user
    const jwtToken = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES || '15d' }
    );

    res.status(201).json({
      message: 'User registered successfully',
      user: user.getPublicProfile(),
      token: jwtToken,
    });

  } catch (error) {
    console.error('Error registering user:', error);
    res.status(400).json({
      error: 'Failed to register user',
      details: error.message
    });
  }
};

// Login user
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await User.findByEmail(email);
    if (!user) {
      return res.status(401).json({ error: 'Invalid email' });
    }

    // Check password
    const isPasswordValid = await user.matchPassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE || '20d' }
    );

    // Get user profile status
    const userProfile = await UserProfile.findOne({ user: user._id });
    const profileStatus = userProfile ? userProfile.status : 'Pending';

    //use backend to determine redirect path
    let redirectTo = '/dashboard';
    if (user.role === 'hr') {
      redirectTo = '/hr/dashboard';
    } else if (['Never Submitted', 'Rejected', 'Pending'].includes(profileStatus)) {
      redirectTo = '/onboarding';
    }

    res.json({
      message: 'Login successful',
      profileStatus, //or handle redirect in frontend
      user: user.getPublicProfile(),
      //or if hr redirect to hr dashboard || employee determine by profile status
      token,
      redirectTo
    });

  } catch (error) {
    console.error('Error logging in user:', error);
    res.status(500).json({ error: 'Failed to login user' });
  }
};

export const logoutUser = async (req, res) => {
  try {
    // Invalidate the user's session or token here if needed
    res.json({
      message: 'Logout successful'
    });
  } catch (error) {
    console.error('Error logging out user:', error);
    res.status(500).json({ error: 'Failed to logout user' });
  }
}

// Get user by ID
export const getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id).select('-password');

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
};

// // Update user role (HR only or self)
// export const updateUser = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const updateData = req.body;
//     const currentUser = req.user;

//     // Check permissions
//     if (currentUser.role !== 'hr' && currentUser._id.toString() !== id) {
//       return res.status(403).json({ error: 'You can only update your own profile' });
//     }

//     // Don't allow updating password through this endpoint
//     delete updateData.password;

//     const user = await User.findByIdAndUpdate(
//       id,
//       updateData,
//       { new: true, runValidators: true }
//     ).select('-password');

//     if (!user) {
//       return res.status(404).json({ error: 'User not found' });
//     }

//     res.json({
//       message: 'User updated successfully',
//       user
//     });
//   } catch (error) {
//     console.error('Error updating user:', error);
//     res.status(400).json({ 
//       error: 'Failed to update user',
//       details: error.message 
//     });
//   }
// };




// Update user role (HR only)
export const updateUserRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;
    const hrUser = req.user;


    // Validate role
    if (!['employee', 'hr'].includes(role)) {
      return res.status(400).json({ error: 'Invalid role. Must be "employee" or "hr"' });
    }

    // Prevent HR from removing their own HR role
    if (hrUser._id.toString() === id && role === 'employee') {
      return res.status(400).json({ error: 'You cannot remove your own HR role' });
    }

    const user = await User.findByIdAndUpdate(
      id,
      { role },
      { new: true, runValidators: true }
    ).select('-password'); //exclude password


    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      message: 'User role updated successfully',
      user
    });
  } catch (error) {
    console.error('Error updating user role:', error);
    res.status(400).json({
      error: 'Failed to update user role',
      details: error.message
    });
  }
};

// Get all registration tokens (HR only)
export const getRegistrationTokens = async (req, res) => {
  try {
    if (req.user.role !== 'hr') {
      return res.status(403).json({
        success: false,
        error: 'Access denied'
      });
    }

    const tokens = await RegistrationToken.find()
      .sort('-createdAt')
      .lean();

    // Add status for each token
    const tokensWithStatus = await Promise.all(
      tokens.map(async (token) => {
        const user = await User.findByEmail(token.email);
        return {
          ...token,
          status: token.used ? 'Used' :
            token.expiresAt < new Date() ? 'Expired' :
              'Active',
          hasRegistered: !!user
        };
      })
    );

    res.json({
      success: true,
      data: tokensWithStatus
    });
  } catch (error) {
    console.error('Error fetching registration tokens:', error);
    res.status(500).json({ error: 'Failed get all registration tokens' });
  }
};

