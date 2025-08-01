// backend/src/services/upload.service.js
import multer from 'multer';
import path from 'path';
import fs from 'fs/promises';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Get current directory (for ES modules)
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Ensure upload directories exist
const ensureUploadDirs = async () => {
  const uploadDirs = [
    'uploads/profiles',
    'uploads/documents/driver-licenses',
    'uploads/documents/work-authorizations',
    'uploads/documents/visa-documents',
    'uploads/temp'
  ];

  for (const dir of uploadDirs) {
    const fullPath = path.join(__dirname, '..', dir);
    try {
      await fs.mkdir(fullPath, { recursive: true });
    } catch (error) {
      console.error(`Error creating directory ${dir}:`, error);
    }
  }
};

// Initialize directories
ensureUploadDirs();

// Configure multer storage
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    let uploadPath = 'uploads/temp'; // Default path

    // Determine path based on file type
    if (file.fieldname === 'profilePicture') {
      uploadPath = 'uploads/profiles';
    } else if (file.fieldname === 'driverLicense') {
      uploadPath = 'uploads/documents/driver-licenses';
    } else if (file.fieldname === 'workAuthorization') {
      uploadPath = 'uploads/documents/work-authorizations';
    } else if (file.fieldname === 'visaDocument') {
      uploadPath = 'uploads/documents/visa-documents';
    }

    const fullPath = path.join(__dirname, '..', uploadPath);
    cb(null, fullPath);
  },
  filename: (req, file, cb) => {
    // Generate unique filename
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    const name = path.basename(file.originalname, ext);
    // Sanitize filename
    const sanitizedName = name.replace(/[^a-zA-Z0-9]/g, '_');
    cb(null, `${sanitizedName}-${uniqueSuffix}${ext}`);
  }
});

// File filter
const fileFilter = (req, file, cb) => {
  // Allowed file types
  const allowedTypes = {
    profilePicture: /jpeg|jpg|png|gif/,
    driverLicense: /jpeg|jpg|png|pdf/,
    workAuthorization: /jpeg|jpg|png|pdf/,
    visaDocument: /jpeg|jpg|png|pdf/
  };

  const fileType = allowedTypes[file.fieldname] || /jpeg|jpg|png|pdf/;
  const extname = fileType.test(path.extname(file.originalname).toLowerCase());
  const mimetype = fileType.test(file.mimetype);

  if (mimetype && extname) {
    cb(null, true);
  } else {
    cb(new Error(`Invalid file type. Allowed types: ${fileType}`));
  }
};

// Create multer instance
export const upload = multer({
  storage: storage,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 5 * 1024 * 1024 // 5MB default
  },
  fileFilter: fileFilter
});

// Upload single file helper
export const uploadFile = async (file, destination) => {
  try {
    const uploadDir = path.join(__dirname, '..', 'uploads', destination);
    await fs.mkdir(uploadDir, { recursive: true });

    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    const name = path.basename(file.originalname, ext);
    const sanitizedName = name.replace(/[^a-zA-Z0-9]/g, '_');
    const filename = `${sanitizedName}-${uniqueSuffix}${ext}`;
    
    const filePath = path.join(uploadDir, filename);
    
    // Move file from temp location or buffer
    if (file.path) {
      // File already saved by multer
      await fs.rename(file.path, filePath);
    } else if (file.buffer) {
      // File in memory
      await fs.writeFile(filePath, file.buffer);
    }

    // Return relative path for database storage
    return path.join(destination, filename).replace(/\\/g, '/');
  } catch (error) {
    console.error('Error uploading file:', error);
    throw new Error('Failed to upload file');
  }
};

// Delete file helper
export const deleteFile = async (filePath) => {
  try {
    const fullPath = path.join(__dirname, '..', 'uploads', filePath);
    await fs.unlink(fullPath);
  } catch (error) {
    console.error('Error deleting file:', error);
    // Don't throw error if file doesn't exist
    if (error.code !== 'ENOENT') {
      throw new Error('Failed to delete file');
    }
  }
};

// Multer middleware configurations
export const uploadMiddleware = {
  profilePicture: upload.single('profilePicture'),
  driverLicense: upload.single('driverLicense'),
  workAuthorization: upload.single('workAuthorization'),
  visaDocument: upload.single('visaDocument'),
  multiple: upload.fields([
     { name: 'profilePicture', maxCount: 1 },
  { name: 'driverLicense', maxCount: 1 },
  { name: 'workAuthorization', maxCount: 1 },
  { name: 'visaDocument', maxCount: 1 },
  { name: 'optReceipt', maxCount: 1 },
  { name: 'otherDoc', maxCount: 1 }
  ])
};

// Get file URL helper
export const getFileUrl = (filePath) => {
  if (!filePath) return null;
  return `${process.env.API_URL || 'http://localhost:5000'}/uploads/${filePath}`;
};

// Validate file size
export const validateFileSize = (file, maxSize = 5 * 1024 * 1024) => {
  if (file.size > maxSize) {
    throw new Error(`File size exceeds limit of ${maxSize / (1024 * 1024)}MB`);
  }
  return true;
};

// Clean up old temp files (run periodically)
export const cleanupTempFiles = async () => {
  try {
    const tempDir = path.join(__dirname, '..', 'uploads', 'temp');
    const files = await fs.readdir(tempDir);
    const now = Date.now();
    const maxAge = 24 * 60 * 60 * 1000; // 24 hours

    for (const file of files) {
      const filePath = path.join(tempDir, file);
      const stats = await fs.stat(filePath);
      
      if (now - stats.mtimeMs > maxAge) {
        await fs.unlink(filePath);
        console.log(`Deleted old temp file: ${file}`);
      }
    }
  } catch (error) {
    console.error('Error cleaning up temp files:', error);
  }
};