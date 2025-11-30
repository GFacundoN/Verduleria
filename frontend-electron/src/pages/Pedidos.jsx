import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/toast';
import { Plus, Search, Eye, ChevronLeft, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { pedidosService, clientesService, remitosService } from '@/services/api.service';
import { formatCurrency, getLocalDateTime } from '@/lib/utils';

const estadoColors = {
  PENDIENTE: 'bg-orange-100 text-orange-700 border-orange-200',
  EN_PREPARACION: 'bg-blue-100 text-blue-700 border-blue-200',
  ENVIADO: 'bg-green-100 text-green-700 border-green-200',
  ENTREGADO: 'bg-green-100 text-green-700 border-green-200',
  CANCELADO: 'bg-red-100 text-red-700 border-red-200'
};

const estadoLabels = {
  PENDIENTE: 'Pendiente',
  EN_PREPARACION: 'En Preparación',
  ENVIADO: 'Entregado',
  ENTREGADO: 'Entregado',
  CANCELADO: 'Cancelado'
};

export default function Pedidos() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [pedidos, setPedidos] = useState([]);
  const [clientes, setClientes] = useState({});
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('todos');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [pedidosRes, clientesRes] = await Promise.all([
        pedidosService.getAll(),
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
      toast({
        title: 'Error',
        description: 'No se pudieron cargar los pedidos',
        variant: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGenerarRemito = async (pedido) => {
    try {
      const remitoData = {
        pedidoId: pedido.id,
        numeroRemito: Date.now(),
        valorTotal: pedido.montoTotal,
        fechaEmision: getLocalDateTime()
      };
      
      await remitosService.create(remitoData);
      await pedidosService.update(pedido.id, { ...pedido, remitoGenerado: true });
      
      toast({
        title: 'Remito generado',
        description: `Remito #${remitoData.numeroRemito} creado exitosamente`,
        variant: 'success'
      });
      loadData();
    } catch (error) {
      console.error('Error generando remito:', error);
      toast({
        title: 'Error',
        description: 'No se pudo generar el remito',
        variant: 'error'
      });
    }
  };

  // Filtrar pedidos por tab y búsqueda
  const filteredPedidos = pedidos.filter(pedido => {
    // Filtro por tab
    let passesTabFilter = true;
    if (activeTab === 'pendientes') {
      passesTabFilter = ['PENDIENTE', 'EN_PREPARACION'].includes(pedido.estado);
    } else if (activeTab === 'entregados') {
      passesTabFilter = ['ENVIADO', 'ENTREGADO'].includes(pedido.estado);
    }
    
    // Filtro por búsqueda (ID, cliente, total)
    let passesSearchFilter = true;
    if (search.trim()) {
      const searchLower = search.toLowerCase();
      const cliente = clientes[pedido.clienteId];
      const clienteNombre = cliente ? `${cliente.nombre} ${cliente.apellido}`.toLowerCase() : '';
      
      passesSearchFilter = 
        pedido.id.toString().includes(searchLower) ||
        clienteNombre.includes(searchLower) ||
        pedido.montoTotal.toString().includes(searchLower) ||
        (estadoLabels[pedido.estado] || pedido.estado).toLowerCase().includes(searchLower);
    }
    
    return passesTabFilter && passesSearchFilter;
  });

  // Paginación
  const totalPages = Math.ceil(filteredPedidos.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedPedidos = filteredPedidos.slice(startIndex, startIndex + itemsPerPage);

  const tabs = [
    { id: 'todos', label: 'Todos', count: pedidos.length },
    { id: 'pendientes', label: 'Pendientes', count: pedidos.filter(p => ['PENDIENTE', 'EN_PREPARACION'].includes(p.estado)).length },
    { id: 'entregados', label: 'Entregados', count: pedidos.filter(p => ['ENVIADO', 'ENTREGADO'].includes(p.estado)).length }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Cargando pedidos...</div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Pedidos del Día</h1>
        </div>
        <Button onClick={() => navigate('/pedidos/nuevo')} className="bg-green-600 hover:bg-green-700">
          <Plus className="h-4 w-4 mr-2" />
          Nuevo Pedido
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 mb-6">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => {
              setActiveTab(tab.id);
              setCurrentPage(1);
            }}
            className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
              activeTab === tab.id
                ? 'bg-green-600 text-white hover:bg-green-700'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {tab.label} ({tab.count})
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="flex gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Buscar por ID, cliente, total o estado..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1); // Reset a primera página al buscar
            }}
            className="pl-10 bg-gray-50 border-gray-200"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left py-3 px-4 font-medium text-gray-600 text-sm">ID PEDIDO</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600 text-sm">HORA</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600 text-sm">TOTAL</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600 text-sm">ESTADO</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600 text-sm">ACCIONES</th>
              </tr>
            </thead>
            <tbody>
              {paginatedPedidos.length === 0 ? (
                <tr>
                  <td colSpan="5" className="text-center py-12 text-gray-500">
                    No hay pedidos para mostrar
                  </td>
                </tr>
              ) : (
                paginatedPedidos.map((pedido) => (
                  <tr key={pedido.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-4 px-4">
                      <span className="font-semibold text-gray-900">#{pedido.id}</span>
                    </td>
                    <td className="py-4 px-4 text-gray-600">
                      {new Date(pedido.fechaCreacion).toLocaleTimeString('es-AR', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </td>
                    <td className="py-4 px-4">
                      <span className="font-semibold text-gray-900">
                        {formatCurrency(pedido.montoTotal)}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${
                        estadoColors[pedido.estado] || 'bg-gray-100 text-gray-700 border-gray-200'
                      }`}>
                        {estadoLabels[pedido.estado] || pedido.estado}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2">
                        {!pedido.remitoGenerado && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleGenerarRemito(pedido)}
                            className="text-gray-600 hover:text-gray-900"
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            Ver Remito
                          </Button>
                        )}
                        {pedido.remitoGenerado && (
                          <span className="text-green-600 text-sm font-medium">Remito generado</span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center py-4 border-t border-gray-200">
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <Button
                  key={page}
                  variant={currentPage === page ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setCurrentPage(page)}
                  className={currentPage === page ? "bg-green-600 hover:bg-green-700" : ""}
                >
                  {page}
                </Button>
              ))}
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}