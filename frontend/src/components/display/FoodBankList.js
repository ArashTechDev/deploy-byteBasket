import React from 'react';

const FoodBankList = ({
  foodBanks,
  onEdit,
  onDelete,
  onAddStorage,
  onEditStorage,
  onDeleteStorage,
}) => {
  if (!foodBanks || foodBanks.length === 0) return <p>No food banks found.</p>;

  return (
    <ul className="space-y-4">
      {foodBanks.map((fb) => (
        <li
          key={fb.id}
          className="bg-white p-4 rounded shadow space-y-3"
        >
          <div className="flex justify-between items-start">
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
              <button
               onClick={() => onAddStorage(fb)}  
               className="px-3 py-1 rounded bg-green-500 text-white hover:bg-green-600"
              >
                Storage
              </button>
            </div>
          </div>

          {/* Storage Locations */}
          {fb.StorageLocations && fb.StorageLocations.length > 0 && (
            <div className="ml-4">
              <h4 className="font-semibold text-md mb-1">Storage Locations:</h4>
              <ul className="space-y-1 list-disc ml-5">
                {fb.StorageLocations.map((sl) => (
                  <li key={sl.id} className="flex justify-between items-center">
                    <span>{sl.name}</span>
                    <div className="space-x-2">
                      <button
                        onClick={() => onEditStorage(fb.id, sl)}
                        className="text-blue-500 hover:underline text-sm"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => onDeleteStorage(sl.id)}
                        className="text-red-500 hover:underline text-sm"
                      >
                        Delete
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </li>
      ))}
    </ul>
  );
};

export default FoodBankList;
