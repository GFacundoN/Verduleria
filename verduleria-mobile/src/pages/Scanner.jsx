import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BarcodeScanner } from '@capacitor-community/barcode-scanner';
import { Button } from '../components/ui/button';
import { X, AlertCircle, ArrowLeft } from 'lucide-react';

export default function Scanner() {
  const navigate = useNavigate();
  const [error, setError] = useState(null);
  const [permissionDenied, setPermissionDenied] = useState(false);
  const [permanentlyDenied, setPermanentlyDenied] = useState(false);

  useEffect(() => {
    startScan();
    
    // Cleanup al desmontar
    return () => {
      BarcodeScanner.stopScan();
      document.body.style.background = '';
      document.querySelector('html').style.background = '';
    };
  }, []);

  const startScan = async () => {
    try {
      // Primero verificar permisos sin forzar
      let status = await BarcodeScanner.checkPermission({ force: false });
      
      console.log('Estado de permisos inicial:', status);
      
      // Si no están concedidos, solicitar permisos
      if (!status.granted) {
        // Intentar pedir permisos forzando el diálogo
        status = await BarcodeScanner.checkPermission({ force: true });
        console.log('Estado después de solicitar:', status);
      }
      
      // Si aún no están concedidos
      if (!status.granted) {
        setError('Se requieren permisos de cámara para escanear el QR');
        setPermissionDenied(true);
        
        // Solo marcar como permanentemente denegado si Android explícitamente lo indica
        // status.denied = true significa que el usuario marcó "No volver a preguntar"
        if (status.denied === true) {
          console.log('Permisos denegados permanentemente');
          setPermanentlyDenied(true);
        } else {
          console.log('Primera denegación, se puede reintentar');
          setPermanentlyDenied(false);
        }
        return;
      }
      
      setPermissionDenied(false);
      setPermanentlyDenied(false);
      console.log('Permisos concedidos, iniciando scanner');

      // Hacer transparente el fondo para ver la cámara (sin ocultar la UI)
      document.body.style.background = 'transparent';
      document.querySelector('html').style.background = 'transparent';
      
      // Iniciar escaneo
      const result = await BarcodeScanner.startScan();
      
      // Restaurar background
      document.body.style.background = '';
      document.querySelector('html').style.background = '';
      
      if (result.hasContent) {
        // Extraer el ID del pedido de la URL
        // Formato esperado: http://origen/#/confirmar/3
        const url = result.content;
        console.log('QR escaneado:', url);
        const match = url.match(/confirmar\/(\d+)/);
        
        if (match && match[1]) {
          const pedidoId = match[1];
          console.log('ID extraído:', pedidoId);
          navigate(`/confirmar/${pedidoId}`);
        } else {
          console.error('No se pudo extraer ID del QR:', url);
          setError('QR inválido. Escanea un código de remito válido.');
        }
      }
    } catch (err) {
      console.error('Error al escanear:', err);
      document.body.style.background = '';
      document.querySelector('html').style.background = '';
      setError('Error al iniciar el escáner: ' + err.message);
    }
  };

  const handleCancel = async () => {
    await BarcodeScanner.stopScan();
    document.body.style.background = '';
    document.querySelector('html').style.background = '';
    navigate('/');
  };

  const handleRetry = async () => {
    if (permanentlyDenied) {
      // Si los permisos fueron denegados permanentemente, abrir configuración
      console.log('Abriendo configuración de la app...');
      await BarcodeScanner.openAppSettings();
    } else {
      // Si fue primer rechazo o error temporal, reintentar
      setError(null);
      setPermissionDenied(false);
      setPermanentlyDenied(false);
      startScan();
    }
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg p-4 max-w-md w-full text-center space-y-3 shadow-xl">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto" />
          <h2 className="text-xl font-bold text-gray-900">Error</h2>
          <p className="text-sm text-gray-600">{error}</p>
          {permissionDenied && (
            <p className="text-xs text-gray-500 bg-gray-50 p-2 rounded-lg">
              {permanentlyDenied 
                ? 'Los permisos fueron denegados. Presiona "Abrir Configuración" para habilitarlos manualmente en la configuración de Android.'
                : 'Presiona "Reintentar" para volver a solicitar los permisos de cámara.'}
            </p>
          )}
          <div className="flex gap-2 pt-2">
            <Button onClick={handleCancel} variant="outline" className="flex-1 h-10 text-sm">
              Volver
            </Button>
            <Button onClick={handleRetry} className="flex-1 h-10 text-sm bg-green-600 hover:bg-green-700 text-white font-semibold">
              {permanentlyDenied ? 'Abrir Configuración' : 'Reintentar'}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-transparent flex flex-col">
      {/* Botón volver - parte superior con espacio para status bar */}
      <div className="w-full px-4" style={{marginTop: '48px'}}>
        <Button 
          onClick={handleCancel}
          className="bg-white/90 text-gray-900 hover:bg-white font-semibold text-sm h-10 px-3 flex items-center"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Volver
        </Button>
      </div>

      {/* Contenedor flex para centrar verticalmente */}
      <div className="flex-1 flex flex-col justify-center items-center px-6">
        {/* Título */}
        <div className="text-center mb-12">
          <p className="text-white text-lg font-semibold">Apunta la cámara al código QR</p>
        </div>

        {/* Recuadro QR */}
        <div className="relative">
          <div className="w-64 h-64 border-4 border-green-500 rounded-2xl relative bg-transparent shadow-[0_0_0_9999px_rgba(0,0,0,0.6)]">
            {/* Esquinas */}
            <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-white rounded-tl-lg"></div>
            <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-white rounded-tr-lg"></div>
            <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-white rounded-bl-lg"></div>
            <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-white rounded-br-lg"></div>
            
            {/* Línea de escaneo */}
            <div className="absolute inset-0 overflow-hidden rounded-2xl">
              <div className="absolute w-full h-1 bg-gradient-to-r from-transparent via-green-400 to-transparent animate-scan"></div>
            </div>
          </div>
        </div>

        {/* Instrucciones debajo del recuadro */}
        <div className="text-center mt-12">
          <p className="text-white text-sm mb-3">El escaneo se realizará automáticamente</p>
          <div className="bg-black/40 backdrop-blur-sm rounded-lg p-3 max-w-xs mx-auto">
            <p className="text-white text-xs">Centra el código QR dentro del recuadro</p>
          </div>
        </div>
      </div>

      {/* Gradientes para mejorar legibilidad */}
      <div className="absolute top-0 left-0 right-0 pointer-events-none" style={{height: '200px', background: 'linear-gradient(to bottom, rgba(0,0,0,0.6) 0%, transparent 100%)', zIndex: -1}}></div>
      <div className="absolute bottom-0 left-0 right-0 pointer-events-none" style={{height: '200px', background: 'linear-gradient(to top, rgba(0,0,0,0.6) 0%, transparent 100%)', zIndex: -1}}></div>

      {/* Estilos para la animación */}
      <style>{`
        @keyframes scan {
          0% {
            transform: translateY(-100%);
          }
          100% {
            transform: translateY(256px);
          }
        }
        .animate-scan {
          animation: scan 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
