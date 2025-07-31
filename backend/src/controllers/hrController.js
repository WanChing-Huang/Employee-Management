// backend/src/controllers/hr.controller.js
import UserProfile from '../models/UserProfile.js';
import Document from '../models/Document.js';
import User from '../models/User.js';
import RegistrationToken from '../models/RegistrationToken.js';

// Get dashboard statistics
export const getDashboardStats = async (req, res) => {
  try {
    if (req.user.role !== 'hr') {
      return res.status(403).json({
        success: false,
        error: 'Access denied'
      });
    }

    const [
      totalEmployees,
      pendingApplications,
      visaEmployees,
      activeTokens
    ] = await Promise.all([
      User.countDocuments({ role: 'employee' }),
      UserProfile.countDocuments({ status: 'Pending' }),
      UserProfile.countDocuments({ 
        'workAuthorization.visaType': { $exists: true, $ne: null },
        'workAuthorization.isPermanentResidentOrCitizen': false
      }),
      RegistrationToken.countDocuments({ 
        used: false, 
        expiresAt: { $gt: new Date() } 
      })
    ]);

    res.json({
        totalEmployees,
        pendingApplications,
        visaEmployees,
        activeTokens 
    });
  } catch (error) {
    console.error('Error fetching dashboard statistics:', error);
     res.status(500).json({ error: 'Error fetching dashboard statistics' });
  }
};

// Get visa status management - In Progress
export const getVisaStatusInProgress = async (req, res) => {
  try {
    // Find all employees with F1(CPT/OPT) visa
    const optEmployees = await UserProfile.find({
      'workAuthorization.visaType': 'F1(CPT/OPT)',
      status: 'Approved'
    }).populate('user', 'email firstName lastName');

    const inProgressList = [];

    for (const employee of optEmployees) {
      const documents = await Document.findOne({ userProfile: employee._id });
      const visaDocuments = documents?.visaDocuments || [];

      // Check document status
      const requiredDocs = ['OPT Receipt', 'OPT EAD', 'I-983', 'I-20'];
      let nextStep = null;
      let currentStatus = null;

      // Check if all documents are approved
      const allApproved = requiredDocs.every(docType => {
        const doc = visaDocuments.find(d => d.type === docType);
        return doc && doc.status === 'Approved';
      });

      if (allApproved) {
        continue; // Skip if all documents are approved
      }

      // Determine next step
      for (const docType of requiredDocs) {
        const doc = visaDocuments.find(d => d.type === docType);
        
        if (!doc) {
          nextStep = `Upload ${docType}`;
          currentStatus = `Waiting for ${docType}`;
          break;
        } else if (doc.status === 'Pending') {
          nextStep = `Review ${docType}`;
          currentStatus = `${docType} pending review`;
          break;
        } else if (doc.status === 'Rejected') {
          nextStep = `Resubmit ${docType}`;
          currentStatus = `${docType} rejected`;
          break;
        }
      }

      // Calculate days remaining
      const endDate = new Date(employee.workAuthorization.endDate);
      const today = new Date();
      const daysRemaining = Math.floor((endDate - today) / (1000 * 60 * 60 * 24));

      inProgressList.push({
        _id: employee._id,
        name: `${employee.firstName} ${employee.lastName}`,
        email: employee.email,
        workAuthorization: {
          type: employee.workAuthorization.visaType,
          startDate: employee.workAuthorization.startDate,
          endDate: employee.workAuthorization.endDate
        },
        daysRemaining,
        nextStep,
        currentStatus,
        documents: visaDocuments
      });
    }

    // Add employees who haven't submitted onboarding yet
    const pendingTokens = await RegistrationToken.find({ 
      used: false,
      expiresAt: { $gt: new Date() }
    });

    for (const token of pendingTokens) {
      const user = await User.findByEmail(token.email);
      if (!user) {
        inProgressList.push({
          email: token.email,
          name: 'Not Registered',
          nextStep: 'Complete Registration',
          currentStatus: 'Registration token sent',
          workAuthorization: { type: 'Unknown' }
        });
      }
    }

    // Add employees with pending onboarding
    const pendingOnboarding = await UserProfile.find({ 
      status: 'Pending' 
    }).populate('user', 'email firstName lastName');

    for (const profile of pendingOnboarding) {
      inProgressList.push({
        _id: profile._id,
        name: `${profile.firstName} ${profile.lastName}`,
        email: profile.email,
        nextStep: 'Review Onboarding Application',
        currentStatus: 'Onboarding application pending',
        workAuthorization: profile.workAuthorization || { type: 'Unknown' }
      });
    }

    res.json(inProgressList);
  } catch (error) {
    console.error('Error fetching visa status in progress:', error);
     res.status(500).json({ error: 'Error fetching visa status in progress' });
  }
};

// Get visa status management - All
export const getVisaStatusAll = async (req, res) => {
  try {
    const { search } = req.query;

    // Build search query
    let query = {
      'workAuthorization.isPermanentResidentOrCitizen': false,
      status: 'Approved'
    };

    if (search) {
      const searchRegex = new RegExp(search, 'i');
      query.$or = [
        { firstName: searchRegex },
        { lastName: searchRegex },
        { preferredName: searchRegex },
        { email: searchRegex }
      ];
    }

    const employees = await UserProfile.find(query)
      .populate('user', 'email')
      .sort('lastName firstName');

    const employeesWithDocuments = [];

    for (const employee of employees) {
      const documents = await Document.findOne({ userProfile: employee._id });
      const visaDocuments = documents?.visaDocuments || [];

      // Calculate days remaining
      const endDate = new Date(employee.workAuthorization.endDate);
      const today = new Date();
      const daysRemaining = Math.floor((endDate - today) / (1000 * 60 * 60 * 24));

      employeesWithDocuments.push({
        _id: employee._id,
        name: `${employee.firstName} ${employee.lastName}`,
        email: employee.email,
        workAuthorization: {
          type: employee.workAuthorization.visaType,
          startDate: employee.workAuthorization.startDate,
          endDate: employee.workAuthorization.endDate
        },
        daysRemaining,
        visaDocuments: visaDocuments.filter(doc => doc.status === 'Approved')
      });
    }

    res.json(
       employeesWithDocuments
    );
  } catch (error) {
    console.error('Error fetching all visa status:', error);
    res.status(500).json({ error: 'Error fetching all visa status' });
  }
};

// Get employee for visa document review
export const getEmployeeForReview = async (req, res, next) => {
  try {

    const { employeeId } = req.params;

    const employee = await UserProfile.findById(employeeId)
      .populate('user', 'email firstName lastName');

    if (!employee) {
      return res.status(404).json({
        success: false,
        error: 'Employee not found'
      });
    }

    const documents = await Document.findOne({ userProfile: employee._id });

    res.json({
        employee,
        documents: documents?.visaDocuments || []   
    });
  } catch (error) {
    console.error('Error fetching employee for review:', error);
    res.status(500).json({ error: 'Error fetching employee for review' });
  }
};

// Search employees
export const searchEmployees = async (req, res) => {
  try {
    if (req.user.role !== 'hr') {
      return res.status(403).json({
        success: false,
        error: 'Access denied'
      });
    }

    const { query } = req.query;

    if (!query || query.length < 2) {
      return res.json({
        success: true,
        data: []
      });
    }

    const searchRegex = new RegExp(query, 'i');
    
    const profiles = await UserProfile.find({
      $or: [
        { firstName: searchRegex },
        { lastName: searchRegex },
        { preferredName: searchRegex },
        { email: searchRegex }
      ]
    })
    .populate('user', 'username email')
    .limit(10)
    .lean();

    res.json(profiles);
  } catch (error) {
    console.error('Error searching employees:', error);
   res.status(500).json({ error: 'Error searching employees' });
  }
};

// Get employee summary for profiles page
export const getEmployeeSummary = async (req, res) => {
  try {
    if (req.user.role !== 'hr') {
      return res.status(403).json({
        success: false,
        error: 'Access denied'
      });
    }

    const employees = await UserProfile.find({ status: 'Approved' })
      .populate('user', 'email')
      .sort('lastName firstName')
      .select('firstName lastName ssn workAuthorization cellPhone email')
      .lean();

    const summary = employees.map(emp => ({
      _id: emp._id,
      fullName: `${emp.firstName} ${emp.lastName}`,
      ssn: emp.ssn ? `***-**-${emp.ssn.slice(-4)}` : 'N/A',
      workAuthorizationType: emp.workAuthorization?.isPermanentResidentOrCitizen 
        ? emp.workAuthorization.residentType 
        : emp.workAuthorization?.visaType || 'N/A',
      phone: emp.cellPhone || 'N/A',
      email: emp.email
    }));

    res.json({
        total: summary.length,
        employees: summary
      
    });
  } catch (error) {
    console.error('Error fetching employee summary:', error);
    res.status(500).json({ error: 'Error fetching employee summary' });
  }
};

// Delete user (example from your request)
export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const hrUser = req.user;

    // Check if user is HR
    if (hrUser.role !== 'hr') {
      return res.status(403).json({ error: 'Only HR representatives can delete users' });
    }

    const user = await User.findByIdAndDelete(id);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Also delete associated UserProfile and Documents
    await UserProfile.deleteOne({ user: id });
    const profile = await UserProfile.findOne({ user: id });
    if (profile) {
      await Document.deleteOne({ userProfile: profile._id });
    }

    res.json({
      message: 'User deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ error: 'Failed to delete user' });
  }
};

// Get all users
export const getAllUsers = async (req, res) => {
  try {
    const hrUser = req.user;

    const users = await User.find({}).select('-password');

    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
};

