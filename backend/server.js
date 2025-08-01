// // backend/server.js
// import express from 'express';
// import mongoose from 'mongoose';
// import cors from 'cors';
// import dotenv from 'dotenv';
// import path from 'path';
// import { fileURLToPath } from 'url';
// import { dirname } from 'path';

// // Get current directory (for ES modules)
// const __filename = fileURLToPath(import.meta.url);
// const __dirname = dirname(__filename);

// // Load environment variables
// dotenv.config();


// // Import routes
// import authRoutes from './src/routes/userRoutes.js';
// import profileRoutes from './src/routes/profileRoutes.js';
// import documentRoutes from './src/routes/documentRoutes.js';
// import hrRoutes from './src/routes/hrRoutes.js';

// const app = express();

// // Middleware
// app.use(cors({
//   origin: process.env.CLIENT_URL || 'http://localhost:3000',
//   credentials: true
// }));
// app.use(express.json());
// app.use(express.urlencoded({ extended: true }));

// // Static files for uploads
// app.use('/uploads', express.static(path.join(__dirname, 'src/uploads')));

// // Routes
// app.use('/api/auth', authRoutes);
// app.use('/api/profiles', profileRoutes);
// app.use('/api/documents', documentRoutes);
// app.use('/api/hr', hrRoutes);


// // Connect to MongoDB and start server
// const PORT = process.env.PORT || 5000;

// mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/employee_management', {
// //   useNewUrlParser: true,
// //   useUnifiedTopology: true
// })
// .then(() => {
//   console.log('$$$ Connected to MongoDB');
//   // Start server
//   app.listen(PORT, () => {
//     console.log(`@@@ Server running on port ${PORT}`);
//     // console.log(` Environment: ${process.env.NODE_ENV || 'development'}`);
//   });
// })
// .catch((error) => {
//   console.error('MongoDB connection error:', error);
//   process.exit(1);
// });

// // Handle unhandled promise rejections
// process.on('unhandledRejection', (err) => {
//   console.error('UNHANDLED REJECTION! Shutting down...');
//   console.error(err);
//   process.exit(1);
// });



// export default app; // For testing purposes


import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Get current directory (for ES modules)
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config();

// Import routes
import authRoutes from './src/routes/userRoutes.js';
import profileRoutes from './src/routes/profileRoutes.js';
import documentRoutes from './src/routes/documentRoutes.js';
import hrRoutes from './src/routes/hrRoutes.js';

const app = express();

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static files for uploads
app.use('/uploads', express.static(path.join(__dirname, 'src/uploads')));

// Test route to verify server is working
app.get('/api/test', (req, res) => {
  res.json({ message: 'Server is running!', timestamp: new Date() });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/profiles', profileRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/hr', hrRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: `Route ${req.method} ${req.url} not found` });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// Connect to MongoDB and start server
const PORT = process.env.PORT || 5000;

mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/employee_management')
.then(() => {
  console.log('✅ Connected to MongoDB');
  // Start server
  app.listen(PORT, () => {
    console.log(`✅ Server running on port ${PORT}`);
    console.log(`✅ Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`\n📍 API Endpoints:`);
    console.log(`   GET  ${process.env.API_URL || `http://localhost:${PORT}`}/api/test`);
    console.log(`   POST ${process.env.API_URL || `http://localhost:${PORT}`}/api/auth/login`);
    console.log(`   POST ${process.env.API_URL || `http://localhost:${PORT}`}/api/auth/register`);
  });
})
.catch((error) => {
  console.error('❌ MongoDB connection error:', error);
  process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('UNHANDLED REJECTION! Shutting down...');
  console.error(err);
  process.exit(1);
});

export default app; // For testing purposes