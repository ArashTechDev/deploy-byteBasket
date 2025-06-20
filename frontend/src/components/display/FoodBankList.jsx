import React from 'react';

const FoodBankList = ({ foodBanks, onEdit, onDelete }) => {
  if (!foodBanks || foodBanks.length === 0) return <p>No food banks found.</p>;

  return (
    <ul className="space-y-4">
      {foodBanks.map((fb) => (
        <li
          key={fb.id}
          className="bg-white p-4 rounded shadow flex justify-between items-center"
        >
          <div>
            <h3 className="font-bold text-lg">{fb.name}</h3>
            <p className="text-gray-600">{fb.address}, {fb.city}, {fb.province} {fb.postalCode}</p>
            <p className="text-gray-600">Contact: {fb.contactEmail} | {fb.contactPhone}</p>
          </div>
          <div className="space-x-2">
            <button
              onClick={() => onEdit(fb)}
              className="px-3 py-1 rounded bg-blue-500 text-white hover:bg-blue-600"
            >
              Edit
            </button>
            <button
              onClick={() => onDelete(fb.id)}
              className="px-3 py-1 rounded bg-red-500 text-white hover:bg-red-600"
            >
              Delete
            </button>
          </div>
        </li>
      ))}
    </ul>
  );
};

export default FoodBankList;
