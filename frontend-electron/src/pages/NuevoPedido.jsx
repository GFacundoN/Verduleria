import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { ArrowLeft, Plus, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { pedidosService, clientesService, productosService } from '@/services/api.service';
import { formatCurrency } from '@/lib/utils';

export default function NuevoPedido() {
  const navigate = useNavigate();
  const [clientes, setClientes] = useState([]);
  const [productos, setProductos] = useState([]);
  const [selectedCliente, setSelectedCliente] = useState('');
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
      subtotal: 0
    }]);
  };

  const actualizarDetalle = (index, field, value) => {
    const nuevosDetalles = [...detalles];
    nuevosDetalles[index][field] = value;

    if (field === 'productoId') {
      const producto = productos.find(p => p.id === parseInt(value));
      if (producto) {
        nuevosDetalles[index].precioUnitario = producto.precioVenta;
      }
    }

    if (field === 'cantidad' || field === 'productoId') {
      nuevosDetalles[index].subtotal = 
        nuevosDetalles[index].cantidad * nuevosDetalles[index].precioUnitario;
    }

    setDetalles(nuevosDetalles);
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
      alert('Debe seleccionar un cliente');
      return;
    }

    if (detalles.length === 0) {
      alert('Debe agregar al menos un producto');
      return;
    }

    try {
      const pedidoData = {
        clienteId: parseInt(selectedCliente),
        fechaCreacion: new Date().toISOString(),
        estado: 'PENDIENTE',
        montoTotal: calcularTotal(),
        detalles: detalles.map(d => ({
          productoId: parseInt(d.productoId),
          cantidad: parseFloat(d.cantidad),
          precioUnitario: parseFloat(d.precioUnitario),
          subtotal: parseFloat(d.subtotal)
        }))
      };

      await pedidosService.create(pedidoData);
      alert('Pedido creado exitosamente');
      navigate('/pedidos');
    } catch (error) {
      console.error('Error creating pedido:', error);
      alert('Error al crear el pedido');
    }
  };

  if (loading) {
    return <div className="text-center py-8">Cargando...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={() => navigate('/pedidos')}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Nuevo Pedido</h1>
          <p className="text-gray-500 mt-1">Crear un nuevo pedido</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Cliente */}
        <Card>
          <CardHeader>
            <CardTitle>Información del Cliente</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="cliente">Cliente</Label>
              <Select
                id="cliente"
                value={selectedCliente}
                onChange={(e) => setSelectedCliente(e.target.value)}
                required
              >
                <option value="">Seleccionar cliente...</option>
                {clientes.map(cliente => (
                  <option key={cliente.id} value={cliente.id}>
                    {cliente.razonSocial} - {cliente.cuitDni}
                  </option>
                ))}
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Productos */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Productos</CardTitle>
            <Button type="button" onClick={agregarDetalle} size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Agregar Producto
            </Button>
          </CardHeader>
          <CardContent>
            {detalles.length === 0 ? (
              <p className="text-center py-8 text-gray-500">
                No hay productos agregados. Haga clic en &quot;Agregar Producto&quot;
              </p>
            ) : (
              <div className="space-y-4">
                {detalles.map((detalle, index) => (
                  <div key={index} className="grid grid-cols-12 gap-4 items-end">
                    <div className="col-span-5 space-y-2">
                      <Label>Producto</Label>
                      <Select
                        value={detalle.productoId}
                        onChange={(e) => actualizarDetalle(index, 'productoId', e.target.value)}
                        required
                      >
                        <option value="">Seleccionar...</option>
                        {productos.map(producto => (
                          <option key={producto.id} value={producto.id}>
                            {producto.nombre} - {formatCurrency(producto.precioVenta)}
                          </option>
                        ))}
                      </Select>
                    </div>
                    <div className="col-span-2 space-y-2">
                      <Label>Cantidad</Label>
                      <Input
                        type="number"
                        step="0.01"
                        min="0.01"
                        value={detalle.cantidad}
                        onChange={(e) => actualizarDetalle(index, 'cantidad', e.target.value)}
                        required
                      />
                    </div>
                    <div className="col-span-2 space-y-2">
                      <Label>Precio Unit.</Label>
                      <Input
                        type="number"
                        step="0.01"
                        value={detalle.precioUnitario}
                        readOnly
                        className="bg-gray-50"
                      />
                    </div>
                    <div className="col-span-2 space-y-2">
                      <Label>Subtotal</Label>
                      <Input
                        type="text"
                        value={formatCurrency(detalle.subtotal)}
                        readOnly
                        className="bg-gray-50"
                      />
                    </div>
                    <div className="col-span-1">
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
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Total */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between items-center">
              <span className="text-2xl font-bold">Total:</span>
              <span className="text-3xl font-bold text-green-600">
                {formatCurrency(calcularTotal())}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex gap-2 justify-end">
          <Button type="button" variant="outline" onClick={() => navigate('/pedidos')}>
            Cancelar
          </Button>
          <Button type="submit">
            Crear Pedido
          </Button>
        </div>
      </form>
    </div>
  );
}