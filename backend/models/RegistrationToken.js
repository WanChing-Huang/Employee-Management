import mongoose from 'mongoose';

//hr can create a token for a new employee to register
//the token will be sent to the employee's email and expire after 3hr

const tokenSchema = new mongoose.Schema({
  email: { type: String, required: true },
  token: { type: String, required: true },
  expiresAt: { type: Date, required: true },
  used: { type: Boolean, default: false },
}, { timestamps: true });

export default mongoose.model('RegistrationToken', tokenSchema);
