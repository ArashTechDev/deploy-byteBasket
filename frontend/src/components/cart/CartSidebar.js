// frontend/src/components/cart/CartSidebar.js
import React, { useState } from 'react';
import { useCart } from '../../contexts/CartContext';

const CartSidebar = ({ isOpen, onClose, onCheckout }) => {
  const { cart, updateCartItem, removeFromCart, clearCart, saveAsWishlist, loading, error } =
    useCart();
  const [wishlistName, setWishlistName] = useState('');
  const [showSaveWishlist, setShowSaveWishlist] = useState(false);

  const handleQuantityChange = async (itemId, newQuantity) => {
    if (newQuantity <= 0) {
      await removeFromCart(itemId);
    } else {
      await updateCartItem(itemId, newQuantity);
    }
  };

  const handleSaveWishlist = async () => {
    if (!wishlistName.trim()) return;

    const result = await saveAsWishlist(wishlistName, '');
    if (result.success) {
      setWishlistName('');
      setShowSaveWishlist(false);
      alert('Wishlist saved successfully!');
    }
  };

  return (
    <div className={`fixed inset-0 z-50 ${isOpen ? '' : 'pointer-events-none'}`}>
      {/* Backdrop */}
      <div
        className={`absolute inset-0 bg-black transition-opacity duration-300 ${
          isOpen ? 'opacity-50' : 'opacity-0'
        }`}
        onClick={onClose}
      />

      {/* Sidebar */}
      <div
        className={`absolute right-0 top-0 h-full w-96 bg-white shadow-xl transform transition-transform duration-300 ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Shopping Cart</h2>
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
            <p className="text-sm text-gray-600 mt-1">
              {cart.total_items} {cart.total_items === 1 ? 'item' : 'items'}
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-4 bg-red-50 border-l-4 border-red-400 text-red-700">{error}</div>
          )}

          {/* Cart Items */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {cart.items.length === 0 ? (
              <div className="text-center text-gray-500 mt-8">
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
                    d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.1 5A1 1 0 006.8 19H19M7 13v6a1 1 0 001 1h10a1 1 0 001-1v-6M9 19v2m6-2v2"
                  />
                </svg>
                <p>Your cart is empty</p>
              </div>
            ) : (
              cart.items.map(item => (
                <div
                  key={item._id}
                  className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg"
                >
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">{item.item_name}</h3>
                    {item.dietary_category && (
                      <span className="inline-block px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full mt-1">
                        {item.dietary_category}
                      </span>
                    )}
                    <div className="flex items-center space-x-2 mt-2">
                      <button
                        onClick={() => handleQuantityChange(item._id, item.quantity - 1)}
                        className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded-lg hover:bg-gray-50"
                        disabled={loading}
                      >
                        -
                      </button>
                      <span className="px-3 py-1 bg-gray-100 rounded">{item.quantity}</span>
                      <button
                        onClick={() => handleQuantityChange(item._id, item.quantity + 1)}
                        className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded-lg hover:bg-gray-50"
                        disabled={loading}
                      >
                        +
                      </button>
                    </div>
                  </div>
                  <button
                    onClick={() => removeFromCart(item._id)}
                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                    disabled={loading}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                  </button>
                </div>
              ))
            )}
          </div>

          {/* Save as Wishlist */}
          {cart.items.length > 0 && (
            <div className="p-4 border-t border-gray-200">
              {!showSaveWishlist ? (
                <button
                  onClick={() => setShowSaveWishlist(true)}
                  className="w-full py-2 px-4 text-sm text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50"
                >
                  Save as Wishlist
                </button>
              ) : (
                <div className="space-y-2">
                  <input
                    type="text"
                    placeholder="Wishlist name"
                    value={wishlistName}
                    onChange={e => setWishlistName(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                  <div className="flex space-x-2">
                    <button
                      onClick={handleSaveWishlist}
                      disabled={!wishlistName.trim() || loading}
                      className="flex-1 py-2 px-4 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => setShowSaveWishlist(false)}
                      className="flex-1 py-2 px-4 text-sm border border-gray-300 rounded-lg hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Footer */}
          {cart.items.length > 0 && (
            <div className="p-4 border-t border-gray-200 space-y-3">
              <div className="flex justify-between">
                <button
                  onClick={clearCart}
                  className="text-sm text-red-600 hover:text-red-700"
                  disabled={loading}
                >
                  Clear Cart
                </button>
              </div>
              <button
                onClick={onCheckout}
                className="w-full py-3 px-4 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium"
                disabled={loading}
              >
                Proceed to Request ({cart.total_items} items)
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CartSidebar;
