import { useState, useEffect } from 'react';
import { axiosClient } from '../services/axiosClient';

// Definición de la interfaz basada en tu JSON
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
  const [searchCode, setSearchCode] = useState<string>(''); // Estado para la barra de búsqueda

  // Estado del formulario (para crear o modificar)
  const [formData, setFormData] = useState<Service>({
    code: '',
    name: '',
    isBia: false,
    active: true
  });

  // Cargar todos al iniciar
  useEffect(() => {
    fetchAllServices();
  }, []);

  // Cargar datos en el formulario al seleccionar uno de la tabla para editar
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

  // 1. LISTAR / BUSCAR TODOS (GET /v1/api/services/all)
  const fetchAllServices = async () => {
    try {
      setLoading(true);
      const response = await axiosClient.get<Service[]>('/v1/api/services/all'); 
      setServices(response.data);
      setSearchCode(''); // Limpia el input de búsqueda al recargar todos
    } catch (error) {
      console.error('Error al cargar todos los servicios:', error);
    } finally {
      setLoading(false);
    }
  };

  // 2. BUSCAR POR CÓDIGO (GET /v1/api/services/{code})
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
      setServices([]); // Si no existe, muestra la tabla vacía
    } finally {
      setLoading(false);
    }
  };

  // 3. CREAR (POST /v1/api/services) O MODIFICAR (PUT /v1/api/services/{code})
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (selectedService) {
        // MODIFICAR (PUT /v1/api/services/{code})
        await axiosClient.put(`/v1/api/services/${formData.code}`, formData);
        alert('Servicio actualizado con éxito');
      } else {
        // CREAR (POST /v1/api/services)
        await axiosClient.post('/v1/api/services', formData);
        alert('Servicio creado con éxito');
      }
      fetchAllServices();
      resetForm();
    } catch (error) {
      console.error('Error al guardar el servicio:', error);
      alert('Ocurrió un error al guardar el servicio');
    }
  };

  return (
    <div style={{ display: 'flex', gap: '20px', padding: '20px' }}>
      
      {/* SECCIÓN IZQUIERDA: Formulario de Creación / Edición */}
      <div style={{ flex: 1, background: '#fff', padding: '20px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
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
              style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid var(--border-color)', marginTop: '4px' }}
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
              style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid var(--border-color)', marginTop: '4px' }}
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
            <button type="submit" style={{ backgroundColor: 'var(--primary)', color: 'white', border: 'none', padding: '8px 15px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
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

      {/* SECCIÓN DERECHA: Tabla Listado General y Buscador */}
      <div style={{ flex: 2, background: '#fff', padding: '20px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
        
        {/* Cabecera y Barra de Búsqueda */}
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
          <p style={{ color: 'var(--text-muted)' }}>No se encontraron servicios.</p>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid var(--border-color)', textAlign: 'left' }}>
                <th style={{ padding: '8px' }}>Código</th>
                <th style={{ padding: '8px' }}>Nombre</th>
                <th style={{ padding: '8px' }}>BIA</th>
                <th style={{ padding: '8px' }}>Estado</th>
                <th style={{ padding: '8px' }}>Acción</th>
              </tr>
            </thead>
            <tbody>
              {services.map((srv) => (
                <tr key={srv.id || srv.code} style={{ borderBottom: '1px solid var(--border-color)' }}>
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

    </div>
  );
}