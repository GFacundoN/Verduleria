import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { QrCode, Package, Truck } from 'lucide-react';

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="w-full max-w-lg p-6 space-y-6">
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="flex justify-center mb-4">
            <div className="p-4 bg-green-100 rounded-full">
              <Package className="h-16 w-16 text-green-700" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gray-900">Verdulería</h1>
          <p className="text-gray-600 text-lg">Sistema de Gestión de Entregas</p>
        </div>

        {/* Main Card */}
        <Card className="border-2 shadow-lg">
          <CardHeader className="bg-gray-50 border-b">
            <div className="flex items-center justify-center gap-2">
              <Truck className="h-5 w-5 text-gray-700" />
              <CardTitle className="text-center">Confirmar Entregas</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-6 pt-6">
            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <p className="text-center text-gray-700 leading-relaxed">
                Escanea el código QR del remito para confirmar la entrega del pedido
              </p>
            </div>
            <Button 
              onClick={() => navigate('/scanner')}
              className="w-full h-16 text-lg font-semibold bg-green-600 hover:bg-green-700 text-white shadow-md"
            >
              <QrCode className="mr-2 h-6 w-6" />
              Escanear Código QR
            </Button>
          </CardContent>
        </Card>

        {/* Info */}
        <div className="text-center text-sm text-gray-500 pt-4">
          <p>Sistema de Entregas v1.0</p>
        </div>
      </div>
    </div>
  );
}
