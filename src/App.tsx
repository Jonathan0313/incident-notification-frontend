import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import IncidentManagementPage from './pages/incident/IncidentManagementPage';
import ServiceManagementPage from './pages/ServiceManagementPage';
import TemplateManagementPage from "./pages/TemplateManagementPage";
import { LoginPage } from './pages/LoginPage';
import { authService } from './services/authService';
import './index.css';

function App() {
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  
  // Estados locales para la vista de cambio de contraseña
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleLoginSuccess = (jwtToken: string) => {
    localStorage.setItem('token', jwtToken);
    setToken(jwtToken);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setToken(null);
  };

  const handleChangePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
    setError('');
    try {
      const res = await authService.changePassword({ currentPassword, newPassword });
      setMessage(typeof res === 'string' ? res : 'Contraseña actualizada exitosamente');
      setCurrentPassword('');
      setNewPassword('');
    } catch (err: any) {
      setError(err?.response?.data || 'Error al actualizar la contraseña');
    }
  };

  // Si no hay token, muestra obligatoriamente el componente de Login
  if (!token) {
    return <LoginPage onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <Router>
      <div className="app-container">
        
        {/* NAVBAR GLOBAL */}
        <nav className="navbar-global">
          <div className="navbar-brand">
            <span>🚨</span>
            <span>Portal de Incidentes & Monitoreo</span>
          </div>
          <div className="navbar-links" style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <Link to="/incidents">Gestión de Incidentes</Link>
            <Link to="/services">Gestión de Servicios</Link>
            <Link to="/templates">Gestión de Templates</Link>
            <Link to="/security" style={{ color: '#93c5fd' }}>Mi Contraseña</Link>
            <button 
              onClick={handleLogout}
              style={{ padding: '4px 10px', backgroundColor: '#ef4444', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '13px' }}
            >
              Cerrar Sesión
            </button>
          </div>
        </nav>

        {/* CONTENEDOR PRINCIPAL */}
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Navigate to="/incidents" replace />} />
            <Route path="/incidents" element={<IncidentManagementPage />} />
            <Route path="/services" element={<ServiceManagementPage />} />
            <Route path="/templates" element={<TemplateManagementPage />} />
            
            {/* Ruta específica dentro de la app para gestionar la contraseña propia */}
            <Route path="/security" element={
              <div style={{ padding: '40px', maxWidth: '400px', margin: '0 auto', background: 'white', borderRadius: '8px', border: '1px solid #d1d5db' }}>
                <h3>Cambiar Contraseña</h3>
                {message && <div style={{ marginBottom: '12px', padding: '8px', backgroundColor: '#d1fae5', color: '#065f46', borderRadius: '4px', fontSize: '13px' }}>{message}</div>}
                {error && <div style={{ marginBottom: '12px', padding: '8px', backgroundColor: '#fee2e2', color: '#b91c1c', borderRadius: '4px', fontSize: '13px' }}>{error}</div>}
                <form onSubmit={handleChangePasswordSubmit}>
                  <div style={{ marginBottom: '12px' }}>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', marginBottom: '4px' }}>Contraseña Actual</label>
                    <input 
                      type="password" 
                      required
                      value={currentPassword} 
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      style={{ width: '100%', padding: '6px', boxSizing: 'border-box' }}
                    />
                  </div>
                  <div style={{ marginBottom: '16px' }}>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', marginBottom: '4px' }}>Nueva Contraseña</label>
                    <input 
                      type="password" 
                      required
                      value={newPassword} 
                      onChange={(e) => setNewPassword(e.target.value)}
                      style={{ width: '100%', padding: '6px', boxSizing: 'border-box' }}
                    />
                  </div>
                  <button type="submit" style={{ width: '100%', padding: '8px', backgroundColor: '#2563eb', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
                    Actualizar Contraseña
                  </button>
                </form>
              </div>
            } />
          </Routes>
        </main>

      </div>
    </Router>
  );
}

export default App;