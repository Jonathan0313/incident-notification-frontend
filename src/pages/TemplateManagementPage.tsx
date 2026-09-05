import { useState, useEffect } from 'react';
import { axiosClient } from '../services/axiosClient';
import { TemplateForm } from './incident/components/templates/TemplateForm';
import { TemplateTable } from './incident/components/templates/TemplateTable';
import { Toast } from './incident/components/ui/Toast';

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
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Estados para el modal personalizado de eliminación
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false);
  const [templateToDelete, setTemplateToDelete] = useState<Template | null>(null);

  const showToast = (type: 'success' | 'error', message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3500);
  };

  useEffect(() => {
    fetchAllTemplates();
  }, []);

  const fetchAllTemplates = async () => {
    try {
      setLoading(true);
      const response = await axiosClient.get<Template[]>('/v1/api/templates'); 
      setTemplates(response.data);
    } catch (error: any) {
      console.error('Error al cargar todas las plantillas:', error);
      const backendMessage = error?.response?.data?.message || error?.message || 'Error al cargar las plantillas';
      showToast('error', backendMessage);
    } finally {
      setLoading(false);
    }
  };

  // Función que intercepta el clic de eliminar y abre el modal personalizado
  const handleDeleteClick = (template: Template) => {
    setTemplateToDelete(template);
    setIsDeleteModalOpen(true);
  };

  // Lógica real que se ejecuta al confirmar en el modal
  const executeDelete = async () => {
    if (!templateToDelete?.id) return;
    try {
      await axiosClient.delete(`/v1/api/templates/${templateToDelete.id}`);
      showToast('success', 'Plantilla eliminada correctamente');
      fetchAllTemplates();
      if (selectedTemplate?.id === templateToDelete.id) {
        setSelectedTemplate(null);
      }
    } catch (error: any) {
      console.error('Error al eliminar la plantilla:', error);
      const backendMessage = error?.response?.data?.message || error?.message || 'Error al eliminar la plantilla';
      showToast('error', backendMessage);
    } finally {
      setIsDeleteModalOpen(false);
      setTemplateToDelete(null);
    }
  };

  return (
    <div style={{ display: 'flex', gap: '20px', padding: '20px', position: 'relative', minHeight: '80vh', boxSizing: 'border-box' }}>
      <TemplateForm 
        selectedTemplate={selectedTemplate} 
        setSelectedTemplate={setSelectedTemplate} 
        refreshTemplates={fetchAllTemplates} 
        showToast={showToast} 
      />
      
      <TemplateTable 
        templates={templates} 
        loading={loading} 
        onEdit={(template) => setSelectedTemplate(template)} 
        refreshTemplates={fetchAllTemplates} 
        setTemplates={setTemplates} 
        showToast={showToast}
        onDelete={handleDeleteClick} 
      />

      {/* Modal de Eliminación Personalizado */}
      {isDeleteModalOpen && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: 'white', padding: '24px', borderRadius: '8px', width: '100%', maxWidth: '400px', boxShadow: '0 10px 25px rgba(0,0,0,0.15)' }}>
            <h3 style={{ margin: '0 0 10px 0', fontSize: '18px', color: '#1f2937' }}>⚠️ Confirmar Eliminación</h3>
            <p style={{ margin: '0 0 20px 0', fontSize: '14px', color: '#4b5563', lineHeight: '1.5' }}>
              ¿Estás seguro de eliminar la plantilla <strong>{templateToDelete?.name}</strong>? Esta acción no se puede deshacer.
            </p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button 
                onClick={() => setIsDeleteModalOpen(false)}
                style={{ padding: '8px 16px', backgroundColor: '#f3f4f6', color: '#374151', border: '1px solid #d1d5db', borderRadius: '4px', cursor: 'pointer', fontWeight: '500' }}
              >
                Cancelar
              </button>
              <button 
                onClick={executeDelete}
                style={{ padding: '8px 16px', backgroundColor: '#dc2626', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: '500' }}
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}

      {toast && <Toast type={toast.type} message={toast.message} />}
    </div>
  );
}