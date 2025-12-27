import { useState, useEffect, Fragment } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/toast';
import { Plus, Search, Eye, ChevronLeft, ChevronRight, ChevronDown, ChevronUp, RefreshCw, Clock, Package, Truck, CheckCircle, XCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { pedidosService, clientesService, remitosService, productosService } from '@/services/api.service';
import { formatCurrency, getLocalDateTime } from '@/lib/utils';
import TruncatedCell from '@/components/TruncatedCell';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const estadoColors = {
  PENDIENTE: 'bg-orange-100 text-orange-700 border-orange-300 dark:bg-orange-900/30 dark:text-orange-400 dark:border-orange-800',
  EN_PREPARACION: 'bg-blue-100 text-blue-700 border-blue-300 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800',
  ENVIADO: 'bg-purple-100 text-purple-700 border-purple-300 dark:bg-purple-900/30 dark:text-purple-400 dark:border-purple-800',
  ENTREGADO: 'bg-green-100 text-green-700 border-green-300 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800',
  CANCELADO: 'bg-red-100 text-red-700 border-red-300 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800'
};

const estadoLabels = {
  PENDIENTE: 'Pendiente',
  EN_PREPARACION: 'En Preparación',
  ENVIADO: 'Enviado',
  ENTREGADO: 'Entregado',
  CANCELADO: 'Cancelado'
};

const estadoIcons = {
  PENDIENTE: Clock,
  EN_PREPARACION: Package,
  ENVIADO: Truck,
  ENTREGADO: CheckCircle,
  CANCELADO: XCircle
};

// Flujo de trabajo de estados
const estadoWorkflow = {
  PENDIENTE: ['EN_PREPARACION', 'CANCELADO'],
  EN_PREPARACION: ['ENVIADO', 'CANCELADO'],
  ENVIADO: ['ENTREGADO', 'CANCELADO'],
  ENTREGADO: [],
  CANCELADO: []
};

const ordenEstados = ['PENDIENTE', 'EN_PREPARACION', 'ENVIADO', 'ENTREGADO'];

export default function Pedidos() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [pedidos, setPedidos] = useState([]);
  const [clientes, setClientes] = useState({});
  const [productos, setProductos] = useState({});
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('todos');
  const [currentPage, setCurrentPage] = useState(1);
  const [expandedRows, setExpandedRows] = useState({});
  const itemsPerPage = 5;

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [pedidosRes, clientesRes, productosRes] = await Promise.all([
        pedidosService.getAll(),
        clientesService.getAll(),
        productosService.getAll()
      ]);
      
      setPedidos(pedidosRes.data);
      
      const clientesMap = {};
      clientesRes.data.forEach(c => {
        clientesMap[c.id] = c;
      });
      setClientes(clientesMap);

      const productosMap = {};
      productosRes.data.forEach(p => {
        productosMap[p.id] = p;
      });
      setProductos(productosMap);
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

  const toggleRow = (pedidoId) => {
    setExpandedRows(prev => ({
      ...prev,
      [pedidoId]: !prev[pedidoId]
    }));
  };

  const handleChangeEstado = async (pedido, nuevoEstado) => {
    // Validar transición de estado
    const estadosPermitidos = estadoWorkflow[pedido.estado] || [];
    if (!estadosPermitidos.includes(nuevoEstado) && nuevoEstado !== pedido.estado) {
      toast({
        title: 'Transición no permitida',
        description: `No se puede cambiar de ${estadoLabels[pedido.estado]} a ${estadoLabels[nuevoEstado]}`,
        variant: 'error'
      });
      return;
    }

    try {
      // Si cambia a ENVIADO, generar remito automáticamente
      if (nuevoEstado === 'ENVIADO' && !pedido.remitoGenerado) {
        const remitoData = {
          pedidoId: pedido.id,
          numeroRemito: Date.now(),
          valorTotal: pedido.montoTotal,
          fechaEmision: getLocalDateTime()
        };
        
        await remitosService.create(remitoData);
        await pedidosService.update(pedido.id, { ...pedido, estado: nuevoEstado, remitoGenerado: true });
        
        toast({
          title: 'Estado actualizado',
          description: `Pedido marcado como ${estadoLabels[nuevoEstado]}. Remito #${remitoData.numeroRemito} generado automáticamente.`,
          variant: 'success'
        });
      } 
      // Si cambia a CANCELADO y tiene remito, eliminar el remito
      else if (nuevoEstado === 'CANCELADO' && pedido.remitoGenerado) {
        try {
          // Buscar el remito asociado al pedido
          const remitosResponse = await remitosService.getAll();
          const remitoAsociado = remitosResponse.data.find(r => r.pedidoId === pedido.id);
          
          if (remitoAsociado) {
            // Eliminar el remito
            await remitosService.delete(remitoAsociado.id);
            
            // Actualizar el pedido con estado CANCELADO y remitoGenerado = false
            await pedidosService.update(pedido.id, { 
              ...pedido, 
              estado: nuevoEstado, 
              remitoGenerado: false 
            });
            
            toast({
              title: 'Pedido cancelado',
              description: `Pedido #${pedido.id} cancelado. El remito #${remitoAsociado.numeroRemito} fue eliminado.`,
              variant: 'warning'
            });
          } else {
            // No se encontró remito, solo actualizar el estado
            await pedidosService.update(pedido.id, { 
              ...pedido, 
              estado: nuevoEstado, 
              remitoGenerado: false 
            });
            
            toast({
              title: 'Pedido cancelado',
              description: `Pedido #${pedido.id} marcado como cancelado`,
              variant: 'warning'
            });
          }
        } catch (remitoError) {
          console.error('Error eliminando remito:', remitoError);
          // Aún así actualizar el estado del pedido
          await pedidosService.update(pedido.id, { 
            ...pedido, 
            estado: nuevoEstado, 
            remitoGenerado: false 
          });
          
          toast({
            title: 'Pedido cancelado',
            description: 'Pedido cancelado, pero hubo un problema al eliminar el remito',
            variant: 'warning'
          });
        }
      } 
      else {
        // Actualizar solo el estado
        await pedidosService.update(pedido.id, { ...pedido, estado: nuevoEstado });
        
        toast({
          title: 'Estado actualizado',
          description: `Pedido #${pedido.id} marcado como ${estadoLabels[nuevoEstado]}`,
          variant: 'success'
        });
      }
      
      loadData();
    } catch (error) {
      console.error('Error actualizando estado:', error);
      toast({
        title: 'Error',
        description: 'No se pudo actualizar el estado del pedido',
        variant: 'error'
      });
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
    if (activeTab !== 'todos') {
      passesTabFilter = pedido.estado === activeTab;
    }
    
    // Filtro por búsqueda (ID, cliente, total)
    let passesSearchFilter = true;
    if (search.trim()) {
      const searchLower = search.toLowerCase();
      const cliente = clientes[pedido.clienteId];
      const clienteNombre = cliente?.razonSocial?.toLowerCase() || '';
      
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
    { id: 'todos', label: 'Todos', count: pedidos.length, icon: null },
    { id: 'PENDIENTE', label: 'Pendientes', count: pedidos.filter(p => p.estado === 'PENDIENTE').length, icon: Clock },
    { id: 'EN_PREPARACION', label: 'En Preparación', count: pedidos.filter(p => p.estado === 'EN_PREPARACION').length, icon: Package },
    { id: 'ENVIADO', label: 'Enviados', count: pedidos.filter(p => p.estado === 'ENVIADO').length, icon: Truck },
    { id: 'ENTREGADO', label: 'Entregados', count: pedidos.filter(p => p.estado === 'ENTREGADO').length, icon: CheckCircle },
    { id: 'CANCELADO', label: 'Cancelados', count: pedidos.filter(p => p.estado === 'CANCELADO').length, icon: XCircle }
  ];

  const getProgressPercentage = (estado) => {
    const index = ordenEstados.indexOf(estado);
    if (index === -1) return 0;
    return ((index + 1) / ordenEstados.length) * 100;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500 dark:text-gray-400">Cargando pedidos...</div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Pedidos del Día</h1>
        </div>
        <Button onClick={() => navigate('/pedidos/nuevo')} className="bg-green-600 hover:bg-green-700">
          <Plus className="h-4 w-4 mr-2" />
          Nuevo Pedido
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 mb-6">
        {tabs.map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                setCurrentPage(1);
              }}
              className={`px-4 py-2 rounded-lg font-medium text-sm transition-all flex items-center gap-2 ${
                activeTab === tab.id
                  ? 'bg-green-600 text-white hover:bg-green-700 shadow-lg'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              {Icon && <Icon className="h-4 w-4" />}
              {tab.label} ({tab.count})
            </button>
          );
        })}
      </div>

      {/* Search */}
      <div className="bg-white dark:bg-[#1a1a1a]/80 dark:backdrop-blur-xl rounded-2xl border border-gray-200 dark:border-[#2a2a2a] dark:shadow-xl dark:shadow-black/20 p-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 h-4 w-4" />
          <Input
            placeholder="Buscar por ID, cliente, total o estado..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            className="pl-10 bg-gray-50 dark:bg-[#1a1a1a]/60 border-gray-200 dark:border-[#2a2a2a] dark:text-white"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-[#1a1a1a]/80 dark:backdrop-blur-xl rounded-2xl border border-gray-200 dark:border-[#2a2a2a] dark:shadow-2xl dark:shadow-black/40 relative z-10">
        <div className="overflow-x-auto rounded-xl">
          <table className="w-full border-collapse">
            <thead className="bg-gray-50 dark:bg-[#1a1a1a]/60 border-b-2 border-gray-200 dark:border-[#2a2a2a]">
              <tr>
                <th className="text-left py-4 px-6 text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-[#9ca3af] w-12 border-r dark:border-[#2a2a2a]"></th>
                <th className="text-left py-4 px-6 text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-[#9ca3af] border-r dark:border-[#2a2a2a]">ID PEDIDO</th>
                <th className="text-left py-4 px-6 text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-[#9ca3af] border-r dark:border-[#2a2a2a]">CLIENTE</th>
                <th className="text-left py-4 px-6 text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-[#9ca3af] border-r dark:border-[#2a2a2a]">HORA</th>
                <th className="text-left py-4 px-6 text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-[#9ca3af] border-r dark:border-[#2a2a2a]">TOTAL</th>
                <th className="text-left py-4 px-6 text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-[#9ca3af] border-r dark:border-[#2a2a2a]">ESTADO</th>
                <th className="text-left py-4 px-6 text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-[#9ca3af]">ACCIONES</th>
              </tr>
            </thead>
            <tbody>
              {paginatedPedidos.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center py-12 text-gray-500 dark:text-gray-400">
                    No hay pedidos para mostrar
                  </td>
                </tr>
              ) : (
                paginatedPedidos.map((pedido) => {
                  const cliente = clientes[pedido.clienteId];
                  const isExpanded = expandedRows[pedido.id];
                  
                  return (
                    <Fragment key={pedido.id}>
                      <tr className="border-b border-gray-100 dark:border-[#2a2a2a] hover:bg-gray-50 dark:hover:bg-[#1db954]/5 transition-colors duration-150">
                        <td className="py-4 px-6 border-r dark:border-[#2a2a2a]">
                          <button
                            onClick={() => toggleRow(pedido.id)}
                            className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
                          >
                            {isExpanded ? (
                              <ChevronUp className="h-5 w-5" />
                            ) : (
                              <ChevronDown className="h-5 w-5" />
                            )}
                          </button>
                        </td>
                        <td className="py-4 px-6 border-r dark:border-[#2a2a2a]">
                          <span className="font-semibold text-gray-900 dark:text-white">#{pedido.id}</span>
                        </td>
                        <td className="py-4 px-6 border-r dark:border-[#2a2a2a]">
                          <TruncatedCell 
                            content={cliente?.razonSocial || 'N/A'}
                            maxLength={25}
                            className="text-gray-900 dark:text-white"
                          />
                        </td>
                        <td className="py-4 px-6 border-r dark:border-[#2a2a2a] text-gray-600 dark:text-gray-300">
                          {new Date(pedido.fechaCreacion).toLocaleTimeString('es-AR', {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </td>
                        <td className="py-4 px-6 border-r dark:border-[#2a2a2a]">
                          <span className="font-semibold text-gray-900 dark:text-white">
                            {formatCurrency(pedido.montoTotal)}
                          </span>
                        </td>
                        <td className="py-4 px-6 border-r dark:border-[#2a2a2a]">
                          <div className="flex items-center gap-2">
                            <Select
                              value={pedido.estado}
                              onValueChange={(value) => handleChangeEstado(pedido, value)}
                              disabled={pedido.estado === 'ENTREGADO' || pedido.estado === 'CANCELADO'}
                            >
                              <SelectTrigger className={`w-[160px] ${estadoColors[pedido.estado]}`}>
                                <SelectValue>
                                  <div className="flex items-center gap-2">
                                    {(() => {
                                      const Icon = estadoIcons[pedido.estado];
                                      return Icon && <Icon className="h-3.5 w-3.5" />;
                                    })()}
                                    {estadoLabels[pedido.estado]}
                                  </div>
                                </SelectValue>
                              </SelectTrigger>
                              <SelectContent>
                                {estadoWorkflow[pedido.estado]?.map(estado => {
                                  const Icon = estadoIcons[estado];
                                  return (
                                    <SelectItem key={estado} value={estado}>
                                      <div className="flex items-center gap-2">
                                        {Icon && <Icon className="h-4 w-4" />}
                                        {estadoLabels[estado]}
                                      </div>
                                    </SelectItem>
                                  );
                                })}
                              </SelectContent>
                            </Select>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          {pedido.remitoGenerado && (
                            <span className="text-green-600 dark:text-green-400 text-sm font-medium flex items-center gap-1">
                              <CheckCircle className="h-4 w-4" />
                              Remito generado
                            </span>
                          )}
                        </td>
                      </tr>
                      {isExpanded && (
                        <tr className="bg-gray-50 dark:bg-[#1a1a1a]/30">
                          <td colSpan="7" className="py-4 px-8">
                            <div className="space-y-4">
                              {/* Barra de progreso */}
                              <div className="bg-white dark:bg-[#1a1a1a]/60 rounded-xl p-4 border border-gray-200 dark:border-[#2a2a2a]">
                                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Estado del Pedido</h4>
                                <div className="relative">
                                  {/* Línea de progreso */}
                                  <div className="absolute top-5 left-0 right-0 h-1 bg-gray-200 dark:bg-gray-700">
                                    <div 
                                      className="h-full bg-green-500 transition-all duration-500"
                                      style={{ width: `${getProgressPercentage(pedido.estado)}%` }}
                                    />
                                  </div>
                                  
                                  {/* Steps */}
                                  <div className="relative flex justify-between">
                                    {ordenEstados.map((estado, index) => {
                                      const Icon = estadoIcons[estado];
                                      const isCompleted = ordenEstados.indexOf(pedido.estado) >= index;
                                      const isCurrent = pedido.estado === estado;
                                      
                                      return (
                                        <div key={estado} className="flex flex-col items-center">
                                          <div className={`w-10 h-10 rounded-full flex items-center justify-center z-10 transition-all ${
                                            isCurrent
                                              ? 'bg-green-500 text-white ring-4 ring-green-200 dark:ring-green-900'
                                              : isCompleted
                                              ? 'bg-green-500 text-white'
                                              : 'bg-gray-200 dark:bg-gray-700 text-gray-400'
                                          }`}>
                                            {Icon && <Icon className="h-5 w-5" />}
                                          </div>
                                          <span className={`text-xs mt-2 font-medium ${
                                            isCurrent ? 'text-green-600 dark:text-green-400' : 'text-gray-500 dark:text-gray-400'
                                          }`}>
                                            {estadoLabels[estado]}
                                          </span>
                                        </div>
                                      );
                                    })}
                                  </div>
                                </div>
                                
                                {pedido.estado === 'CANCELADO' && (
                                  <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                                    <div className="flex items-center gap-2 text-red-700 dark:text-red-400">
                                      <XCircle className="h-4 w-4" />
                                      <span className="text-sm font-medium">Pedido Cancelado</span>
                                    </div>
                                  </div>
                                )}
                              </div>

                              <h3 className="font-semibold text-gray-900 dark:text-white">Detalles del Pedido</h3>
                              
                              {/* Información del cliente */}
                              <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                  <span className="font-medium text-gray-600 dark:text-[#9ca3af]">Cliente:</span>
                                  <span className="ml-2 text-gray-900 dark:text-white">
                                    <TruncatedCell 
                                      content={cliente?.razonSocial || 'N/A'}
                                      maxLength={30}
                                      className="text-gray-900 dark:text-white"
                                    />
                                  </span>
                                </div>
                                <div>
                                  <span className="font-medium text-gray-600 dark:text-[#9ca3af]">CUIT/DNI:</span>
                                  <span className="ml-2 text-gray-900 dark:text-white">
                                    <TruncatedCell 
                                      content={cliente?.cuitDni || 'N/A'}
                                      maxLength={15}
                                      className="text-gray-900 dark:text-white"
                                    />
                                  </span>
                                </div>
                                <div>
                                  <span className="font-medium text-gray-600 dark:text-[#9ca3af]">Dirección:</span>
                                  <span className="ml-2 text-gray-900 dark:text-white">
                                    <TruncatedCell 
                                      content={cliente?.direccion || 'N/A'}
                                      maxLength={40}
                                      className="text-gray-900 dark:text-white"
                                    />
                                  </span>
                                </div>
                                <div>
                                  <span className="font-medium text-gray-600 dark:text-[#9ca3af]">Fecha:</span>
                                  <span className="ml-2 text-gray-900 dark:text-white">
                                    {new Date(pedido.fechaCreacion).toLocaleDateString('es-AR')}
                                  </span>
                                </div>
                              </div>

                              {/* Productos */}
                              <div>
                                <h4 className="font-medium text-gray-700 dark:text-white mb-2">Productos:</h4>
                                <div className="bg-white dark:bg-[#1a1a1a]/60 rounded-xl border border-gray-200 dark:border-[#2a2a2a]">
                                  <table className="w-full text-sm border-collapse">
                                    <thead className="bg-gray-100 dark:bg-[#1a1a1a]/40">
                                      <tr>
                                        <th className="text-left py-3 px-4 text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-[#9ca3af] border-r dark:border-[#2a2a2a]">Producto</th>
                                        <th className="text-center py-3 px-4 text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-[#9ca3af] border-r dark:border-[#2a2a2a]">Cantidad</th>
                                        <th className="text-right py-3 px-4 text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-[#9ca3af] border-r dark:border-[#2a2a2a]">Precio Unit.</th>
                                        <th className="text-right py-3 px-4 text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-[#9ca3af]">Subtotal</th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {pedido.detalles && pedido.detalles.length > 0 ? (
                                        pedido.detalles.map((detalle, idx) => {
                                          // Verificar si es un producto personalizado
                                          const esPersonalizado = detalle.nombrePersonalizado || detalle.productoId === null;
                                          const producto = esPersonalizado ? null : productos[detalle.productoId];
                                          
                                          // Prioridad: precioUnitario > precioVenta > precio del producto > 0
                                          const precioUnitario = detalle.precioUnitario || detalle.precioVenta || producto?.precioVenta || 0;
                                          const subtotal = detalle.subtotal || (detalle.cantidad * precioUnitario);
                                          
                                          // Construir el nombre del producto
                                          let nombreProducto = '';
                                          if (esPersonalizado) {
                                            nombreProducto = detalle.nombrePersonalizado || 'Producto Personalizado';
                                            if (detalle.descripcionPersonalizada) {
                                              nombreProducto += ` (${detalle.descripcionPersonalizada})`;
                                            }
                                          } else {
                                            nombreProducto = `${producto?.nombre || `Producto #${detalle.productoId}`}${producto?.unidadMedida ? ` (${producto.unidadMedida})` : ''}`;
                                          }
                                          
                                          return (
                                            <tr key={idx} className="border-t border-gray-100 dark:border-[#2a2a2a]">
                                              <td className="py-2 px-4 border-r dark:border-[#2a2a2a] dark:text-gray-300">
                                                <TruncatedCell 
                                                  content={nombreProducto}
                                                  maxLength={30}
                                                  className="dark:text-gray-300"
                                                />
                                              </td>
                                              <td className="py-2 px-4 border-r dark:border-[#2a2a2a] text-center font-medium dark:text-gray-300">{detalle.cantidad}</td>
                                              <td className="py-2 px-4 border-r dark:border-[#2a2a2a] text-right dark:text-gray-300">{formatCurrency(precioUnitario)}</td>
                                              <td className="py-2 px-4 text-right font-semibold text-[#1db954]">{formatCurrency(subtotal)}</td>
                                            </tr>
                                          );
                                        })
                                      ) : (
                                        <tr>
                                          <td colSpan="4" className="py-4 text-center text-gray-500 dark:text-gray-400">
                                            No hay detalles disponibles
                                          </td>
                                        </tr>
                                      )}
                                    </tbody>
                                    <tfoot className="bg-gray-50 dark:bg-[#1a1a1a]/40 font-semibold">
                                      <tr>
                                        <td colSpan="3" className="py-3 px-4 text-right dark:text-white">Total:</td>
                                        <td className="py-3 px-4 text-right font-semibold text-[#1db954]">{formatCurrency(pedido.montoTotal)}</td>
                                      </tr>
                                    </tfoot>
                                  </table>
                                </div>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </Fragment>
                  );
                })
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