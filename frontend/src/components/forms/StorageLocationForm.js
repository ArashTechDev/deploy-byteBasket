import React, { useState } from 'react';

const StorageLocationForm = ({ initialData = {}, onSubmit, onCancel }) => {
  const safeInitialData = initialData || {};

  const [form, setForm] = useState({
    name: safeInitialData.name || '',
  });

  const handleChange = (field, value) => {
    setForm((f) => ({ ...f, [field]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(form);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 bg-white p-6 rounded shadow">
      <div>
        <label className="block font-medium mb-1">Storage Location Name</label>
        <input
          type="text"
          value={form.name}
          onChange={(e) => handleChange('name', e.target.value)}
          className="w-full border border-gray-300 rounded px-3 py-2"
          required
        />
      </div>

      <div className="flex justify-end space-x-4">
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

export default StorageLocationForm;
