import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Edit, Trash2, Search } from 'lucide-react';
import { productosService } from '@/services/api.service';
import { formatCurrency, cn } from '@/lib/utils';

export default function Productos() {
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await productosService.update(editingId, formData);
      } else {
        await productosService.create(formData);
      }
      resetForm();
      loadProductos();
    } catch (error) {
      console.error('Error saving producto:', error);
      alert('Error al guardar el producto');
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
        alert('Producto eliminado correctamente');
      } catch (error) {
        console.error('Error deleting producto:', error);
        const errorMessage = error.response?.data?.message || error.message || 'Error desconocido al eliminar el producto';
        alert(`Error al eliminar el producto: ${errorMessage}`);
      }
    }
  };

  const resetForm = () => {
    setFormData({ nombre: '', unidadMedida: '', precioVenta: '' });
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
                  <Label htmlFor="nombre">Nombre</Label>
                  <Input
                    id="nombre"
                    value={formData.nombre}
                    onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="unidadMedida">Unidad de Medida</Label>
                  <Input
                    id="unidadMedida"
                    placeholder="kg, unidad, etc."
                    value={formData.unidadMedida}
                    onChange={(e) => setFormData({ ...formData, unidadMedida: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="precioVenta">Precio de Venta</Label>
                  <Input
                    id="precioVenta"
                    type="number"
                    step="0.01"
                    value={formData.precioVenta}
                    onChange={(e) => setFormData({ ...formData, precioVenta: e.target.value })}
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
                      <td className="py-4 px-6 border-r dark:border-[#2a2a2a] font-semibold dark:text-white">{producto.nombre}</td>
                      <td className="py-4 px-6 border-r dark:border-[#2a2a2a] dark:text-gray-300">{producto.unidadMedida}</td>
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