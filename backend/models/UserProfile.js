import mongoose from 'mongoose';
//user profile form for employee to file and upload documents

const userProfileSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    status: { type: String, enum: ['Pending', 'Approved', 'Rejected'], default: 'Pending' },
    feedback: { type: String }, // HR Feedback

    // basic INFO
    firstName: String,
    lastName: String,
    middleName: String,
    preferredName: String,
    profilePicture: String, //upload file name

    //pre-filled based on email that received registration token, cannot be edited
    email: {
        type: String,
        required: true

    },
    address: {
        buildingApt: {
            type: String,
            required: [true, 'Building/Apt # is required'],
            trim: true
        },
        streetName: {
            type: String,
            required: [true, 'Street name is required'],
            trim: true
        },
        city: {
            type: String,
            required: [true, 'City is required'],
            trim: true
        },
        state: {
            type: String,
            required: [true, 'State is required'],
            trim: true,
            minlength: [2, 'State must be at least 2 characters'],
            maxlength: [2, 'State must be exactly 2 characters']
        },
        zip: {
            type: String,
            required: [true, 'ZIP code is required'],
            validate: {
                validator: function (v) {
                    // ZIP code format: 5 digits or 5+4 format
                    const zipRegex = /^\d{5}(-\d{4})?$/;
                    return zipRegex.test(v);
                },
                message: 'ZIP code must be in format 12345 or 12345-1234'
            }
        },
    },
    cellPhone: {
        type: String,
        validate: {
            validator: function (v) {
                // Skip validation if phone is empty/undefined (optional field)
                if (!v || v.trim() === '') return true;
                // Phone number format: (XXX) XXX-XXXX or XXX-XXX-XXXX
                const phoneRegex = /^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/;
                return phoneRegex.test(v);
            },
            message: 'Phone number must be in format (XXX) XXX-XXXX or XXX-XXX-XXXX'
        }
    },
    workPhone: {
        type: String,
        validate: {
            validator: function (v) {
                // Skip validation if phone is empty/undefined (optional field)
                if (!v || v.trim() === '') return true;
                // Phone number format: (XXX) XXX-XXXX or XXX-XXX-XXXX
                const phoneRegex = /^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/;
                return phoneRegex.test(v);
            },
            message: 'Phone number must be in format (XXX) XXX-XXXX or XXX-XXX-XXXX'
        }
    },
    ssn: String,
    dateOfBirth: Date,
    gender: { type: String, enum: ['male', 'female', 'prefer not to say'] },

    workAuthorization: {
        // Question: "Permanent resident or citizen of the U.S.?"
        isPermanentResidentOrCitizen: {
            type: Boolean,
            required: [true, 'Please specify if you are a permanent resident or citizen of the U.S.']
        },

        // If Yes: choose "Green Card" or "Citizen"
        residentType: {
            type: String,
            enum: ['Green Card', 'Citizen'],
            validate: {
                validator: function (v) {
                    if (this.isPermanentResidentOrCitizen === true && !v) {
                        return false;
                    }
                    if (this.isPermanentResidentOrCitizen === false && v) {
                        return false;
                    }
                    return true;
                },
                message: 'Please select Green Card or Citizen if you are a permanent resident or citizen'
            }
        },

        // If No: "What is your work authorization?"
        visaType: {
            type: String,
            enum: ['H1-B', 'L2', 'F1(CPT/OPT)', 'H4', 'Other'], //front end will show all options
            validate: {
                validator: function (v) {
                    if (this.isPermanentResidentOrCitizen === false && !v) {
                        return false;
                    }
                    if (this.isPermanentResidentOrCitizen === true && v) {
                        return false;
                    }
                    return true;
                },
                message: 'Please select your work authorization type if you are not a permanent resident or citizen'
            }
        },
  
        //all in visa document model 
        //the feature add in front end js

        // optReceipt: {
        //     type: String, // file name
        //     validate: {
        //         validator: function (v) {
        //             if (this.visaType === 'F1(CPT/OPT)' && !v) {
        //                 return false;
        //             }
        //             return true;
        //         },
        //         message: 'OPT Receipt is required for F1(CPT/OPT) visa holders'
        //     }
        // },


        // otherVisaTitle: {
        //     type: String,  // visa title
        //     validate: {
        //         validator: function (v) {
        //             if (this.visaType === 'Other' && !v) {
        //                 return false;
        //             }
        //             return true;
        //         },
        //         message: 'Please specify the visa title for Other visa type'
        //     }
        // },

        // Start and end date for work authorization
        startDate: {
            type: Date,
            validate: {
                validator: function (v) {
                    if (this.isPermanentResidentOrCitizen === false && !v) {
                        return false;
                    }
                    return true;
                },
                message: 'Start date is required for work authorization'
            }
        },
        endDate: {
            type: Date,
            validate: {
                validator: function (v) {
                    if (this.isPermanentResidentOrCitizen === false && !v) {
                        return false;
                    }
                    if (v && this.startDate && v <= this.startDate) {
                        return false;
                    }
                    return true;
                },
                message: 'End date must be after start date and is required for work authorization'
            }
        }
    },

    reference: {
        firstName: String,
        lastName: String,
        middleName: String,
        phone: {
            type: String,
            validate: {
                validator: function (v) {
                    // Skip validation if phone is empty/undefined (optional field)
                    if (!v || v.trim() === '') return true;
                    // Phone number format: (XXX) XXX-XXXX or XXX-XXX-XXXX
                    const phoneRegex = /^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/;
                    return phoneRegex.test(v);
                },
                message: 'Phone number must be in format (XXX) XXX-XXXX or XXX-XXX-XXXX'
            }
        },
        email: {
            type: String,
            required: [true, 'Email is required'],
            trim: true,
            lowercase: true,
            match: [/\S+@\S+\.\S+/, 'Invalid email address']
        },
        relationship: String,
    },
    emergencyContacts: [{
        firstName: String,
        lastName: String,
        middleName: String,
        phone: {
            type: String,
            validate: {
                validator: function (v) {
                    // Skip validation if phone is empty/undefined (optional field)
                    if (!v || v.trim() === '') return true;
                    // Phone number format: (XXX) XXX-XXXX or XXX-XXX-XXXX
                    const phoneRegex = /^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/;
                    return phoneRegex.test(v);
                },
                message: 'Phone number must be in format (XXX) XXX-XXXX or XXX-XXX-XXXX'
            }
        },
        email: {
            type: String,
            required: [true, 'Email is required'],
            trim: true,
            lowercase: true,
            match: [/\S+@\S+\.\S+/, 'Invalid email address']
        },
        relationship: String,
    }],
}, { 
  timestamps: true,
  // Include virtual fields when converting to JSON
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual field to map _id to id for frontend compatibility
userProfileSchema.virtual('id').get(function() {
  return this._id.toHexString();
});

// Transform toJSON to include virtuals and clean up
userProfileSchema.methods.toJSON = function () {
  const profile = this.toObject({ virtuals: true });
  delete profile._id; // Remove _id since we have id virtual field
  delete profile.__v; // Remove version key
  return profile;
};

export default mongoose.model('UserProfile', userProfileSchema);
