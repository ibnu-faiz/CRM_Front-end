// lib/api.ts
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

// Helper function untuk handle API calls
async function apiCall<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'Something went wrong');
  }

  return data;
}

// Auth API
export const authAPI = {
  // Register
  register: async (userData: {
    name: string;
    email: string;
    phone: string;
    role: string;
    password: string;
  }) => {
    const response = await apiCall<{ token: string; user: any; message: string }>(
      '/auth/register',
      {
        method: 'POST',
        body: JSON.stringify(userData),
      }
    );
    
    if (response.token) {
      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify(response.user));
    }
    
    return response;
  },

  // Login
  login: async (email: string, password: string) => {
    const response = await apiCall<{ token: string; user: any; message: string }>(
      '/auth/login',
      {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      }
    );
    
    if (response.token) {
      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify(response.user));
    }
    
    return response;
  },

  // Google Login (DIPERBAIKI)
  googleLogin: async (token: string) => {
    const response = await apiCall<{ token: string; user: any; message: string }>(
      '/auth/google-login', // Endpoint baru
      {
        method: 'POST',
        body: JSON.stringify({ token }),
      }
    );
    
    if (response.token) {
      localStorage.setItem('token', response.token);
      // Simpan user
    }
    return response;
  },

  googleRegisterCheck: async (token: string) => {
    // Kita gunakan fetch manual karena apiCall mungkin melempar error generik
    const response = await fetch(`${API_BASE_URL}/auth/google-check`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token }),
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Google check failed');
    }
    
    // Return data: { email, name, avatar }
    return data;
  },

  // Get Profile
  getProfile: async () => {
    return apiCall<{ user: any }>('/auth/profile', {
      method: 'GET',
    });
  },

  // Logout
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  // Check if logged in
  isAuthenticated: () => {
    if (typeof window === 'undefined') return false;
    return !!localStorage.getItem('token');
  },

  // Get current user from localStorage
  getCurrentUser: () => {
    if (typeof window === 'undefined') return null;
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },

  forgotPassword: async (email: string) => {
    return apiCall<{ message: string }>('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  },

  resetPassword: async (email: string, code: string, newPassword: string) => {
    return apiCall<{ message: string }>('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ email, code, newPassword }),
    });
  },
  
};