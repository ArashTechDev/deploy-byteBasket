import React, { useState, useEffect } from 'react';
import { Search, Filter, Download, Plus, Edit, Trash2, AlertTriangle, Calendar, Package } from 'lucide-react';

// Main Inventory Management Component
const InventoryManagement = () => {
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [alerts, setAlerts] = useState({ lowStock: [], expiring: [] });
  
  // Search and filter state
  const [filters, setFilters] = useState({
    search: '',
    category: '',
    dietary_category: '',
    foodbank_id: '',
    location: '',
    expiring_soon: false,
    low_stock_only: false,
    sort_by: 'date_added',
    sort_order: 'DESC',
    page: 1,
    limit: 20
  });
  
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    limit: 20
  });

  const [categories, setCategories] = useState([]);
  const [dietaryCategories, setDietaryCategories] = useState([]);
  const [foodbanks] = useState([
    { id: 1, name: 'Downtown Food Bank' },
    { id: 2, name: 'Community Kitchen' },
    { id: 3, name: 'Local Food Pantry' }
  ]);

  // Fetch inventory data
  const fetchInventory = async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== '' && value !== false) {
          queryParams.append(key, value);
        }
      });

      const response = await fetch(`/api/inventory?${queryParams}`);
      const data = await response.json();
      
      setInventory(data.items || []);
      setPagination(data.pagination || {});
    } catch (error) {
      console.error('Error fetching inventory:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch alerts
  const fetchAlerts = async () => {
    try {
      const [lowStockRes, expiringRes] = await Promise.all([
        fetch('/api/inventory/alerts/low-stock'),
        fetch('/api/inventory/alerts/expiring')
      ]);
      
      const lowStock = await lowStockRes.json();
      const expiring = await expiringRes.json();
      
      setAlerts({ lowStock, expiring });
    } catch (error) {
      console.error('Error fetching alerts:', error);
    }
  };

  // Fetch metadata
  const fetchMetadata = async () => {
    try {
      const [categoriesRes, dietaryRes] = await Promise.all([
        fetch('/api/inventory/meta/categories'),
        fetch('/api/inventory/meta/dietary-categories')
      ]);
      
      const categories = await categoriesRes.json();
      const dietary = await dietaryRes.json();
      
      setCategories(categories);
      setDietaryCategories(dietary);
    } catch (error) {
      console.error('Error fetching metadata:', error);
    }
  };

  useEffect(() => {
    fetchInventory();
    fetchAlerts();
    fetchMetadata();
  }, [filters]);

  // Handle filter changes
  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: 1 // Reset to first page when filtering
    }));
  };

  // Export functionality
  const handleExport = async (format) => {
    try {
      const queryParams = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== '' && value !== false) {
          queryParams.append(key, value);
        }
      });
      queryParams.append('export_format', format);

      const response = await fetch(`/api/inventory?${queryParams}`);
      const blob = await response.blob();
      
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `inventory.${format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error exporting:', error);
    }
  };

  // Delete item
  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      try {
        await fetch(`/api/inventory/${id}`, { method: 'DELETE' });
        fetchInventory();
        fetchAlerts();
      } catch (error) {
        console.error('Error deleting item:', error);
      }
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Inventory Management</h1>
          <button
            onClick={() => setShowForm(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700"
          >
            <Plus size={20} />
            Add Item
          </button>
        </div>

        {/* Alerts Section */}
        <AlertsSection alerts={alerts} />

        {/* Search and Filters */}
        <SearchAndFilters
          filters={filters}
          onFilterChange={handleFilterChange}
          categories={categories}
          dietaryCategories={dietaryCategories}
          foodbanks={foodbanks}
          onExport={handleExport}
        />

        {/* Inventory Table */}
        <InventoryTable
          inventory={inventory}
          loading={loading}
          onEdit={(item) => {
            setEditingItem(item);
            setShowForm(true);
          }}
          onDelete={handleDelete}
          pagination={pagination}
          onPageChange={(page) => handleFilterChange('page', page)}
        />

        {/* Form Modal */}
        {showForm && (
          <InventoryForm
            item={editingItem}
            categories={categories}
            dietaryCategories={dietaryCategories}
            foodbanks={foodbanks}
            onClose={() => {
              setShowForm(false);
              setEditingItem(null);
            }}
            onSave={() => {
              setShowForm(false);
              setEditingItem(null);
              fetchInventory();
              fetchAlerts();
            }}
          />
        )}
      </div>
    </div>
  );
};

// Alerts Section Component
const AlertsSection = ({ alerts }) => {
  const totalAlerts = alerts.lowStock.length + alerts.expiring.length;
  
  if (totalAlerts === 0) return null;

  return (
    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
      <div className="flex items-center gap-2 mb-3">
        <AlertTriangle className="text-red-600" size={20} />
        <h2 className="text-lg font-semibold text-red-800">Inventory Alerts</h2>
      </div>
      
      <div className="grid md:grid-cols-2 gap-4">
        {alerts.lowStock.length > 0 && (
          <div className="bg-white p-3 rounded border">
            <h3 className="font-medium text-red-700 mb-2">Low Stock ({alerts.lowStock.length})</h3>
            <div className="space-y-1">
              {alerts.lowStock.slice(0, 3).map(item => (
                <div key={item.inventory_id} className="text-sm text-gray-700">
                  {item.item_name} - {item.quantity} left
                </div>
              ))}
              {alerts.lowStock.length > 3 && (
                <div className="text-sm text-gray-500">
                  +{alerts.lowStock.length - 3} more items
                </div>
              )}
            </div>
          </div>
        )}
        
        {alerts.expiring.length > 0 && (
          <div className="bg-white p-3 rounded border">
            <h3 className="font-medium text-red-700 mb-2">Expiring Soon ({alerts.expiring.length})</h3>
            <div className="space-y-1">
              {alerts.expiring.slice(0, 3).map(item => (
                <div key={item.inventory_id} className="text-sm text-gray-700">
                  {item.item_name} - {new Date(item.expiration_date).toLocaleDateString()}
                </div>
              ))}
              {alerts.expiring.length > 3 && (
                <div className="text-sm text-gray-500">
                  +{alerts.expiring.length - 3} more items
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Search and Filters Component
const SearchAndFilters = ({ filters, onFilterChange, categories, dietaryCategories, foodbanks, onExport }) => {
  return (
    <div className="bg-white p-4 rounded-lg shadow mb-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-3 text-gray-400" size={16} />
          <input
            type="text"
            placeholder="Search items..."
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            value={filters.search}
            onChange={(e) => onFilterChange('search', e.target.value)}
          />
        </div>

        {/* Category Filter */}
        <select
          className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
          value={filters.category}
          onChange={(e) => onFilterChange('category', e.target.value)}
        >
          <option value="">All Categories</option>
          {categories.map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>

        {/* Dietary Category Filter */}
        <select
          className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
          value={filters.dietary_category}
          onChange={(e) => onFilterChange('dietary_category', e.target.value)}
        >
          <option value="">All Dietary Categories</option>
          {dietaryCategories.map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>

        {/* Food Bank Filter */}
        <select
          className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
          value={filters.foodbank_id}
          onChange={(e) => onFilterChange('foodbank_id', e.target.value)}
        >
          <option value="">All Food Banks</option>
          {foodbanks.map(fb => (
            <option key={fb.id} value={fb.id}>{fb.name}</option>
          ))}
        </select>
      </div>

      <div className="flex flex-wrap items-center gap-4">
        {/* Quick Filters */}
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={filters.low_stock_only}
            onChange={(e) => onFilterChange('low_stock_only', e.target.checked)}
            className="rounded"
          />
          <span className="text-sm">Low Stock Only</span>
        </label>

        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={filters.expiring_soon}
            onChange={(e) => onFilterChange('expiring_soon', e.target.checked)}
            className="rounded"
          />
          <span className="text-sm">Expiring Soon</span>
        </label>

        {/* Sort */}
        <select
          className="px-3 py-1 border rounded text-sm"
          value={`${filters.sort_by}-${filters.sort_order}`}
          onChange={(e) => {
            const [sort_by, sort_order] = e.target.value.split('-');
            onFilterChange('sort_by', sort_by);
            onFilterChange('sort_order', sort_order);
          }}
        >
          <option value="date_added-DESC">Newest First</option>
          <option value="date_added-ASC">Oldest First</option>
          <option value="item_name-ASC">Name A-Z</option>
          <option value="item_name-DESC">Name Z-A</option>
          <option value="quantity-ASC">Quantity Low-High</option>
          <option value="quantity-DESC">Quantity High-Low</option>
          <option value="expiration_date-ASC">Expiring Soon</option>
        </select>

        {/* Export Buttons */}
        <div className="flex gap-2 ml-auto">
          <button
            onClick={() => onExport('csv')}
            className="bg-green-600 text-white px-3 py-1 rounded text-sm flex items-center gap-1 hover:bg-green-700"
          >
            <Download size={14} />
            CSV
          </button>
          <button
            onClick={() => onExport('excel')}
            className="bg-blue-600 text-white px-3 py-1 rounded text-sm flex items-center gap-1 hover:bg-blue-700"
          >
            <Download size={14} />
            Excel
          </button>
        </div>
      </div>
    </div>
  );
};

// Inventory Table Component
const InventoryTable = ({ inventory, loading, onEdit, onDelete, pagination, onPageChange }) => {
  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-8 text-center">
        <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading inventory...</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
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
                Expiration
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Location
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
            {inventory.map((item) => (
              <tr key={item.inventory_id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div>
                    <div className="text-sm font-medium text-gray-900">{item.item_name}</div>
                    {item.dietary_category && (
                      <div className="text-sm text-gray-500">{item.dietary_category}</div>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {item.category}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className={`text-sm font-medium ${item.low_stock ? 'text-red-600' : 'text-gray-900'}`}>
                    {item.quantity}
                    {item.low_stock && (
                      <span className="ml-1 text-xs bg-red-100 text-red-800 px-2 py-1 rounded-full">
                        Low Stock
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {item.expiration_date ? (
                    <div className={item.is_expiring_soon ? 'text-red-600 font-medium' : ''}>
                      {new Date(item.expiration_date).toLocaleDateString()}
                      {item.is_expiring_soon && (
                        <div className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full mt-1">
                          Expires Soon
                        </div>
                      )}
                    </div>
                  ) : (
                    <span className="text-gray-400">No expiration</span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {item.storage_location || 'Not specified'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex flex-col gap-1">
                    {item.low_stock && (
                      <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                        Low Stock
                      </span>
                    )}
                    {item.is_expiring_soon && (
                      <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
                        Expiring
                      </span>
                    )}
                    {!item.low_stock && !item.is_expiring_soon && (
                      <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                        Good
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <div className="flex gap-2">
                    <button
                      onClick={() => onEdit(item)}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      onClick={() => onDelete(item.inventory_id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="bg-gray-50 px-6 py-3 flex items-center justify-between">
          <div className="text-sm text-gray-700">
            Showing {((pagination.currentPage - 1) * pagination.limit) + 1} to{' '}
            {Math.min(pagination.currentPage * pagination.limit, pagination.totalItems)} of{' '}
            {pagination.totalItems} results
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => onPageChange(pagination.currentPage - 1)}
              disabled={pagination.currentPage === 1}
              className="px-3 py-1 border rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            {Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
              .filter(page => 
                page === 1 || 
                page === pagination.totalPages || 
                Math.abs(page - pagination.currentPage) <= 2
              )
              .map((page, index, array) => (
                <React.Fragment key={page}>
                  {index > 0 && array[index - 1] < page - 1 && (
                    <span className="px-3 py-1 text-gray-500">...</span>
                  )}
                  <button
                    onClick={() => onPageChange(page)}
                    className={`px-3 py-1 border rounded text-sm ${
                      page === pagination.currentPage
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'hover:bg-gray-50'
                    }`}
                  >
                    {page}
                  </button>
                </React.Fragment>
              ))}
            <button
              onClick={() => onPageChange(pagination.currentPage + 1)}
              disabled={pagination.currentPage === pagination.totalPages}
              className="px-3 py-1 border rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// Inventory Form Component
const InventoryForm = ({ item, categories, dietaryCategories, foodbanks, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    foodbank_id: item?.foodbank_id || '',
    item_name: item?.item_name || '',
    category: item?.category || '',
    quantity: item?.quantity || '',
    expiration_date: item?.expiration_date || '',
    storage_location: item?.storage_location || '',
    dietary_category: item?.dietary_category || '',
    barcode: item?.barcode || '',
    minimum_stock_level: item?.minimum_stock_level || 10
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
    if (!formData.foodbank_id) newErrors.foodbank_id = 'Food bank is required';
    if (!formData.quantity || formData.quantity < 0) newErrors.quantity = 'Valid quantity is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validate()) return;

    setLoading(true);
    try {
      const url = item ? `/api/inventory/${item.inventory_id}` : '/api/inventory';
      const method = item ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        onSave();
      } else {
        const errorData = await response.json();
        console.error('Error saving item:', errorData);
      }
    } catch (error) {
      console.error('Error saving item:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <h2 className="text-2xl font-bold mb-6">
            {item ? 'Edit Inventory Item' : 'Add New Inventory Item'}
          </h2>
          
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
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
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
                  Food Bank *
                </label>
                <select
                  name="foodbank_id"
                  value={formData.foodbank_id}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                    errors.foodbank_id ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  <option value="">Select food bank</option>
                  {foodbanks.map(fb => (
                    <option key={fb.id} value={fb.id}>{fb.name}</option>
                  ))}
                </select>
                {errors.foodbank_id && (
                  <p className="text-red-500 text-sm mt-1">{errors.foodbank_id}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category *
                </label>
                <input
                  type="text"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  list="categories"
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                    errors.category ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Enter or select category"
                />
                <datalist id="categories">
                  {categories.map(cat => (
                    <option key={cat} value={cat} />
                  ))}
                </datalist>
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
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
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
                  Expiration Date
                </label>
                <input
                  type="date"
                  name="expiration_date"
                  value={formData.expiration_date}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Aisle 3, Shelf B"
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">None</option>
                  {dietaryCategories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Alert threshold"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Barcode
                </label>
                <input
                  type="text"
                  name="barcode"
                  value={formData.barcode}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Scan or enter barcode"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-6">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? 'Saving...' : (item ? 'Update' : 'Create')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default InventoryManagement;