import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Edit, Trash2, Search } from 'lucide-react';
import { clientesService } from '@/services/api.service';

export default function Clientes() {
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    razonSocial: '',
    telefono: '',
    direccion: '',
    email: '',
    cuitDni: ''
  });

  useEffect(() => {
    loadClientes();
  }, []);

  const loadClientes = async () => {
    try {
      const response = await clientesService.getAll(search);
      setClientes(response.data);
    } catch (error) {
      console.error('Error loading clientes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await clientesService.update(editingId, formData);
      } else {
        await clientesService.create(formData);
      }
      resetForm();
      loadClientes();
    } catch (error) {
      console.error('Error saving cliente:', error);
      alert('Error al guardar el cliente');
    }
  };

  const handleEdit = (cliente) => {
    setFormData(cliente);
    setEditingId(cliente.id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Está seguro de eliminar este cliente?')) {
      try {
        await clientesService.delete(id);
        loadClientes();
      } catch (error) {
        console.error('Error deleting cliente:', error);
        alert('Error al eliminar el cliente');
      }
    }
  };

  const resetForm = () => {
    setFormData({ razonSocial: '', telefono: '', direccion: '', email: '', cuitDni: '' });
    setEditingId(null);
    setShowForm(false);
  };

  const handleSearch = () => {
    setLoading(true);
    loadClientes();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Clientes</h1>
          <p className="text-gray-500 mt-1">Gestión de clientes de la verdulería</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)}>
          <Plus className="h-5 w-5 mr-2" />
          Nuevo Cliente
        </Button>
      </div>

      {/* Form */}
      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>{editingId ? 'Editar Cliente' : 'Nuevo Cliente'}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="razonSocial">Razón Social / Nombre</Label>
                  <Input
                    id="razonSocial"
                    value={formData.razonSocial}
                    onChange={(e) => setFormData({ ...formData, razonSocial: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cuitDni">CUIT / DNI</Label>
                  <Input
                    id="cuitDni"
                    value={formData.cuitDni}
                    onChange={(e) => setFormData({ ...formData, cuitDni: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="telefono">Teléfono</Label>
                  <Input
                    id="telefono"
                    value={formData.telefono}
                    onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="direccion">Dirección</Label>
                  <Input
                    id="direccion"
                    value={formData.direccion}
                    onChange={(e) => setFormData({ ...formData, direccion: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Button type="submit">
                  {editingId ? 'Actualizar' : 'Guardar'}
                </Button>
                <Button type="button" variant="outline" onClick={resetForm}>
                  Cancelar
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-2">
            <Input
              placeholder="Buscar clientes..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            />
            <Button onClick={handleSearch}>
              <Search className="h-5 w-5" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardContent className="pt-6">
          {loading ? (
            <div className="text-center py-8">Cargando...</div>
          ) : clientes.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No hay clientes registrados
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4">Razón Social</th>
                    <th className="text-left py-3 px-4">CUIT/DNI</th>
                    <th className="text-left py-3 px-4">Teléfono</th>
                    <th className="text-left py-3 px-4">Dirección</th>
                    <th className="text-right py-3 px-4">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {clientes.map((cliente) => (
                    <tr key={cliente.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4">{cliente.razonSocial}</td>
                      <td className="py-3 px-4">{cliente.cuitDni}</td>
                      <td className="py-3 px-4">{cliente.telefono || '-'}</td>
                      <td className="py-3 px-4">{cliente.direccion}</td>
                      <td className="py-3 px-4 text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(cliente)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(cliente.id)}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}