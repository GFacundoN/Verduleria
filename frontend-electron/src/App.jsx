import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Productos from './pages/Productos';
import Clientes from './pages/Clientes';
import Pedidos from './pages/Pedidos';
import Remitos from './pages/Remitos';
import NuevoPedido from './pages/NuevoPedido';
import ConfirmarEntrega from './pages/ConfirmarEntrega';

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/productos" element={<Productos />} />
          <Route path="/clientes" element={<Clientes />} />
          <Route path="/pedidos" element={<Pedidos />} />
          <Route path="/pedidos/nuevo" element={<NuevoPedido />} />
          <Route path="/remitos" element={<Remitos />} />
          <Route path="/confirmar/:pedidoId" element={<ConfirmarEntrega />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;