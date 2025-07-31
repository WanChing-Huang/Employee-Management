import Document from '../models/Document.js';
import UserProfile from '../models/UserProfile.js';
import path from 'path';
import fs from 'fs';

// Upload document
export const uploadDocument = async (req, res) => {
  try {
    const { userProfileId } = req.params;
    const { documentType } = req.body; // 'driverLicense', 'optReceipt', 'optEAD', 'i983', 'i20'
    
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const userProfile = await UserProfile.findById(userProfileId);
    if (!userProfile) {
      return res.status(404).json({ error: 'User profile not found' });
    }

    // Check if user owns this profile (or is HR)
    if (req.user.role !== 'hr' && userProfile.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Unauthorized access to this profile' });
    }

    // Find or create document record
    let document = await Document.findOne({ userProfile: userProfileId });
    if (!document) {
      document = new Document({ userProfile: userProfileId });
    }

    // Handle different document types
    switch (documentType) {
      case 'driverLicense':
        document.driverLicense = {
          file: req.file.filename,
          uploadedAt: new Date()
        };
        break;
      
      case 'profilePicture':
        // Update profile picture in UserProfile model
        userProfile.profilePicture = req.file.filename;
        await userProfile.save();
        return res.json({
          message: 'Profile picture uploaded successfully',
          filename: req.file.filename
        });
      
      case 'optReceipt':
      case 'optEAD':
      case 'i983':
      case 'i20':
        // Map document types
        const visaTypeMap = {
          'optReceipt': 'OPT Receipt',
          'optEAD': 'OPT EAD',
          'i983': 'I-983',
          'i20': 'I-20'
        };
        
        // Remove existing document of same type if exists
        document.visaDocuments = document.visaDocuments.filter(
          doc => doc.type !== visaTypeMap[documentType]
        );
        
        // Add new document
        document.visaDocuments.push({
          type: visaTypeMap[documentType],
          file: req.file.filename,
          uploadedAt: new Date(),
          status: 'Pending'
        });
        break;
      
      default:
        return res.status(400).json({ error: 'Invalid document type' });
    }

    await document.save();

    res.json({
      message: 'Document uploaded successfully',
      filename: req.file.filename,
      documentType
    });
  } catch (error) {
    console.error('Error uploading document:', error);
    res.status(500).json({ error: 'Failed to upload document' });
  }
};

// Get user documents
export const getUserDocuments = async (req, res) => {
  try {
    const { userProfileId } = req.params;
    
    const userProfile = await UserProfile.findById(userProfileId);
    if (!userProfile) {
      return res.status(404).json({ error: 'User profile not found' });
    }

    // Check if user owns this profile (or is HR)
    if (req.user.role !== 'hr' && userProfile.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Unauthorized access to this profile' });
    }

    const document = await Document.findOne({ userProfile: userProfileId });
    
    res.json({
      document: document || null,
      profilePicture: userProfile.profilePicture || null
    });
  } catch (error) {
    console.error('Error fetching documents:', error);
    res.status(500).json({ error: 'Failed to fetch documents' });
  }
};

// Download/View document
export const downloadDocument = async (req, res) => {
  try {
    const { filename } = req.params;
    const { userProfileId } = req.query;
    
    if (userProfileId) {
      const userProfile = await UserProfile.findById(userProfileId);
      if (!userProfile) {
        return res.status(404).json({ error: 'User profile not found' });
      }

      // Check if user owns this profile (or is HR)
      if (req.user.role !== 'hr' && userProfile.user.toString() !== req.user._id.toString()) {
        return res.status(403).json({ error: 'Unauthorized access to this document' });
      }
    }

    const filePath = path.join(process.cwd(), 'uploads', filename);
    
    // Check if file exists
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'File not found' });
    }

    // Get file extension to determine content type
    const ext = path.extname(filename).toLowerCase();
    let contentType = 'application/octet-stream';
    
    switch (ext) {
      case '.pdf':
        contentType = 'application/pdf';
        break;
      case '.jpg':
      case '.jpeg':
        contentType = 'image/jpeg';
        break;
      case '.png':
        contentType = 'image/png';
        break;
    }

    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', `inline; filename="${filename}"`);
    
    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);
  } catch (error) {
    console.error('Error downloading document:', error);
    res.status(500).json({ error: 'Failed to download document' });
  }
};

// Update document status (HR only)
export const updateDocumentStatus = async (req, res) => {
  try {
    const { userProfileId, documentId } = req.params;
    const { status, feedback } = req.body;

    if (!['Approved', 'Rejected'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status. Must be Approved or Rejected' });
    }

    const document = await Document.findOne({ userProfile: userProfileId });
    if (!document) {
      return res.status(404).json({ error: 'Document not found' });
    }

    const visaDoc = document.visaDocuments.id(documentId);
    if (!visaDoc) {
      return res.status(404).json({ error: 'Visa document not found' });
    }

    visaDoc.status = status;
    if (feedback) {
      visaDoc.feedback = feedback;
    }

    await document.save();

    res.json({
      message: 'Document status updated successfully',
      document: visaDoc
    });
  } catch (error) {
    console.error('Error updating document status:', error);
    res.status(500).json({ error: 'Failed to update document status' });
  }
};

// Delete document
export const deleteDocument = async (req, res) => {
  try {
    const { userProfileId } = req.params;
    const { documentType, documentId } = req.body;
    
    const userProfile = await UserProfile.findById(userProfileId);
    if (!userProfile) {
      return res.status(404).json({ error: 'User profile not found' });
    }

    // Check if user owns this profile (or is HR)
    if (req.user.role !== 'hr' && userProfile.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Unauthorized access to this profile' });
    }

    const document = await Document.findOne({ userProfile: userProfileId });
    if (!document) {
      return res.status(404).json({ error: 'Document not found' });
    }

    let filename = null;

    if (documentType === 'driverLicense') {
      filename = document.driverLicense?.file;
      document.driverLicense = undefined;
    } else if (documentType === 'profilePicture') {
      filename = userProfile.profilePicture;
      userProfile.profilePicture = undefined;
      await userProfile.save();
    } else if (documentId) {
      const visaDoc = document.visaDocuments.id(documentId);
      if (visaDoc) {
        filename = visaDoc.file;
        document.visaDocuments.pull(documentId);
      }
    }

    await document.save();

    // Delete physical file
    if (filename) {
      const filePath = path.join(process.cwd(), 'uploads', filename);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    res.json({ message: 'Document deleted successfully' });
  } catch (error) {
    console.error('Error deleting document:', error);
    res.status(500).json({ error: 'Failed to delete document' });
  }
}; 