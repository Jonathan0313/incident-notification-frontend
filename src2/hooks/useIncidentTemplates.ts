import { useState, useEffect } from 'react';
import type { Incident } from '../domain/incident';
import { notificationTemplateService, type NotificationTemplate } from '../services/notificationTemplateService';

interface UseIncidentTemplatesProps {
  formData: Incident | null;
  selectedIncident: Incident | null;
  filterType: string;
  setFilterType: (type: string) => void;
  setIsCreating: (isCreating: boolean) => void;
  setFormData: (data: Incident | null) => void;
  setSelectedIncident: (incident: Incident | null) => void;
  refreshCurrentList: (status?: string, targetTab?: string) => Promise<any>;
  showToast: (type: 'success' | 'error', message: string, errorObj?: any) => void;
}

export function useIncidentTemplates({
  formData,
  selectedIncident,
  filterType,
  setFilterType,
  setIsCreating,
  setFormData,
  setSelectedIncident,
  refreshCurrentList,
  showToast,
}: UseIncidentTemplatesProps) {
  const [templates, setTemplates] = useState<NotificationTemplate[]>([]);
  const [dropdownTemplates, setDropdownTemplates] = useState<NotificationTemplate[]>([]);

  const fetchTemplates = async () => {
    try {
      const data = await notificationTemplateService.getAll();
      setTemplates(data || []);
      setDropdownTemplates(data || []);
    } catch (error: any) {
      showToast('error', error?.message || 'Error al cargar las plantillas.', error);
    }
  };

  useEffect(() => {
    fetchTemplates();
  }, []);

  const normalizeText = (str: string) => {
    if (!str) return '';
    return str
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase();
  };

  const handleSaveAsTemplate = async () => {
    if (!formData) return;

    try {
      const templateData: NotificationTemplate = {
        name: formData.name || 'Nueva Plantilla',
        impact: formData.impact || '',
        functionality: (formData as any).functionality || 'Ok',
        jira: formData.jira || '',
        partnerCase: formData.partnerCase || '',
        affectedComponent: (formData as any).affectedComponent || '',
        description: formData.description || '',
        resolution: formData.resolution || '',
        affectedServices: (formData as any).affectedServices || [],
      };

      await notificationTemplateService.create(templateData);
      showToast('success', '¡Plantilla guardada exitosamente!');
      await fetchTemplates();
    } catch (error: any) {
      showToast('error', error?.message || 'Error al guardar la plantilla.', error);
    }
  };

  const handleUpdateTemplate = async () => {
    if (!formData) {
      showToast('error', 'No hay datos en el formulario.');
      return;
    }

    const targetId = formData.id || selectedIncident?.id;

    if (!targetId) {
      showToast('error', 'No se ha seleccionado ninguna plantilla válida para actualizar.');
      return;
    }

    try {
      const templateData: NotificationTemplate = {
        id: String(targetId),
        name: String(formData.name || ''),
        impact: String(formData.impact || ''),
        functionality: String((formData as any).functionality || 'Ok'),
        jira: String(formData.jira || ''),
        partnerCase: String(formData.partnerCase || ''),
        affectedComponent: String((formData as any).affectedComponent || ''),
        description: String(formData.description || ''),
        resolution: String(formData.resolution || ''),
        affectedServices: Array.isArray((formData as any).affectedServices) 
          ? (formData as any).affectedServices 
          : [],
      };

      await notificationTemplateService.update(String(targetId), templateData);
      showToast('success', 'Plantilla actualizada exitosamente.');
      await fetchTemplates();
    } catch (error: any) {
      const backendMessage = error?.message || 'Error al actualizar la plantilla.';
      showToast('error', backendMessage, error);
    }
  };

  const handleDeleteTemplate = async () => {
    if (!selectedIncident || !selectedIncident.id) {
      showToast('error', 'Selecciona una plantilla para eliminar.');
      return;
    }

    if (!window.confirm('¿Estás seguro de eliminar esta plantilla?')) return;

    try {
      await notificationTemplateService.delete(selectedIncident.id.toString());
      showToast('success', 'Plantilla eliminada exitosamente.');
      
      setIsCreating(false);
      setFormData(null);
      setSelectedIncident(null);
      setFilterType('open');
      await refreshCurrentList(undefined, 'open');
      await fetchTemplates();
    } catch (error: any) {
      showToast('error', error?.message || 'Error al eliminar la plantilla.', error);
    }
  };

  return {
    templates,
    dropdownTemplates,
    handleSaveAsTemplate,
    handleUpdateTemplate,
    handleDeleteTemplate,
    normalizeText,
    refreshTemplates: fetchTemplates,
  };
}