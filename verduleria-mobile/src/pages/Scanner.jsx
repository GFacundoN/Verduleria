import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BarcodeScanner } from '@capacitor-community/barcode-scanner';
import { Button } from '../components/ui/button';
import { X, AlertCircle } from 'lucide-react';

export default function Scanner() {
  const navigate = useNavigate();
  const [error, setError] = useState(null);

  useEffect(() => {
    startScan();
    
    // Cleanup al desmontar
    return () => {
      BarcodeScanner.stopScan();
      document.body.style.opacity = '1';
    };
  }, []);

  const startScan = async () => {
    try {
      // Pedir permisos
      const status = await BarcodeScanner.checkPermission({ force: true });
      
      if (!status.granted) {
        setError('Se requieren permisos de cámara para escanear el QR');
        return;
      }

      // Hacer transparente el fondo para ver la cámara
      document.body.style.opacity = '0';
      
      // Iniciar escaneo
      const result = await BarcodeScanner.startScan();
      
      // Restaurar opacidad
      document.body.style.opacity = '1';
      
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
      document.body.style.opacity = '1';
      setError('Error al iniciar el escáner: ' + err.message);
    }
  };

  const handleCancel = async () => {
    await BarcodeScanner.stopScan();
    document.body.style.opacity = '1';
    navigate('/');
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg p-6 max-w-md w-full text-center space-y-4 shadow-xl">
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto" />
          <h2 className="text-2xl font-bold text-gray-900">Error</h2>
          <p className="text-gray-600">{error}</p>
          <div className="flex gap-3 pt-2">
            <Button onClick={handleCancel} variant="outline" className="flex-1 h-12">
              Volver
            </Button>
            <Button onClick={() => {
              setError(null);
              startScan();
            }} className="flex-1 h-12 bg-green-600 hover:bg-green-700 text-white font-semibold">
              Reintentar
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-transparent z-50">
      {/* Overlay con botón de cancelar */}
      <div className="absolute top-0 left-0 right-0 p-4 bg-gradient-to-b from-black/50 to-transparent z-10">
        <div className="max-w-md mx-auto">
          <Button 
            onClick={handleCancel}
            className="bg-white/90 text-gray-900 hover:bg-white"
          >
            <X className="h-5 w-5 mr-2" />
            Cancelar
          </Button>
        </div>
      </div>
      
      {/* Instrucciones */}
      <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/70 to-transparent z-10">
        <div className="max-w-md mx-auto text-center text-white">
          <p className="text-lg font-medium">Apunta la cámara al código QR</p>
          <p className="text-sm opacity-90 mt-2">El escaneo se realizará automáticamente</p>
        </div>
      </div>
    </div>
  );
}
