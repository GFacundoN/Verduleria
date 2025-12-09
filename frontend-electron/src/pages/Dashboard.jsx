import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { Package, Users, ShoppingCart, DollarSign, TrendingUp, Plus, RefreshCw } from 'lucide-react';
import { pedidosService, productosService, clientesService, remitosService } from '@/services/api.service';
import { formatCurrency, getLocalDate, toLocalDateString } from '@/lib/utils';

export default function Dashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalProductos: 0,
    totalClientes: 0,
    pedidosHoy: 0,
    ventasHoy: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      console.log(' Cargando datos del backend...');
      const [productosRes, clientesRes, pedidosRes, remitosRes] = await Promise.all([
        productosService.getAll(),
        clientesService.getAll(),
        pedidosService.getAll(),
        remitosService.getAll()
      ]);
      console.log(' Datos cargados:', { productosRes, clientesRes, pedidosRes, remitosRes });

      // Calcular fecha de hoy en hora local
      const today = getLocalDate(); // YYYY-MM-DD format en hora local
      
      console.log(' Fecha de hoy (hora local):', today);
      console.log(' Total pedidos disponibles:', pedidosRes.data.length);
      
      // Debug detallado de fechas
      pedidosRes.data.forEach(p => {
        const fechaPedido = toLocalDateString(p.fechaCreacion);
        console.log(`Pedido #${p.id}: ${p.fechaCreacion} -> ${fechaPedido} (¿Es hoy? ${fechaPedido === today}) - Monto: $${p.montoTotal}`);
      });
      
      const pedidosHoy = pedidosRes.data.filter(p => {
        const fechaPedido = toLocalDateString(p.fechaCreacion);
        return fechaPedido === today;
      });
      
      console.log('Pedidos de hoy encontrados:', pedidosHoy);
      
      // Calcular ventas basándose en pedidos, no en remitos
      const ventasHoy = pedidosHoy.reduce((sum, p) => sum + parseFloat(p.montoTotal || 0), 0);
      
      console.log('Ventas calculadas para hoy:', ventasHoy);

      setStats({
        totalProductos: productosRes.data.length,
        totalClientes: clientesRes.data.length,
        pedidosHoy: pedidosHoy.length,
        ventasHoy: ventasHoy
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: 'Productos',
      value: stats.totalProductos,
      icon: Package,
      description: 'Total de productos',
      color: 'text-blue-600'
    },
    {
      title: 'Clientes',
      value: stats.totalClientes,
      icon: Users,
      description: 'Total de clientes',
      color: 'text-green-600'
    },
    {
      title: 'Pedidos Hoy',
      value: stats.pedidosHoy,
      icon: ShoppingCart,
      description: 'Pedidos registrados hoy',
      color: 'text-orange-600'
    },
    {
      title: 'Ventas Hoy',
      value: formatCurrency(stats.ventasHoy),
      icon: DollarSign,
      description: 'Total vendido hoy',
      color: 'text-emerald-600'
    }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500 dark:text-gray-400">Cargando...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6 lg:space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
          <p className="text-gray-500 dark:text-[#80868e] mt-1 text-sm sm:text-base">Bienvenido al sistema de gestión de pedidos</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
          <Button 
            onClick={() => {
              console.log(' Refresh manual solicitado');
              loadStats();
            }} 
            variant="outline"
            size="default"
            className="w-full sm:w-auto"
          >
            <RefreshCw className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
            <span className="hidden sm:inline">Actualizar</span>
            <span className="sm:hidden">Actualizar</span>
          </Button>
          <Button 
            onClick={() => navigate('/pedidos/nuevo')} 
            size="default"
            className="w-full sm:w-auto"
          >
            <Plus className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
            Nuevo Pedido
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        {statCards.map((stat) => (
          <Card key={stat.title} className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium truncate">
                {stat.title}
              </CardTitle>
              <stat.icon className={`h-4 w-4 sm:h-5 sm:w-5 ${stat.color} flex-shrink-0`} />
            </CardHeader>
            <CardContent>
              <div className="text-xl sm:text-2xl font-bold truncate">{stat.value}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {stat.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg sm:text-xl">Acciones Rápidas</CardTitle>
          <CardDescription className="text-sm">Accede rápidamente a las funciones principales</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            <Button 
              variant="outline" 
              className="h-16 sm:h-20 flex flex-col gap-1 sm:gap-2 hover:bg-gray-50 dark:hover:bg-[#1db954]/10 transition-colors"
              onClick={() => navigate('/pedidos/nuevo')}
            >
              <Plus className="h-5 w-5 sm:h-6 sm:w-6" />
              <span className="text-sm sm:text-base">Crear Pedido</span>
            </Button>
            <Button 
              variant="outline" 
              className="h-16 sm:h-20 flex flex-col gap-1 sm:gap-2 hover:bg-gray-50 dark:hover:bg-[#1db954]/10 transition-colors"
              onClick={() => navigate('/productos')}
            >
              <Package className="h-5 w-5 sm:h-6 sm:w-6" />
              <span className="text-sm sm:text-base">Ver Productos</span>
            </Button>
            <Button 
              variant="outline" 
              className="h-16 sm:h-20 flex flex-col gap-1 sm:gap-2 hover:bg-gray-50 dark:hover:bg-[#1db954]/10 transition-colors sm:col-span-2 lg:col-span-1"
              onClick={() => navigate('/remitos')}
            >
              <TrendingUp className="h-5 w-5 sm:h-6 sm:w-6" />
              <span className="text-sm sm:text-base">Ver Remitos</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}