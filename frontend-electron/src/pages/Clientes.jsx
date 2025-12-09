import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Edit, Trash2, Search } from 'lucide-react';
import { clientesService } from '@/services/api.service';
import { cn } from '@/lib/utils';

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
  const [allClientes, setAllClientes] = useState([]);

  useEffect(() => {
    loadClientes();
  }, []);

  const loadClientes = async () => {
    try {
      const response = await clientesService.getAll();
      setAllClientes(response.data);
      setClientes(response.data);
    } catch (error) {
      console.error('Error loading clientes:', error);
    } finally {
      setLoading(false);
    }
  };

  // Filtrar clientes en tiempo real
  useEffect(() => {
    console.log(' [CLIENTES] Filtrado - Búsqueda:', search);
    console.log(' [CLIENTES] Total clientes disponibles:', allClientes.length);
    
    if (!search.trim()) {
      console.log(' [CLIENTES] Sin filtro - mostrando todos');
      setClientes(allClientes);
    } else {
      console.log(' [CLIENTES] Aplicando filtro para:', search);
      
      const filtered = allClientes.filter(cliente => {
        const matchNombre = cliente.razonSocial?.toLowerCase().includes(search.toLowerCase());
        const matchCuit = cliente.cuitDni?.toLowerCase().includes(search.toLowerCase());
        const matchTelefono = cliente.telefono?.toLowerCase().includes(search.toLowerCase());
        const matchDireccion = cliente.direccion?.toLowerCase().includes(search.toLowerCase());
        const matchEmail = cliente.email?.toLowerCase().includes(search.toLowerCase());
        
        const match = matchNombre || matchCuit || matchTelefono || matchDireccion || matchEmail;
        
        if (match) {
          console.log(` [CLIENTES] Coincidencia: ${cliente.razonSocial} (${cliente.cuitDni})`);
        }
        
        return match;
      });
      
      console.log(' [CLIENTES] Resultados filtrados:', filtered.length);
      setClientes(filtered);
    }
  }, [search, allClientes]);

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
    setFormData({
      razonSocial: cliente.razonSocial,
      telefono: cliente.telefono || '',
      direccion: cliente.direccion,
      email: cliente.email || '',
      cuitDni: cliente.cuitDni
    });
    setEditingId(cliente.id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Está seguro de eliminar este cliente?')) {
      try {
        await clientesService.delete(id);
        await loadClientes();
        alert('Cliente eliminado correctamente');
      } catch (error) {
        console.error('Error deleting cliente:', error);
        const errorMessage = error.response?.data?.message || error.message || 'Error desconocido al eliminar el cliente';
        alert(`Error al eliminar el cliente: ${errorMessage}`);
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
    <div className="space-y-4 lg:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Clientes</h1>
          <p className="text-gray-500 dark:text-[#80868e] mt-1 text-sm sm:text-base">Gestión de clientes de la verdulería</p>
        </div>
        <Button 
          onClick={() => setShowForm(!showForm)}
          className="w-full sm:w-auto"
        >
          <Plus className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
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
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2 sm:col-span-2 lg:col-span-1">
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
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="direccion">Dirección</Label>
                  <Input
                    id="direccion"
                    value={formData.direccion}
                    onChange={(e) => setFormData({ ...formData, direccion: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-2">
                <Button type="submit" className="w-full sm:w-auto">
                  {editingId ? 'Actualizar' : 'Guardar'}
                </Button>
                <Button type="button" variant="outline" onClick={resetForm} className="w-full sm:w-auto">
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
          <div className="flex flex-col sm:flex-row gap-3">
            <Input
              placeholder="Buscar clientes por nombre, CUIT, teléfono, dirección o email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1"
            />
            <div className="flex items-center justify-between sm:justify-center text-sm text-gray-500 px-3 py-2 bg-gray-50 rounded-md">
              <Search className="h-4 w-4 mr-2" />
              <span>{search ? `${clientes.length} resultado(s)` : `${allClientes.length} cliente(s)`}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardContent className="pt-6">
          {loading ? (
            <div className="text-center py-8 dark:text-gray-400">Cargando...</div>
          ) : clientes.length === 0 ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              No hay clientes registrados
            </div>
          ) : (
            <div className="overflow-hidden rounded-xl">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-50 dark:bg-[#1a1a1a]/60 border-b-2 dark:border-[#2a2a2a]">
                    <th className="text-left py-4 px-6 text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-[#9ca3af] border-r dark:border-[#2a2a2a]">Razón Social</th>
                    <th className="text-left py-4 px-6 text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-[#9ca3af] border-r dark:border-[#2a2a2a]">CUIT/DNI</th>
                    <th className="text-left py-4 px-6 text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-[#9ca3af] border-r dark:border-[#2a2a2a]">Teléfono</th>
                    <th className="text-left py-4 px-6 text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-[#9ca3af] border-r dark:border-[#2a2a2a]">Dirección</th>
                    <th className="text-right py-4 px-6 text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-[#9ca3af]">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {clientes.map((cliente, index) => (
                    <tr 
                      key={cliente.id}
                      className={cn(
                        "border-b dark:border-[#2a2a2a] transition-colors duration-150",
                        "hover:bg-gray-50 dark:hover:bg-[#1db954]/5",
                        index % 2 === 0 ? "" : "bg-gray-50/50 dark:bg-[#1a1a1a]/30"
                      )}
                    >
                      <td className="py-4 px-6 border-r dark:border-[#2a2a2a] font-semibold dark:text-white">{cliente.razonSocial}</td>
                      <td className="py-4 px-6 border-r dark:border-[#2a2a2a] dark:text-gray-300">{cliente.cuitDni}</td>
                      <td className="py-4 px-6 border-r dark:border-[#2a2a2a] dark:text-gray-300">{cliente.telefono || '-'}</td>
                      <td className="py-4 px-6 border-r dark:border-[#2a2a2a] max-w-xs truncate dark:text-gray-300">{cliente.direccion}</td>
                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEdit(cliente)}
                            className="rounded-xl hover:bg-[#1db954]/10 hover:text-[#1db954] transition-all"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(cliente.id)}
                            className="rounded-xl hover:bg-red-500/10 hover:text-red-500 transition-all"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
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