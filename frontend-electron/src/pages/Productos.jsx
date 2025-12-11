import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Edit, Trash2, Search } from 'lucide-react';
import { productosService } from '@/services/api.service';
import { formatCurrency, cn } from '@/lib/utils';
import { useToast } from '@/components/ui/toast';
import TruncatedCell from '@/components/TruncatedCell';

export default function Productos() {
  const { toast } = useToast();
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    nombre: '',
    unidadMedida: '',
    precioVenta: ''
  });
  const [formErrors, setFormErrors] = useState({
    nombre: '',
    unidadMedida: '',
    precioVenta: ''
  });
  const [allProductos, setAllProductos] = useState([]);

  useEffect(() => {
    loadProductos();
  }, []);

  const loadProductos = async () => {
    try {
      const response = await productosService.getAll();
      setAllProductos(response.data);
      setProductos(response.data);
    } catch (error) {
      console.error('Error loading productos:', error);
    } finally {
      setLoading(false);
    }
  };

  // Filtrar productos en tiempo real
  useEffect(() => {
    console.log(' [PRODUCTOS] Filtrado - Búsqueda:', search);
    console.log(' [PRODUCTOS] Total productos disponibles:', allProductos.length);
    
    if (!search.trim()) {
      console.log(' [PRODUCTOS] Sin filtro - mostrando todos');
      setProductos(allProductos);
    } else {
      console.log(' [PRODUCTOS] Aplicando filtro para:', search);
      
      const filtered = allProductos.filter(producto => {
        const matchNombre = producto.nombre?.toLowerCase().includes(search.toLowerCase());
        const matchUnidad = producto.unidadMedida?.toLowerCase().includes(search.toLowerCase());
        
        const match = matchNombre || matchUnidad;
        
        if (match) {
          console.log(` [PRODUCTOS] Coincidencia: ${producto.nombre} (${producto.unidadMedida})`);
        }
        
        return match;
      });
      
      console.log(' [PRODUCTOS] Resultados filtrados:', filtered.length);
      setProductos(filtered);
    }
  }, [search, allProductos]);

  const validateField = (name, value) => {
    let error = '';
    
    switch (name) {
      case 'nombre':
        if (!value.trim()) {
          error = 'El nombre es requerido';
        } else if (value.length > 20) {
          error = 'Máximo 20 caracteres';
        } else if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(value)) {
          error = 'Solo se permiten letras';
        }
        break;
      
      case 'unidadMedida':
        if (!value.trim()) {
          error = 'La unidad de medida es requerida';
        } else if (value.length > 10) {
          error = 'Máximo 10 caracteres';
        } else if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ]+$/.test(value)) {
          error = 'Solo se permiten letras (sin espacios)';
        }
        break;
      
      case 'precioVenta':
        if (!value) {
          error = 'El precio es requerido';
        } else if (isNaN(value) || parseFloat(value) <= 0) {
          error = 'Debe ser un número mayor a 0';
        }
        break;
      
      default:
        break;
    }
    
    return error;
  };

  const validateForm = () => {
    const errors = {
      nombre: validateField('nombre', formData.nombre),
      unidadMedida: validateField('unidadMedida', formData.unidadMedida),
      precioVenta: validateField('precioVenta', formData.precioVenta)
    };
    
    setFormErrors(errors);
    return !errors.nombre && !errors.unidadMedida && !errors.precioVenta;
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
    
    try {
      if (editingId) {
        await productosService.update(editingId, formData);
        toast({
          title: '✅ Producto actualizado',
          description: 'El producto se actualizó correctamente.',
          variant: 'success'
        });
      } else {
        await productosService.create(formData);
        toast({
          title: '✅ Producto creado',
          description: 'El producto se creó correctamente.',
          variant: 'success'
        });
      }
      resetForm();
      loadProductos();
    } catch (error) {
      console.error('Error saving producto:', error);
      toast({
        title: '❌ Error al guardar',
        description: error.response?.data?.message || 'No se pudo guardar el producto.',
        variant: 'error'
      });
    }
  };

  const handleEdit = (producto) => {
    setFormData({
      nombre: producto.nombre,
      unidadMedida: producto.unidadMedida,
      precioVenta: producto.precioVenta
    });
    setEditingId(producto.id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Está seguro de eliminar este producto?')) {
      try {
        await productosService.delete(id);
        await loadProductos();
        toast({
          title: '✅ Producto eliminado',
          description: 'El producto se eliminó correctamente.',
          variant: 'success'
        });
      } catch (error) {
        console.error('Error deleting producto:', error);
        
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
            description: 'El producto tiene pedidos asociados. Para eliminarlo, primero debe eliminar o modificar los pedidos que lo utilizan.',
            variant: 'warning',
            duration: 6000
          });
        } else {
          toast({
            title: '❌ Error al eliminar',
            description: error.response?.data?.message || error.message || 'Error desconocido al eliminar el producto',
            variant: 'error'
          });
        }
      }
    }
  };

  const resetForm = () => {
    setFormData({ nombre: '', unidadMedida: '', precioVenta: '' });
    setFormErrors({ nombre: '', unidadMedida: '', precioVenta: '' });
    setEditingId(null);
    setShowForm(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Productos</h1>
          <p className="text-gray-500 dark:text-[#80868e] mt-1 text-sm sm:text-base">Gestión de productos de la verdulería</p>
        </div>
        <Button 
          onClick={() => setShowForm(!showForm)}
          className="w-full sm:w-auto"
        >
          <Plus className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
          Nuevo Producto
        </Button>
      </div>

      {/* Form */}
      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>{editingId ? 'Editar Producto' : 'Nuevo Producto'}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="nombre">
                    Nombre <span className="text-red-500 dark:text-red-400">*</span>
                  </Label>
                  <Input
                    id="nombre"
                    value={formData.nombre}
                    onChange={(e) => handleInputChange('nombre', e.target.value)}
                    maxLength={20}
                    className={formErrors.nombre ? 'border-red-500 dark:border-red-500' : ''}
                    required
                  />
                  {formErrors.nombre && (
                    <p className="text-xs text-red-500 dark:text-red-400 mt-1">{formErrors.nombre}</p>
                  )}
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {formData.nombre.length}/20 caracteres (solo letras)
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="unidadMedida">
                    Unidad de Medida <span className="text-red-500 dark:text-red-400">*</span>
                  </Label>
                  <Input
                    id="unidadMedida"
                    placeholder="kg, unidad, bolsa..."
                    value={formData.unidadMedida}
                    onChange={(e) => handleInputChange('unidadMedida', e.target.value)}
                    maxLength={10}
                    className={formErrors.unidadMedida ? 'border-red-500 dark:border-red-500' : ''}
                    required
                  />
                  {formErrors.unidadMedida && (
                    <p className="text-xs text-red-500 dark:text-red-400 mt-1">{formErrors.unidadMedida}</p>
                  )}
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {formData.unidadMedida.length}/10 caracteres (solo letras)
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="precioVenta">
                    Precio de Venta <span className="text-red-500 dark:text-red-400">*</span>
                  </Label>
                  <Input
                    id="precioVenta"
                    type="number"
                    step="0.01"
                    min="0.01"
                    value={formData.precioVenta}
                    onChange={(e) => handleInputChange('precioVenta', e.target.value)}
                    className={formErrors.precioVenta ? 'border-red-500 dark:border-red-500' : ''}
                    required
                  />
                  {formErrors.precioVenta && (
                    <p className="text-xs text-red-500 dark:text-red-400 mt-1">{formErrors.precioVenta}</p>
                  )}
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Solo números positivos
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
              placeholder="Buscar productos por nombre o unidad de medida..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1"
            />
            <div className="flex items-center justify-between sm:justify-center text-sm text-gray-500 px-3 py-2 bg-gray-50 rounded-md">
              <Search className="h-4 w-4 mr-2" />
              <span>{search ? `${productos.length} resultado(s)` : `${allProductos.length} producto(s)`}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardContent className="pt-6">
          {loading ? (
            <div className="text-center py-8 dark:text-gray-400">Cargando...</div>
          ) : productos.length === 0 ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              No hay productos registrados
            </div>
          ) : (
            <div className="overflow-hidden rounded-xl">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-50 dark:bg-[#1a1a1a]/60 border-b-2 dark:border-[#2a2a2a]">
                    <th className="text-left py-4 px-6 text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-[#9ca3af] border-r dark:border-[#2a2a2a]">Nombre</th>
                    <th className="text-left py-4 px-6 text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-[#9ca3af] border-r dark:border-[#2a2a2a]">Unidad</th>
                    <th className="text-left py-4 px-6 text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-[#9ca3af] border-r dark:border-[#2a2a2a]">Precio</th>
                    <th className="text-right py-4 px-6 text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-[#9ca3af]">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {productos.map((producto, index) => (
                    <tr 
                      key={producto.id} 
                      className={cn(
                        "border-b dark:border-[#2a2a2a] transition-colors duration-150",
                        "hover:bg-gray-50 dark:hover:bg-[#1db954]/5",
                        index % 2 === 0 ? "" : "bg-gray-50/50 dark:bg-[#1a1a1a]/30"
                      )}
                    >
                      <td className="py-4 px-6 border-r dark:border-[#2a2a2a]">
                        <TruncatedCell 
                          content={producto.nombre}
                          maxLength={20}
                          className="font-semibold dark:text-white"
                        />
                      </td>
                      <td className="py-4 px-6 border-r dark:border-[#2a2a2a]">
                        <TruncatedCell 
                          content={producto.unidadMedida}
                          maxLength={10}
                          className="dark:text-gray-300"
                        />
                      </td>
                      <td className="py-4 px-6 border-r dark:border-[#2a2a2a] font-bold text-[#1db954]">{formatCurrency(producto.precioVenta)}</td>
                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEdit(producto)}
                            className="rounded-xl hover:bg-[#1db954]/10 hover:text-[#1db954] transition-all"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(producto.id)}
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