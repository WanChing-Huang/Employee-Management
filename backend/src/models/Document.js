import mongoose from 'mongoose';

const documentSchema = new mongoose.Schema({
  userProfile: { type: mongoose.Schema.Types.ObjectId, ref: 'UserProfile', required: true },

  driverLicense: {
    file: String,
    uploadedAt: { type: Date, default: Date.now }
  },
   //enable multiple visa documents
  visaDocuments: [{
    type: {
      type: String,
      enum: ['OPT Receipt', 'OPT EAD', 'I-983', 'I-20'],
      required: true
    },
    file: String,
    uploadedAt: { type: Date, default: Date.now },
    status: { type: String, enum: ['Pending', 'Approved', 'Rejected'], default: 'Pending' },
    feedback: String
  }]

}, { timestamps: true });

export default mongoose.model('Document', documentSchema);
