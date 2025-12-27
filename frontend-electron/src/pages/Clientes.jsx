import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Edit, Trash2, Search } from 'lucide-react';
import { clientesService } from '@/services/api.service';
import { cn } from '@/lib/utils';
import { useToast } from '@/components/ui/toast';
import TruncatedCell from '@/components/TruncatedCell';

export default function Clientes() {
  const { toast } = useToast();
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
  const [formErrors, setFormErrors] = useState({
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
      const response = await clientesService.getAll();
      setClientes(response.data);
    } catch (error) {
      console.error('Error loading clientes:', error);
    } finally {
      setLoading(false);
    }
  };

  const validateField = (name, value) => {
    let error = '';
    
    switch (name) {
      case 'razonSocial':
        if (!value.trim()) {
          error = 'El nombre es requerido';
        } else if (value.length > 25) {
          error = 'Máximo 25 caracteres';
        } else if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(value)) {
          error = 'Solo se permiten letras';
        }
        break;
      
      case 'cuitDni':
        if (!value.trim()) {
          error = 'El CUIT/DNI es requerido';
        } else if (value.length > 9) {
          error = 'Máximo 9 caracteres';
        } else if (!/^[0-9]+$/.test(value)) {
          error = 'Solo se permiten números';
        }
        break;
      
      case 'telefono':
        if (!value.trim()) {
          error = 'El teléfono es requerido';
        } else if (value.length > 13) {
          error = 'Máximo 13 caracteres';
        } else if (!/^[0-9]+$/.test(value)) {
          error = 'Solo se permiten números';
        }
        break;
      
      case 'email':
        // Email es opcional, solo validar formato si hay valor
        if (value.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          error = 'Email inválido';
        }
        break;
      
      case 'direccion':
        if (!value.trim()) {
          error = 'La dirección es requerida';
        } else if (value.length > 60) {
          error = 'Máximo 60 caracteres';
        }
        break;
      
      default:
        break;
    }
    
    return error;
  };

  const validateForm = () => {
    const errors = {
      razonSocial: validateField('razonSocial', formData.razonSocial),
      cuitDni: validateField('cuitDni', formData.cuitDni),
      telefono: validateField('telefono', formData.telefono),
      email: validateField('email', formData.email),
      direccion: validateField('direccion', formData.direccion)
    };
    
    setFormErrors(errors);
    return !errors.razonSocial && !errors.cuitDni && !errors.telefono && !errors.email && !errors.direccion;
  };

  const handleInputChange = (name, value) => {
    setFormData({ ...formData, [name]: value });
    // Validar en tiempo real
    const error = validateField(name, value);
    setFormErrors({ ...formErrors, [name]: error });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validar formulario antes de enviar
    if (!validateForm()) {
      toast({
        title: '⚠️ Errores en el formulario',
        description: 'Por favor corrige los errores antes de continuar.',
        variant: 'warning'
      });
      return;
    }
    
    // Verificar si ya existe un cliente con el mismo DNI/CUIT
    const clienteExistente = clientes.find(
      cliente => cliente.cuitDni === formData.cuitDni && cliente.id !== editingId
    );
    
    if (clienteExistente) {
      toast({
        title: '⚠️ DNI/CUIT duplicado',
        description: `Ya existe un cliente con el DNI/CUIT ${formData.cuitDni} (${clienteExistente.razonSocial})`,
        variant: 'error'
      });
      setFormErrors({ ...formErrors, cuitDni: 'Este DNI/CUIT ya está registrado' });
      return;
    }
    
    try {
      if (editingId) {
        await clientesService.update(editingId, formData);
        toast({
          title: '✅ Cliente actualizado',
          description: 'El cliente se actualizó correctamente.',
          variant: 'success'
        });
      } else {
        await clientesService.create(formData);
        toast({
          title: '✅ Cliente creado',
          description: 'El cliente se creó correctamente.',
          variant: 'success'
        });
      }
      resetForm();
      loadClientes();
    } catch (error) {
      console.error('Error saving cliente:', error);
      toast({
        title: '❌ Error al guardar',
        description: error.response?.data?.message || 'No se pudo guardar el cliente.',
        variant: 'error'
      });
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
        toast({
          title: '✅ Cliente eliminado',
          description: 'El cliente se eliminó correctamente.',
          variant: 'success'
        });
      } catch (error) {
        console.error('Error deleting cliente:', error);
        
        // Detectar si el error es por restricción de integridad (pedidos asociados)
        const errorMsg = error.response?.data?.message || error.message || '';
        const isConstraintError = errorMsg.toLowerCase().includes('constraint') || 
                                  errorMsg.toLowerCase().includes('foreign key') ||
                                  errorMsg.toLowerCase().includes('referenced') ||
                                  errorMsg.toLowerCase().includes('asociado') ||
                                  error.response?.status === 409 ||
                                  error.response?.status === 500;
        
        if (isConstraintError) {
          toast({
            title: '⚠️ No se puede eliminar',
            description: 'El cliente tiene pedidos asociados. Para eliminarlo, primero debe eliminar o modificar los pedidos que le pertenecen.',
            variant: 'warning',
            duration: 6000
          });
        } else {
          toast({
            title: '❌ Error al eliminar',
            description: error.response?.data?.message || error.message || 'Error desconocido al eliminar el cliente',
            variant: 'error'
          });
        }
      }
    }
  };

  const resetForm = () => {
    setFormData({ razonSocial: '', telefono: '', direccion: '', email: '', cuitDni: '' });
    setFormErrors({ razonSocial: '', telefono: '', direccion: '', email: '', cuitDni: '' });
    setEditingId(null);
    setShowForm(false);
  };

  // Filtrar clientes en base a la búsqueda
  const filteredClientes = clientes.filter(cliente => {
    if (!search.trim()) return true;
    
    const searchLower = search.toLowerCase();
    return (
      cliente.razonSocial.toLowerCase().includes(searchLower) ||
      cliente.cuitDni.toLowerCase().includes(searchLower) ||
      (cliente.telefono || '').toLowerCase().includes(searchLower) ||
      (cliente.direccion || '').toLowerCase().includes(searchLower) ||
      (cliente.email || '').toLowerCase().includes(searchLower)
    );
  });

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
                  <Label htmlFor="razonSocial">
                    Razón Social / Nombre <span className="text-red-500 dark:text-red-400">*</span>
                  </Label>
                  <Input
                    id="razonSocial"
                    value={formData.razonSocial}
                    onChange={(e) => handleInputChange('razonSocial', e.target.value)}
                    maxLength={25}
                    className={formErrors.razonSocial ? 'border-red-500 dark:border-red-500' : ''}
                    required
                  />
                  {formErrors.razonSocial && (
                    <p className="text-xs text-red-500 dark:text-red-400 mt-1">{formErrors.razonSocial}</p>
                  )}
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {formData.razonSocial.length}/25 caracteres (solo letras)
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cuitDni">
                    CUIT / DNI <span className="text-red-500 dark:text-red-400">*</span>
                  </Label>
                  <Input
                    id="cuitDni"
                    value={formData.cuitDni}
                    onChange={(e) => handleInputChange('cuitDni', e.target.value)}
                    maxLength={9}
                    className={formErrors.cuitDni ? 'border-red-500 dark:border-red-500' : ''}
                    required
                  />
                  {formErrors.cuitDni && (
                    <p className="text-xs text-red-500 dark:text-red-400 mt-1">{formErrors.cuitDni}</p>
                  )}
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {formData.cuitDni.length}/9 caracteres (solo números)
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="telefono">
                    Teléfono <span className="text-red-500 dark:text-red-400">*</span>
                  </Label>
                  <Input
                    id="telefono"
                    value={formData.telefono}
                    onChange={(e) => handleInputChange('telefono', e.target.value)}
                    maxLength={13}
                    className={formErrors.telefono ? 'border-red-500 dark:border-red-500' : ''}
                    required
                  />
                  {formErrors.telefono && (
                    <p className="text-xs text-red-500 dark:text-red-400 mt-1">{formErrors.telefono}</p>
                  )}
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {formData.telefono.length}/13 caracteres (solo números)
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className={formErrors.email ? 'border-red-500 dark:border-red-500' : ''}
                  />
                  {formErrors.email && (
                    <p className="text-xs text-red-500 dark:text-red-400 mt-1">{formErrors.email}</p>
                  )}
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Opcional - Formato: ejemplo@mail.com
                  </p>
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="direccion">
                    Dirección <span className="text-red-500 dark:text-red-400">*</span>
                  </Label>
                  <Input
                    id="direccion"
                    value={formData.direccion}
                    onChange={(e) => handleInputChange('direccion', e.target.value)}
                    maxLength={60}
                    className={formErrors.direccion ? 'border-red-500 dark:border-red-500' : ''}
                    required
                  />
                  {formErrors.direccion && (
                    <p className="text-xs text-red-500 dark:text-red-400 mt-1">{formErrors.direccion}</p>
                  )}
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {formData.direccion.length}/60 caracteres
                  </p>
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
            <div className="flex items-center justify-between sm:justify-center text-sm text-gray-500 dark:text-gray-400 px-3 py-2 bg-gray-50 dark:bg-gray-800 rounded-md">
              <Search className="h-4 w-4 mr-2" />
              <span>{search ? `${filteredClientes.length} resultado(s)` : `${clientes.length} cliente(s)`}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardContent className="pt-6">
          {loading ? (
            <div className="text-center py-8 dark:text-gray-400">Cargando...</div>
          ) : filteredClientes.length === 0 ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              {search ? 'No se encontraron clientes con ese criterio' : 'No hay clientes registrados'}
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
                  {filteredClientes.map((cliente, index) => (
                    <tr 
                      key={cliente.id}
                      className={cn(
                        "border-b dark:border-[#2a2a2a] transition-colors duration-150",
                        "hover:bg-gray-50 dark:hover:bg-[#1db954]/5",
                        index % 2 === 0 ? "" : "bg-gray-50/50 dark:bg-[#1a1a1a]/30"
                      )}
                    >
                      <td className="py-4 px-6 border-r dark:border-[#2a2a2a]">
                        <TruncatedCell 
                          content={cliente.razonSocial}
                          maxLength={25}
                          className="font-semibold dark:text-white"
                        />
                      </td>
                      <td className="py-4 px-6 border-r dark:border-[#2a2a2a]">
                        <TruncatedCell 
                          content={cliente.cuitDni}
                          maxLength={15}
                          className="dark:text-gray-300"
                        />
                      </td>
                      <td className="py-4 px-6 border-r dark:border-[#2a2a2a]">
                        <TruncatedCell 
                          content={cliente.telefono}
                          maxLength={15}
                          className="dark:text-gray-300"
                        />
                      </td>
                      <td className="py-4 px-6 border-r dark:border-[#2a2a2a]">
                        <TruncatedCell 
                          content={cliente.direccion}
                          maxLength={40}
                          className="dark:text-gray-300"
                        />
                      </td>
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