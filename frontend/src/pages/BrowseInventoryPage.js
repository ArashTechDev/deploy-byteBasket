// frontend/src/pages/BrowseInventoryPage.js
import React, { useState, useEffect, useCallback } from 'react';
import Header from '../components/layout/Header';
import CartIcon from '../components/cart/CartIcon';
import CartSidebar from '../components/cart/CartSidebar';
import WishlistModal from '../components/wishlist/WishlistModal';
import { useCart } from '../contexts/CartContext';
import { useTranslation } from 'react-i18next';
import InventoryService from '../services/inventoryService';

// Custom debounce hook
function useDebounce(value, delay) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debounced;
}

const BrowseInventoryPage = ({ onNavigate }) => {
  const { t } = useTranslation();
  const { addToCart, error, clearError } = useCart();

  // State for inventory and UI
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [wishlistOpen, setWishlistOpen] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  // Categories and dietary categories
  const [categories, setCategories] = useState([]);
  const [dietaryCategories, setDietaryCategories] = useState([]);

  // Filter states
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedDietary, setSelectedDietary] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  // Pagination
  const [page, setPage] = useState(1);
  const pageSize = 12;
  const [totalPages, setTotalPages] = useState(1);

  // Load categories and dietary categories on mount
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const [categoriesData, dietaryData] = await Promise.all([
          InventoryService.getCategories(),
          InventoryService.getDietaryCategories(),
        ]);
        setCategories(categoriesData || []);
        setDietaryCategories(dietaryData || []);
      } catch (error) {
        console.error('Failed to load categories:', error);
        setCategories([]);
        setDietaryCategories([]);
      }
    };

    loadCategories();
  }, []);

  // Load inventory items when filters/search/page change
  const loadInventory = useCallback(async () => {
    try {
      setLoading(true);

      const filters = {
        search: debouncedSearchTerm || undefined,
        category: selectedCategories.length ? selectedCategories.join(',') : undefined,
        dietary_category: selectedDietary.length ? selectedDietary.join(',') : undefined,
        page,
        limit: pageSize,
      };

      const response = await InventoryService.getAll(filters);

      if (response.items) {
        setInventory(response.items);
        setTotalPages(response.pagination?.totalPages || 1);
      } else {
        setInventory([]);
        setTotalPages(1);
      }
    } catch (error) {
      console.error('Failed to load inventory:', error);
      setInventory([]);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  }, [selectedCategories, selectedDietary, debouncedSearchTerm, page, pageSize]);

  useEffect(() => {
    loadInventory();
  }, [loadInventory]);

  // Filter handlers
  const toggleCategory = category => {
    setPage(1);
    setSelectedCategories(prev =>
      prev.includes(category) ? prev.filter(c => c !== category) : [...prev, category]
    );
  };

  const toggleDietary = dietary => {
    setPage(1);
    setSelectedDietary(prev =>
      prev.includes(dietary) ? prev.filter(d => d !== dietary) : [...prev, dietary]
    );
  };

  const clearFilters = () => {
    setSelectedCategories([]);
    setSelectedDietary([]);
    setSearchTerm('');
    setPage(1);
  };

  // Pagination handlers
  const goPrev = () => setPage(p => Math.max(1, p - 1));
  const goNext = () => setPage(p => Math.min(totalPages, p + 1));

  // Cart handlers
  const handleAddToCart = async item => {
    const result = await addToCart(item._id, 1);
    if (result.success) {
      alert(t('itemAddedToCart', 'Item added to cart!'));
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
            className="px-4 py-2 text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
          >
            {t('myWishlists', 'My Wishlists')}
          </button>
          <CartIcon onClick={() => setCartOpen(true)} />
        </div>
      </Header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 tracking-tight">
            {t('browseInventoryTitle', 'Browse Available Items')}
          </h1>
          <p className="mt-2 text-gray-600">
            {t('browseInventorySubtitle', 'Find items you need and add them to your cart')}
          </p>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative max-w-xl">
            <input
              type="text"
              placeholder={t('searchPlaceholder', 'Search items...')}
              value={searchTerm}
              onChange={e => {
                setPage(1);
                setSearchTerm(e.target.value);
              }}
              className="w-full pl-4 pr-10 py-3 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm"
              aria-label={t('searchAriaLabel', 'Search inventory items')}
            />
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              <svg
                className="h-5 w-5 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-400 text-red-700 rounded-lg">
            <div className="flex justify-between items-center">
              <span>{error}</span>
              <button onClick={clearError} className="ml-2 text-red-400 hover:text-red-600 text-xl">
                ×
              </button>
            </div>
          </div>
        )}

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Enhanced Filters Sidebar */}
          <aside className="lg:w-80 flex-shrink-0">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 sticky top-4">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-gray-900">{t('filters', 'Filters')}</h2>
                {(selectedCategories.length > 0 || selectedDietary.length > 0) && (
                  <button
                    onClick={clearFilters}
                    className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                  >
                    {t('clearAll', 'Clear All')}
                  </button>
                )}
              </div>

              {/* Category Filters */}
              <div className="mb-8">
                <h3 className="font-medium mb-4 text-gray-800">
                  {t('filterByCategory', 'Category')}
                </h3>
                <div className="max-h-48 overflow-y-auto space-y-3">
                  {categories.length === 0 ? (
                    <p className="text-gray-400 text-sm italic">
                      {t('noCategories', 'No categories found')}
                    </p>
                  ) : (
                    categories.map(category => (
                      <label
                        key={category}
                        className="flex items-center cursor-pointer text-gray-700 hover:text-gray-900 transition-colors"
                      >
                        <input
                          type="checkbox"
                          checked={selectedCategories.includes(category)}
                          onChange={() => toggleCategory(category)}
                          className="mr-3 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <span className="capitalize text-sm">{category}</span>
                      </label>
                    ))
                  )}
                </div>
              </div>

              {/* Dietary Filters */}
              <div>
                <h3 className="font-medium mb-4 text-gray-800">
                  {t('filterByDietary', 'Dietary Restrictions')}
                </h3>
                <div className="max-h-48 overflow-y-auto space-y-3">
                  {dietaryCategories.length === 0 ? (
                    <p className="text-gray-400 text-sm italic">
                      {t('noDietaryCategories', 'No dietary categories found')}
                    </p>
                  ) : (
                    dietaryCategories.map(dietary => (
                      <label
                        key={dietary}
                        className="flex items-center cursor-pointer text-gray-700 hover:text-gray-900 transition-colors"
                      >
                        <input
                          type="checkbox"
                          checked={selectedDietary.includes(dietary)}
                          onChange={() => toggleDietary(dietary)}
                          className="mr-3 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <span className="capitalize text-sm">{dietary}</span>
                      </label>
                    ))
                  )}
                </div>
              </div>

              {/* Active Filters Summary */}
              {(selectedCategories.length > 0 || selectedDietary.length > 0) && (
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <h4 className="text-sm font-medium text-gray-900 mb-3">
                    {t('activeFilters', 'Active Filters')}
                  </h4>
                  <div className="space-y-2">
                    {selectedCategories.map(category => (
                      <span
                        key={category}
                        className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800"
                      >
                        {category}
                        <button
                          onClick={() => toggleCategory(category)}
                          className="ml-1 text-blue-600 hover:text-blue-800"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                    {selectedDietary.map(dietary => (
                      <span
                        key={dietary}
                        className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 text-green-800"
                      >
                        {dietary}
                        <button
                          onClick={() => toggleDietary(dietary)}
                          className="ml-1 text-green-600 hover:text-green-800"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </aside>

          {/* Main Content */}
          <section className="flex-1">
            {/* Results Header */}
            <div className="flex justify-between items-center mb-6">
              <p className="text-gray-600">
                {loading
                  ? t('loading', 'Loading...')
                  : t('showingResults', `Showing ${inventory.length} items`)}
              </p>
              <div className="text-sm text-gray-500">
                {totalPages > 1 && <span>{t('pageInfo', `Page ${page} of ${totalPages}`)}</span>}
              </div>
            </div>

            {/* Inventory Grid */}
            {loading ? (
              <div className="flex justify-center items-center py-24">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                <p className="ml-4 text-gray-600">
                  {t('loadingInventory', 'Loading inventory...')}
                </p>
              </div>
            ) : inventory.length === 0 ? (
              <div className="text-center py-24">
                <div className="mx-auto h-24 w-24 text-gray-400 mb-4">
                  <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1}
                      d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2M4 13h2m13-8l-4 4m0-4l4 4"
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {t('noItemsFound', 'No items found')}
                </h3>
                <p className="text-gray-500">
                  {t(
                    'noItemsFoundMessage',
                    "Try adjusting your search or filters to find what you're looking for."
                  )}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {inventory.map(item => (
                  <div
                    key={item._id}
                    className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
                  >
                    <div className="p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">
                        {item.item_name || item.itemName}
                      </h3>

                      <div className="space-y-2 text-sm text-gray-600 mb-4">
                        <p>
                          <span className="font-medium">{t('category', 'Category')}:</span>{' '}
                          <span className="capitalize">{item.category}</span>
                        </p>
                        <p>
                          <span className="font-medium">{t('available', 'Available')}:</span>{' '}
                          {item.quantity} {t('units', 'units')}
                        </p>
                        {(item.expiration_date || item.expirationDate) && (
                          <p>
                            <span className="font-medium">{t('expires', 'Expires')}:</span>{' '}
                            {new Date(
                              item.expiration_date || item.expirationDate
                            ).toLocaleDateString()}
                          </p>
                        )}
                      </div>

                      {/* Dietary Category Tags */}
                      {(item.dietary_category || item.dietaryCategory) && (
                        <div className="mb-4">
                          <span className="inline-block px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">
                            {item.dietary_category || item.dietaryCategory}
                          </span>
                        </div>
                      )}

                      {/* Add to Cart Button */}
                      <button
                        onClick={() => handleAddToCart(item)}
                        disabled={item.quantity === 0}
                        className={`w-full py-2 px-4 rounded-lg font-medium transition-colors ${
                          item.quantity === 0
                            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                            : 'bg-blue-600 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
                        }`}
                      >
                        {item.quantity === 0
                          ? t('outOfStock', 'Out of Stock')
                          : t('addToCart', 'Add to Cart')}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Enhanced Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-8 mt-12">
                <button
                  onClick={goPrev}
                  disabled={page === 1}
                  className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                    page === 1
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
                  }`}
                >
                  {t('previous', 'Previous')}
                </button>

                <span className="text-gray-700 font-medium">
                  {t('pageLabel', 'Page')} {page} {t('ofLabel', 'of')} {totalPages}
                </span>

                <button
                  onClick={goNext}
                  disabled={page === totalPages}
                  className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                    page === totalPages
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
                  }`}
                >
                  {t('next', 'Next')}
                </button>
              </div>
            )}
          </section>
        </div>
      </main>

      {/* Cart Sidebar */}
      <CartSidebar
        isOpen={cartOpen}
        onClose={() => setCartOpen(false)}
        onCheckout={handleCheckout}
      />

      {/* Wishlist Modal */}
      <WishlistModal isOpen={wishlistOpen} onClose={() => setWishlistOpen(false)} />
    </div>
  );
};

export default BrowseInventoryPage;
