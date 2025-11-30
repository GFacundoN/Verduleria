import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Search, FileText, Eye } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { pedidosService, clientesService, remitosService } from '@/services/api.service';
import { formatCurrency, formatDate } from '@/lib/utils';

const estadoColors = {
  PENDIENTE: 'bg-yellow-100 text-yellow-800',
  EN_PREPARACION: 'bg-blue-100 text-blue-800',
  ENVIADO: 'bg-purple-100 text-purple-800',
  ENTREGADO: 'bg-green-100 text-green-800',
  CANCELADO: 'bg-red-100 text-red-800'
};

export default function Pedidos() {
  const navigate = useNavigate();
  const [pedidos, setPedidos] = useState([]);
  const [clientes, setClientes] = useState({});
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [pedidosRes, clientesRes] = await Promise.all([
        pedidosService.getAll(search),
        clientesService.getAll()
      ]);
      
      setPedidos(pedidosRes.data);
      
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

  const handleGenerarRemito = async (pedido) => {
    try {
      const remitoData = {
        pedidoId: pedido.id,
        numeroRemito: Date.now(),
        valorTotal: pedido.montoTotal,
        fechaEmision: new Date().toISOString()
      };
      
      await remitosService.create(remitoData);
      await pedidosService.update(pedido.id, { ...pedido, remitoGenerado: true });
      
      alert('Remito generado exitosamente');
      loadData();
    } catch (error) {
      console.error('Error generando remito:', error);
      alert('Error al generar el remito');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Pedidos</h1>
          <p className="text-gray-500 mt-1">Gestión de pedidos</p>
        </div>
        <Button onClick={() => navigate('/pedidos/nuevo')}>
          <Plus className="h-5 w-5 mr-2" />
          Nuevo Pedido
        </Button>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-2">
            <Input
              placeholder="Buscar pedidos..."
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
          ) : pedidos.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No hay pedidos registrados
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4">ID</th>
                    <th className="text-left py-3 px-4">Cliente</th>
                    <th className="text-left py-3 px-4">Fecha</th>
                    <th className="text-left py-3 px-4">Monto</th>
                    <th className="text-left py-3 px-4">Estado</th>
                    <th className="text-left py-3 px-4">Remito</th>
                    <th className="text-right py-3 px-4">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {pedidos.map((pedido) => (
                    <tr key={pedido.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4">#{pedido.id}</td>
                      <td className="py-3 px-4">
                        {clientes[pedido.clienteId]?.razonSocial || 'N/A'}
                      </td>
                      <td className="py-3 px-4">
                        {new Date(pedido.fechaCreacion).toLocaleDateString('es-AR')}
                      </td>
                      <td className="py-3 px-4">{formatCurrency(pedido.montoTotal)}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${estadoColors[pedido.estado]}`}>
                          {pedido.estado}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        {pedido.remitoGenerado ? (
                          <span className="text-green-600 font-semibold">Sí</span>
                        ) : (
                          <span className="text-gray-400">No</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          disabled={pedido.remitoGenerado}
                          onClick={() => handleGenerarRemito(pedido)}
                        >
                          <FileText className="h-4 w-4 mr-1" />
                          Generar Remito
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