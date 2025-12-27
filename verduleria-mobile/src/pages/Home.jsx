import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { QrCode, Package, Truck } from 'lucide-react';

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex flex-col p-6">
      {/* Header - parte superior */}
      <div className="text-center pt-8 pb-6">
        <div className="flex justify-center mb-4">
          <div className="p-2 bg-green-100 rounded-full">
            <Package className="h-10 w-10 text-green-700" />
          </div>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Verdulería</h1>
        <p className="text-sm text-gray-600">Sistema de Gestión de Entregas</p>
      </div>

      {/* Contenido central */}
      <div className="flex-1 flex flex-col justify-center">
        <div className="w-full max-w-md mx-auto">
          {/* Título de sección */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Truck className="h-5 w-5 text-gray-700" />
              <h2 className="text-lg font-semibold text-gray-900">Confirmar Entregas</h2>
            </div>
            <p className="text-sm text-gray-600 mt-3 px-4">
              Escanea el código QR del remito para confirmar la entrega del pedido
            </p>
          </div>

          {/* Botón principal */}
          <Button 
            onClick={() => navigate('/scanner')}
            className="w-full h-14 font-semibold bg-green-600 hover:bg-green-700 text-white shadow-lg text-base"
          >
            <QrCode className="mr-2 h-6 w-6" />
            Escanear Código QR
          </Button>
        </div>
      </div>

      {/* Footer - parte inferior */}
      <div className="text-center pb-6 pt-4">
        <p className="text-xs text-gray-500">Sistema de Entregas v1.0</p>
      </div>
    </div>
  );
}
