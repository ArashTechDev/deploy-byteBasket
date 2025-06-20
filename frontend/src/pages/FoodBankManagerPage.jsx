import React, { useEffect, useState } from 'react';
import Header from '../components/layout/Header';
import FoodBankList from '../components/display/FoodBankList';
import FoodBankForm from '../components/forms/FoodBankForm';
import {
  getFoodBanks,
  createFoodBank,
  updateFoodBank,
  deleteFoodBank,
} from '../services/foodBankService';

const FoodBankManagerPage = ({ onNavigate }) => {
  const [foodBanks, setFoodBanks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingFoodBank, setEditingFoodBank] = useState(null);
  const [showFoodBankForm, setShowFoodBankForm] = useState(false);

  useEffect(() => {
    loadFoodBanks();
  }, []);

  const loadFoodBanks = async () => {
    setLoading(true);
    try {
      const data = await getFoodBanks();
      setFoodBanks(data);
    } catch (error) {
      alert('Failed to load food banks');
    } finally {
      setLoading(false);
    }
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
          />
        )}

        {showFoodBankForm && (
          <FoodBankForm
            initialData={editingFoodBank}
            onSubmit={handleSubmitForm}
            onCancel={handleCancelForm}
          />
        )}
      </main>
    </div>
  );
};

export default FoodBankManagerPage;
