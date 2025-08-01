// backend/src/controllers/document.controller.js
import path from 'path';
import fs from 'fs/promises';
import Document from '../models/Document.js';
import UserProfile from '../models/UserProfile.js';
import { uploadFile, deleteFile } from '../services/uploadService.js';
import { sendEmail } from '../services/emailService.js';

// Upload document
export const uploadDocument = async (req, res) => {
  try {
    const { type } = req.body;
    const userId = req.user.userId;

    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No file uploaded'
      });
    }

    // Get user profile
    const userProfile = await UserProfile.findOne({ user: userId });
    if (!userProfile) {
      return res.status(404).json({
        success: false,
        error: 'User profile not found'
      });
    }

    // Get or create document record
    let documents = await Document.findOne({ userProfile: userProfile._id });
    if (!documents) {
      documents = await Document.create({ userProfile: userProfile._id });
    }

    // Handle different document types
    if (type === 'profilePicture') {
      // Delete old profile picture if exists
      if (userProfile.profilePicture) {
        await deleteFile(userProfile.profilePicture);
      }
      const filePath = await uploadFile(req.file, 'profiles');
      userProfile.profilePicture = filePath;
      await userProfile.save();
    } else if (type === 'driverLicense') {
      // Delete old driver license if exists
      if (documents.driverLicense?.file) {
        await deleteFile(documents.driverLicense.file);
      }
      const filePath = await uploadFile(req.file, 'documents/driver-licenses');
      documents.driverLicense.push({
  file: filePath,
  uploadedAt: new Date()
});
      await documents.save();
    } else if (['OPT Receipt', 'OPT EAD', 'I-983', 'I-20'].includes(type)) {
      // Handle visa documents
      const filePath = await uploadFile(req.file, 'documents/visa-documents');
      
      // Check if this document type already exists
      const existingDocIndex = documents.visaDocuments.findIndex(doc => doc.type === type);
      
      if (existingDocIndex !== -1) {
        // Delete old file
        await deleteFile(documents.visaDocuments[existingDocIndex].file);
        // Update existing document
        documents.visaDocuments[existingDocIndex] = {
          type,
          file: filePath,
          uploadedAt: new Date(),
          status: 'Pending',
          feedback: ''
        };
      } else {
        // Add new document
        documents.visaDocuments.push({
          type,
          file: filePath,
          status: 'Pending'
        });
      }
      await documents.save();
    }

    res.json({  
      message: 'Document uploaded successfully',
     documents
    });
  } catch (error) {
    console.error('Error uploading document:', error);
     res.status(500).json({
      error: 'Error uploading document',
      details: error.message
    });
  }
};

// Get my documents
export const getMyDocuments = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    
    const userProfile = await UserProfile.findOne({ user: userId });
    if (!userProfile) {
      return res.status(404).json({
        success: false,
        error: 'User profile not found'
      });
    }

    const documents = await Document.findOne({ userProfile: userProfile._id });

    res.json({
        profilePicture: userProfile.profilePicture,
        documents: documents || { visaDocuments: [] },   
    });
  } catch (error) {
    console.error('Error fetching documents:', error);
     res.status(500).json({
      error: 'Error fetching documents',
      details: error.message
    });
  }
};
// Download document
export const downloadDocument = async (req, res) => {
  try {
    const { documentId } = req.params;
    const userId = req.user.userId;

    let userProfile;
    let documents;

    
    if (req.user.role === 'hr') {
      // HR by documentId 
      documents = await Document.findOne({ 
        $or: [
          { 'visaDocuments._id': documentId },
          { 'driverLicense._id': documentId }
        ]
      }).populate('userProfile');

      if (!documents || !documents.userProfile) {
        return res.status(404).json({ success: false, error: 'Document or user profile not found' });
      }

      userProfile = documents.userProfile;
    } else {
      // employee by userId
      // Get user profile
      userProfile = await UserProfile.findOne({ user: userId });
      if (!userProfile) {
        return res.status(404).json({ success: false, error: 'User profile not found' });
      }

      documents = await Document.findOne({ userProfile: userProfile._id });
      if (!documents) {
        return res.status(404).json({ success: false, error: 'Documents not found' });
      }
    }

    // fid the document file path
    let filePath;
     const licenseDoc = documents.driverLicense.find(doc => doc._id.toString() === documentId);

    if (documentId === 'profilePicture') {
      filePath = userProfile.profilePicture;
    } else if (licenseDoc) {
      filePath = licenseDoc.file;
    } else {
      const visaDoc = documents.visaDocuments.find(doc => doc._id.toString() === documentId);
      if (visaDoc) {
        filePath = visaDoc.file;
      }
    }

    if (!filePath) {
      return res.status(404).json({ success: false, error: 'Document not found' });
    }

    // check file exists
    const fullPath = path.join(process.cwd(), 'src/uploads', filePath);
    try {
      await fs.access(fullPath);
    } catch {
      return res.status(404).json({ success: false, error: 'File not found on server' });
    }

    console.log('📥 Downloading file:', fullPath);
    res.download(fullPath);
  } catch (error) {
    console.error('Error downloading document:', error);
    res.status(500).json({
      error: 'Error downloading document',
      details: error.message
    });
  }
};

// // Download document
// export const downloadDocument = async (req, res) => {
//   try {
//     const { documentId } = req.params;
//     const userId = req.user.userId;

//     // Get user profile
//     const userProfile = await UserProfile.findOne({ user: userId });
//     if (!userProfile) {
//       return res.status(404).json({
//         success: false,
//         error: 'User profile not found'
//       });
//     }

//     const documents = await Document.findOne({ userProfile: userProfile._id });
//     if (!documents) {
//       return res.status(404).json({
//         success: false,
//         error: 'Documents not found'
//       });
//     }

//     // Find the document file path
//     let filePath;
   
//     if (documentId === 'profilePicture') {
//       filePath = userProfile.profilePicture;
//     } else if (documentId === 'driverLicense') {
//       filePath = documents.driverLicense?.file;
//     } else {
//       // Find in visa documents
//       const visaDoc = documents.visaDocuments.find(doc => doc._id.toString() === documentId);
//       if (visaDoc) {
//         filePath = visaDoc.file;
//       }
//     }
//     console.log('📥 Download fullPath:', fullPath);
//     if (!filePath) {
//       return res.status(404).json({
//         success: false,
//         error: 'Document not found'
//       });
//     }

//     // Check if file exists
//     const fullPath = path.join(process.cwd(), 'src/uploads', filePath);
//     try {
//       await fs.access(fullPath);
//     } catch {
//       return res.status(404).json({
//         success: false,
//         error: 'File not found on server'
//       });
//     }

//     // Send file
//     res.download(fullPath);
//   } catch (error) {
//     console.error('Error downloading document:', error);
//      res.status(500).json({
//       error: 'Error downloading document',
//       details: error.message
//     });
//   }
// };

// Get visa status management data
export const getVisaStatus = async (req, res) => {
  try {
    const userId = req.user.userId;

    const userProfile = await UserProfile.findOne({ user: userId });
    if (!userProfile || userProfile.workAuthorization?.visaType !== 'F1(CPT/OPT)') {
      return res.json({
        success: true,
        data: {
          isOPT: false,
          message: 'Visa status management is only for F1(CPT/OPT) visa holders'
        }
      });
    }

    const documents = await Document.findOne({ userProfile: userProfile._id });
    const visaDocuments = documents?.visaDocuments || [];

    // Define the required documents in order
    const requiredDocs = ['OPT Receipt', 'OPT EAD', 'I-983', 'I-20'];
    const documentStatus = {};
    let nextStep = null;

    for (let i = 0; i < requiredDocs.length; i++) {
      const docType = requiredDocs[i];
      const doc = visaDocuments.find(d => d.type === docType);

      if (!doc) {
        documentStatus[docType] = { status: 'Not Uploaded' };
        if (!nextStep) {
          nextStep = docType;
        }
      } else {
        documentStatus[docType] = {
          status: doc.status,
          feedback: doc.feedback,
          uploadedAt: doc.uploadedAt,
          file: doc.file
        };

        if (doc.status === 'Rejected' && !nextStep) {
          nextStep = docType;
        } else if (doc.status === 'Pending' && !nextStep) {
          nextStep = 'Waiting for HR approval';
        } else if (doc.status === 'Approved' && i < requiredDocs.length - 1 && !nextStep) {
          const nextDoc = visaDocuments.find(d => d.type === requiredDocs[i + 1]);
          if (!nextDoc) {
            nextStep = requiredDocs[i + 1];
          }
        }
      }
    }

    // Check if all documents are approved
    const allApproved = requiredDocs.every(docType => {
      const doc = visaDocuments.find(d => d.type === docType);
      return doc && doc.status === 'Approved';
    });

    res.json({
      success: true,
      data: {
        isOPT: true,
        documentStatus,
        nextStep: allApproved ? 'All documents approved' : nextStep,
        allApproved
      }
    });
  } catch (error) {
    console.error('Error fetching visa status:', error);
     res.status(500).json({
      error: 'Error fetching visa status',
      details: error.message
    });
  }
};

// Download templates (for I-983)
export const downloadTemplate = async (req, res, next) => {
  try {
    const { templateType } = req.params; // 'empty' or 'sample'
    
    // In a real application, you would have actual PDF templates
    const templatePath = path.join(
      process.cwd(), 
      'src/templates',
      templateType === 'empty' ? 'i983-empty.pdf' : 'i983-sample.pdf'
    );

    res.download(templatePath, `I-983_${templateType}_template.pdf`);
  } catch (error) {
    console.error('Error downloading template:', error);
     res.status(500).json({
      error: 'Error downloading template',
      details: error.message
    });
  }
};

// HR: Review visa document
export const reviewVisaDocument = async (req, res) => {
  try {
    if (req.user.role !== 'hr') {
      return res.status(403).json({
        success: false,
        error: 'Access denied'
      });
    }

    const { documentId } = req.params;
    const { action, feedback } = req.body;

    if (!['approve', 'reject'].includes(action)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid action'
      });
    }

    // Find the document
    const document = await Document.findOne({ 'visaDocuments._id': documentId });
    if (!document) {
      return res.status(404).json({
        success: false,
        error: 'Document not found'
      });
    }

    // Update document status
    const visaDoc = document.visaDocuments.id(documentId);
    visaDoc.status = action === 'approve' ? 'Approved' : 'Rejected';
    visaDoc.feedback = feedback || '';
    await document.save();

    // Get user info for email
    const userProfile = await UserProfile.findById(document.userProfile)
      .populate('user', 'email firstName lastName');

    // Send notification email
    if (userProfile && userProfile.user) {
      await sendEmail({
        to: userProfile.user.email,
        subject: `Visa Document ${action === 'approve' ? 'Approved' : 'Rejected'}: ${visaDoc.type}`,
        html: `
          <h2>Visa Document Review Update</h2>
          <p>Dear ${userProfile.firstName} ${userProfile.lastName},</p>
          <p>Your ${visaDoc.type} has been ${action === 'approve' ? 'approved' : 'rejected'}.</p>
          ${feedback ? `<p><strong>Feedback:</strong> ${feedback}</p>` : ''}
          ${action === 'approve' ? '<p>Please proceed with the next step in your visa documentation process.</p>' : '<p>Please address the feedback and resubmit the document.</p>'}
          <p>Best regards,<br>HR Team</p>
        `
      });
    }

    res.json({
      success: true,
      message: `Document ${action}d successfully`,
      data: visaDoc
    });
  } catch (error) {
    console.error('Error reviewing visa document:', error);
    res.status(500).json({
      error: 'Error reviewing visa document',
      details: error.message
    });
  }
};

// HR: Send reminder notification
export const sendReminder = async (req, res, next) => {
  try {
    if (req.user.role !== 'hr') {
      return res.status(403).json({
        success: false,
        error: 'Access denied'
      });
    }

    const { profileId } = req.params;
    const { nextStep } = req.body;

    const userProfile = await UserProfile.findById(profileId)
      .populate('user', 'email firstName lastName');

    if (!userProfile) {
      return res.status(404).json({
        success: false,
        error: 'Profile not found'
      });
    }

    await sendEmail({
      to: userProfile.user.email,
      subject: 'Action Required: Visa Documentation',
      html: `
        <h2>Visa Documentation Reminder</h2>
        <p>Dear ${userProfile.firstName} ${userProfile.lastName},</p>
        <p>This is a reminder that you need to complete the following step in your visa documentation process:</p>
        <p><strong>${nextStep}</strong></p>
        <p>Please log in to your account and complete this step as soon as possible.</p>
        <p>Best regards,<br>HR Team</p>
      `
    });

    res.json({
      message: 'Reminder sent successfully'
    });
  } catch (error) {
    console.error('Error sending reminder:', error);
     res.status(500).json({
      error: 'Error sending reminder',
      details: error.message
    });
  }
};

// documentController.js
export const getDocumentsByProfileId = async (req, res) => {
  try {
    const { profileId } = req.params;

    const documents = await Document.findOne({ userProfile: profileId });

    if (!documents) {
      return res.status(404).json({ error: 'Documents not found' });
    }

    res.status(200).json(documents); // 回傳整份 document 結構給 HR
  } catch (error) {
    console.error('Error getting documents:', error);
    res.status(500).json({ error: 'Failed to fetch documents' });
  }
};
