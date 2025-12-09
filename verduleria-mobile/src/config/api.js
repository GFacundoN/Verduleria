import { CapacitorHttp } from '@capacitor/core';

// Para React (no Vite) usamos process.env
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://3.14.151.116:8080/api';
const API_KEY = process.env.REACT_APP_API_KEY;

const api = {
  get: async (url) => {
    try {
      console.log('GET Request:', `${API_BASE_URL}${url}`);
      const response = await CapacitorHttp.get({
        url: `${API_BASE_URL}${url}`,
        headers: { 
          'Content-Type': 'application/json',
          ...(API_KEY && { 'X-APP-KEY': API_KEY }),
        }
      });
      console.log('GET Response:', response);
      return { data: response.data };
    } catch (error) {
      console.error('API GET Error:', error);
      throw error;
    }
  },
  
  post: async (url, data) => {
    try {
      const response = await CapacitorHttp.post({
        url: `${API_BASE_URL}${url}`,
        headers: { 
          'Content-Type': 'application/json',
          ...(API_KEY && { 'X-APP-KEY': API_KEY }),
        },
        data: data
      });
      return { data: response.data };
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  },
  
  put: async (url, data) => {
    try {
      const response = await CapacitorHttp.put({
        url: `${API_BASE_URL}${url}`,
        headers: { 
          'Content-Type': 'application/json',
          ...(API_KEY && { 'X-APP-KEY': API_KEY }),
        },
        data: data
      });
      return { data: response.data };
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  },
  
  delete: async (url) => {
    try {
      const response = await CapacitorHttp.delete({
        url: `${API_BASE_URL}${url}`,
        headers: { 
          'Content-Type': 'application/json',
          ...(API_KEY && { 'X-APP-KEY': API_KEY }),
        }
      });
      return { data: response.data };
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }
};

export default api;
