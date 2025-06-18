// frontend/src/services/inventoryService.js
class InventoryService {
  constructor() {
    this.baseURL = '/api/inventory';
  }

  async getAll(filters = {}) {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== '' && value !== false && value !== null && value !== undefined) {
        params.append(key, value);
      }
    });

    const response = await fetch(`${this.baseURL}?${params}`);
    if (!response.ok) throw new Error('Failed to fetch inventory');
    return response.json();
  }

  async getById(id) {
    const response = await fetch(`${this.baseURL}/${id}`);
    if (!response.ok) throw new Error('Failed to fetch inventory item');
    return response.json();
  }

  async create(data) {
    const response = await fetch(this.baseURL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error('Failed to create inventory item');
    return response.json();
  }

  async update(id, data) {
    const response = await fetch(`${this.baseURL}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error('Failed to update inventory item');
    return response.json();
  }

  async delete(id) {
    const response = await fetch(`${this.baseURL}/${id}`, {
      method: 'DELETE'
    });
    if (!response.ok) throw new Error('Failed to delete inventory item');
    return response.json();
  }

  async getLowStockAlerts() {
    const response = await fetch(`${this.baseURL}/alerts/low-stock`);
    if (!response.ok) throw new Error('Failed to fetch low stock alerts');
    return response.json();
  }

  async getExpiringAlerts(days = 7) {
    const response = await fetch(`${this.baseURL}/alerts/expiring?days=${days}`);
    if (!response.ok) throw new Error('Failed to fetch expiring alerts');
    return response.json();
  }

  async getCategories() {
    const response = await fetch(`${this.baseURL}/meta/categories`);
    if (!response.ok) throw new Error('Failed to fetch categories');
    return response.json();
  }

  async getDietaryCategories() {
    const response = await fetch(`${this.baseURL}/meta/dietary-categories`);
    if (!response.ok) throw new Error('Failed to fetch dietary categories');
    return response.json();
  }

  async export(filters = {}, format = 'csv') {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== '' && value !== false && value !== null && value !== undefined) {
        params.append(key, value);
      }
    });
    params.append('export_format', format);

    const response = await fetch(`${this.baseURL}?${params}`);
    if (!response.ok) throw new Error('Failed to export data');
    
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `inventory.${format}`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  }
}

export default new InventoryService();
