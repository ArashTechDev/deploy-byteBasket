// frontend/src/pages/InventoryManagement.js
import React, { useState, useEffect } from 'react';
import { Search, Filter, Download, Plus, Edit, Trash2, AlertTriangle, Calendar, Package, X } from 'lucide-react';
import { useInventory, useInventoryAlerts } from '../hooks/useInventory';
import inventoryService from '../services/inventoryService';

// Main Inventory Management Component
const InventoryManagement = () => {
  const {
    inventory,
    loading,
    error,
    pagination,
    filters,
    updateFilters,
    changePage,
    createItem,
    updateItem,
    deleteItem,
    refetch
  } = useInventory();

  const { alerts } = useInventoryAlerts();
  
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [categories, setCategories] = useState([]);
  const [dietaryCategories, setDietaryCategories] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);
  const [showFilters, setShowFilters] = useState(false);

  // Fetch metadata on component mount
  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        const [categoriesData, dietaryData] = await Promise.all([
          inventoryService.getCategories(),
          inventoryService.getDietaryCategories()
        ]);
        setCategories(categoriesData);
        setDietaryCategories(dietaryData);
      } catch (error) {
        console.error('Error fetching metadata:', error);
      }
    };

    fetchMetadata();
  }, []);

  const handleSearch = (e) => {
    updateFilters({ search: e.target.value });
  };

  const handleFilterChange = (key, value) => {
    updateFilters({ [key]: value });
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setShowForm(true);
  };

  const handleDelete = async (item) => {
    if (window.confirm(`Are you sure you want to delete "${item.item_name}"?`)) {
      try {
        await deleteItem(item._id || item.inventory_id);
      } catch (error) {
        alert(`Error deleting item: ${error.message}`);
      }
    }
  };

  const handleFormSubmit = async (formData) => {
    try {
      if (editingItem) {
        await updateItem(editingItem._id || editingItem.inventory_id, formData);
      } else {
        await createItem(formData);
      }
      setShowForm(false);
      setEditingItem(null);
    } catch (error) {
      alert(`Error saving item: ${error.message}`);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedItems.length === 0) return;
    
    if (window.confirm(`Are you sure you want to delete ${selectedItems.length} items?`)) {
      try {
        await Promise.all(selectedItems.map(id => deleteItem(id)));
        setSelectedItems([]);
      } catch (error) {
        alert(`Error deleting items: ${error.message}`);
      }
    }
  };

  const exportData = () => {
    const csvContent = [
      ['Name', 'Category', 'Quantity', 'Location', 'Expiration', 'Dietary Category'].join(','),
      ...inventory.map(item => [
        item.item_name,
        item.category,
        item.quantity,
        item.storage_location || '',
        item.expiration_date || '',
        item.dietary_category || ''
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'inventory.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (error) {
    return (
      <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded">
        <h3 className="font-bold">Error Loading Inventory</h3>
        <p>{error}</p>
        <button 
          onClick={refetch}
          className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Inventory Management</h1>
        <div className="flex space-x-3">
          <button
            onClick={exportData}
            className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            <Download size={20} className="mr-2" />
            Export
          </button>
          <button
            onClick={() => {
              setEditingItem(null);
              setShowForm(true);
            }}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Plus size={20} className="mr-2" />
            Add Item
          </button>
        </div>
      </div>

      {/* Alerts Section */}
      {(alerts.lowStock.length > 0 || alerts.expiring.length > 0) && (
        <AlertsSection alerts={alerts} />
      )}

      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow mb-6 p-4">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search items..."
                value={filters.search}
                onChange={handleSearch}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            <Filter size={20} className="mr-2" />
            Filters
          </button>
        </div>

        {/* Expandable Filters */}
        {showFilters && (
          <FiltersSection
            filters={filters}
            categories={categories}
            dietaryCategories={dietaryCategories}
            onFilterChange={handleFilterChange}
          />
        )}
      </div>

      {/* Bulk Actions */}
      {selectedItems.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex justify-between items-center">
            <span className="text-blue-800">
              {selectedItems.length} item(s) selected
            </span>
            <button
              onClick={handleBulkDelete}
              className="flex items-center px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
            >
              <Trash2 size={16} className="mr-1" />
              Delete Selected
            </button>
          </div>
        </div>
      )}

      {/* Inventory Table */}
      <InventoryTable
        inventory={inventory}
        loading={loading}
        selectedItems={selectedItems}
        onSelectionChange={setSelectedItems}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      {/* Pagination */}
      <PaginationComponent
        pagination={pagination}
        onPageChange={changePage}
      />

      {/* Form Modal */}
      {showForm && (
        <InventoryForm
          item={editingItem}
          categories={categories}
          dietaryCategories={dietaryCategories}
          onClose={() => {
            setShowForm(false);
            setEditingItem(null);
          }}
          onSave={handleFormSubmit}
        />
      )}
    </div>
  );
};

// Alerts Section Component
const AlertsSection = ({ alerts }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
    {alerts.lowStock.length > 0 && (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-center mb-2">
          <AlertTriangle className="text-red-500 mr-2" size={20} />
          <h3 className="font-semibold text-red-800">Low Stock Alert</h3>
        </div>
        <p className="text-red-700 mb-2">{alerts.lowStock.length} items running low</p>
        <ul className="text-sm text-red-600">
          {alerts.lowStock.slice(0, 3).map(item => (
            <li key={item._id || item.inventory_id}>
              {item.item_name}: {item.quantity} left
            </li>
          ))}
          {alerts.lowStock.length > 3 && (
            <li>...and {alerts.lowStock.length - 3} more</li>
          )}
        </ul>
      </div>
    )}

    {alerts.expiring.length > 0 && (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex items-center mb-2">
          <Calendar className="text-yellow-500 mr-2" size={20} />
          <h3 className="font-semibold text-yellow-800">Expiring Soon</h3>
        </div>
        <p className="text-yellow-700 mb-2">{alerts.expiring.length} items expiring soon</p>
        <ul className="text-sm text-yellow-600">
          {alerts.expiring.slice(0, 3).map(item => (
            <li key={item._id || item.inventory_id}>
              {item.item_name}: {new Date(item.expiration_date).toLocaleDateString()}
            </li>
          ))}
          {alerts.expiring.length > 3 && (
            <li>...and {alerts.expiring.length - 3} more</li>
          )}
        </ul>
      </div>
    )}
  </div>
);

// Filters Section Component
const FiltersSection = ({ filters, categories, dietaryCategories, onFilterChange }) => (
  <div className="mt-4 pt-4 border-t border-gray-200">
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <select
        value={filters.category}
        onChange={(e) => onFilterChange('category', e.target.value)}
        className="border border-gray-300 rounded-lg px-3 py-2"
      >
        <option value="">All Categories</option>
        {categories.map(cat => (
          <option key={cat} value={cat}>{cat}</option>
        ))}
      </select>

      <select
        value={filters.dietary_category}
        onChange={(e) => onFilterChange('dietary_category', e.target.value)}
        className="border border-gray-300 rounded-lg px-3 py-2"
      >
        <option value="">All Dietary Categories</option>
        {dietaryCategories.map(diet => (
          <option key={diet} value={diet}>{diet}</option>
        ))}
      </select>

      <select
        value={filters.sort}
        onChange={(e) => onFilterChange('sort', e.target.value)}
        className="border border-gray-300 rounded-lg px-3 py-2"
      >
        <option value="-date_added">Newest First</option>
        <option value="date_added">Oldest First</option>
        <option value="item_name">Name A-Z</option>
        <option value="-item_name">Name Z-A</option>
        <option value="quantity">Quantity Low-High</option>
        <option value="-quantity">Quantity High-Low</option>
      </select>

      <div className="flex items-center space-x-4">
        <label className="flex items-center">
          <input
            type="checkbox"
            checked={filters.low_stock}
            onChange={(e) => onFilterChange('low_stock', e.target.checked)}
            className="mr-2"
          />
          Low Stock Only
        </label>
      </div>
    </div>
  </div>
);

// Inventory Table Component
const InventoryTable = ({ 
  inventory, 
  loading, 
  selectedItems, 
  onSelectionChange, 
  onEdit, 
  onDelete 
}) => {
  const handleSelectAll = (e) => {
    if (e.target.checked) {
      onSelectionChange(inventory.map(item => item._id || item.inventory_id));
    } else {
      onSelectionChange([]);
    }
  };

  const handleSelectItem = (itemId) => {
    onSelectionChange(prev => 
      prev.includes(itemId)
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-8 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading inventory...</p>
      </div>
    );
  }

  if (inventory.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-8 text-center">
        <Package size={48} className="mx-auto text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No items found</h3>
        <p className="text-gray-600">Try adjusting your search or filters</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left">
                <input
                  type="checkbox"
                  checked={selectedItems.length === inventory.length}
                  onChange={handleSelectAll}
                  className="rounded"
                />
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Item
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Category
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Quantity
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Location
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Expiration
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {inventory.map((item) => {
              const itemId = item._id || item.inventory_id;
              const isSelected = selectedItems.includes(itemId);
              const isLowStock = item.low_stock || (item.quantity <= (item.minimum_stock_level || 10));
              const isExpiring = item.expiration_date && 
                new Date(item.expiration_date) <= new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
              
              return (
                <tr key={itemId} className={isSelected ? 'bg-blue-50' : 'hover:bg-gray-50'}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => handleSelectItem(itemId)}
                      className="rounded"
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {item.item_name}
                        </div>
                        {item.dietary_category && (
                          <div className="text-sm text-gray-500">
                            {item.dietary_category}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {item.category}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <span className={isLowStock ? 'text-red-600 font-semibold' : ''}>
                      {item.quantity}
                    </span>
                    <span className="text-gray-500 ml-1">units</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {item.storage_location || 'Not specified'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {item.expiration_date ? (
                      <span className={isExpiring ? 'text-yellow-600 font-semibold' : ''}>
                        {new Date(item.expiration_date).toLocaleDateString()}
                      </span>
                    ) : (
                      <span className="text-gray-500">No expiration</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex space-x-2">
                      {isLowStock && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          <AlertTriangle size={12} className="mr-1" />
                          Low Stock
                        </span>
                      )}
                      {isExpiring && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                          <Calendar size={12} className="mr-1" />
                          Expiring
                        </span>
                      )}
                      {!isLowStock && !isExpiring && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          Good
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => onEdit(item)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => onDelete(item)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// Pagination Component
const PaginationComponent = ({ pagination, onPageChange }) => {
  if (!pagination || pagination.totalPages <= 1) return null;

  const pages = [];
  const maxVisiblePages = 5;
  const { currentPage, totalPages } = pagination;

  let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
  let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

  if (endPage - startPage + 1 < maxVisiblePages) {
    startPage = Math.max(1, endPage - maxVisiblePages + 1);
  }

  for (let i = startPage; i <= endPage; i++) {
    pages.push(i);
  }

  return (
    <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6 mt-6 rounded-lg shadow">
      <div className="flex-1 flex justify-between sm:hidden">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Previous
        </button>
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Next
        </button>
      </div>
      <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-gray-700">
            Showing{' '}
            <span className="font-medium">{(currentPage - 1) * pagination.itemsPerPage + 1}</span>{' '}
            to{' '}
            <span className="font-medium">
              {Math.min(currentPage * pagination.itemsPerPage, pagination.totalItems)}
            </span>{' '}
            of{' '}
            <span className="font-medium">{pagination.totalItems}</span>{' '}
            results
          </p>
        </div>
        <div>
          <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
            <button
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            {pages.map(page => (
              <button
                key={page}
                onClick={() => onPageChange(page)}
                className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                  page === currentPage
                    ? 'z-10 bg-blue-600 border-blue-600 text-white'
                    : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                }`}
              >
                {page}
              </button>
            ))}
            <button
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </nav>
        </div>
      </div>
    </div>
  );
};

// Inventory Form Component
const InventoryForm = ({ item, categories, dietaryCategories, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    foodbank_id: item?.foodbank_id || '',
    item_name: item?.item_name || '',
    category: item?.category || '',
    quantity: item?.quantity || '',
    expiration_date: item?.expiration_date ? item.expiration_date.split('T')[0] : '',
    storage_location: item?.storage_location || '',
    dietary_category: item?.dietary_category || '',
    barcode: item?.barcode || '',
    minimum_stock_level: item?.minimum_stock_level || 10,
    description: item?.description || ''
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validate = () => {
    const newErrors = {};
    
    if (!formData.item_name.trim()) newErrors.item_name = 'Item name is required';
    if (!formData.category.trim()) newErrors.category = 'Category is required';
    if (!formData.quantity || formData.quantity < 0) newErrors.quantity = 'Valid quantity is required';
    if (formData.minimum_stock_level < 0) newErrors.minimum_stock_level = 'Minimum stock level must be 0 or greater';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validate()) return;

    setLoading(true);
    try {
      await onSave({
        ...formData,
        quantity: parseInt(formData.quantity),
        minimum_stock_level: parseInt(formData.minimum_stock_level)
      });
    } catch (error) {
      console.error('Error saving item:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium">
            {item ? 'Edit Inventory Item' : 'Add New Inventory Item'}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Item Name *
              </label>
              <input
                type="text"
                name="item_name"
                value={formData.item_name}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.item_name ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter item name"
              />
              {errors.item_name && (
                <p className="text-red-500 text-sm mt-1">{errors.item_name}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category *
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.category ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                <option value="">Select category</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
              {errors.category && (
                <p className="text-red-500 text-sm mt-1">{errors.category}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Quantity *
              </label>
              <input
                type="number"
                name="quantity"
                value={formData.quantity}
                onChange={handleChange}
                min="0"
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.quantity ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter quantity"
              />
              {errors.quantity && (
                <p className="text-red-500 text-sm mt-1">{errors.quantity}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Minimum Stock Level
              </label>
              <input
                type="number"
                name="minimum_stock_level"
                value={formData.minimum_stock_level}
                onChange={handleChange}
                min="0"
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.minimum_stock_level ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter minimum stock level"
              />
              {errors.minimum_stock_level && (
                <p className="text-red-500 text-sm mt-1">{errors.minimum_stock_level}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Storage Location
              </label>
              <input
                type="text"
                name="storage_location"
                value={formData.storage_location}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g., Shelf A1, Freezer B"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Expiration Date
              </label>
              <input
                type="date"
                name="expiration_date"
                value={formData.expiration_date}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Dietary Category
              </label>
              <select
                name="dietary_category"
                value={formData.dietary_category}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select dietary category</option>
                {dietaryCategories.map(diet => (
                  <option key={diet} value={diet}>{diet}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Barcode
              </label>
              <input
                type="text"
                name="barcode"
                value={formData.barcode}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter barcode"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="3"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter additional details about the item"
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Saving...' : (item ? 'Update Item' : 'Add Item')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default InventoryManagement;