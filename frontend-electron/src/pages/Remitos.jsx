import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Search, QrCode, Printer, Eye, RefreshCw, ChevronLeft, ChevronRight } from 'lucide-react';
import { remitosService, pedidosService, clientesService, productosService } from '@/services/api.service';
import { formatCurrency, formatDate, getLocalDate, toLocalDateString, cn } from '@/lib/utils';
import QRCode from 'qrcode.react';
import TruncatedCell from '@/components/TruncatedCell';
import laJunglaLogo from '/la-jungla-logo.png';

export default function Remitos() {
  const [remitos, setRemitos] = useState([]);
  const [allRemitos, setAllRemitos] = useState([]);
  const [pedidos, setPedidos] = useState({});
  const [clientes, setClientes] = useState({});
  const [productos, setProductos] = useState({});
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('todos');
  const [selectedRemito, setSelectedRemito] = useState(null);
  const [showQR, setShowQR] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [remitosRes, pedidosRes, clientesRes, productosRes] = await Promise.all([
        remitosService.getAll(),
        pedidosService.getAll(),
        clientesService.getAll(),
        productosService.getAll()
      ]);
      
      setAllRemitos(remitosRes.data);
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

      const productosMap = {};
      productosRes.data.forEach(p => {
        productosMap[p.id] = p;
      });
      setProductos(productosMap);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Filtrar remitos en tiempo real
  useEffect(() => {
    console.log(' [REMITOS] Filtrado - Búsqueda:', search, 'Tab:', activeTab);
    console.log(' [REMITOS] Total remitos disponibles:', allRemitos.length);
    
    let filtered = allRemitos;
    
    // Filtrar por tab (estado del pedido)
    if (activeTab === 'pendientes') {
      filtered = filtered.filter(remito => {
        const pedido = pedidos[remito.pedidoId];
        return pedido && pedido.estado !== 'ENTREGADO';
      });
    } else if (activeTab === 'entregados') {
      filtered = filtered.filter(remito => {
        const pedido = pedidos[remito.pedidoId];
        return pedido && pedido.estado === 'ENTREGADO';
      });
    }
    
    // Filtrar por búsqueda
    if (search.trim()) {
      console.log(' [REMITOS] Aplicando filtro de búsqueda para:', search);
      
      filtered = filtered.filter(remito => {
        const pedido = pedidos[remito.pedidoId];
        const cliente = pedido ? clientes[pedido.clienteId] : null;
        
        const matchNumeroRemito = remito.numeroRemito?.toString().includes(search.toLowerCase());
        const matchPedidoId = remito.pedidoId?.toString().includes(search.toLowerCase());
        const matchCliente = cliente?.razonSocial?.toLowerCase().includes(search.toLowerCase());
        const matchValor = remito.valorTotal?.toString().includes(search);
        const matchFecha = new Date(remito.fechaEmision).toLocaleDateString('es-AR').includes(search);
        
        return matchNumeroRemito || matchPedidoId || matchCliente || matchValor || matchFecha;
      });
    }
    
    console.log(' [REMITOS] Resultados filtrados:', filtered.length);
    setRemitos(filtered);
    setCurrentPage(1); // Reset a página 1 cuando cambian los filtros
  }, [search, activeTab, allRemitos, pedidos, clientes]);

  // Paginación
  const totalPages = Math.ceil(remitos.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedRemitos = remitos.slice(startIndex, startIndex + itemsPerPage);

  const handleVerQR = (remito) => {
    setSelectedRemito(remito);
    setShowQR(true);
  };

  const handleImprimir = () => {
    window.print();
  };

  const getQRUrl = (pedidoId) => {
    // URL que la app móvil usará para confirmar entrega
    // Usar hash (#) porque la app usa HashRouter
    return `${window.location.origin}/#/confirmar/${pedidoId}`;
  };

  const calcularTotalDia = () => {
    // Usar hora local de Argentina
    const today = getLocalDate(); // YYYY-MM-DD format en hora local
    
    console.log(' [REMITOS] Fecha de hoy (hora local):', today);
    console.log(' [REMITOS] Total remitos disponibles:', allRemitos.length);
    
    // Debug detallado de fechas de remitos
    allRemitos.forEach(r => {
      const fechaRemito = toLocalDateString(r.fechaEmision);
      console.log(`[REMITOS] Remito #${r.numeroRemito}: ${r.fechaEmision} -> ${fechaRemito} (¿Es hoy? ${fechaRemito === today}) - Valor: $${r.valorTotal}`);
    });
    
    const remitosHoy = allRemitos.filter(r => {
      const fechaRemito = toLocalDateString(r.fechaEmision);
      const esHoy = fechaRemito === today;
      if (esHoy) {
        console.log(` [REMITOS] Remito #${r.numeroRemito} ES de hoy: $${r.valorTotal}`);
      }
      return esHoy;
    });
    
    console.log(' [REMITOS] Remitos de hoy encontrados:', remitosHoy.length);
    
    const total = remitosHoy.reduce((sum, r) => sum + parseFloat(r.valorTotal), 0);
    console.log(' [REMITOS] Ventas calculadas para hoy:', total);
    
    return total;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Remitos</h1>
          <p className="text-gray-500 dark:text-[#80868e] mt-1">Gestión de remitos y ventas</p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            onClick={() => {
              setLoading(true);
              loadData();
            }}
            variant="outline"
            size="icon"
            title="Recargar datos"
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
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
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 mb-6">
        <button
          onClick={() => setActiveTab('todos')}
          className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
            activeTab === 'todos'
              ? 'bg-green-600 text-white hover:bg-green-700'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600'
          }`}
        >
          Todos ({allRemitos.length})
        </button>
        <button
          onClick={() => setActiveTab('pendientes')}
          className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
            activeTab === 'pendientes'
              ? 'bg-green-600 text-white hover:bg-green-700'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600'
          }`}
        >
          Pendientes ({allRemitos.filter(r => {
            const p = pedidos[r.pedidoId];
            return p && p.estado !== 'ENTREGADO';
          }).length})
        </button>
        <button
          onClick={() => setActiveTab('entregados')}
          className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
            activeTab === 'entregados'
              ? 'bg-green-600 text-white hover:bg-green-700'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600'
          }`}
        >
          Entregados ({allRemitos.filter(r => {
            const p = pedidos[r.pedidoId];
            return p && p.estado === 'ENTREGADO';
          }).length})
        </button>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-3">
            <Input
              placeholder="Buscar por número de remito, pedido, cliente, valor o fecha..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1"
            />
            <div className="flex items-center justify-between sm:justify-center text-sm text-gray-500 px-3 py-2 bg-gray-50 rounded-md">
              <Search className="h-4 w-4 mr-2" />
              <span>{search ? `${remitos.length} resultado(s)` : `${allRemitos.length} remito(s)`}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardContent className="pt-6">
          {loading ? (
            <div className="text-center py-8 dark:text-gray-400">Cargando...</div>
          ) : remitos.length === 0 ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              No hay remitos generados
            </div>
          ) : (
            <>
              <div className="overflow-hidden rounded-xl">
                <table className="w-full border-collapse">
                  <thead className="bg-gray-50 dark:bg-[#1a1a1a]/60 border-b-2 dark:border-[#2a2a2a]">
                    <tr>
                      <th className="text-left py-4 px-6 text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-[#9ca3af] border-r dark:border-[#2a2a2a]">Nº Remito</th>
                      <th className="text-left py-4 px-6 text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-[#9ca3af] border-r dark:border-[#2a2a2a]">Pedido</th>
                      <th className="text-left py-4 px-6 text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-[#9ca3af] border-r dark:border-[#2a2a2a]">Cliente</th>
                      <th className="text-left py-4 px-6 text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-[#9ca3af] border-r dark:border-[#2a2a2a]">Fecha Emisión</th>
                      <th className="text-left py-4 px-6 text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-[#9ca3af] border-r dark:border-[#2a2a2a]">Valor Total</th>
                      <th className="text-left py-4 px-6 text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-[#9ca3af] border-r dark:border-[#2a2a2a]">Estado</th>
                      <th className="text-right py-4 px-6 text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-[#9ca3af]">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedRemitos.map((remito, index) => {
                      const pedido = pedidos[remito.pedidoId];
                      const cliente = pedido ? clientes[pedido.clienteId] : null;
                      
                      return (
                        <tr 
                          key={remito.id} 
                          className={`border-b dark:border-[#2a2a2a] transition-colors duration-150 hover:bg-gray-50 dark:hover:bg-[#1db954]/5 ${
                            index % 2 === 0 ? "" : "bg-gray-50/50 dark:bg-[#1a1a1a]/30"
                          }`}
                        >
                          <td className="py-4 px-6 border-r dark:border-[#2a2a2a] font-semibold dark:text-white">#{remito.numeroRemito}</td>
                          <td className="py-4 px-6 border-r dark:border-[#2a2a2a] dark:text-gray-300">#{remito.pedidoId}</td>
                          <td className="py-4 px-6 border-r dark:border-[#2a2a2a] dark:text-gray-300">
                            <TruncatedCell 
                              content={cliente?.razonSocial || 'N/A'}
                              maxLength={25}
                              className="dark:text-gray-300"
                            />
                          </td>
                          <td className="py-4 px-6 border-r dark:border-[#2a2a2a] dark:text-gray-300">
                            {new Date(remito.fechaEmision).toLocaleDateString('es-AR')}
                          </td>
                          <td className="py-4 px-6 border-r dark:border-[#2a2a2a] font-bold text-[#1db954]">{formatCurrency(remito.valorTotal)}</td>
                          <td className="py-4 px-6 border-r dark:border-[#2a2a2a]">
                            {pedido?.estado === 'ENTREGADO' ? (
                              <span className="px-2 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                                Entregado
                              </span>
                            ) : (
                              <span className="px-2 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400">
                                Pendiente
                              </span>
                            )}
                          </td>
                          <td className="py-4 px-6 text-right">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleVerQR(remito)}
                              className="rounded-xl hover:bg-[#1db954]/10 hover:text-[#1db954] transition-all"
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

              {/* Paginación */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center py-4 border-t border-gray-200 dark:border-[#2a2a2a] mt-4">
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
            </>
          )}
        </CardContent>
      </Card>

      {/* QR Dialog con vista de impresión completa */}
      <Dialog open={showQR} onClose={() => setShowQR(false)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto dark:bg-[#1a1a1a] dark:border-[#2a2a2a]">
          <DialogHeader>
            <DialogTitle className="dark:text-white">Remito #{selectedRemito?.numeroRemito}</DialogTitle>
          </DialogHeader>
          {selectedRemito && (() => {
            const pedido = pedidos[selectedRemito.pedidoId];
            const cliente = pedido ? clientes[pedido.clienteId] : null;
            
            return (
              <div className="space-y-4 pb-4">
                {/* Vista de impresión */}
                <div id="remito-print" className="bg-white text-black" style={{ fontSize: '11px', lineHeight: '1.3', padding: '0' }}>
                  {/* Header: Logo izquierda + QR derecha */}
                  <div className="flex justify-between items-start mb-1">
                    {/* Logo */}
                    <div className="flex-shrink-0">
                      <img 
                        src={laJunglaLogo} 
                        alt="La Jungla" 
                        className="h-16 w-auto"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'block';
                        }}
                      />
                      <div style={{ display: 'none', border: '2px solid #3b82f6', padding: '8px', fontSize: '14px', fontWeight: 'bold', color: '#3b82f6' }}>
                        LA JUNGLA
                      </div>
                    </div>
                    
                    {/* QR Code */}
                    <div className="flex-shrink-0">
                      <QRCode 
                        value={getQRUrl(selectedRemito.pedidoId)}
                        size={80}
                        level="H"
                        includeMargin={false}
                      />
                    </div>
                  </div>

                  {/* Fecha y Número de Remito */}
                  <div className="flex justify-between mb-1" style={{ fontSize: '12px' }}>
                    <div><strong>Fecha:</strong> {new Date(selectedRemito.fechaEmision).toLocaleDateString('es-AR')}</div>
                    <div><strong>REMITO NRO.:</strong> {selectedRemito.numeroRemito}</div>
                  </div>

                  {/* ID del Pedido */}
                  <div className="mb-2" style={{ fontSize: '12px' }}>
                    <strong>PEDIDO ID:</strong> #{selectedRemito.pedidoId}
                  </div>

                  {/* Datos del Cliente */}
                  <div className="mb-2" style={{ fontSize: '11px', border: '1px solid #000', padding: '8px', backgroundColor: '#f3f4f6' }}>
                    <div style={{ fontSize: '12px', fontWeight: 'bold', marginBottom: '4px' }}>DATOS DEL CLIENTE</div>
                    <div><strong>Cliente:</strong> {cliente?.razonSocial || 'N/A'}</div>
                    {cliente?.direccion && <div><strong>Dirección:</strong> {cliente.direccion}</div>}
                    {cliente?.telefono && <div><strong>Teléfono:</strong> {cliente.telefono}</div>}
                    {cliente?.email && <div><strong>Email:</strong> {cliente.email}</div>}
                  </div>

                  {/* Información de la Verdulería */}
                  <div className="mb-1" style={{ fontSize: '11px' }}>
                    <div><strong>VERDULERIA " LA JUNGLA "</strong></div>
                    <div style={{ fontStyle: 'italic' }}>Tucumán y De la Reducción</div>
                    <div style={{ color: '#dc2626', fontWeight: 'bold' }}>(00257) 490-669</div>
                  </div>

                  {/* Disclaimer */}
                  <div className="text-center mb-2" style={{ fontSize: '11px', fontWeight: 'bold' }}>
                    DOCUMENTO NO VALIDO COMO FACTURA
                  </div>

                  {/* Tabla de productos - Compacta */}
                  <table className="w-full mb-2" style={{ fontSize: '10px', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ backgroundColor: '#000', color: '#fff' }}>
                        <th className="border border-black px-2 py-1 text-center" style={{ width: '12%' }}>CANTIDAD</th>
                        <th className="border border-black px-2 py-1 text-left" style={{ width: '56%' }}>DESCRIPCION</th>
                        <th className="border border-black px-2 py-1 text-right" style={{ width: '16%' }}>PRECIO</th>
                        <th className="border border-black px-2 py-1 text-right" style={{ width: '16%' }}>TOTAL</th>
                      </tr>
                    </thead>
                  <tbody>
                    {pedido?.detalles && pedido.detalles.length > 0 ? (
                      pedido.detalles.map((detalle, idx) => {
                        // Verificar si es un producto personalizado
                        const esPersonalizado = detalle.nombrePersonalizado || detalle.productoId === null;
                        const producto = esPersonalizado ? null : productos[detalle.productoId];
                        
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
                          <tr key={idx}>
                            <td className="border border-black px-2 py-0.5 text-center">
                              {detalle.cantidad}
                            </td>
                            <td className="border border-black px-2 py-0.5">
                              {nombreProducto}
                            </td>
                            <td className="border border-black px-2 py-0.5 text-right">
                              {formatCurrency(precioUnitario)}
                            </td>
                            <td className="border border-black px-2 py-0.5 text-right">
                              {formatCurrency(subtotal)}
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan="4" className="border border-black px-2 py-2 text-center">
                          No hay productos en este pedido
                        </td>
                      </tr>
                    )}
                  </tbody>
                  </table>

                  {/* Totales */}
                  <div className="flex justify-end">
                    <table style={{ fontSize: '10px', width: '35%', borderCollapse: 'collapse' }}>
                      <tbody>
                        <tr>
                          <td className="border border-black px-2 py-1 text-right font-bold">SUBTOTAL</td>
                          <td className="border border-black px-2 py-1 text-right">{formatCurrency(selectedRemito.valorTotal)}</td>
                        </tr>
                        <tr>
                          <td className="border border-black px-2 py-1 text-right font-bold">TOTAL A PAGAR</td>
                          <td className="border border-black px-2 py-1 text-right font-bold">{formatCurrency(selectedRemito.valorTotal)}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  {/* Footer */}
                  <div className="mt-6 text-center" style={{ fontSize: '10px', fontWeight: 'bold' }}>
                    Verduleria "La Jungla"
                  </div>
                </div>

                {/* Botones de acción */}
                <div className="flex gap-2">
                  <Button onClick={handleImprimir} className="flex-1">
                    <Printer className="h-4 w-4 mr-2" />
                    Imprimir Remito
                  </Button>
                  <Button variant="outline" onClick={() => setShowQR(false)} className="flex-1">
                    Cerrar
                  </Button>
                </div>
              </div>
            );
          })()}
        </DialogContent>
      </Dialog>
    </div>
  );
}