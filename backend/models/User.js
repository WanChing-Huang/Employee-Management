import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: [true, 'Username is required'],
        unique: true,
        trim: true,
        minlength: [3, 'Username must be at least 3 characters'],
        maxlength: [30, 'Username must be at most 30 characters']
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        trim: true,
        lowercase: true,
        match: [/\S+@\S+\.\S+/, 'Invalid email address']
    },
    password: {
        type: String,
        required: [true, 'Password is required'],
        minlength: [6, 'Password must be at least 6 characters']
    },
    role: { 
        type: String, 
        enum: ['employee', 'hr'], 
        default: 'employee' },
    firstName: String,
    lastName: String,
}, { timestamps: true });

// encrypt password
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

// compare password
userSchema.methods.matchPassword = async function (enteredPwd) {
    return await bcrypt.compare(enteredPwd, this.password);
};

// Update password method
userSchema.methods.updatePassword = async function (currentPassword, newPassword) {
    // Verify current password
    const isCurrentPasswordValid = await this.comparePassword(currentPassword);
    if (!isCurrentPasswordValid) {
        throw new Error('Current password is incorrect');
    }

    // Set new password (will be hashed by pre-save hook)
    this.password = newPassword;
    await this.save();
    return this;
};

// Get public profile (exclude password)
userSchema.methods.getPublicProfile = function () {
    return {
        id: this._id,
        username: this.username,
        email: this.email,
        role: this.role,
        createdAt: this.createdAt,
        updatedAt: this.updatedAt
    };
};

// Static method to find by email
userSchema.statics.findByEmail = function (email) {
    return this.findOne({ email: email.toLowerCase() });
};


// Static method to check if email exists
userSchema.statics.emailExists = async function (email, excludeId = null) {
    const query = { email: email.toLowerCase() };
    if (excludeId) {
         // Exclude the current user's ID if provided
        //use in update operations to avoid conflict
        query._id = { $ne: excludeId };
    }
    const user = await this.findOne(query);
    return !!user;
};

// Static method to check if username exists
userSchema.statics.usernameExists = async function (username, excludeId = null) {
    const query = { username };
    if (excludeId) {
        // Exclude the current user's ID if provided
        //use in update operations to avoid conflict
        query._id = { $ne: excludeId };
    }
    const user = await this.findOne(query);
    return !!user;
};

// Transform toJSON to exclude password
userSchema.methods.toJSON = function () {
    //when converting to JSON, exclude the password field
    //this is useful for API responses
    const user = this.toObject();
    delete user.password;
    return user;
};



const User = mongoose.model('User', userSchema);

export default User;
