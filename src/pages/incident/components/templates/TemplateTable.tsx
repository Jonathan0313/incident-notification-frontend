import { useState } from 'react';
import { axiosClient } from '../../../../services/axiosClient';
import type { Template } from '../../../TemplateManagementPage';

interface TemplateTableProps {
  templates: Template[];
  loading: boolean;
  onEdit: (template: Template) => void;
  refreshTemplates: () => void;
  setTemplates: (templates: Template[]) => void;
  showToast: (type: 'success' | 'error', message: string) => void;
}

export function TemplateTable({ templates, loading, onEdit, refreshTemplates, setTemplates, showToast }: TemplateTableProps) {
  const [searchName, setSearchName] = useState<string>('');

  const handleSearchByName = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchName.trim()) {
      refreshTemplates();
      return;
    }

    try {
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
    }
  };

  const handleDelete = async (id?: string) => {
    if (!id) return;
    if (window.confirm('¿Estás seguro de eliminar esta plantilla?')) {
      try {
        await axiosClient.delete(`/v1/api/templates/${id}`);
        showToast('success', 'Plantilla eliminada con éxito');
        refreshTemplates();
      } catch (error: any) {
        console.error('Error al eliminar la plantilla:', error);
        const backendMessage = error?.response?.data?.message || error?.message || 'No se pudo eliminar la plantilla';
        showToast('error', backendMessage);
      }
    }
  };

  return (
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
          <button type="button" onClick={() => { setSearchName(''); refreshTemplates(); }} title="Ver todas" style={{ backgroundColor: '#e2e8f0', border: 'none', padding: '6px 10px', borderRadius: '4px', cursor: 'pointer', fontSize: '13px' }}>
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
                    onClick={() => onEdit(tpl)}
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
  );
}