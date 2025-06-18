// frontend/src/hooks/useInventory.js
import { useState, useEffect, useCallback } from 'react';
import inventoryService from '../services/inventoryService';

export const useInventory = (initialFilters = {}) => {
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({});
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
    limit: 20,
    ...initialFilters
  });

  const fetchInventory = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await inventoryService.getAll(filters);
      setInventory(data.items || []);
      setPagination(data.pagination || {});
    } catch (err) {
      setError(err.message);
      // eslint-disable-next-line no-console
      console.error('Error fetching inventory:', err);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  const updateFilters = useCallback((newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters, page: 1 }));
  }, []);

  const changePage = useCallback((page) => {
    setFilters(prev => ({ ...prev, page }));
  }, []);

  const createItem = useCallback(async (itemData) => {
    try {
      const newItem = await inventoryService.create(itemData);
      await fetchInventory(); // Refresh the list
      return newItem;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, [fetchInventory]);

  const updateItem = useCallback(async (id, itemData) => {
    try {
      const updatedItem = await inventoryService.update(id, itemData);
      await fetchInventory(); // Refresh the list
      return updatedItem;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, [fetchInventory]);

  const deleteItem = useCallback(async (id) => {
    try {
      await inventoryService.delete(id);
      await fetchInventory(); // Refresh the list
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, [fetchInventory]);

  useEffect(() => {
    fetchInventory();
  }, [fetchInventory]);

  return {
    inventory,
    loading,
    error,
    pagination,
    filters,
    updateFilters,
    changePage,
    refetch: fetchInventory,
    createItem,
    updateItem,
    deleteItem
  };
};

export const useInventoryAlerts = () => {
  const [alerts, setAlerts] = useState({ lowStock: [], expiring: [] });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchAlerts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [lowStock, expiring] = await Promise.all([
        inventoryService.getLowStockAlerts(),
        inventoryService.getExpiringAlerts()
      ]);
      setAlerts({ lowStock, expiring });
    } catch (err) {
      setError(err.message);
      // eslint-disable-next-line no-console
      console.error('Error fetching alerts:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAlerts();
  }, [fetchAlerts]);

  return { 
    alerts, 
    loading, 
    error,
    refetch: fetchAlerts 
  };
};

export const useInventoryMetadata = () => {
  const [categories, setCategories] = useState([]);
  const [dietaryCategories, setDietaryCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchMetadata = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [categories, dietary] = await Promise.all([
        inventoryService.getCategories(),
        inventoryService.getDietaryCategories()
      ]);
      setCategories(categories);
      setDietaryCategories(dietary);
    } catch (err) {
      setError(err.message);
      // eslint-disable-next-line no-console
      console.error('Error fetching metadata:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMetadata();
  }, [fetchMetadata]);

  return {
    categories,
    dietaryCategories,
    loading,
    error,
    refetch: fetchMetadata
  };
};