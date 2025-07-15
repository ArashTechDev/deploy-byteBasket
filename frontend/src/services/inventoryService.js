// frontend/src/services/inventoryService.js
class InventoryService {
  constructor() {
    this.baseURL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';
    this.inventoryEndpoint = `${this.baseURL}/inventory`;
  }

  // Get auth token from localStorage or context
  getAuthHeaders() {
    const token = localStorage.getItem('authToken');
    return {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` })
    };
  }

  async handleResponse(response) {
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }
    return response.json();
  }

  async getAll(filters = {}) {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== '' && value !== false && value !== null && value !== undefined) {
        params.append(key, value);
      }
    });

    const response = await fetch(`${this.inventoryEndpoint}?${params}`, {
      method: 'GET',
      headers: this.getAuthHeaders()
    });
    
    const data = await this.handleResponse(response);
    return {
      items: data.data || [],
      pagination: data.pagination || {}
    };
  }

  async getById(id) {
    const response = await fetch(`${this.inventoryEndpoint}/${id}`, {
      method: 'GET',
      headers: this.getAuthHeaders()
    });
    
    const data = await this.handleResponse(response);
    return data.data;
  }

  async create(itemData) {
    const response = await fetch(this.inventoryEndpoint, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(itemData)
    });
    
    const data = await this.handleResponse(response);
    return data.data;
  }

  async update(id, itemData) {
    const response = await fetch(`${this.inventoryEndpoint}/${id}`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(itemData)
    });
    
    const data = await this.handleResponse(response);
    return data.data;
  }

  async delete(id) {
    const response = await fetch(`${this.inventoryEndpoint}/${id}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders()
    });
    
    return this.handleResponse(response);
  }

  async getLowStockAlerts() {
    const response = await fetch(`${this.inventoryEndpoint}/alerts/low-stock`, {
      method: 'GET',
      headers: this.getAuthHeaders()
    });
    
    const data = await this.handleResponse(response);
    return data.data || [];
  }

  async getExpiringAlerts(days = 7) {
    const response = await fetch(`${this.inventoryEndpoint}/alerts/expiring?days=${days}`, {
      method: 'GET',
      headers: this.getAuthHeaders()
    });
    
    const data = await this.handleResponse(response);
    return data.data || [];
  }

  async getCategories() {
    const response = await fetch(`${this.inventoryEndpoint}/meta/categories`, {
      method: 'GET',
      headers: this.getAuthHeaders()
    });
    
    const data = await this.handleResponse(response);
    return data.data || [];
  }

  async getDietaryCategories() {
    const response = await fetch(`${this.inventoryEndpoint}/meta/dietary-categories`, {
      method: 'GET',
      headers: this.getAuthHeaders()
    });
    
    const data = await this.handleResponse(response);
    return data.data || [];
  }

  async getStats() {
    const response = await fetch(`${this.inventoryEndpoint}/stats`, {
      method: 'GET',
      headers: this.getAuthHeaders()
    });
    
    const data = await this.handleResponse(response);
    return data.data || {};
  }
}

// eslint-disable-next-line import/no-anonymous-default-export
export default new InventoryService();