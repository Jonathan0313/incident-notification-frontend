import { useState, useEffect } from 'react';
import { axiosClient } from '../services/axiosClient';

export interface Service {
  id?: number;
  code: string;
  name: string;
  isBia: boolean;
  active: boolean;
}

export default function ServiceManagementPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [searchCode, setSearchCode] = useState<string>('');

  // Estado para las notificaciones flotantes (Toast)
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const [formData, setFormData] = useState<Service>({
    code: '',
    name: '',
    isBia: false,
    active: true
  });

  const showToast = (type: 'success' | 'error', message: string) => {
    setToast({ type, message });
    setTimeout(() => {
      setToast(null);
    }, 3500);
  };

  useEffect(() => {
    fetchAllServices();
  }, []);

  useEffect(() => {
    if (selectedService) {
      setFormData(selectedService);
    } else {
      resetForm();
    }
  }, [selectedService]);

  const resetForm = () => {
    setFormData({ code: '', name: '', isBia: false, active: true });
    setSelectedService(null);
  };

  const fetchAllServices = async () => {
    try {
      setLoading(true);
      const response = await axiosClient.get<Service[]>('/v1/api/services/all'); 
      setServices(response.data);
      setSearchCode('');
    } catch (error) {
      console.error('Error al cargar todos los servicios:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchByCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchCode.trim()) {
      fetchAllServices();
      return;
    }

    try {
      setLoading(true);
      const response = await axiosClient.get<Service>(`/v1/api/services/${searchCode.trim()}`);
      setServices(response.data ? [response.data] : []);
    } catch (error) {
      console.error('No se encontró el servicio:', error);
      setServices([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (selectedService) {
        await axiosClient.put(`/v1/api/services/${formData.code}`, formData);
        showToast('success', 'Servicio actualizado con éxito');
      } else {
        await axiosClient.post('/v1/api/services', formData);
        showToast('success', 'Servicio creado con éxito');
      }
      fetchAllServices();
      resetForm();
    } catch (error) {
      console.error('Error al guardar el servicio:', error);
      showToast('error', 'Ocurrió un error al guardar el servicio');
    }
  };

  return (
    <div style={{ display: 'flex', gap: '20px', padding: '20px', position: 'relative', minHeight: '80vh', boxSizing: 'border-box' }}>
      
      {/* SECCIÓN IZQUIERDA: Formulario */}
      <div style={{ flex: 1, background: '#fff', padding: '20px', borderRadius: '8px', border: '1px solid var(--border-color)', height: 'fit-content' }}>
        <h3 style={{ marginTop: 0 }}>
          {selectedService ? '✏️ Modificar Servicio' : '➕ Crear Nuevo Servicio'}
        </h3>
        
        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div>
            <label style={{ fontSize: '13px', fontWeight: 'bold' }}>Código:</label>
            <input 
              type="text" 
              value={formData.code} 
              onChange={(e) => setFormData({ ...formData, code: e.target.value })}
              placeholder="Ej. S4"
              required
              style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid var(--border-color)', marginTop: '4px', boxSizing: 'border-box' }}
            />
          </div>

          <div>
            <label style={{ fontSize: '13px', fontWeight: 'bold' }}>Nombre del Servicio:</label>
            <input 
              type="text" 
              value={formData.name} 
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Ej. Servicio de Pagos"
              required
              style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid var(--border-color)', marginTop: '4px', boxSizing: 'border-box' }}
            />
          </div>

          <div style={{ display: 'flex', gap: '20px', marginTop: '5px' }}>
            <label style={{ fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
              <input 
                type="checkbox" 
                checked={formData.isBia} 
                onChange={(e) => setFormData({ ...formData, isBia: e.target.checked })}
              />
              Es BIA
            </label>

            <label style={{ fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
              <input 
                type="checkbox" 
                checked={formData.active} 
                onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
              />
              Activo
            </label>
          </div>

          <div style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
            <button type="submit" style={{ backgroundColor: '#2563eb', color: 'white', border: 'none', padding: '8px 15px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
              {selectedService ? 'Actualizar' : 'Guardar'}
            </button>
            {selectedService && (
              <button type="button" onClick={resetForm} style={{ backgroundColor: '#e2e8f0', border: 'none', padding: '8px 15px', borderRadius: '4px', cursor: 'pointer' }}>
                Cancelar
              </button>
            )}
          </div>
        </form>
      </div>

      {/* SECCIÓN DERECHA: Tabla y Buscador */}
      <div style={{ flex: 2, background: '#fff', padding: '20px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
          <h3 style={{ margin: 0 }}>📋 Lista de Servicios</h3>
          
          <form onSubmit={handleSearchByCode} style={{ display: 'flex', gap: '6px' }}>
            <input 
              type="text" 
              value={searchCode}
              onChange={(e) => setSearchCode(e.target.value)}
              placeholder="Buscar por código (Ej. S4)"
              style={{ padding: '6px 10px', borderRadius: '4px', border: '1px solid var(--border-color)', fontSize: '13px' }}
            />
            <button type="submit" style={{ backgroundColor: '#3b82f6', color: 'white', border: 'none', padding: '6px 10px', borderRadius: '4px', cursor: 'pointer', fontSize: '13px', fontWeight: 'bold' }}>
              🔍
            </button>
            <button type="button" onClick={fetchAllServices} title="Ver todos" style={{ backgroundColor: '#e2e8f0', border: 'none', padding: '6px 10px', borderRadius: '4px', cursor: 'pointer', fontSize: '13px' }}>
              🔄
            </button>
          </form>
        </div>

        {loading ? (
          <p>Cargando servicios...</p>
        ) : services.length === 0 ? (
          <p style={{ color: '#64748b' }}>No se encontraron servicios.</p>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #e2e8f0', textAlign: 'left', background: '#f8fafc' }}>
                <th style={{ padding: '8px' }}>Código</th>
                <th style={{ padding: '8px' }}>Nombre</th>
                <th style={{ padding: '8px' }}>BIA</th>
                <th style={{ padding: '8px' }}>Estado</th>
                <th style={{ padding: '8px' }}>Acción</th>
              </tr>
            </thead>
            <tbody>
              {services.map((srv) => (
                <tr key={srv.id || srv.code} style={{ borderBottom: '1px solid #e2e8f0' }}>
                  <td style={{ padding: '8px', fontWeight: 500 }}>{srv.code}</td>
                  <td style={{ padding: '8px' }}>{srv.name}</td>
                  <td style={{ padding: '8px' }}>{srv.isBia ? '✅' : '❌'}</td>
                  <td style={{ padding: '8px' }}>
                    <span style={{ color: srv.active ? 'green' : 'red', fontWeight: 500 }}>
                      {srv.active ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td style={{ padding: '8px' }}>
                    <button 
                      onClick={() => setSelectedService(srv)}
                      style={{ backgroundColor: '#3b82f6', color: 'white', border: 'none', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}>
                      Editar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* 🟢 NOTIFICACIÓN FLOTANTE (TOAST) EN VEZ DE ALERT */}
      {toast && (
        <div style={{
          position: 'fixed',
          bottom: '25px',
          right: '25px',
          backgroundColor: toast.type === 'success' ? '#10b981' : '#ef4444',
          color: '#ffffff',
          padding: '12px 20px',
          borderRadius: '8px',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
          fontSize: '14px',
          fontWeight: '500',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <span>{toast.type === 'success' ? '✔' : '✖'}</span>
          <span>{toast.message}</span>
        </div>
      )}

    </div>
  );
}