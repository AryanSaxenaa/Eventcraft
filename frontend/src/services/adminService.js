import api from './api';
import authService from './authService';
import { mockEvents } from './eventService';
import vendorService from './vendorService';

// Mock data for admin dashboard
const mockAdminData = {
  stats: {
    totalEvents: 145,
    totalUsers: 1250,
    totalRevenue: 85000,
    activeEvents: 23
  },
  recentActivity: [
    { id: 1, type: 'event_created', message: 'New event "Tech Conference 2024" created', time: '2 hours ago' },
    { id: 2, type: 'user_registered', message: 'User John Doe registered', time: '4 hours ago' },
    { id: 3, type: 'event_approved', message: 'Event "Music Festival" approved', time: '6 hours ago' },
    { id: 4, type: 'payment_received', message: 'Payment of $299 received', time: '8 hours ago' }
  ],
  pendingApprovals: 5,
  monthlyRevenue: [
    { month: 'Jan', revenue: 12000 },
    { month: 'Feb', revenue: 15000 },
    { month: 'Mar', revenue: 18000 },
    { month: 'Apr', revenue: 22000 },
    { month: 'May', revenue: 28000 },
    { month: 'Jun', revenue: 32000 }
  ]
};

// Helper function to simulate API delays
const mockDelay = (data, ms = 500) => {
  return new Promise((resolve) => {
    setTimeout(() => resolve({ data }), ms);
  });
};

// Get users from authService
const getUsers = () => {
  // This is a mock function that would normally be handled by the backend
  // Just for demo purposes
  return [
    { id: 'u001', name: 'John Doe', email: 'john@example.com', role: 'attendee' },
    { id: 'u002', name: 'Jane Smith', email: 'jane@example.com', role: 'organizer' },
    { id: 'u003', name: 'Admin User', email: 'admin@example.com', role: 'admin' }
  ];
};

// User Management
export const getAllUsers = async (params = {}) => {
  try {
    const { data } = await api.get('/admin/users', { params });
    return data;
  } catch (error) {
    console.error('Error fetching users:', error);
    throw error;
  }
};

export const getUserStats = async () => {
  try {
    const { data } = await api.get('/admin/stats');
    return data;
  } catch (error) {
    console.error('Error fetching user stats:', error);
    throw error;
  }
};

export const updateUserRole = async (userId, role) => {
  try {
    const { data } = await api.put(`/admin/users/${userId}/role`, { role });
    return data;
  } catch (error) {
    console.error('Error updating user role:', error);
    throw error;
  }
};

export const deleteUser = async (userId) => {
  try {
    const { data } = await api.delete(`/admin/users/${userId}`);
    return data;
  } catch (error) {
    console.error('Error deleting user:', error);
    throw error;
  }
};

// Event Management
export const getAllEvents = async (params = {}) => {
  try {
    const { data } = await api.get('/events', { params });
    return data;
  } catch (error) {
    console.error('Error fetching events:', error);
    throw error;
  }
};

export const getPendingEvents = async (params = {}) => {
  try {
    const response = await api.get('/events/admin/pending', { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching pending events:', error);
    throw error;
  }
};

export const approveEvent = async (eventId) => {
  try {
    const response = await api.put(`/events/${eventId}/approve`);
    return response.data;
  } catch (error) {
    console.error('Error approving event:', error);
    throw error;
  }
};

export const rejectEvent = async (eventId, rejectionReason) => {
  try {
    const response = await api.put(`/events/${eventId}/reject`, { rejectionReason });
    return response.data;
  } catch (error) {
    console.error('Error rejecting event:', error);
    throw error;
  }
};

export const getApprovalStats = async () => {
  try {
    const response = await api.get('/events/admin/approval-stats');
    return response.data;
  } catch (error) {
    console.error('Error fetching approval stats:', error);
    // Return mock data if API fails
    return {
      pending: 3,
      approved: 12,
      rejected: 2,
      published: 10,
      total: 17
    };
  }
};

// Dashboard Stats (fallback to mock data if backend not available)
export const getDashboardStats = async () => {
  try {
    // Try to get real stats from backend
    const data = await getUserStats();
    
    return {
      ...data,
      revenue: data.platformRevenue ? `₹${data.platformRevenue}` : '₹0',
      reports: data.reports || 0
    };
  } catch (error) {
    console.warn('Using mock stats due to backend error:', error);
    // Fallback to mock data
    return {
      totalUsers: 874,
      attendees: 751,
      organizers: 123,
      admins: 3,
      totalEvents: 148,
      pendingEvents: 15,
      revenue: '₹1.45L',
      reports: 12,
      recentRegistrations: 45
    };
  }
};

export const adminService = {
  // Get admin statistics
  getStats: async () => {
    try {
      const response = await api.get('/admin/dashboard/stats');
      return response.data;
    } catch (error) {
      console.error('Error fetching admin stats:', error);
      // Return fallback stats
      return {
        totalUsers: 0,
        totalEvents: 0,
        totalRevenue: 0,
        activeEvents: 0
      };
    }
  },

  // Get recent users
  getRecentUsers: async () => {
    try {
      const response = await api.get('/admin/recent-users');
      return response.data;
    } catch (error) {
      console.error('Error fetching recent users:', error);
      // Return empty array as fallback
      return [];
    }
  },

  // Get revenue data
  getRevenueData: async () => {
    try {
      const response = await api.get('/admin/dashboard/revenue');
      return response.data;
    } catch (error) {
      console.error('Error fetching revenue data:', error);
      // Return empty array as fallback
      return [];
    }
  },

  // Get activity data
  getActivity: async () => {
    try {
      const response = await api.get('/admin/dashboard/activity');
      return response.data;
    } catch (error) {
      console.error('Error fetching activity data:', error);
      // Return empty array as fallback
      return [];
    }
  },

  // Get pending events
  getPendingEvents: async () => {
    try {
      const response = await api.get('/events/admin/pending');
      return response.data;
    } catch (error) {
      console.error('Error fetching pending events:', error);
      // Return empty array as fallback
      return [];
    }
  },

  // Get dashboard activity
  getActivity: async () => {
    try {
      const response = await api.get('/admin/dashboard/activity');
      return response.data;
    } catch (error) {
      console.error('Error fetching activity data:', error);
      
      const errorMsg = error.response?.data?.message || 
                       error.message || 
                       'Failed to fetch activity data';
      
      const enhancedError = new Error(errorMsg);
      enhancedError.statusCode = error.response?.status;
      enhancedError.originalError = error;
      
      throw enhancedError;
    }
  },

  // Get revenue data
  getRevenueData: async () => {
    try {
      const response = await api.get('/admin/dashboard/revenue');
      return response.data;
    } catch (error) {
      console.error('Error fetching revenue data:', error);
      
      const errorMsg = error.response?.data?.message || 
                       error.message || 
                       'Failed to fetch revenue data';
      
      const enhancedError = new Error(errorMsg);
      enhancedError.statusCode = error.response?.status;
      enhancedError.originalError = error;
      
      throw enhancedError;
    }
  },

  // Get all users with pagination
  getUsers: async (page = 1, limit = 10, search = '', role = '') => {
    try {
      const params = new URLSearchParams();
      if (page) params.append('page', page);
      if (limit) params.append('limit', limit);
      if (search) params.append('search', search);
      if (role) params.append('role', role);
      
      const response = await api.get(`/admin/users?${params.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching users:', error);
      
      const errorMsg = error.response?.data?.message || 
                       error.message || 
                       'Failed to fetch users';
      
      const enhancedError = new Error(errorMsg);
      enhancedError.statusCode = error.response?.status;
      enhancedError.originalError = error;
      
      throw enhancedError;
    }
  },

  // Get all events with pagination
  getEvents: async (page = 1, limit = 10, search = '', status = '') => {
    try {
      const params = new URLSearchParams();
      if (page) params.append('page', page);
      if (limit) params.append('limit', limit);
      if (search) params.append('search', search);
      if (status) params.append('status', status);
      
      const response = await api.get(`/events?${params.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching events:', error);
      
      const errorMsg = error.response?.data?.message || 
                       error.message || 
                       'Failed to fetch events';
      
      const enhancedError = new Error(errorMsg);
      enhancedError.statusCode = error.response?.status;
      enhancedError.originalError = error;
      
      throw enhancedError;
    }
  },

  // Update user role
  updateUserRole: async (userId, role) => {
    try {
      const response = await api.put(`/admin/users/${userId}/role`, { role });
      return response.data;
    } catch (error) {
      console.error('Error updating user role:', error);
      
      const errorMsg = error.response?.data?.message || 
                       error.message || 
                       'Failed to update user role';
      
      const enhancedError = new Error(errorMsg);
      enhancedError.statusCode = error.response?.status;
      enhancedError.originalError = error;
      
      throw enhancedError;
    }
  },

  // Approve event
  approveEvent: async (eventId) => {
    try {
      const response = await api.put(`/admin/events/${eventId}/approve`);
      return response.data;
    } catch (error) {
      console.error('Error approving event:', error);
      
      const errorMsg = error.response?.data?.message || 
                       error.message || 
                       'Failed to approve event';
      
      const enhancedError = new Error(errorMsg);
      enhancedError.statusCode = error.response?.status;
      enhancedError.originalError = error;
      
      throw enhancedError;
    }
  },

  // Reject event
  rejectEvent: async (eventId, reason) => {
    try {
      const response = await api.put(`/admin/events/${eventId}/reject`, { reason });
      return response.data;
    } catch (error) {
      console.error('Error rejecting event:', error);
      
      const errorMsg = error.response?.data?.message || 
                       error.message || 
                       'Failed to reject event';
      
      const enhancedError = new Error(errorMsg);
      enhancedError.statusCode = error.response?.status;
      enhancedError.originalError = error;
      
      throw enhancedError;
    }
  },

  // Get platform analytics
  getAnalytics: async () => {
    try {
      const response = await api.get('/admin/analytics');
      return response.data;
    } catch (error) {
      console.error('Error fetching analytics:', error);
      
      const errorMsg = error.response?.data?.message || 
                       error.message || 
                       'Failed to fetch analytics';
      
      const enhancedError = new Error(errorMsg);
      enhancedError.statusCode = error.response?.status;
      enhancedError.originalError = error;
      
      throw enhancedError;
    }
  }
};

export default adminService;