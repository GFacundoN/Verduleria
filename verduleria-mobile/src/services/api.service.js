import api from '../config/api';

// Productos
export const productosService = {
  getAll: (search = '') => api.get(`/productos/all${search ? `?search=${search}` : ''}`),
  getById: (id) => api.get(`/productos/${id}`),
};

// Clientes
export const clientesService = {
  getAll: (search = '') => api.get(`/clientes/all${search ? `?search=${search}` : ''}`),
  getById: (id) => api.get(`/clientes/${id}`),
};

// Pedidos
export const pedidosService = {
  getAll: (search = '') => api.get(`/pedidos/all${search ? `?search=${search}` : ''}`),
  getById: (id) => api.get(`/pedidos/${id}`),
  update: (id, data) => api.put(`/pedidos/${id}`, data),
};
