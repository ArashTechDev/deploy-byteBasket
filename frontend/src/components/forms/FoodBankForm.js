import React, { useState } from 'react';

const FoodBankForm = ({ initialData = {}, onSubmit, onCancel }) => {
  const [form, setForm] = useState({
    name: '',
    address: '',
    city: '',
    province: '',
    postalCode: '',
    contactEmail: '',
    contactPhone: '',
    operatingHours: {
      mon: '',
      tue: '',
      wed: '',
      thu: '',
      fri: '',
      sat: '',
      sun: ''
    },
    ...initialData,
  });

  const provinces = ['ON', 'QC', 'BC', 'AB', 'MB', 'SK', 'NS', 'NB', 'NL', 'PE', 'YT', 'NT', 'NU'];

  const handleChange = (field, value) => {
    setForm((f) => ({ ...f, [field]: value }));
    
  };

  const handleHoursChange = (day, value) => {
    setForm((f) => ({
      ...f,
      operatingHours: {
        ...f.operatingHours,
        [day]: value,
      },
    }));
  };

const handleSubmit = (e) => {
  e.preventDefault();

  const cleanedHours = Object.fromEntries(
    Object.entries(form.operatingHours).filter(([_, val]) => val.trim() !== '')
  );

  const dataToSubmit = {
    ...form,
    operatingHours: cleanedHours,
  };

  delete dataToSubmit.id;
  delete dataToSubmit.latitude;
  delete dataToSubmit.longitude;
  delete dataToSubmit.createdAt;
  delete dataToSubmit.updatedAt;
  delete dataToSubmit.storageLocations;

  onSubmit(dataToSubmit);
};


  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-xl shadow-md">
      {/* Basic Info */}
      <div>
        <label className="block font-semibold mb-1">Name</label>
        <input
          type="text"
          value={form.name}
          onChange={(e) => handleChange('name', e.target.value)}
          className="w-full border border-gray-300 rounded px-3 py-2"
          required
        />
      </div>

      <div>
        <label className="block font-semibold mb-1">Address</label>
        <input
          type="text"
          value={form.address}
          onChange={(e) => handleChange('address', e.target.value)}
          className="w-full border border-gray-300 rounded px-3 py-2"
          required
        />
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="block font-semibold mb-1">City</label>
          <input
            type="text"
            value={form.city}
            onChange={(e) => handleChange('city', e.target.value)}
            className="w-full border border-gray-300 rounded px-3 py-2"
            required
          />
        </div>

        <div>
          <label className="block font-semibold mb-1">Province</label>
          <select
            value={form.province}
            onChange={(e) => handleChange('province', e.target.value)}
            className="w-full border border-gray-300 rounded px-3 py-2"
            required
          >
            <option value="">Select</option>
            {provinces.map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block font-semibold mb-1">Postal Code</label>
          <input
            type="text"
            value={form.postalCode}
            onChange={(e) => handleChange('postalCode', e.target.value)}
            className="w-full border border-gray-300 rounded px-3 py-2"
            required
          />
        </div>
      </div>

      {/* Contact Info */}
      <div>
        <label className="block font-semibold mb-1">Contact Email</label>
        <input
          type="email"
          value={form.contactEmail}
          onChange={(e) => handleChange('contactEmail', e.target.value)}
          className="w-full border border-gray-300 rounded px-3 py-2"
          required
        />
      </div>

      <div>
        <label className="block font-semibold mb-1">Contact Phone</label>
        <input
          type="text"
          value={form.contactPhone}
          onChange={(e) => handleChange('contactPhone', e.target.value)}
          className="w-full border border-gray-300 rounded px-3 py-2"
        />
      </div>

      {/* Operating Hours */}
      <div>
        <label className="block font-bold text-lg mb-2">Operating Hours</label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'].map((day) => (
            <div key={day}>
              <label className="block font-medium capitalize mb-1">{day}</label>
              <input
                type="text"
                placeholder="e.g., 09:00-17:00"
                value={form.operatingHours[day]}
                onChange={(e) => handleHoursChange(day, e.target.value)}
                className="w-full border border-gray-300 rounded px-3 py-2"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Form Buttons */}
      <div className="flex justify-end space-x-4 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="bg-gray-300 hover:bg-gray-400 px-4 py-2 rounded"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="bg-orange-400 hover:bg-orange-500 text-white px-6 py-2 rounded"
        >
          Save
        </button>
      </div>
    </form>
  );
};

export default FoodBankForm;
