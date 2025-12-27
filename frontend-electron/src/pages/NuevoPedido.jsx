import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { useToast } from '@/components/ui/toast';
import { ArrowLeft, Plus, Trash2, Search, Package } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { pedidosService, clientesService, productosService } from '@/services/api.service';
import { formatCurrency, getLocalDateTime } from '@/lib/utils';

export default function NuevoPedido() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [clientes, setClientes] = useState([]);
  const [productos, setProductos] = useState([]);
  const [selectedCliente, setSelectedCliente] = useState('');
  const [searchCliente, setSearchCliente] = useState('');
  const [searchProductos, setSearchProductos] = useState({});
  const [showClienteDropdown, setShowClienteDropdown] = useState(false);
  const [showProductoDropdown, setShowProductoDropdown] = useState({});
  const [detalles, setDetalles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [clientesRes, productosRes] = await Promise.all([
        clientesService.getAll(),
        productosService.getAll()
      ]);
      setClientes(clientesRes.data);
      setProductos(productosRes.data);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const agregarDetalle = () => {
    setDetalles([...detalles, {
      productoId: '',
      cantidad: 1,
      precioUnitario: 0,
      subtotal: 0,
      esPersonalizado: false,
      nombrePersonalizado: '',
      descripcionPersonalizada: ''
    }]);
  };

  const actualizarDetalle = (index, field, value) => {
    const nuevosDetalles = [...detalles];
    
    // Si es cantidad, asegurarse que sea un entero positivo
    if (field === 'cantidad') {
      const cantidad = parseInt(value) || 1;
      nuevosDetalles[index][field] = cantidad >= 1 ? cantidad : 1;
    } else {
      nuevosDetalles[index][field] = value;
    }

    // Si cambia a modo personalizado, limpiar productoId
    if (field === 'esPersonalizado' && value === true) {
      nuevosDetalles[index].productoId = '';
      nuevosDetalles[index].precioUnitario = 0;
      nuevosDetalles[index].nombrePersonalizado = '';
      nuevosDetalles[index].descripcionPersonalizada = '';
      setSearchProductos({...searchProductos, [index]: ''});
    }

    // Si cambia a modo normal, limpiar campos personalizados
    if (field === 'esPersonalizado' && value === false) {
      nuevosDetalles[index].nombrePersonalizado = '';
      nuevosDetalles[index].descripcionPersonalizada = '';
      nuevosDetalles[index].precioUnitario = 0;
    }

    if (field === 'productoId' && !nuevosDetalles[index].esPersonalizado) {
      const producto = productos.find(p => p.id === parseInt(value));
      if (producto) {
        nuevosDetalles[index].precioUnitario = producto.precioVenta;
      }
    }

    if (field === 'cantidad' || field === 'productoId' || field === 'precioUnitario') {
      nuevosDetalles[index].subtotal = 
        nuevosDetalles[index].cantidad * parseFloat(nuevosDetalles[index].precioUnitario || 0);
    }

    setDetalles(nuevosDetalles);
  };

  // Filtrar clientes
  const clientesFiltrados = clientes.filter(cliente => {
    if (!searchCliente.trim()) return true;
    const search = searchCliente.toLowerCase();
    return (
      cliente.razonSocial?.toLowerCase().includes(search) ||
      cliente.cuitDni?.toLowerCase().includes(search)
    );
  });

  // Filtrar productos
  const getProductosFiltrados = (index) => {
    const search = searchProductos[index] || '';
    if (!search.trim()) return productos;
    const searchLower = search.toLowerCase();
    return productos.filter(p => p.nombre?.toLowerCase().includes(searchLower));
  };

  // Seleccionar cliente
  const selectCliente = (cliente) => {
    setSelectedCliente(cliente.id.toString());
    setSearchCliente(cliente.razonSocial);
    setShowClienteDropdown(false);
  };

  // Seleccionar producto
  const selectProducto = (index, producto) => {
    actualizarDetalle(index, 'productoId', producto.id.toString());
    setSearchProductos({...searchProductos, [index]: producto.nombre});
    setShowProductoDropdown({...showProductoDropdown, [index]: false});
  };

  const eliminarDetalle = (index) => {
    setDetalles(detalles.filter((_, i) => i !== index));
  };

  const calcularTotal = () => {
    return detalles.reduce((sum, d) => sum + d.subtotal, 0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedCliente) {
      toast({
        title: 'Cliente requerido',
        description: 'Debe seleccionar un cliente para continuar',
        variant: 'error'
      });
      return;
    }

    if (detalles.length === 0) {
      toast({
        title: 'Productos requeridos',
        description: 'Debe agregar al menos un producto al pedido',
        variant: 'error'
      });
      return;
    }

    // Validar que todos los detalles tengan la información necesaria
    for (let i = 0; i < detalles.length; i++) {
      const detalle = detalles[i];
      if (detalle.esPersonalizado) {
        if (!detalle.nombrePersonalizado || !detalle.precioUnitario) {
          toast({
            title: 'Datos incompletos',
            description: `El producto personalizado en la línea ${i + 1} debe tener nombre y precio`,
            variant: 'error'
          });
          return;
        }
      } else {
        if (!detalle.productoId) {
          toast({
            title: 'Producto no seleccionado',
            description: `Debe seleccionar un producto en la línea ${i + 1}`,
            variant: 'error'
          });
          return;
        }
      }
    }

    try {
      const pedidoData = {
        clienteId: parseInt(selectedCliente),
        fechaCreacion: getLocalDateTime(),
        estado: 'PENDIENTE',
        montoTotal: calcularTotal(),
        detalles: detalles.map(d => {
          if (d.esPersonalizado) {
            // Producto personalizado: sin productoId, con nombre y descripción personalizados
            return {
              cantidad: parseInt(d.cantidad),
              precioVenta: parseFloat(d.precioUnitario),
              subtotal: parseFloat(d.subtotal),
              nombrePersonalizado: d.nombrePersonalizado,
              descripcionPersonalizada: d.descripcionPersonalizada || ''
            };
          } else {
            // Producto normal de la base de datos
            return {
              productoId: parseInt(d.productoId),
              cantidad: parseInt(d.cantidad),
              precioVenta: parseFloat(d.precioUnitario),
              subtotal: parseFloat(d.subtotal)
            };
          }
        })
      };

      console.log('📤 PEDIDO DATA A ENVIAR:', JSON.stringify(pedidoData, null, 2));
      await pedidosService.create(pedidoData);
      toast({
        title: '¡Pedido creado!',
        description: `Pedido por ${formatCurrency(calcularTotal())} creado exitosamente`,
        variant: 'success'
      });
      navigate('/pedidos');
    } catch (error) {
      console.error('Error creating pedido:', error);
      toast({
        title: 'Error',
        description: 'No se pudo crear el pedido. Intente nuevamente.',
        variant: 'error'
      });
    }
  };

  if (loading) {
    return <div className="text-center py-8 text-gray-500 dark:text-gray-400">Cargando...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={() => navigate('/pedidos')} size="icon" className="shrink-0">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Nuevo Pedido</h1>
          <p className="text-gray-500 dark:text-[#80868e] mt-1 text-sm sm:text-base">Crear un nuevo pedido</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Cliente */}
        <Card className="relative z-50 overflow-visible">
          <CardHeader>
            <CardTitle>Información del Cliente</CardTitle>
          </CardHeader>
          <CardContent className="overflow-visible">
            <div className="space-y-2 relative">
              <Label htmlFor="cliente">Cliente</Label>
              <Input
                id="cliente"
                type="text"
                value={searchCliente}
                onChange={(e) => {
                  setSearchCliente(e.target.value);
                  setShowClienteDropdown(true);
                }}
                onFocus={() => setShowClienteDropdown(true)}
                placeholder="Seleccione o escriba para buscar..."
                required
                autoComplete="off"
              />
              {showClienteDropdown && clientesFiltrados.length > 0 && (
                <div className="absolute z-[100] w-full mt-1 bg-white dark:bg-[#1a1a1a] border border-gray-300 dark:border-[#2a2a2a] rounded-lg shadow-2xl max-h-60 overflow-auto">
                  {clientesFiltrados.map(cliente => (
                    <div
                      key={cliente.id}
                      onClick={() => selectCliente(cliente)}
                      className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-[#1db954]/10 cursor-pointer border-b dark:border-[#2a2a2a] last:border-b-0 transition-colors"
                    >
                      <div className="font-medium text-gray-900 dark:text-white">{cliente.razonSocial}</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">{cliente.cuitDni}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Productos */}
        <Card className="relative z-40 overflow-visible">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Productos</CardTitle>
            <Button type="button" onClick={agregarDetalle} size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Agregar Producto
            </Button>
          </CardHeader>
          <CardContent className="overflow-visible">
            {detalles.length === 0 ? (
              <p className="text-center py-8 text-gray-500 dark:text-gray-400">
                No hay productos agregados. Haga clic en &quot;Agregar Producto&quot;
              </p>
            ) : (
              <div className="space-y-4">
                {detalles.map((detalle, index) => (
                  <div key={index} className="p-4 bg-gray-50 dark:bg-[#1a1a1a]/40 rounded-lg space-y-4">
                    {/* Selector de tipo de producto con estilo visual */}
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => actualizarDetalle(index, 'esPersonalizado', false)}
                        className={`px-4 py-2 rounded-lg font-medium text-sm transition-all flex items-center gap-2 ${
                          !detalle.esPersonalizado
                            ? 'bg-blue-100 text-blue-700 border-2 border-blue-300 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800 shadow-md'
                            : 'bg-gray-100 text-gray-600 border-2 border-gray-200 hover:bg-gray-200 dark:bg-gray-700/50 dark:text-gray-400 dark:border-gray-600 dark:hover:bg-gray-600'
                        }`}
                      >
                        <Package className="h-4 w-4" />
                        Producto de Catálogo
                      </button>
                      <button
                        type="button"
                        onClick={() => actualizarDetalle(index, 'esPersonalizado', true)}
                        className={`px-4 py-2 rounded-lg font-medium text-sm transition-all flex items-center gap-2 ${
                          detalle.esPersonalizado
                            ? 'bg-green-100 text-green-700 border-2 border-green-300 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800 shadow-md'
                            : 'bg-gray-100 text-gray-600 border-2 border-gray-200 hover:bg-gray-200 dark:bg-gray-700/50 dark:text-gray-400 dark:border-gray-600 dark:hover:bg-gray-600'
                        }`}
                      >
                        <Package className="h-4 w-4" />
                        Producto Personalizado
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-end">
                      {/* Campo de producto - varía según el tipo */}
                      {!detalle.esPersonalizado ? (
                        <div className="sm:col-span-5 space-y-2 relative z-40">
                          <Label>Producto</Label>
                          <Input
                            type="text"
                            value={searchProductos[index] || ''}
                            onChange={(e) => {
                              setSearchProductos({...searchProductos, [index]: e.target.value});
                              setShowProductoDropdown({...showProductoDropdown, [index]: true});
                            }}
                            onFocus={() => setShowProductoDropdown({...showProductoDropdown, [index]: true})}
                            placeholder="Seleccione o escriba para buscar..."
                            required
                            autoComplete="off"
                          />
                          {showProductoDropdown[index] && getProductosFiltrados(index).length > 0 && (
                            <div className="absolute z-[60] w-full mt-1 bg-white dark:bg-[#1a1a1a] border border-gray-300 dark:border-[#2a2a2a] rounded-lg shadow-2xl max-h-48 overflow-auto">
                              {getProductosFiltrados(index).map(producto => (
                                <div
                                  key={producto.id}
                                  onClick={() => selectProducto(index, producto)}
                                  className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-[#1db954]/10 cursor-pointer border-b dark:border-[#2a2a2a] last:border-b-0 transition-colors"
                                >
                                  <div className="font-medium text-gray-900 dark:text-white">
                                    {producto.nombre} <span className="text-sm font-normal text-gray-500 dark:text-gray-400">({producto.unidadMedida})</span>
                                  </div>
                                  <div className="text-sm text-gray-500 dark:text-gray-400">{formatCurrency(producto.precioVenta)}</div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      ) : (
                        <>
                          <div className="sm:col-span-3 space-y-2">
                            <Label>Nombre del Producto</Label>
                            <Input
                              type="text"
                              value={detalle.nombrePersonalizado || ''}
                              onChange={(e) => actualizarDetalle(index, 'nombrePersonalizado', e.target.value)}
                              placeholder="Ej: Morrón"
                              required
                            />
                          </div>
                          <div className="sm:col-span-2 space-y-2">
                            <Label>Peso/Descripción</Label>
                            <Input
                              type="text"
                              value={detalle.descripcionPersonalizada || ''}
                              onChange={(e) => actualizarDetalle(index, 'descripcionPersonalizada', e.target.value)}
                              placeholder="Ej: 700gr"
                            />
                          </div>
                        </>
                      )}
                      <div className="sm:col-span-2 space-y-2">
                        <Label>Cantidad</Label>
                        <Input
                          type="number"
                          step="1"
                          min="1"
                          value={detalle.cantidad}
                          onChange={(e) => actualizarDetalle(index, 'cantidad', e.target.value)}
                          onKeyDown={(e) => {
                            // Prevenir entrada de puntos decimales
                            if (e.key === '.' || e.key === ',') {
                              e.preventDefault();
                            }
                          }}
                          required
                          className="font-semibold"
                        />
                      </div>
                      <div className="sm:col-span-2 space-y-2">
                        <Label>Precio Unit.</Label>
                        <Input
                          type="number"
                          step="0.01"
                          min="0"
                          value={detalle.precioUnitario}
                          onChange={(e) => detalle.esPersonalizado && actualizarDetalle(index, 'precioUnitario', e.target.value)}
                          readOnly={!detalle.esPersonalizado}
                          className={detalle.esPersonalizado ? '' : 'bg-gray-50 dark:bg-[#1a1a1a]/60 dark:text-white'}
                          required
                        />
                      </div>
                      <div className="sm:col-span-2 space-y-2">
                        <Label>Subtotal</Label>
                        <Input
                          type="text"
                          value={formatCurrency(detalle.subtotal)}
                          readOnly
                          className="bg-gray-50 dark:bg-[#1a1a1a]/60 dark:text-[#1db954] font-semibold"
                        />
                      </div>
                      <div className="sm:col-span-1 flex justify-end">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => eliminarDetalle(index)}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Total */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between items-center">
              <span className="text-2xl font-bold text-gray-900 dark:text-white">Total:</span>
              <span className="text-3xl font-bold text-green-600 dark:text-[#1db954]">
                {formatCurrency(calcularTotal())}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-2 justify-end">
          <Button type="button" variant="outline" onClick={() => navigate('/pedidos')} className="w-full sm:w-auto">
            Cancelar
          </Button>
          <Button type="submit" className="w-full sm:w-auto">
            Crear Pedido
          </Button>
        </div>
      </form>
    </div>
  );
}