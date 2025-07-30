import React, { useState } from 'react';
import axios from 'axios';

const OnboardingForm = ({ token }) => {
  const [formData, setFormData] = useState({
    token: token,
    firstName: '',
    lastName: '',
    middleName: '',
    preferredName: '',
    address: {
      buildingApt: '',
      streetName: '',
      city: '',
      state: '',
      zip: ''
    },
    cellPhone: '',
    workPhone: '',
    ssn: '',
    dateOfBirth: '',
    gender: '',
    workAuthorization: {
      isPermanentResidentOrCitizen: null,
      residentType: '',
      visaType: '',
      optReceipt: '',
      otherVisaTitle: '',
      startDate: '',
      endDate: ''
    }
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle address changes
  const handleAddressChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      address: {
        ...prev.address,
        [name]: value
      }
    }));
  };

  // Handle work authorization changes
  const handleWorkAuthChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      workAuthorization: {
        ...prev.workAuthorization,
        [name]: value
      }
    }));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await axios.post('/api/onboarding', formData);
      console.log('Onboarding submitted successfully:', response.data);
      // Handle success (redirect, show message, etc.)
    } catch (error) {
      console.error('Error submitting onboarding:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Employee Onboarding Form</h1>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Basic Information</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">First Name *</label>
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleInputChange}
                className="w-full p-2 border rounded"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Last Name *</label>
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleInputChange}
                className="w-full p-2 border rounded"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Middle Name</label>
              <input
                type="text"
                name="middleName"
                value={formData.middleName}
                onChange={handleInputChange}
                className="w-full p-2 border rounded"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Preferred Name</label>
              <input
                type="text"
                name="preferredName"
                value={formData.preferredName}
                onChange={handleInputChange}
                className="w-full p-2 border rounded"
              />
            </div>
          </div>
        </div>

        {/* Address */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Current Address</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Building/Apt # *</label>
              <input
                type="text"
                name="buildingApt"
                value={formData.address.buildingApt}
                onChange={handleAddressChange}
                className="w-full p-2 border rounded"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Street Name *</label>
              <input
                type="text"
                name="streetName"
                value={formData.address.streetName}
                onChange={handleAddressChange}
                className="w-full p-2 border rounded"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">City *</label>
              <input
                type="text"
                name="city"
                value={formData.address.city}
                onChange={handleAddressChange}
                className="w-full p-2 border rounded"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">State *</label>
              <input
                type="text"
                name="state"
                value={formData.address.state}
                onChange={handleAddressChange}
                className="w-full p-2 border rounded"
                maxLength="2"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">ZIP Code *</label>
              <input
                type="text"
                name="zip"
                value={formData.address.zip}
                onChange={handleAddressChange}
                className="w-full p-2 border rounded"
                required
              />
            </div>
          </div>
        </div>

        {/* Contact Information */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Contact Information</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Cell Phone *</label>
              <input
                type="tel"
                name="cellPhone"
                value={formData.cellPhone}
                onChange={handleInputChange}
                className="w-full p-2 border rounded"
                placeholder="(123) 456-7890"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Work Phone</label>
              <input
                type="tel"
                name="workPhone"
                value={formData.workPhone}
                onChange={handleInputChange}
                className="w-full p-2 border rounded"
                placeholder="(123) 456-7890"
              />
            </div>
          </div>
        </div>

        {/* Work Authorization */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Work Authorization</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Are you a permanent resident or citizen of the U.S.? *
              </label>
              <div className="space-x-4">
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    name="isPermanentResidentOrCitizen"
                    value="true"
                    checked={formData.workAuthorization.isPermanentResidentOrCitizen === true}
                    onChange={(e) => handleWorkAuthChange({
                      target: { name: 'isPermanentResidentOrCitizen', value: e.target.value === 'true' }
                    })}
                    className="mr-2"
                    required
                  />
                  Yes
                </label>
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    name="isPermanentResidentOrCitizen"
                    value="false"
                    checked={formData.workAuthorization.isPermanentResidentOrCitizen === false}
                    onChange={(e) => handleWorkAuthChange({
                      target: { name: 'isPermanentResidentOrCitizen', value: e.target.value === 'true' }
                    })}
                    className="mr-2"
                    required
                  />
                  No
                </label>
              </div>
            </div>

            {/* If Yes - Resident Type */}
            {formData.workAuthorization.isPermanentResidentOrCitizen === true && (
              <div>
                <label className="block text-sm font-medium mb-2">Resident Type *</label>
                <select
                  name="residentType"
                  value={formData.workAuthorization.residentType}
                  onChange={handleWorkAuthChange}
                  className="w-full p-2 border rounded"
                  required
                >
                  <option value="">Select...</option>
                  <option value="Green Card">Green Card</option>
                  <option value="Citizen">Citizen</option>
                </select>
              </div>
            )}

            {/* If No - Visa Type */}
            {formData.workAuthorization.isPermanentResidentOrCitizen === false && (
              <>
                <div>
                  <label className="block text-sm font-medium mb-2">Work Authorization Type *</label>
                  <select
                    name="visaType"
                    value={formData.workAuthorization.visaType}
                    onChange={handleWorkAuthChange}
                    className="w-full p-2 border rounded"
                    required
                  >
                    <option value="">Select...</option>
                    <option value="H1-B">H1-B</option>
                    <option value="L2">L2</option>
                    <option value="F1(CPT/OPT)">F1(CPT/OPT)</option>
                    <option value="H4">H4</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                {/* If F1(CPT/OPT) - OPT Receipt */}
                {formData.workAuthorization.visaType === 'F1(CPT/OPT)' && (
                  <div>
                    <label className="block text-sm font-medium mb-2">OPT Receipt *</label>
                    <input
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={(e) => {
                        // Handle file upload here
                        console.log('File selected:', e.target.files[0]);
                      }}
                      className="w-full p-2 border rounded"
                      required
                    />
                  </div>
                )}

                {/* If Other - Visa Title */}
                {formData.workAuthorization.visaType === 'Other' && (
                  <div>
                    <label className="block text-sm font-medium mb-2">Visa Title *</label>
                    <input
                      type="text"
                      name="otherVisaTitle"
                      value={formData.workAuthorization.otherVisaTitle}
                      onChange={handleWorkAuthChange}
                      className="w-full p-2 border rounded"
                      required
                    />
                  </div>
                )}

                {/* Start and End Date */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Start Date *</label>
                    <input
                      type="date"
                      name="startDate"
                      value={formData.workAuthorization.startDate}
                      onChange={handleWorkAuthChange}
                      className="w-full p-2 border rounded"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">End Date *</label>
                    <input
                      type="date"
                      name="endDate"
                      value={formData.workAuthorization.endDate}
                      onChange={handleWorkAuthChange}
                      className="w-full p-2 border rounded"
                      required
                    />
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting}
            className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {isSubmitting ? 'Submitting...' : 'Submit Onboarding Form'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default OnboardingForm; 