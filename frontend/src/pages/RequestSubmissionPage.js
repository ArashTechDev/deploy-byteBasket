// frontend/src/pages/RequestSubmissionPage.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/layout/Header';
import { useCart } from '../contexts/CartContext';
import foodRequestService from '../services/foodRequestService';

const RequestSubmissionPage = () => {
  const navigate = useNavigate();
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
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    // Only redirect if cart is empty AND we're not currently submitting
    if (cart.items.length === 0 && !isSubmitting) {
      alert('Your cart is empty. Please add items before submitting a request.');
      navigate('/browse-inventory');
    }
  }, [cart.items.length, navigate, isSubmitting]);

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
    setIsSubmitting(true);
    setError('');

    try {
      // Prepare the request data
      const requestData = {
        items: cart.items.map(item => ({
          item_name: item.item_name,
          quantity: item.quantity, // This is correct according to validation rules
          dietary_category: item.dietary_category,
        })),
        preferredPickupDate: formData.preferredPickupDate,
        preferredPickupTime: formData.preferredPickupTime,
        specialInstructions: formData.specialInstructions,
        dietaryRestrictions: formData.dietaryRestrictions,
        allergies: formData.allergies,
      };

      // Submit the request to the backend
      const response = await foodRequestService.submitRequest(requestData);

      if (response.success) {
        // Clear the cart after successful submission
        await clearCart();

        // Show success message and redirect
        alert(
          'Your food request has been submitted successfully! You will receive a confirmation email shortly.'
        );

        // Navigate immediately without waiting for useEffect
        navigate('/dashboard');
      } else {
        throw new Error(response.message || 'Failed to submit request');
      }
    } catch (error) {
      console.error('Error submitting request:', error);
      console.error('Error response:', error.response?.data);
      setError(
        error.response?.data?.message ||
          error.message ||
          'Failed to submit request. Please try again.'
      );
      setIsSubmitting(false); // Reset submitting state on error
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-8">Submit Food Request</h1>

            {error && (
              <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative">
                {error}
              </div>
            )}

            {/* Cart Summary */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Your Cart</h2>
              <div className="bg-gray-50 rounded-lg p-6">
                {cart.items && cart.items.length > 0 ? (
                  <div className="space-y-4">
                    {cart.items.map((item, index) => (
                      <div
                        key={index}
                        className="flex justify-between items-center py-2 border-b border-gray-200 last:border-b-0"
                      >
                        <div>
                          <h3 className="font-medium text-gray-900">{item.item_name}</h3>
                          {item.dietary_category && (
                            <span className="text-sm text-green-600 bg-green-100 px-2 py-1 rounded-full">
                              {item.dietary_category}
                            </span>
                          )}
                        </div>
                        <span className="text-gray-600">Qty: {item.quantity}</span>
                      </div>
                    ))}
                    <div className="pt-4 border-t border-gray-200">
                      <p className="text-lg font-semibold text-gray-900">
                        Total Items: {cart.total_items || cart.items.length}
                      </p>
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-500 text-center">Your cart is empty</p>
                )}
              </div>
            </div>

            {/* Request Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Preferred Pickup Date
                  </label>
                  <input
                    type="date"
                    name="preferredPickupDate"
                    value={formData.preferredPickupDate}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  >
                    <option value="">Select a time</option>
                    <option value="9:00 AM">9:00 AM</option>
                    <option value="10:00 AM">10:00 AM</option>
                    <option value="11:00 AM">11:00 AM</option>
                    <option value="12:00 PM">12:00 PM</option>
                    <option value="1:00 PM">1:00 PM</option>
                    <option value="2:00 PM">2:00 PM</option>
                    <option value="3:00 PM">3:00 PM</option>
                    <option value="4:00 PM">4:00 PM</option>
                    <option value="5:00 PM">5:00 PM</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Dietary Restrictions
                </label>
                <input
                  type="text"
                  name="dietaryRestrictions"
                  value={formData.dietaryRestrictions}
                  onChange={handleInputChange}
                  placeholder="e.g., Vegetarian, Gluten-free, etc."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Food Allergies
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
                  onClick={() => navigate('/browse-inventory')}
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
