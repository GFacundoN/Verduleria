import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastProvider } from './components/ui/toast';
import { DarkModeProvider } from './hooks/useDarkMode.jsx';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Productos from './pages/Productos';
import Clientes from './pages/Clientes';
import Pedidos from './pages/Pedidos';
import NuevoPedido from './pages/NuevoPedido';
import Remitos from './pages/Remitos';
import ConfirmarEntrega from './pages/ConfirmarEntrega';
import Estadisticas from './pages/Estadistica';

function App() {
  return (
    <DarkModeProvider>
      <ToastProvider>
        <Router>
          <Routes>
            {/* Ruta sin Layout para confirmación (móvil) */}
            <Route path="/confirmar/:pedidoId" element={<ConfirmarEntrega />} />
            
            {/* Rutas con Layout (aplicación principal) */}
            <Route path="/*" element={
              <Layout>
                <Routes>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/productos" element={<Productos />} />
                  <Route path="/clientes" element={<Clientes />} />
                  <Route path="/pedidos" element={<Pedidos />} />
                  <Route path="/pedidos/nuevo" element={<NuevoPedido />} />
                  <Route path="/remitos" element={<Remitos />} />
                  <Route path="/estadisticas" element={<Estadisticas />} />
                </Routes>
              </Layout>
            } />
          </Routes>
        </Router>
      </ToastProvider>
    </DarkModeProvider>
  );
}

export default App;