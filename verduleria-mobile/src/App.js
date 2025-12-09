import React from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Scanner from './pages/Scanner';
import ConfirmarEntrega from './pages/ConfirmarEntrega';
import './App.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/scanner" element={<Scanner />} />
        <Route path="/confirmar/:pedidoId" element={<ConfirmarEntrega />} />
      </Routes>
    </Router>
  );
}

export default App;
