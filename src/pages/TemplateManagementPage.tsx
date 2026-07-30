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
      />

      {toast && <Toast type={toast.type} message={toast.message} />}
    </div>
  );
}