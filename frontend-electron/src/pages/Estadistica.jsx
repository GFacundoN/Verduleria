import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/toast';
import { Calendar, TrendingUp, Package, Users, DollarSign, BarChart3, Clock, Filter } from 'lucide-react';
import { pedidosService, productosService, clientesService } from '@/services/api.service';
import { formatCurrency, getLocalDate, toLocalDateString } from '@/lib/utils';

const PERIODOS = {
  HOY: 'hoy',
  SEMANA: 'semana',
  MES: 'mes',
  TRIMESTRE: 'trimestre',
  PERSONALIZADO: 'personalizado'
};

const PERIODO_LABELS = {
  [PERIODOS.HOY]: 'Hoy',
  [PERIODOS.SEMANA]: 'Esta Semana',
  [PERIODOS.MES]: 'Este Mes',
  [PERIODOS.TRIMESTRE]: 'Este Trimestre',
  [PERIODOS.PERSONALIZADO]: 'Período Personalizado'
};

export default function Estadisticas() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [pedidos, setPedidos] = useState([]);
  const [productos, setProductos] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [periodoSeleccionado, setPeriodoSeleccionado] = useState(PERIODOS.MES);
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (periodoSeleccionado !== PERIODOS.PERSONALIZADO) {
      calcularFechasPeriodo();
    }
  }, [periodoSeleccionado]);

  const loadData = async () => {
    try {
      const [pedidosRes, productosRes, clientesRes] = await Promise.all([
        pedidosService.getAll(),
        productosService.getAll(),
        clientesService.getAll()
      ]);
      
      setPedidos(pedidosRes.data);
      setProductos(productosRes.data);
      setClientes(clientesRes.data);
    } catch (error) {
      console.error('Error loading data:', error);
      toast({
        title: 'Error',
        description: 'No se pudieron cargar los datos',
        variant: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const calcularFechasPeriodo = () => {
    const hoy = new Date();
    let inicio, fin;

    switch (periodoSeleccionado) {
      case PERIODOS.HOY:
        // Para hoy, usar la misma fecha de inicio y fin en hora local
        const fechaHoy = getLocalDate();
        setFechaInicio(fechaHoy);
        setFechaFin(fechaHoy);
        return;
      case PERIODOS.SEMANA:
        const inicioSemana = hoy.getDate() - hoy.getDay();
        inicio = new Date(hoy.getFullYear(), hoy.getMonth(), inicioSemana);
        fin = new Date(hoy.getFullYear(), hoy.getMonth(), inicioSemana + 6);
        break;
      case PERIODOS.MES:
        inicio = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
        fin = new Date(hoy.getFullYear(), hoy.getMonth() + 1, 0);
        break;
      case PERIODOS.TRIMESTRE:
        const mesActual = hoy.getMonth();
        const inicioTrimestre = Math.floor(mesActual / 3) * 3;
        inicio = new Date(hoy.getFullYear(), inicioTrimestre, 1);
        fin = new Date(hoy.getFullYear(), inicioTrimestre + 3, 0);
        break;
      default:
        return;
    }

    setFechaInicio(getLocalDate(inicio));
    setFechaFin(getLocalDate(fin));
  };

  // Filtrar pedidos por período
  const pedidosFiltrados = pedidos.filter(pedido => {
    if (!fechaInicio || !fechaFin) return true;
    
    // Usar hora local para comparaciones
    const fechaPedido = toLocalDateString(pedido.fechaCreacion);
    
    // Para un solo día, comparar fechas exactas
    if (fechaInicio === fechaFin) {
      return fechaPedido === fechaInicio;
    }
    
    // Para rangos, usar comparación de fechas
    return fechaPedido >= fechaInicio && fechaPedido <= fechaFin;
  });

  // Calcular estadísticas principales (excluyendo pedidos cancelados)
  const pedidosNoCancelados = pedidosFiltrados.filter(p => p.estado !== 'CANCELADO');
  const totalVentas = pedidosNoCancelados.reduce((sum, p) => sum + parseFloat(p.montoTotal), 0);
  const totalPedidos = pedidosNoCancelados.length;
  const ticketPromedio = totalPedidos > 0 ? totalVentas / totalPedidos : 0;
  const clientesUnicos = new Set(pedidosNoCancelados.map(p => p.clienteId)).size;

  // Productos más vendidos - Usando datos reales (excluyendo cancelados)
  const productosVendidos = {};
  
  pedidosNoCancelados.forEach((pedido) => {
    if (pedido.detalles && Array.isArray(pedido.detalles)) {
      pedido.detalles.forEach(detalle => {
        const producto = productos.find(p => p.id === detalle.productoId);
        const productoId = detalle.productoId;
        
        if (!productosVendidos[productoId]) {
          productosVendidos[productoId] = {
            producto: producto || { nombre: `Producto #${productoId}` },
            cantidad: 0,
            ingresos: 0
          };
        }
        
        // Calcular precio unitario con la misma lógica de fallback
        const precioUnitario = detalle.precioUnitario || detalle.precioVenta || producto?.precioVenta || 0;
        const subtotal = detalle.subtotal || (detalle.cantidad * precioUnitario);
        
        productosVendidos[productoId].cantidad += detalle.cantidad;
        productosVendidos[productoId].ingresos += subtotal;
      });
    }
  });

  const topProductos = Object.values(productosVendidos)
    .sort((a, b) => b.cantidad - a.cantidad)
    .slice(0, 10);

  // Ventas por día (excluyendo cancelados)
  const ventasPorDia = {};
  pedidosNoCancelados.forEach(pedido => {
    const fecha = toLocalDateString(pedido.fechaCreacion);
    if (!ventasPorDia[fecha]) {
      ventasPorDia[fecha] = { pedidos: 0, ventas: 0 };
    }
    ventasPorDia[fecha].pedidos += 1;
    ventasPorDia[fecha].ventas += parseFloat(pedido.montoTotal);
  });

  const diasOrdenados = Object.keys(ventasPorDia).sort();

  // Ventas por hora (solo para hoy, excluyendo cancelados)
  const ventasPorHora = {};
  if (periodoSeleccionado === PERIODOS.HOY) {
    pedidosNoCancelados.forEach(pedido => {
      const hora = new Date(pedido.fechaCreacion).getHours();
      if (!ventasPorHora[hora]) {
        ventasPorHora[hora] = { pedidos: 0, ventas: 0 };
      }
      ventasPorHora[hora].pedidos += 1;
      ventasPorHora[hora].ventas += parseFloat(pedido.montoTotal);
    });
  }

  const stats = [
    {
      title: 'Ventas Totales',
      value: formatCurrency(totalVentas),
      icon: DollarSign,
      color: 'text-green-600',
      bg: 'bg-green-50',
      border: 'border-green-200'
    },
    {
      title: 'Total Pedidos',
      value: totalPedidos,
      icon: Package,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
      border: 'border-blue-200'
    },
    {
      title: 'Ticket Promedio',
      value: formatCurrency(ticketPromedio),
      icon: TrendingUp,
      color: 'text-purple-600',
      bg: 'bg-purple-50',
      border: 'border-purple-200'
    },
    {
      title: 'Clientes Únicos',
      value: clientesUnicos,
      icon: Users,
      color: 'text-orange-600',
      bg: 'bg-orange-50',
      border: 'border-orange-200'
    }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500 dark:text-gray-400">Cargando estadísticas...</div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Estadísticas de Ventas</h1>
          <p className="text-gray-500 dark:text-[#80868e] mt-1">Análisis detallado de rendimiento</p>
        </div>
        <div className="flex items-center gap-2">
          <BarChart3 className="h-6 w-6 text-gray-400 dark:text-gray-500" />
        </div>
      </div>

      {/* Filtros de Período */}
      <div className="bg-white dark:bg-[#1a1a1a]/80 dark:backdrop-blur-xl rounded-2xl border border-gray-200 dark:border-[#2a2a2a] dark:shadow-2xl dark:shadow-black/40 p-6 mb-8">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="h-5 w-5 text-gray-500 dark:text-gray-400" />
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Filtros de Período</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
          {/* Selector de Período */}
          <div className="lg:col-span-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Período</label>
            <select
              value={periodoSeleccionado}
              onChange={(e) => setPeriodoSeleccionado(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-[#2a2a2a] dark:bg-[#1a1a1a]/60 dark:text-white rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
            >
              {Object.entries(PERIODO_LABELS).map(([key, label]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>
          </div>

          {/* Fecha Inicio */}
          <div className="lg:col-span-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Fecha Inicio</label>
            <Input
              type="date"
              value={fechaInicio}
              onChange={(e) => setFechaInicio(e.target.value)}
              disabled={periodoSeleccionado !== PERIODOS.PERSONALIZADO}
              className="bg-gray-50 dark:bg-[#1a1a1a]/60 border-gray-200 dark:border-[#2a2a2a] dark:text-white [color-scheme:dark]"
            />
          </div>

          {/* Fecha Fin */}
          <div className="lg:col-span-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Fecha Fin</label>
            <Input
              type="date"
              value={fechaFin}
              onChange={(e) => setFechaFin(e.target.value)}
              disabled={periodoSeleccionado !== PERIODOS.PERSONALIZADO}
              className="bg-gray-50 dark:bg-[#1a1a1a]/60 border-gray-200 dark:border-[#2a2a2a] dark:text-white [color-scheme:dark]"
            />
          </div>
        </div>
      </div>

      {/* Estadísticas Principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => {
          const IconComponent = stat.icon;
          return (
            <div key={index} className={`${stat.bg} dark:bg-[#1a1a1a]/80 dark:backdrop-blur-xl ${stat.border} dark:border-[#2a2a2a] border rounded-2xl p-6 transition-all hover:shadow-md dark:shadow-lg dark:shadow-black/40`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
                </div>
                <div className={`${stat.color} p-3`}>
                  <IconComponent className="h-6 w-6" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Productos Más Vendidos */}
        <div className="bg-white dark:bg-[#1a1a1a]/80 dark:backdrop-blur-xl rounded-2xl border border-gray-200 dark:border-[#2a2a2a] dark:shadow-2xl dark:shadow-black/40 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Productos Más Vendidos</h3>
          <div className="space-y-4">
            {topProductos.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No hay datos para mostrar</p>
            ) : (
              topProductos.map((item, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-[#1a1a1a]/40 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-green-100 dark:bg-[#1db954]/20 text-green-600 dark:text-[#1db954] rounded-full flex items-center justify-center text-sm font-bold">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">{item.producto.nombre}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{item.cantidad} unidades</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900 dark:text-[#1db954]">{formatCurrency(item.ingresos)}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Ventas por Día */}
        <div className="bg-white dark:bg-[#1a1a1a]/80 dark:backdrop-blur-xl rounded-2xl border border-gray-200 dark:border-[#2a2a2a] dark:shadow-2xl dark:shadow-black/40 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Ventas por Día</h3>
          <div className="space-y-3">
            {diasOrdenados.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No hay datos para mostrar</p>
            ) : (
              diasOrdenados.slice(-7).map(fecha => {
                const data = ventasPorDia[fecha];
                const maxVentas = Math.max(...Object.values(ventasPorDia).map(d => d.ventas));
                const porcentaje = maxVentas > 0 ? (data.ventas / maxVentas) * 100 : 0;
                
                // Parsear fecha en hora local (YYYY-MM-DD)
                const [year, month, day] = fecha.split('-').map(Number);
                const fechaLocal = new Date(year, month - 1, day);
                
                return (
                  <div key={fecha} className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">
                        {fechaLocal.toLocaleDateString('es-AR', { 
                          weekday: 'short', 
                          day: 'numeric', 
                          month: 'short' 
                        })}
                      </span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {formatCurrency(data.ventas)} ({data.pedidos} pedidos)
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-[#2a2a2a] rounded-full h-2">
                      <div 
                        className="bg-green-500 dark:bg-[#1db954] h-2 rounded-full transition-all duration-300"
                        style={{ width: `${porcentaje}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Análisis por Horarios (solo para hoy) */}
      {periodoSeleccionado === PERIODOS.HOY && Object.keys(ventasPorHora).length > 0 && (
        <div className="bg-white dark:bg-[#1a1a1a]/80 dark:backdrop-blur-xl rounded-2xl border border-gray-200 dark:border-[#2a2a2a] dark:shadow-2xl dark:shadow-black/40 p-6">
          <div className="flex items-center gap-2 mb-4">
            <Clock className="h-5 w-5 text-gray-500 dark:text-gray-400" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Ventas por Hora (Hoy)</h3>
          </div>
          <div className="grid grid-cols-6 md:grid-cols-12 gap-2">
            {Array.from({ length: 24 }, (_, hora) => {
              const data = ventasPorHora[hora] || { pedidos: 0, ventas: 0 };
              const maxVentas = Math.max(...Object.values(ventasPorHora).map(d => d.ventas), 1);
              const intensidad = data.ventas / maxVentas;
              
              return (
                <div key={hora} className="text-center">
                  <div 
                    className={`w-full h-12 rounded mb-1 flex items-center justify-center text-xs font-medium transition-all ${
                      intensidad > 0.7 ? 'bg-green-500 dark:bg-[#1db954] text-white' :
                      intensidad > 0.4 ? 'bg-green-300 dark:bg-[#1db954]/60 text-green-800 dark:text-white' :
                      intensidad > 0.1 ? 'bg-green-100 dark:bg-[#1db954]/20 text-green-600 dark:text-[#1db954]' :
                      'bg-gray-100 dark:bg-[#1a1a1a]/40 text-gray-400 dark:text-gray-500'
                    }`}
                    title={`${hora}:00 - ${data.pedidos} pedidos - ${formatCurrency(data.ventas)}`}
                  >
                    {data.pedidos}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">{hora}h</div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}