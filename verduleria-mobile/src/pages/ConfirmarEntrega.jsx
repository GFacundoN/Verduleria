import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { useParams, useNavigate } from 'react-router-dom';
import { CheckCircle, XCircle, Package } from 'lucide-react';
import { pedidosService, clientesService, productosService } from '../services/api.service';
import { formatCurrency, formatDate } from '../lib/utils';

export default function ConfirmarEntrega() {
  const { pedidoId } = useParams();
  const navigate = useNavigate();
  const [pedido, setPedido] = useState(null);
  const [cliente, setCliente] = useState(null);
  const [productos, setProductos] = useState({});
  const [loading, setLoading] = useState(true);
  const [confirmando, setConfirmando] = useState(false);
  const [confirmado, setConfirmado] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadPedido();
  }, [pedidoId]);

  const loadPedido = async () => {
    try {
      console.log('Cargando pedido ID:', pedidoId);
      const [pedidoRes, productosRes] = await Promise.all([
        pedidosService.getById(pedidoId),
        productosService.getAll()
      ]);
      
      console.log('Pedido cargado:', pedidoRes.data);
      console.log('Pedido completo:', JSON.stringify(pedidoRes.data));
      console.log('Productos respuesta:', JSON.stringify(productosRes.data));
      setPedido(pedidoRes.data);

      const clienteRes = await clientesService.getById(pedidoRes.data.clienteId || pedidoRes.data.cliente_id);
      console.log('Cliente cargado:', clienteRes.data);
      setCliente(clienteRes.data);

      // Crear mapa de productos
      const productosMap = {};
      const productosArray = Array.isArray(productosRes.data) ? productosRes.data : (productosRes.data.data || []);
      productosArray.forEach(p => {
        productosMap[p.id] = p;
      });
      setProductos(productosMap);
      console.log('Datos cargados exitosamente');
    } catch (error) {
      console.error('Error loading pedido:', error);
      console.error('Detalles del error:', error.response?.data || error.message);
      setError('No se pudo cargar la información del pedido');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmar = async () => {
    setConfirmando(true);
    try {
      await pedidosService.update(pedidoId, {
        ...pedido,
        estado: 'ENTREGADO'
      });
      setConfirmado(true);
    } catch (error) {
      console.error('Error confirmando entrega:', error);
      setError('Error al confirmar la entrega');
    } finally {
      setConfirmando(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 p-4">
        <div className="text-gray-500">Cargando...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 p-4">
        <Card className="w-full max-w-md shadow-lg border-2 border-red-200">
          <CardContent className="pt-6 pb-6">
            <div className="text-center space-y-6">
              <div className="flex justify-center">
                <div className="p-4 bg-red-100 rounded-full">
                  <XCircle className="h-16 w-16 text-red-600" />
                </div>
              </div>
              <div className="space-y-2">
                <h2 className="text-3xl font-bold text-gray-900">Error</h2>
                <p className="text-gray-700 text-lg">{error}</p>
              </div>
              <Button 
                onClick={() => navigate('/')}
                className="w-full h-12 bg-gray-600 hover:bg-gray-700 text-white font-semibold"
              >
                Volver al Inicio
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (confirmado) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 p-4">
        <Card className="w-full max-w-md shadow-lg border-2 border-green-200">
          <CardContent className="pt-6 pb-6">
            <div className="text-center space-y-6">
              <div className="flex justify-center">
                <div className="p-4 bg-green-100 rounded-full">
                  <CheckCircle className="h-20 w-20 text-green-600" />
                </div>
              </div>
              <div className="space-y-3">
                <h2 className="text-3xl font-bold text-gray-900">¡Entrega Confirmada!</h2>
                <p className="text-gray-700 text-lg">
                  El pedido <span className="font-bold">#{pedidoId}</span> ha sido marcado como entregado exitosamente.
                </p>
              </div>
              <Button 
                onClick={() => navigate('/')}
                className="w-full h-12 bg-green-600 hover:bg-green-700 text-white font-semibold"
              >
                Volver al Inicio
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 p-4">
      <div className="w-full max-w-3xl space-y-4">
        <Card className="border-2">
          <CardHeader className="border-b bg-gray-50">
            <div className="flex items-center gap-3">
              <Package className="h-8 w-8 text-gray-700" />
              <div>
                <CardTitle className="text-xl">Remito - Pedido #{pedidoId}</CardTitle>
                <p className="text-sm text-gray-600 mt-1">
                  {formatDate(pedido.fechaCreacion)}
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6 pt-6">
            {/* Información del Cliente */}
            {cliente && (
              <div className="space-y-3">
                <h4 className="font-bold text-base text-gray-900 border-b pb-2">Información del Cliente</h4>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-gray-600">Razón Social</p>
                    <p className="font-semibold">{cliente.razonSocial}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">CUIT/DNI</p>
                    <p className="font-semibold">{cliente.cuitDni}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-gray-600">Dirección</p>
                    <p className="font-semibold">{cliente.direccion}</p>
                  </div>
                  {cliente.telefono && (
                    <div>
                      <p className="text-gray-600">Teléfono</p>
                      <p className="font-semibold">{cliente.telefono}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Productos - Tabla */}
            {pedido.detalles && pedido.detalles.length > 0 && (
              <div className="space-y-3">
                <h4 className="font-bold text-base text-gray-900 border-b pb-2">Detalle de Productos</h4>
                <div className="overflow-x-auto border border-gray-300 rounded-lg">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-100 border-b border-gray-300">
                      <tr>
                        <th className="text-left px-3 py-2 font-semibold">Producto</th>
                        <th className="text-center px-3 py-2 font-semibold">Cant.</th>
                        <th className="text-right px-3 py-2 font-semibold">P. Unit.</th>
                        <th className="text-right px-3 py-2 font-semibold">Subtotal</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pedido.detalles.map((detalle, index) => {
                        const producto = productos[detalle.productoId];
                        const precioUnitario = detalle.precioUnitario || detalle.precioVenta || producto?.precioVenta || 0;
                        const subtotal = detalle.subtotal || (detalle.cantidad * precioUnitario);
                        return (
                          <tr key={index} className="border-b border-gray-200 last:border-0">
                            <td className="px-3 py-2">{producto?.nombre || `Producto #${detalle.productoId}`}</td>
                            <td className="px-3 py-2 text-center">{detalle.cantidad}</td>
                            <td className="px-3 py-2 text-right">{formatCurrency(precioUnitario)}</td>
                            <td className="px-3 py-2 text-right font-semibold">{formatCurrency(subtotal)}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                    <tfoot className="bg-gray-50 border-t-2 border-gray-300">
                      <tr>
                        <td colSpan="3" className="px-3 py-3 text-right font-bold">TOTAL:</td>
                        <td className="px-3 py-3 text-right text-lg font-bold text-green-600">
                          {formatCurrency(pedido.montoTotal)}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
            )}

            {/* Estado y Botón */}
            <div className="space-y-3 pt-2">
              <div className="flex justify-between items-center pb-3 border-b">
                <span className="text-sm font-semibold text-gray-700">Estado Actual:</span>
                <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                  pedido.estado === 'ENTREGADO' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {pedido.estado}
                </span>
              </div>

              {pedido.estado === 'ENTREGADO' ? (
                <div className="text-center py-6 bg-green-50 rounded-lg border-2 border-green-200">
                  <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-3" />
                  <p className="text-green-700 font-bold text-lg">
                    Este pedido ya fue entregado
                  </p>
                </div>
              ) : (
                <Button 
                  onClick={handleConfirmar}
                  disabled={confirmando}
                  className="w-full h-14 text-lg font-semibold bg-green-600 hover:bg-green-700 text-white"
                >
                  {confirmando ? 'Confirmando...' : 'Confirmar Entrega'}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}