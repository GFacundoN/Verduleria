import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { Package, Users, ShoppingCart, DollarSign, TrendingUp, Plus } from 'lucide-react';
import { pedidosService, productosService, clientesService, remitosService } from '@/services/api.service';
import { formatCurrency } from '@/lib/utils';

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
      const [productos, clientes, pedidos, remitos] = await Promise.all([
        productosService.getAll(),
        clientesService.getAll(),
        pedidosService.getAll(),
        remitosService.getAll()
      ]);

      const today = new Date().toDateString();
      const pedidosHoy = pedidos.data.filter(p => 
        new Date(p.fechaCreacion).toDateString() === today
      );
      const remitosHoy = remitos.data.filter(r => 
        new Date(r.fechaEmision).toDateString() === today
      );
      const ventasHoy = remitosHoy.reduce((sum, r) => sum + parseFloat(r.valorTotal), 0);

      setStats({
        totalProductos: productos.data.length,
        totalClientes: clientes.data.length,
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
        <div className="text-gray-500">Cargando...</div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-500 mt-1">Bienvenido al sistema de gestión de pedidos</p>
        </div>
        <Button onClick={() => navigate('/pedidos/nuevo')} size="lg">
          <Plus className="h-5 w-5 mr-2" />
          Nuevo Pedido
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <stat.icon className={`h-5 w-5 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
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
          <CardTitle>Acciones Rápidas</CardTitle>
          <CardDescription>Accede rápidamente a las funciones principales</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button 
              variant="outline" 
              className="h-20 flex flex-col gap-2"
              onClick={() => navigate('/pedidos/nuevo')}
            >
              <Plus className="h-6 w-6" />
              <span>Crear Pedido</span>
            </Button>
            <Button 
              variant="outline" 
              className="h-20 flex flex-col gap-2"
              onClick={() => navigate('/productos')}
            >
              <Package className="h-6 w-6" />
              <span>Ver Productos</span>
            </Button>
            <Button 
              variant="outline" 
              className="h-20 flex flex-col gap-2"
              onClick={() => navigate('/remitos')}
            >
              <TrendingUp className="h-6 w-6" />
              <span>Ver Remitos</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}