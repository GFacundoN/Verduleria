import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Search, QrCode, Printer, Eye } from 'lucide-react';
import { remitosService, pedidosService, clientesService } from '@/services/api.service';
import { formatCurrency, formatDate } from '@/lib/utils';
import QRCode from 'qrcode.react';

export default function Remitos() {
  const [remitos, setRemitos] = useState([]);
  const [pedidos, setPedidos] = useState({});
  const [clientes, setClientes] = useState({});
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedRemito, setSelectedRemito] = useState(null);
  const [showQR, setShowQR] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [remitosRes, pedidosRes, clientesRes] = await Promise.all([
        remitosService.getAll(search),
        pedidosService.getAll(),
        clientesService.getAll()
      ]);
      
      setRemitos(remitosRes.data);
      
      const pedidosMap = {};
      pedidosRes.data.forEach(p => {
        pedidosMap[p.id] = p;
      });
      setPedidos(pedidosMap);
      
      const clientesMap = {};
      clientesRes.data.forEach(c => {
        clientesMap[c.id] = c;
      });
      setClientes(clientesMap);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setLoading(true);
    loadData();
  };

  const handleVerQR = (remito) => {
    setSelectedRemito(remito);
    setShowQR(true);
  };

  const handleImprimir = () => {
    window.print();
  };

  const getQRUrl = (pedidoId) => {
    // URL que la app móvil usará para confirmar entrega
    return `${window.location.origin}/confirmar/${pedidoId}`;
  };

  const calcularTotalDia = () => {
    const today = new Date().toDateString();
    return remitos
      .filter(r => new Date(r.fechaEmision).toDateString() === today)
      .reduce((sum, r) => sum + parseFloat(r.valorTotal), 0);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Remitos</h1>
          <p className="text-gray-500 mt-1">Gestión de remitos y ventas</p>
        </div>
        <Card className="w-64">
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm text-gray-500">Ventas del Día</p>
              <p className="text-2xl font-bold text-green-600">
                {formatCurrency(calcularTotalDia())}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-2">
            <Input
              placeholder="Buscar remitos..."
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
          ) : remitos.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No hay remitos generados
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4">Nº Remito</th>
                    <th className="text-left py-3 px-4">Pedido</th>
                    <th className="text-left py-3 px-4">Cliente</th>
                    <th className="text-left py-3 px-4">Fecha Emisión</th>
                    <th className="text-left py-3 px-4">Valor Total</th>
                    <th className="text-left py-3 px-4">Estado</th>
                    <th className="text-right py-3 px-4">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {remitos.map((remito) => {
                    const pedido = pedidos[remito.pedidoId];
                    const cliente = pedido ? clientes[pedido.clienteId] : null;
                    
                    return (
                      <tr key={remito.id} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4">#{remito.numeroRemito}</td>
                        <td className="py-3 px-4">#{remito.pedidoId}</td>
                        <td className="py-3 px-4">
                          {cliente?.razonSocial || 'N/A'}
                        </td>
                        <td className="py-3 px-4">
                          {new Date(remito.fechaEmision).toLocaleDateString('es-AR')}
                        </td>
                        <td className="py-3 px-4">{formatCurrency(remito.valorTotal)}</td>
                        <td className="py-3 px-4">
                          {pedido?.estado === 'ENTREGADO' ? (
                            <span className="px-2 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800">
                              Entregado
                            </span>
                          ) : (
                            <span className="px-2 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-800">
                              Pendiente
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleVerQR(remito)}
                          >
                            <QrCode className="h-4 w-4 mr-1" />
                            Ver QR
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* QR Dialog */}
      <Dialog open={showQR} onClose={() => setShowQR(false)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Código QR - Remito #{selectedRemito?.numeroRemito}</DialogTitle>
          </DialogHeader>
          {selectedRemito && (
            <div className="space-y-4">
              <div className="bg-white p-8 rounded-lg flex flex-col items-center">
                <QRCode 
                  value={getQRUrl(selectedRemito.pedidoId)}
                  size={256}
                  level="H"
                  includeMargin
                />
                <p className="text-sm text-gray-600 mt-4 text-center">
                  Escanea este código para confirmar la entrega
                </p>
              </div>
              <div className="space-y-2">
                <p><strong>Pedido:</strong> #{selectedRemito.pedidoId}</p>
                <p><strong>Valor:</strong> {formatCurrency(selectedRemito.valorTotal)}</p>
                <p><strong>Fecha:</strong> {formatDate(selectedRemito.fechaEmision)}</p>
              </div>
              <div className="flex gap-2">
                <Button onClick={handleImprimir} className="flex-1">
                  <Printer className="h-4 w-4 mr-2" />
                  Imprimir
                </Button>
                <Button variant="outline" onClick={() => setShowQR(false)} className="flex-1">
                  Cerrar
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}