import api from '../config/api';

// Productos
export const productosService = {
  getAll: (search = '') => api.get(`/productos/all${search ? `?search=${search}` : ''}`),
  getById: (id) => api.get(`/productos/${id}`),
  create: (data) => api.post('/productos', data),
  update: (id, data) => api.put(`/productos/${id}`, data),
  delete: (id) => api.delete(`/productos/${id}`),
};

// Clientes
export const clientesService = {
  getAll: (search = '') => api.get(`/clientes/all${search ? `?search=${search}` : ''}`),
  getById: (id) => api.get(`/clientes/${id}`),
  create: (data) => api.post('/clientes', data),
  update: (id, data) => api.put(`/clientes/${id}`, data),
  delete: (id) => api.delete(`/clientes/${id}`),
};

// Pedidos
export const pedidosService = {
  getAll: (search = '') => api.get(`/pedidos/all${search ? `?search=${search}` : ''}`),
  getById: (id) => api.get(`/pedidos/${id}`),
  create: (data) => api.post('/pedidos', data),
  update: (id, data) => api.put(`/pedidos/${id}`, data),
  delete: (id) => api.delete(`/pedidos/${id}`),
};

// Remitos
export const remitosService = {
  getAll: (search = '') => api.get(`/remitos/all${search ? `?search=${search}` : ''}`),
  getById: (id) => api.get(`/remitos/${id}`),
  create: (data) => api.post('/remitos', data),
  update: (id, data) => api.put(`/remitos/${id}`, data),
  delete: (id) => api.delete(`/remitos/${id}`),
};