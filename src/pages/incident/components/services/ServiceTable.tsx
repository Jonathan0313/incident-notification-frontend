import { useState } from 'react';
import { axiosClient } from '../../../../services/axiosClient';
import type { Service } from '../../../ServiceManagementPage';

interface ServiceTableProps {
  services: Service[];
  loading: boolean;
  onEdit: (service: Service) => void;
  refreshServices: () => void;
  setServices: (services: Service[]) => void;
  showToast: (type: 'success' | 'error', message: string) => void;
}

export function ServiceTable({ services, loading, onEdit, refreshServices, setServices, showToast }: ServiceTableProps) {
  const [searchCode, setSearchCode] = useState<string>('');

  const handleSearchByCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchCode.trim()) {
      refreshServices();
      return;
    }

    try {
      const response = await axiosClient.get<Service>(`/v1/api/services/${searchCode.trim()}`);
      setServices(response.data ? [response.data] : []);
    } catch (error: any) {
      console.error('No se encontró el servicio:', error);
      setServices([]);
      showToast('error', 'No se encontró el servicio con ese código');
    }
  };

  return (
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
          <button type="button" onClick={() => { setSearchCode(''); refreshServices(); }} title="Ver todos" style={{ backgroundColor: '#e2e8f0', border: 'none', padding: '6px 10px', borderRadius: '4px', cursor: 'pointer', fontSize: '13px' }}>
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
                    onClick={() => onEdit(srv)}
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
  );
}