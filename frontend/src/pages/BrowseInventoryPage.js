/* eslint-disable no-console */
// frontend/src/pages/BrowseInventoryPage.js
import React, { useState, useEffect } from 'react';
import Header from '../components/layout/Header';
import CartIcon from '../components/cart/CartIcon';
import CartSidebar from '../components/cart/CartSidebar';
import WishlistModal from '../components/wishlist/WishlistModal';
import { useCart } from '../contexts/CartContext';
import inventoryService from '../services/inventoryService';

const BrowseInventoryPage = ({ onNavigate }) => {
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [wishlistOpen, setWishlistOpen] = useState(false);
  const [filters, setFilters] = useState({
    search: '',
    category: '',
    dietary_category: '',
  });

  const { addToCart, error, clearError } = useCart();

  useEffect(() => {
    loadInventory();
  }, [filters]);

  const loadInventory = async () => {
    try {
      setLoading(true);
      const response = await inventoryService.getInventory({
        search: filters.search,
        category: filters.category,
        dietary_category: filters.dietary_category,
      });
      if (response.success) {
        setInventory(response.data);
      }
    } catch (error) {
      console.error('Failed to load inventory:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async item => {
    const result = await addToCart(item._id, 1);
    if (result.success) {
      alert('Item added to cart!');
    }
  };

  const handleCheckout = () => {
    setCartOpen(false);
    onNavigate('request-submission');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header onNavigate={onNavigate}>
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setWishlistOpen(true)}
            className="px-4 py-2 text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50"
          >
            My Wishlists
          </button>
          <CartIcon onClick={() => setCartOpen(true)} />
        </div>
      </Header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Browse Available Items</h1>
          <p className="mt-2 text-gray-600">Add items to your cart and submit a request</p>
        </div>

        {/* Filters */}
        <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <input
            type="text"
            placeholder="Search items..."
            value={filters.search}
            onChange={e => setFilters({ ...filters, search: e.target.value })}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <select
            value={filters.category}
            onChange={e => setFilters({ ...filters, category: e.target.value })}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Categories</option>
            <option value="canned">Canned Goods</option>
            <option value="fresh">Fresh Produce</option>
            <option value="dry">Dry Goods</option>
            <option value="frozen">Frozen</option>
            <option value="dairy">Dairy</option>
            <option value="meat">Meat & Poultry</option>
          </select>
          <select
            value={filters.dietary_category}
            onChange={e => setFilters({ ...filters, dietary_category: e.target.value })}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Dietary Options</option>
            <option value="vegetarian">Vegetarian</option>
            <option value="vegan">Vegan</option>
            <option value="gluten_free">Gluten Free</option>
            <option value="dairy_free">Dairy Free</option>
            <option value="nut_free">Nut Free</option>
            <option value="low_sodium">Low Sodium</option>
          </select>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-400 text-red-700">
            <div className="flex">
              <div className="flex-1">{error}</div>
              <button onClick={clearError} className="ml-2 text-red-400 hover:text-red-600">
                ×
              </button>
            </div>
          </div>
        )}

        {/* Inventory Grid */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading inventory...</p>
          </div>
        ) : inventory.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">No items found matching your criteria.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {inventory.map(item => (
              <div key={item._id} className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{item.item_name}</h3>
                  <div className="space-y-2 text-sm text-gray-600">
                    <p>
                      <span className="font-medium">Category:</span> {item.category}
                    </p>
                    <p>
                      <span className="font-medium">Available:</span> {item.quantity} units
                    </p>
                    {item.expiration_date && (
                      <p>
                        <span className="font-medium">Expires:</span>{' '}
                        {new Date(item.expiration_date).toLocaleDateString()}
                      </p>
                    )}
                    {item.dietary_category && (
                      <span className="inline-block px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">
                        {item.dietary_category}
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => handleAddToCart(item)}
                    disabled={item.quantity === 0}
                    className="w-full mt-4 py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
                  >
                    {item.quantity === 0 ? 'Out of Stock' : 'Add to Cart'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <CartSidebar
        isOpen={cartOpen}
        onClose={() => setCartOpen(false)}
        onCheckout={handleCheckout}
      />

      <WishlistModal isOpen={wishlistOpen} onClose={() => setWishlistOpen(false)} />
    </div>
  );
};

export default BrowseInventoryPage;
