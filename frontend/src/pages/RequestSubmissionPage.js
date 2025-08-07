// frontend/src/pages/RequestSubmissionPage.js
import React, { useState, useEffect } from 'react';
import Header from '../components/layout/Header';
import { useCart } from '../contexts/CartContext';

const RequestSubmissionPage = ({ onNavigate }) => {
  const { cart, clearCart } = useCart();
  const [formData, setFormData] = useState({
    specialInstructions: '',
    preferredPickupDate: '',
    preferredPickupTime: '',
    dietaryRestrictions: '',
    allergies: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    // Redirect if cart is empty
    if (cart.items.length === 0) {
      alert('Your cart is empty. Please add items before submitting a request.');
      onNavigate('browse-inventory');
    }
  }, [cart.items.length, onNavigate]);

  const handleInputChange = e => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Here you would typically make an API call to submit the request
      // For now, we'll simulate a successful submission

      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate API call

      // Clear the cart after successful submission
      await clearCart();

      // Show success message and redirect
      alert(
        'Your food request has been submitted successfully! You will receive a confirmation email shortly.'
      );
      onNavigate('dashboard');
    } catch (error) {
      setError('Failed to submit request. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getTomorrowDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  };

  if (cart.items.length === 0) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header onNavigate={onNavigate} />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Submit Food Request</h1>
          <p className="mt-2 text-gray-600">Review your items and provide additional details</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-400 text-red-700">{error}</div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Request Summary</h2>
              <div className="space-y-3 mb-6">
                {cart.items.map(item => (
                  <div key={item._id} className="flex justify-between">
                    <div>
                      <p className="font-medium text-gray-900">{item.item_name}</p>
                      <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="border-t pt-4">
                <div className="flex justify-between font-semibold">
                  <span>Total Items:</span>
                  <span>{cart.total_items}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Request Form */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6 space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Preferred Pickup Date
                </label>
                <input
                  type="date"
                  name="preferredPickupDate"
                  value={formData.preferredPickupDate}
                  onChange={handleInputChange}
                  min={getTomorrowDate()}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Preferred Pickup Time
                </label>
                <select
                  name="preferredPickupTime"
                  value={formData.preferredPickupTime}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select a time</option>
                  <option value="09:00">9:00 AM</option>
                  <option value="10:00">10:00 AM</option>
                  <option value="11:00">11:00 AM</option>
                  <option value="12:00">12:00 PM</option>
                  <option value="13:00">1:00 PM</option>
                  <option value="14:00">2:00 PM</option>
                  <option value="15:00">3:00 PM</option>
                  <option value="16:00">4:00 PM</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Dietary Restrictions
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    'Vegetarian',
                    'Vegan',
                    'Gluten Free',
                    'Dairy Free',
                    'Nut Free',
                    'Low Sodium',
                  ].map(restriction => (
                    <label key={restriction} className="flex items-center">
                      <input
                        type="checkbox"
                        className="mr-2 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">{restriction}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Allergies (if any)
                </label>
                <input
                  type="text"
                  name="allergies"
                  value={formData.allergies}
                  onChange={handleInputChange}
                  placeholder="List any food allergies"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Special Instructions
                </label>
                <textarea
                  name="specialInstructions"
                  value={formData.specialInstructions}
                  onChange={handleInputChange}
                  rows="4"
                  placeholder="Any special instructions or notes"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="flex justify-between">
                <button
                  type="button"
                  onClick={() => onNavigate('browse-inventory')}
                  className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Back to Browse
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Submitting...' : 'Submit Request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RequestSubmissionPage;
