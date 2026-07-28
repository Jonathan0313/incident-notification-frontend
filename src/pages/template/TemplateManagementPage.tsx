import { useState, useEffect } from 'react';
import { axiosClient } from '../../services/axiosClient';

export interface Template {
  id?: string;
  typeTemplate: string;
  name: string;
  messageTemplate: string;
  createdAt?: string;
}

export default function TemplateManagementPage() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [searchName, setSearchName] = useState<string>('');

  // Estado para las notificaciones flotantes (Toast)
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const [formData, setFormData] = useState<Template>({
    typeTemplate: 'Descripción',
    name: '',
    messageTemplate: ''
  });

  const showToast = (type: 'success' | 'error', message: string) => {
    setToast({ type, message });
    setTimeout(() => {
      setToast(null);
    }, 3500);
  };

  useEffect(() => {
    fetchAllTemplates();
  }, []);

  useEffect(() => {
    if (selectedTemplate) {
      setFormData(selectedTemplate);
    } else {
      resetForm();
    }
  }, [selectedTemplate]);

  const resetForm = () => {
    setFormData({ typeTemplate: 'Descripción', name: '', messageTemplate: '' });
    setSelectedTemplate(null);
  };

  const fetchAllTemplates = async () => {
    try {
      setLoading(true);
      const response = await axiosClient.get<Template[]>('/v1/api/templates'); 
      setTemplates(response.data);
      setSearchName('');
    } catch (error: any) {
      console.error('Error al cargar todas las plantillas:', error);
      const backendMessage = error?.response?.data?.message || error?.message || 'Error al cargar las plantillas';
      showToast('error', backendMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchByName = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchName.trim()) {
      fetchAllTemplates();
      return;
    }

    try {
      setLoading(true);
      const response = await axiosClient.get<Template[]>('/v1/api/templates');
      const filtered = response.data.filter(t => 
        t.name.toLowerCase().includes(searchName.trim().toLowerCase()) ||
        t.typeTemplate.toLowerCase().includes(searchName.trim().toLowerCase())
      );
      setTemplates(filtered);
    } catch (error: any) {
      console.error('Error al buscar la plantilla:', error);
      setTemplates([]);
      showToast('error', 'Error al buscar la plantilla');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (selectedTemplate && selectedTemplate.id) {
        await axiosClient.put(`/v1/api/templates/${selectedTemplate.id}`, formData);
        showToast('success', 'Plantilla actualizada con éxito');
      } else {
        await axiosClient.post('/v1/api/templates', formData);
        showToast('success', 'Plantilla creada con éxito');
      }
      fetchAllTemplates();
      resetForm();
    } catch (error: any) {
      console.error('Error al guardar la plantilla:', error);
      
      // 🟢 EXTRACCIÓN INTELIGENTE DEL MENSAJE DEL BACKEND (Ej: Nombre único repetido)
      const backendMessage = 
        error?.response?.data?.message || 
        error?.response?.data?.error || 
        (typeof error?.response?.data === 'string' ? error.response.data : null) ||
        error?.message || 
        'Ocurrió un error al guardar la plantilla';

      showToast('error', backendMessage);
    }
  };

  const handleDelete = async (id?: string) => {
    if (!id) return;
    if (window.confirm('¿Estás seguro de eliminar esta plantilla?')) {
      try {
        await axiosClient.delete(`/v1/api/templates/${id}`);
        showToast('success', 'Plantilla eliminada con éxito');
        fetchAllTemplates();
      } catch (error: any) {
        console.error('Error al eliminar la plantilla:', error);
        const backendMessage = error?.response?.data?.message || error?.message || 'No se pudo eliminar la plantilla';
        showToast('error', backendMessage);
      }
    }
  };

  return (
    <div style={{ display: 'flex', gap: '20px', padding: '20px', position: 'relative', minHeight: '80vh', boxSizing: 'border-box' }}>
      
      {/* SECCIÓN IZQUIERDA: Formulario */}
      <div style={{ flex: 1, background: '#fff', padding: '20px', borderRadius: '8px', border: '1px solid var(--border-color)', height: 'fit-content' }}>
        <h3 style={{ marginTop: 0 }}>
          {selectedTemplate ? '✏️ Modificar Plantilla' : '➕ Crear Nueva Plantilla'}
        </h3>
        
        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div>
            <label style={{ fontSize: '13px', fontWeight: 'bold' }}>Tipo de Template:</label>
            <select 
              value={formData.typeTemplate} 
              onChange={(e) => setFormData({ ...formData, typeTemplate: e.target.value })}
              required
              style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid var(--border-color)', marginTop: '4px', boxSizing: 'border-box', backgroundColor: '#fff' }}
            >
              <option value="Descripción">Descripción</option>
              <option value="Avances">Avances</option>
              <option value="Solución">Solución</option>
            </select>
          </div>

          <div>
            <label style={{ fontSize: '13px', fontWeight: 'bold' }}>Nombre (Único):</label>
            <input 
              type="text" 
              value={formData.name} 
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Ej. Plantilla Inicial de Incidente"
              required
              disabled={selectedTemplate !== null} // 🟢 BLOQUEADO AL EDITAR PARA EVITAR CAMBIAR OTROS REGISTROS
              style={{ 
                width: '100%', 
                padding: '8px', 
                borderRadius: '4px', 
                border: '1px solid var(--border-color)', 
                marginTop: '4px', 
                boxSizing: 'border-box',
                backgroundColor: selectedTemplate !== null ? '#f1f5f9' : '#fff',
                cursor: selectedTemplate !== null ? 'not-allowed' : 'text'
              }}
            />
          </div>

          <div>
            <label style={{ fontSize: '13px', fontWeight: 'bold' }}>Mensaje de la Plantilla:</label>
            <textarea 
              rows={4}
              value={formData.messageTemplate} 
              onChange={(e) => setFormData({ ...formData, messageTemplate: e.target.value })}
              placeholder="Escribe el cuerpo del mensaje..."
              required
              style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid var(--border-color)', marginTop: '4px', boxSizing: 'border-box', resize: 'vertical' }}
            />
          </div>

          <div style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
            <button type="submit" style={{ backgroundColor: '#2563eb', color: 'white', border: 'none', padding: '8px 15px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
              {selectedTemplate ? 'Actualizar' : 'Guardar'}
            </button>
            {selectedTemplate && (
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
          <h3 style={{ margin: 0 }}>📋 Lista de Plantillas</h3>
          
          <form onSubmit={handleSearchByName} style={{ display: 'flex', gap: '6px' }}>
            <input 
              type="text" 
              value={searchName}
              onChange={(e) => setSearchName(e.target.value)}
              placeholder="Buscar plantilla..."
              style={{ padding: '6px 10px', borderRadius: '4px', border: '1px solid var(--border-color)', fontSize: '13px' }}
            />
            <button type="submit" style={{ backgroundColor: '#3b82f6', color: 'white', border: 'none', padding: '6px 10px', borderRadius: '4px', cursor: 'pointer', fontSize: '13px', fontWeight: 'bold' }}>
              🔍
            </button>
            <button type="button" onClick={fetchAllTemplates} title="Ver todas" style={{ backgroundColor: '#e2e8f0', border: 'none', padding: '6px 10px', borderRadius: '4px', cursor: 'pointer', fontSize: '13px' }}>
              🔄
            </button>
          </form>
        </div>

        {loading ? (
          <p>Cargando plantillas...</p>
        ) : templates.length === 0 ? (
          <p style={{ color: '#64748b' }}>No se encontraron plantillas.</p>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #e2e8f0', textAlign: 'left', background: '#f8fafc' }}>
                <th style={{ padding: '8px' }}>Tipo</th>
                <th style={{ padding: '8px' }}>Nombre</th>
                <th style={{ padding: '8px' }}>Mensaje</th>
                <th style={{ padding: '8px' }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {templates.map((tpl) => (
                <tr key={tpl.id || tpl.name} style={{ borderBottom: '1px solid #e2e8f0' }}>
                  <td style={{ padding: '8px', fontWeight: 500 }}>
                    <span style={{ backgroundColor: '#e0e7ff', color: '#3730a3', padding: '3px 8px', borderRadius: '12px', fontSize: '12px' }}>
                      {tpl.typeTemplate}
                    </span>
                  </td>
                  <td style={{ padding: '8px', fontWeight: 500 }}>{tpl.name}</td>
                  <td style={{ padding: '8px', color: '#475569', maxWidth: '200px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {tpl.messageTemplate}
                  </td>
                  <td style={{ padding: '8px', display: 'flex', gap: '6px' }}>
                    <button 
                      onClick={() => setSelectedTemplate(tpl)}
                      style={{ backgroundColor: '#3b82f6', color: 'white', border: 'none', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}>
                      Editar
                    </button>
                    <button 
                      onClick={() => handleDelete(tpl.id)}
                      style={{ backgroundColor: '#ef4444', color: 'white', border: 'none', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}>
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* NOTIFICACIÓN FLOTANTE (TOAST) */}
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