import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import IncidentManagementPage from './pages/incident/IncidentManagementPage';
import ServiceManagementPage from './pages/ServiceManagementPage';
import TemplateManagementPage from "./pages/TemplateManagementPage";
import TokenManagementPage from './pages/TokenManagementPage';
import FormManagementPage from './pages/FormManagementPage';
import { LoginPage } from './pages/LoginPage';
import { authService } from './services/authService';
import PipelineManagementPage from './pages/PipelineManagementPage';
import './index.css';

function App() {
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  
  // Estado para mostrar el tiempo restante en pantalla
  const [timeLeftFormatted, setTimeLeftFormatted] = useState<string>('');

  // Estados locales para la vista de cambio de contraseña
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  // Validación periódica del tiempo de expiración y cálculo del timer
  useEffect(() => {
    const checkSession = () => {
      const expirationTime = localStorage.getItem('token_expiration');
      if (!expirationTime) return;

      const currentTime = new Date().getTime();
      const timeLeft = parseInt(expirationTime) - currentTime;

      if (timeLeft <= 0) {
        localStorage.removeItem('token');
        localStorage.removeItem('token_expiration');
        sessionStorage.clear();
        setToken(null);
        setTimeLeftFormatted('');
      } else {
        const hours = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);

        const formatted = `${hours > 0 ? hours + 'h ' : ''}${minutes.toString().padStart(2, '0')}m ${seconds.toString().padStart(2, '0')}s`;
        setTimeLeftFormatted(formatted);
      }
    };

    checkSession();
    const interval = setInterval(checkSession, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleLoginSuccess = (jwtToken: string) => {
    setToken(jwtToken);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('token_expiration');
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
      // Solución: Extraer la propiedad 'message' de la respuesta del backend de forma segura
      const errorData = err?.response?.data;
      const errorMsg = typeof errorData === 'object' && errorData !== null ? errorData.message : errorData;
      setError(errorMsg || 'Error al actualizar la contraseña');
    }
  };

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
            {timeLeftFormatted && (
              <span style={{ fontSize: '12px', background: 'rgba(255,255,255,0.15)', padding: '4px 8px', borderRadius: '4px', color: '#fef08a' }} title="Tiempo restante de sesión">
                ⏱️ {timeLeftFormatted}
              </span>
            )}
            <Link to="/incidents">Gestión de Incidentes</Link>
            <Link to="/services">Gestión de Servicios</Link>
            <Link to="/templates">Gestión de Templates</Link>
            <Link to="/tokens" style={{ color: '#fde047' }}>Gestión de Tokens</Link>
            <Link to="/forms" style={{ color: '#67e8f9' }}>Gestión de Formularios</Link>
            <Link to="/pipelines" style={{ color: '#86efac' }}>Gestión de Pipelines</Link>
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
            <Route path="/tokens" element={<TokenManagementPage />} />
            <Route path="/pipelines" element={<PipelineManagementPage />} />
            <Route path="/forms" element={<FormManagementPage />} />
            
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