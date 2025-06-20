import React, { useState } from 'react';
import Header from '../components/layout/Header';

const DonatePage = ({ onNavigate }) => {
  const [formData, setFormData] = useState({
    donorName: '',
    donorEmail: '',
    donorPhone: '',
    productName: '',
    quantity: '',
    unit: 'pieces',
    category: 'other',
    scheduledPickupTime: '',
    scheduledPickupDate: '',
    notes: '',
    productImage: null
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState('');

  const handleInputChange = (e) => {
    const { name, value, type, files } = e.target;
    
    if (type === 'file') {
      setFormData(prev => ({
        ...prev,
        [name]: files[0]
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitMessage('');

    // Validation
    if (!formData.donorName || !formData.donorEmail || !formData.productName || 
        !formData.quantity || !formData.scheduledPickupTime || !formData.scheduledPickupDate) {
      setSubmitMessage('Please fill in all required fields');
      setIsSubmitting(false);
      return;
    }

    try {
      const donationData = new FormData();
      donationData.append('donorName', formData.donorName);
      donationData.append('donorEmail', formData.donorEmail);
      donationData.append('donorPhone', formData.donorPhone);
      donationData.append('productName', formData.productName);
      donationData.append('quantity', formData.quantity);
      donationData.append('unit', formData.unit);
      donationData.append('category', formData.category);
      donationData.append('scheduledPickupTime', formData.scheduledPickupTime);
      donationData.append('scheduledPickupDate', formData.scheduledPickupDate);
      donationData.append('notes', formData.notes);
      
      if (formData.productImage) {
        donationData.append('productImage', formData.productImage);
      }

      const response = await fetch('http://localhost:3001/api/donations', {
        method: 'POST',
        body: donationData
      });

      const result = await response.json();

      if (result.success) {
        setSubmitMessage('✅ Donation submitted successfully! Thank you for your contribution.');
        // Reset form
        setFormData({
          donorName: '',
          donorEmail: '',
          donorPhone: '',
          productName: '',
          quantity: '',
          unit: 'pieces',
          category: 'other',
          scheduledPickupTime: '',
          scheduledPickupDate: '',
          notes: '',
          productImage: null
        });
        // Reset file input
        const fileInput = document.querySelector('input[type="file"]');
        if (fileInput) fileInput.value = '';
      } else {
        setSubmitMessage('❌ Error: ' + (result.message || 'Failed to submit donation'));
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Get tomorrow's date as minimum pickup date
  const getTomorrowDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  };

  return (
    <div className="min-h-screen bg-gray-200">
      <Header currentPage="donate" onNavigate={onNavigate} />
      
      <main className="py-12">
        <div className="max-w-md mx-auto">
          <h1 className="text-3xl font-bold text-center mb-8 text-gray-800">
            For Donors
          </h1>
          
          <div className="bg-gray-600 rounded-lg p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Donor Name */}
              <div>
                <div className="block text-white text-sm font-medium mb-2">
                  Donor Name *
                </div>
                <input 
                  type="text" 
                  name="donorName"
                  value={formData.donorName}
                  onChange={handleInputChange}
                  placeholder="Enter your full name"
                  className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md placeholder-gray-400"
                  required
                />
              </div>

              {/* Donor Email */}
              <div>
                <div className="block text-white text-sm font-medium mb-2">
                  Email Address *
                </div>
                <input 
                  type="email" 
                  name="donorEmail"
                  value={formData.donorEmail}
                  onChange={handleInputChange}
                  placeholder="Enter your email"
                  className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md placeholder-gray-400"
                  required
                />
              </div>

              {/* Donor Phone */}
              <div>
                <div className="block text-white text-sm font-medium mb-2">
                  Phone Number
                </div>
                <input 
                  type="tel" 
                  name="donorPhone"
                  value={formData.donorPhone}
                  onChange={handleInputChange}
                  placeholder="Enter your phone number"
                  className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md placeholder-gray-400"
                />
              </div>

              {/* Product Name */}
              <div>
                <div className="block text-white text-sm font-medium mb-2">
                  Product Name *
                </div>
                <input 
                  type="text" 
                  name="productName"
                  value={formData.productName}
                  onChange={handleInputChange}
                  placeholder="e.g., Canned Beans, Rice, Apples"
                  className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md placeholder-gray-400"
                  required
                />
              </div>
              
              {/* Quantity and Unit */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="block text-white text-sm font-medium mb-2">
                    Quantity *
                  </div>
                  <input 
                    type="number" 
                    name="quantity"
                    value={formData.quantity}
                    onChange={handleInputChange}
                    placeholder="Amount"
                    min="1"
                    className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md placeholder-gray-400"
                    required
                  />
                </div>
                <div>
                  <div className="block text-white text-sm font-medium mb-2">
                    Unit
                  </div>
                  <select 
                    name="unit"
                    value={formData.unit}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-gray-700"
                  >
                    <option value="pieces">Pieces</option>
                    <option value="kg">Kilograms</option>
                    <option value="lbs">Pounds</option>
                    <option value="cans">Cans</option>
                    <option value="boxes">Boxes</option>
                    <option value="bags">Bags</option>
                    <option value="liters">Liters</option>
                  </select>
                </div>
              </div>

              {/* Category */}
              <div>
                <div className="block text-white text-sm font-medium mb-2">
                  Category
                </div>
                <select 
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-gray-700"
                >
                  <option value="other">Other</option>
                  <option value="canned-goods">Canned Goods</option>
                  <option value="fresh-produce">Fresh Produce</option>
                  <option value="dairy">Dairy</option>
                  <option value="meat">Meat</option>
                  <option value="grains">Grains</option>
                  <option value="beverages">Beverages</option>
                  <option value="snacks">Snacks</option>
                </select>
              </div>

              {/* Pickup Date */}
              <div>
                <div className="block text-white text-sm font-medium mb-2">
                  Pickup Date *
                </div>
                <input 
                  type="date" 
                  name="scheduledPickupDate"
                  value={formData.scheduledPickupDate}
                  onChange={handleInputChange}
                  min={getTomorrowDate()}
                  className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-gray-700"
                  required
                />
              </div>
              
              {/* Pickup Time */}
              <div>
                <div className="block text-white text-sm font-medium mb-2">
                  Pickup Time *
                </div>
                <select 
                  name="scheduledPickupTime"
                  value={formData.scheduledPickupTime}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-gray-700"
                  required
                >
                  <option value="">Choose a Time</option>
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

              {/* Notes */}
              <div>
                <div className="block text-white text-sm font-medium mb-2">
                  Additional Notes
                </div>
                <textarea 
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  placeholder="Any special instructions or notes about the donation"
                  rows="3"
                  className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md placeholder-gray-400"
                />
              </div>
              
              {/* Product Image */}
              <div>
                <div className="block text-white text-sm font-medium mb-2">
                  Product Image
                </div>
                <input 
                  type="file" 
                  name="productImage"
                  onChange={handleInputChange}
                  accept="image/*"
                  className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-gray-700 file:mr-4 file:py-1 file:px-4 file:rounded file:border-0 file:bg-orange-400 file:text-white file:font-medium hover:file:bg-orange-500"
                />
                <p className="text-gray-300 text-xs mt-1">Upload an image of the product you want to donate (optional)</p>
              </div>

              {/* Submit Message */}
              {submitMessage && (
                <div className={`p-3 rounded-md text-sm ${
                  submitMessage.includes('✅') 
                    ? 'bg-green-100 text-green-800 border border-green-300' 
                    : 'bg-red-100 text-red-800 border border-red-300'
                }`}>
                  {submitMessage}
                </div>
              )}
              
              {/* Submit Button */}
              <button 
                type="submit"
                disabled={isSubmitting}
                className={`w-full py-3 rounded-md font-medium transition-colors ${
                  isSubmitting 
                    ? 'bg-gray-400 cursor-not-allowed text-gray-600' 
                    : 'bg-orange-400 hover:bg-orange-500 text-white'
                }`}
              >
                {isSubmitting ? 'Submitting...' : 'Submit Donation'}
              </button>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
};

export default DonatePage;