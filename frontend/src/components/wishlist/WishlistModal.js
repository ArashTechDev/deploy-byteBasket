// frontend/src/components/wishlist/WishlistModal.js
import React, { useState, useEffect } from 'react';
import wishlistService from '../../services/wishlistService';
import { useCart } from '../../contexts/CartContext';

const WishlistModal = ({ isOpen, onClose }) => {
  const [wishlists, setWishlists] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { loadCart } = useCart();

  useEffect(() => {
    if (isOpen) {
      loadWishlists();
    }
  }, [isOpen]);

  const loadWishlists = async () => {
    try {
      setLoading(true);
      const response = await wishlistService.getWishlists();
      if (response.success) {
        setWishlists(response.data);
      }
    } catch (error) {
      setError('Failed to load wishlists');
    } finally {
      setLoading(false);
    }
  };

  const handleLoadToCart = async wishlistId => {
    try {
      setLoading(true);
      const response = await wishlistService.loadToCart(wishlistId);
      if (response.success) {
        await loadCart(); // Refresh cart
        alert(`Wishlist loaded! ${response.data.validItems} items added to cart.`);
        if (response.data.invalidItems > 0) {
          alert(
            `Note: ${response.data.invalidItems} items were unavailable and couldn't be added.`
          );
        }
        onClose();
      }
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to load wishlist to cart');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteWishlist = async wishlistId => {
    if (!window.confirm('Are you sure you want to delete this wishlist?')) return;

    try {
      setLoading(true);
      const response = await wishlistService.deleteWishlist(wishlistId);
      if (response.success) {
        setWishlists(wishlists.filter(w => w._id !== wishlistId));
      }
    } catch (error) {
      setError('Failed to delete wishlist');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black opacity-50" onClick={onClose} />
      <div className="relative bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">My Wishlists</h2>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="p-4 bg-red-50 border-l-4 border-red-400 text-red-700">{error}</div>
        )}

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-96">
          {loading && (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-gray-600">Loading...</p>
            </div>
          )}

          {!loading && wishlists.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <svg
                className="w-16 h-16 mx-auto mb-4 text-gray-300"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1}
                  d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                />
              </svg>
              <p>No wishlists found</p>
              <p className="text-sm mt-1">Add items to your cart and save as a wishlist!</p>
            </div>
          )}

          {!loading && wishlists.length > 0 && (
            <div className="space-y-4">
              {wishlists.map(wishlist => (
                <div key={wishlist._id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">{wishlist.name}</h3>
                      {wishlist.description && (
                        <p className="text-sm text-gray-600 mt-1">{wishlist.description}</p>
                      )}
                      <p className="text-sm text-gray-500 mt-2">
                        {wishlist.total_items} {wishlist.total_items === 1 ? 'item' : 'items'} •
                        Created {new Date(wishlist.created_at).toLocaleDateString()}
                      </p>

                      {/* Wishlist Items Preview */}
                      {wishlist.items.length > 0 && (
                        <div className="mt-3 space-y-1">
                          {wishlist.items.slice(0, 3).map(item => (
                            <div key={item._id} className="text-sm text-gray-600">
                              • {item.item_name} (Qty: {item.quantity})
                            </div>
                          ))}
                          {wishlist.items.length > 3 && (
                            <div className="text-sm text-gray-500">
                              ... and {wishlist.items.length - 3} more items
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="flex space-x-2 ml-4">
                      <button
                        onClick={() => handleLoadToCart(wishlist._id)}
                        className="px-3 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                        disabled={loading}
                      >
                        Load to Cart
                      </button>
                      <button
                        onClick={() => handleDeleteWishlist(wishlist._id)}
                        className="px-3 py-2 text-sm text-red-600 border border-red-600 rounded-lg hover:bg-red-50"
                        disabled={loading}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default WishlistModal;
