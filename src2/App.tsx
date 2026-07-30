import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import IncidentManagementPage from './pages/incident/IncidentManagementPage';
import ServiceManagementPage from './pages/ServiceManagementPage';
import TemplateManagementPage from './pages/template/TemplateManagementPage';
import './index.css';

function App() {
  return (
    <Router>
      <div className="app-container">
        
        {/* NAVBAR GLOBAL */}
        <nav className="navbar-global">
          <div className="navbar-brand">
            <span>🚨</span>
            <span>Portal de Incidentes & Monitoreo</span>
          </div>
          <div className="navbar-links">
            <Link to="/incidents">Gestión de Incidentes</Link>
            <Link to="/services">Gestión de Servicios</Link>
            <Link to="/templates">Gestión de Templates</Link>
          </div>
        </nav>

        {/* CONTENEDOR PRINCIPAL */}
        <main className="main-content">
          <Routes>
            <Route path="/" element={<IncidentManagementPage />} />
            <Route path="/incidents" element={<IncidentManagementPage />} />
            <Route path="/services" element={<ServiceManagementPage />} />
            <Route path="/templates" element={<TemplateManagementPage />} />
          </Routes>
        </main>

      </div>
    </Router>
  );
}

export default App;