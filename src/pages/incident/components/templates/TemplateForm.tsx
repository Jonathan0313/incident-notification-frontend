import { useState, useEffect } from 'react';
import { axiosClient } from '../../../../services/axiosClient';
import type { Template } from '../../../TemplateManagementPage';

interface TemplateFormProps {
  selectedTemplate: Template | null;
  setSelectedTemplate: (template: Template | null) => void;
  refreshTemplates: () => void;
  showToast: (type: 'success' | 'error', message: string) => void;
}

export function TemplateForm({ selectedTemplate, setSelectedTemplate, refreshTemplates, showToast }: TemplateFormProps) {
  const [formData, setFormData] = useState<Template>({
    typeTemplate: 'Descripción',
    name: '',
    messageTemplate: ''
  });

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
      refreshTemplates();
      resetForm();
    } catch (error: any) {
      console.error('Error al guardar la plantilla:', error);
      
      const backendMessage = 
        error?.response?.data?.message || 
        error?.response?.data?.error || 
        (typeof error?.response?.data === 'string' ? error.response.data : null) ||
        error?.message || 
        'Ocurrió un error al guardar la plantilla';

      showToast('error', backendMessage);
    }
  };

  return (
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
            disabled={selectedTemplate !== null}
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
  );
}