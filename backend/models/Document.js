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

}, { 
  timestamps: true,
  // Include virtual fields when converting to JSON
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual field to map _id to id for frontend compatibility
documentSchema.virtual('id').get(function() {
  return this._id.toHexString();
});

// Transform toJSON to include virtuals and clean up
documentSchema.methods.toJSON = function () {
  const document = this.toObject({ virtuals: true });
  delete document._id; // Remove _id since we have id virtual field
  delete document.__v; // Remove version key
  return document;
};

export default mongoose.model('Document', documentSchema);
