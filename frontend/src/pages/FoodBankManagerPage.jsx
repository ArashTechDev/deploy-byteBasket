import React, { useEffect, useState } from 'react';
import Header from '../components/layout/Header';
import FoodBankList from '../components/display/FoodBankList';
import FoodBankForm from '../components/forms/FoodBankForm';
import StorageLocationForm from '../components/forms/StorageLocationForm';
import {
  getFoodBanks,
  createFoodBank,
  updateFoodBank,
  deleteFoodBank,
} from '../services/foodBankService';
import {
  createStorageLocation,
  updateStorageLocation,
  deleteStorageLocation,
  getStorageLocationsByFoodBankId,
} from '../services/storageService';

const FoodBankManagerPage = ({ onNavigate }) => {
  const [foodBanks, setFoodBanks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingFoodBank, setEditingFoodBank] = useState(null);
  const [showFoodBankForm, setShowFoodBankForm] = useState(false);

  const [showStorageForm, setShowStorageForm] = useState(false);
  const [currentFoodBank, setCurrentFoodBank] = useState(null);
  const [editingStorage, setEditingStorage] = useState(null);

  useEffect(() => {
    loadFoodBanks();
  }, []);

  // Load all food banks
  const loadFoodBanks = async () => {
    setLoading(true);
    try {
      const data = await getFoodBanks();
      const normalized = data.map((fb) => ({ ...fb, id: fb._id }));
      setFoodBanks(normalized);
    } catch (error) {
      alert('Failed to load food banks');
    } finally {
      setLoading(false);
    }
  };

  // Update storageLocations for a specific food bank in state
  const updateFoodBankStorageLocations = (foodBankId, storageLocations) => {
    setFoodBanks((prevFoodBanks) =>
      prevFoodBanks.map((fb) =>
        fb.id === foodBankId ? { ...fb, storageLocations } : fb
      )
    );
  };

  const handleEdit = (fb) => {
    setEditingFoodBank(fb);
    setShowFoodBankForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this food bank?')) return;
    try {
      await deleteFoodBank(id);
      await loadFoodBanks();
    } catch {
      alert('Delete failed');
    }
  };

  const handleAddNew = () => {
    setEditingFoodBank(null);
    setShowFoodBankForm(true);
  };

  const handleSubmitForm = async (data) => {
    try {
      if (editingFoodBank) {
        await updateFoodBank(editingFoodBank.id, data);
      } else {
        await createFoodBank(data);
      }
      setShowFoodBankForm(false);
      await loadFoodBanks();
    } catch {
      alert('Save failed');
    }
  };

  const handleCancelForm = () => {
    setShowFoodBankForm(false);
    setEditingFoodBank(null);
  };

  const handleAddStorageClick = async (foodBank) => {
    try {
      const storageLocations = await getStorageLocationsByFoodBankId(foodBank.id);

      setCurrentFoodBank({
        ...foodBank,
        storageLocations: storageLocations || [],
      });

      setShowStorageForm(true);
      setEditingStorage(null);
    } catch (error) {
      console.error('Failed to load storage locations:', error);
      alert('Failed to load storage locations');
    }
  };

  const refreshStorageLocations = async () => {
    if (!currentFoodBank) return;
    const updated = await getStorageLocationsByFoodBankId(currentFoodBank.id);
    setCurrentFoodBank((prev) => ({
      ...prev,
      storageLocations: updated || [],
    }));
  };

  // Submit new or edited storage location
const handleStorageFormSubmit = async (data) => {
  try {
    if (editingStorage) {
      await updateStorageLocation(editingStorage._id, data);
    } else {
      await createStorageLocation({ ...data, foodBank: currentFoodBank.id });
    }
    const refreshedStorage = await getStorageLocationsByFoodBankId(currentFoodBank.id);
    updateFoodBankStorageLocations(currentFoodBank.id, refreshedStorage);
    setCurrentFoodBank((fb) => ({ ...fb, storageLocations: refreshedStorage }));
    setEditingStorage(null);
    setShowStorageForm(false);
    refreshStorageLocations();
  } catch (error) {
    console.error('Storage creation failed:', error.response?.data || error.message);
    alert('Failed to save storage location. Check console for details.');
  }
};

  const handleStorageFormCancel = () => {
    setShowStorageForm(false);
    setCurrentFoodBank(null);
    setEditingStorage(null);
  };

  const handleEditStorage = (storage) => {
    setEditingStorage(storage);
  };

  const handleDeleteStorage = async (id) => {
    if (!window.confirm('Are you sure you want to delete this storage location?')) return;
    try {
      await deleteStorageLocation(id);
      const refreshedStorage = await getStorageLocationsByFoodBankId(currentFoodBank.id);
      updateFoodBankStorageLocations(currentFoodBank.id, refreshedStorage);
      setCurrentFoodBank((fb) => ({ ...fb, storageLocations: refreshedStorage }));
      refreshStorageLocations();
    } catch {
      alert('Failed to delete storage location');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Header currentPage="foodbanks" onNavigate={onNavigate} />
      <main className="max-w-6xl mx-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Manage Food Bank Locations</h1>
          <button
            onClick={handleAddNew}
            className="bg-orange-400 hover:bg-orange-500 text-white px-4 py-2 rounded"
          >
            Add New Food Bank
          </button>
        </div>

        {loading && <p>Loading...</p>}

        {!loading && !showFoodBankForm && (
          <FoodBankList
            foodBanks={foodBanks}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onAddStorage={handleAddStorageClick}
          />
        )}

        {showFoodBankForm && (
          <FoodBankForm
            initialData={editingFoodBank}
            onSubmit={handleSubmitForm}
            onCancel={handleCancelForm}
          />
        )}

        {showStorageForm && currentFoodBank && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg max-w-md w-full shadow-lg max-h-[80vh] overflow-y-auto">
              <h2 className="text-xl font-bold mb-4">
                Storage Locations for {currentFoodBank.name}
              </h2>
              <div className="mb-4 p-3 border rounded bg-gray-50 max-h-48 overflow-y-auto">
                {currentFoodBank.storageLocations && currentFoodBank.storageLocations.length > 0 ? (
                  <ul>
                    {currentFoodBank.storageLocations.map((loc) => (
                      <li
                        key={loc._id}
                        className="mb-2 border-b pb-2 flex justify-between items-center"
                      >
                        <p className="font-semibold">{loc.name}</p>
                        <div className="space-x-2">
                          <button
                            onClick={() => handleEditStorage(loc)}
                            className="text-blue-600 hover:underline"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteStorage(loc._id)}
                            className="text-red-600 hover:underline"
                          >
                            Delete
                          </button>
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-500">No storage locations yet.</p>
                )}
              </div>

              <h3 className="text-lg font-semibold mb-2">
                {editingStorage ? 'Edit Storage Location' : 'Add New Storage Location'}
              </h3>
              <StorageLocationForm
                key={editingStorage ? editingStorage._id : 'new'}
                initialData={editingStorage || {}}
                onSubmit={handleStorageFormSubmit}
                onCancel={handleStorageFormCancel}
              />
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default FoodBankManagerPage;
