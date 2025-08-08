// frontend/src/pages/CartPage.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import { useCart } from '../contexts/CartContext';
import WishlistModal from '../components/wishlist/WishlistModal';

const CartPage = () => {
  const navigate = useNavigate();
  const {
    cart,
    loading,
    error,
    isUserAuthenticated,
    updateCartItem,
    removeFromCart,
    clearCart,
    saveAsWishlist,
    clearError,
  } = useCart();

  const [isWishlistModalOpen, setIsWishlistModalOpen] = useState(false);
  const [wishlistForm, setWishlistForm] = useState({
    name: '',
    description: '',
    showForm: false,
  });
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    if (!isUserAuthenticated) {
      navigate('/signup');
    }
  }, [isUserAuthenticated, navigate]);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        clearError();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, clearError]);

  const handleQuantityChange = async (itemId, newQuantity) => {
    if (newQuantity < 1) {
      await handleRemoveItem(itemId);
      return;
    }

    setActionLoading(true);
    const result = await updateCartItem(itemId, newQuantity);
    if (!result.success) {
      alert(result.message || 'Failed to update item quantity');
    }
    setActionLoading(false);
  };

  const handleRemoveItem = async itemId => {
    if (!window.confirm('Remove this item from your cart?')) return;

    setActionLoading(true);
    const result = await removeFromCart(itemId);
    if (!result.success) {
      alert(result.message || 'Failed to remove item');
    }
    setActionLoading(false);
  };

  const handleClearCart = async () => {
    if (!window.confirm('Clear all items from your cart?')) return;

    setActionLoading(true);
    const result = await clearCart();
    if (!result.success) {
      alert(result.message || 'Failed to clear cart');
    }
    setActionLoading(false);
  };

  const handleSaveAsWishlist = async () => {
    if (!wishlistForm.name.trim()) {
      alert('Please enter a wishlist name');
      return;
    }

    setActionLoading(true);
    const result = await saveAsWishlist(wishlistForm.name, wishlistForm.description);

    if (result.success) {
      alert('Cart saved as wishlist successfully!');
      setWishlistForm({ name: '', description: '', showForm: false });
    } else {
      alert(result.message || 'Failed to save wishlist');
    }
    setActionLoading(false);
  };

  const handleSubmitRequest = () => {
    if (cart.items.length === 0) {
      alert('Your cart is empty');
      return;
    }

    // Navigate to request submission page
    navigate('/submit-request');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading your cart...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">My Cart</h1>
              <p className="text-gray-600">
                {cart.items.length === 0
                  ? 'Your cart is empty'
                  : `${cart.total_items} item${cart.total_items !== 1 ? 's' : ''} in your cart`}
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/browse-inventory')}
                className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg transition duration-200"
              >
                Continue Shopping
              </button>
              <button
                onClick={() => setIsWishlistModalOpen(true)}
                className="bg-rose-500 hover:bg-rose-600 text-white px-4 py-2 rounded-lg transition duration-200"
              >
                View Wishlists
              </button>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-center">
              <svg
                className="w-5 h-5 text-red-600 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 18.5c-.77.833.192 2.5 1.732 2.5z"
                />
              </svg>
              <span className="text-red-800">{error}</span>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            {cart.items.length === 0 ? (
              <div className="bg-white rounded-xl shadow-lg p-8 text-center">
                <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg
                    className="w-12 h-12 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.1 5A1 1 0 006.8 19H19M7 13v6a1 1 0 001 1h10a1 1 0 001-1v-6M9 19v2m6-2v2"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Your cart is empty</h3>
                <p className="text-gray-600 mb-6">
                  Start browsing our available food items to add them to your cart.
                </p>
                <button
                  onClick={() => navigate('/browse-inventory')}
                  className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-lg font-medium transition duration-200"
                >
                  Browse Food Items
                </button>
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-gray-900">Cart Items</h2>
                  <button
                    onClick={handleClearCart}
                    disabled={actionLoading}
                    className="text-red-600 hover:text-red-800 text-sm font-medium"
                  >
                    Clear Cart
                  </button>
                </div>

                <div className="space-y-4">
                  {cart.items.map(item => (
                    <div
                      key={item._id}
                      className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg"
                    >
                      {/* Item Info */}
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">
                          {item.inventory_id?.item_name || 'Unknown Item'}
                        </h3>
                        <p className="text-sm text-gray-600">
                          Category: {item.inventory_id?.category || 'N/A'}
                        </p>
                        {item.inventory_id?.expiration_date && (
                          <p className="text-sm text-gray-500">
                            Expires:{' '}
                            {new Date(item.inventory_id.expiration_date).toLocaleDateString()}
                          </p>
                        )}
                        <p className="text-sm text-gray-500">
                          Available: {item.inventory_id?.quantity || 0} units
                        </p>
                      </div>

                      {/* Quantity Controls */}
                      <div className="flex items-center space-x-3">
                        <button
                          onClick={() => handleQuantityChange(item._id, item.quantity - 1)}
                          disabled={actionLoading || item.quantity <= 1}
                          className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50 disabled:opacity-50"
                        >
                          -
                        </button>
                        <span className="font-semibold text-gray-900 w-8 text-center">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => handleQuantityChange(item._id, item.quantity + 1)}
                          disabled={
                            actionLoading || item.quantity >= (item.inventory_id?.quantity || 0)
                          }
                          className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50 disabled:opacity-50"
                        >
                          +
                        </button>
                      </div>

                      {/* Remove Button */}
                      <button
                        onClick={() => handleRemoveItem(item._id)}
                        disabled={actionLoading}
                        className="text-red-600 hover:text-red-800 p-2"
                      >
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                          />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Cart Summary & Actions */}
          <div className="space-y-6">
            {/* Cart Summary */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Cart Summary</h3>

              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Items:</span>
                  <span className="font-semibold">{cart.total_items || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Unique Items:</span>
                  <span className="font-semibold">{cart.items?.length || 0}</span>
                </div>
              </div>

              {cart.items.length > 0 && (
                <button
                  onClick={handleSubmitRequest}
                  className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-4 rounded-lg transition duration-200 mt-6"
                >
                  Submit Food Request
                </button>
              )}
            </div>

            {/* Save as Wishlist */}
            {cart.items.length > 0 && (
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Save as Wishlist</h3>

                {!wishlistForm.showForm ? (
                  <button
                    onClick={() => setWishlistForm(prev => ({ ...prev, showForm: true }))}
                    className="w-full bg-rose-500 hover:bg-rose-600 text-white py-2 px-4 rounded-lg transition duration-200"
                  >
                    Save Cart as Wishlist
                  </button>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Wishlist Name *
                      </label>
                      <input
                        type="text"
                        value={wishlistForm.name}
                        onChange={e => setWishlistForm(prev => ({ ...prev, name: e.target.value }))}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                        placeholder="My Wishlist"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Description (optional)
                      </label>
                      <textarea
                        value={wishlistForm.description}
                        onChange={e =>
                          setWishlistForm(prev => ({ ...prev, description: e.target.value }))
                        }
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                        placeholder="Weekly groceries, emergency food, etc."
                        rows={3}
                      />
                    </div>

                    <div className="flex space-x-2">
                      <button
                        onClick={handleSaveAsWishlist}
                        disabled={actionLoading || !wishlistForm.name.trim()}
                        className="flex-1 bg-rose-500 hover:bg-rose-600 disabled:opacity-50 text-white py-2 px-4 rounded-lg transition duration-200"
                      >
                        {actionLoading ? 'Saving...' : 'Save Wishlist'}
                      </button>
                      <button
                        onClick={() =>
                          setWishlistForm({ name: '', description: '', showForm: false })
                        }
                        className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition duration-200"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Quick Actions */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>

              <div className="space-y-3">
                <button
                  onClick={() => navigate('/browse-inventory')}
                  className="w-full bg-orange-500 hover:bg-orange-600 text-white py-2 px-4 rounded-lg transition duration-200 flex items-center justify-center space-x-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                  <span>Browse Food Items</span>
                </button>

                <button
                  onClick={() => setIsWishlistModalOpen(true)}
                  className="w-full bg-purple-500 hover:bg-purple-600 text-white py-2 px-4 rounded-lg transition duration-200 flex items-center justify-center space-x-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                    />
                  </svg>
                  <span>Load from Wishlist</span>
                </button>

                <button
                  onClick={() => navigate('/request-history')}
                  className="w-full bg-gray-500 hover:bg-gray-600 text-white py-2 px-4 rounded-lg transition duration-200 flex items-center justify-center space-x-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
                    />
                  </svg>
                  <span>View Request History</span>
                </button>
              </div>
            </div>

            {/* Cart Tips */}
            <div className="bg-blue-50 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-blue-900 mb-3">💡 Tips</h3>
              <ul className="text-sm text-blue-800 space-y-2">
                <li>• Save frequently requested items as a wishlist for easy reordering</li>
                <li>• Check expiration dates to prioritize items</li>
                <li>• Submit requests early in the week for better availability</li>
                <li>• Review your request history to track patterns</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Wishlist Modal */}
      <WishlistModal isOpen={isWishlistModalOpen} onClose={() => setIsWishlistModalOpen(false)} />

      <Footer />
    </div>
  );
};

export default CartPage;
