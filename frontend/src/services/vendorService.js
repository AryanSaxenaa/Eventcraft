import api from './api';

class VendorService {
  // Get all vendors
  async getAllVendors() {
    try {
      const response = await api.get('/vendors');
      return response.data;
    } catch (error) {
      console.error('Error fetching vendors:', error);
      throw error;
    }
  }

  // Get vendor by ID
  async getVendorById(id) {
    try {
      const response = await api.get(`/vendors/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching vendor:', error);
      throw error;
    }
  }

  // Create new vendor (Admin only)
  async createVendor(vendorData) {
    try {
      const response = await api.post('/vendors', vendorData);
      return response.data;
    } catch (error) {
      console.error('Error creating vendor:', error);
      throw error;
    }
  }

  // Update vendor (Admin only)
  async updateVendor(id, vendorData) {
    try {
      const response = await api.put(`/vendors/${id}`, vendorData);
      return response.data;
    } catch (error) {
      console.error('Error updating vendor:', error);
      throw error;
    }
  }

  // Delete vendor (Admin only)
  async deleteVendor(id) {
    try {
      const response = await api.delete(`/vendors/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting vendor:', error);
      throw error;
    }
  }

  // Get vendor statistics (Admin only)
  async getVendorStats() {
    try {
      const response = await api.get('/vendors/stats/overview');
      return response.data;
    } catch (error) {
      console.error('Error fetching vendor stats:', error);
      throw error;
    }
  }
}

export default new VendorService(); 