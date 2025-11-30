import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useParams, useNavigate } from 'react-router-dom';
import { CheckCircle, XCircle, Package } from 'lucide-react';
import { pedidosService, clientesService } from '@/services/api.service';
import { formatCurrency, formatDate } from '@/lib/utils';

export default function ConfirmarEntrega() {
  const { pedidoId } = useParams();
  const navigate = useNavigate();
  const [pedido, setPedido] = useState(null);
  const [cliente, setCliente] = useState(null);
  const [loading, setLoading] = useState(true);
  const [confirmando, setConfirmando] = useState(false);
  const [confirmado, setConfirmado] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadPedido();
  }, [pedidoId]);

  const loadPedido = async () => {
    try {
      const pedidoRes = await pedidosService.getById(pedidoId);
      setPedido(pedidoRes.data);

      const clienteRes = await clientesService.getById(pedidoRes.data.clienteId);
      setCliente(clienteRes.data);
    } catch (error) {
      console.error('Error loading pedido:', error);
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
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-500">Cargando...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <XCircle className="h-16 w-16 text-red-500 mx-auto" />
              <h2 className="text-2xl font-bold text-gray-900">Error</h2>
              <p className="text-gray-600">{error}</p>
              <Button onClick={() => navigate('/')}>Volver al Inicio</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (confirmado) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <CheckCircle className="h-16 w-16 text-green-500 mx-auto" />
              <h2 className="text-2xl font-bold text-gray-900">¡Entrega Confirmada!</h2>
              <p className="text-gray-600">
                El pedido #{pedidoId} ha sido marcado como entregado exitosamente.
              </p>
              <Button onClick={() => navigate('/')}>Volver al Inicio</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="w-full max-w-2xl space-y-6 p-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-center">Confirmar Entrega de Pedido</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Información del Pedido */}
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-center gap-3 mb-4">
                <Package className="h-8 w-8 text-blue-600" />
                <div>
                  <h3 className="font-semibold text-lg">Pedido #{pedidoId}</h3>
                  <p className="text-sm text-gray-600">
                    {formatDate(pedido.fechaCreacion)}
                  </p>
                </div>
              </div>
            </div>

            {/* Información del Cliente */}
            {cliente && (
              <div className="space-y-2">
                <h4 className="font-semibold text-gray-900">Cliente</h4>
                <div className="bg-gray-50 p-4 rounded-lg space-y-1">
                  <p><strong>Razón Social:</strong> {cliente.razonSocial}</p>
                  <p><strong>CUIT/DNI:</strong> {cliente.cuitDni}</p>
                  <p><strong>Dirección:</strong> {cliente.direccion}</p>
                  {cliente.telefono && (
                    <p><strong>Teléfono:</strong> {cliente.telefono}</p>
                  )}
                </div>
              </div>
            )}

            {/* Detalles del Pedido */}
            <div className="space-y-2">
              <h4 className="font-semibold text-gray-900">Detalles</h4>
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Estado Actual:</span>
                  <span className="px-3 py-1 rounded-full text-sm font-semibold bg-yellow-100 text-yellow-800">
                    {pedido.estado}
                  </span>
                </div>
                <div className="flex justify-between items-center mt-3 pt-3 border-t">
                  <span className="text-lg font-semibold">Monto Total:</span>
                  <span className="text-2xl font-bold text-green-600">
                    {formatCurrency(pedido.montoTotal)}
                  </span>
                </div>
              </div>
            </div>

            {/* Productos */}
            {pedido.detalles && pedido.detalles.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-semibold text-gray-900">Productos</h4>
                <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                  {pedido.detalles.map((detalle, index) => (
                    <div key={index} className="flex justify-between text-sm">
                      <span>{detalle.cantidad}x Producto #{detalle.productoId}</span>
                      <span>{formatCurrency(detalle.subtotal)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Botón de Confirmación */}
            <div className="pt-4">
              {pedido.estado === 'ENTREGADO' ? (
                <div className="text-center py-4">
                  <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-2" />
                  <p className="text-green-600 font-semibold">
                    Este pedido ya fue entregado
                  </p>
                </div>
              ) : (
                <Button 
                  onClick={handleConfirmar}
                  disabled={confirmando}
                  className="w-full h-14 text-lg"
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