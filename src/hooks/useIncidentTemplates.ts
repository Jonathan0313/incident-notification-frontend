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
      const backendMsg = error?.message || 'Error al cargar las plantillas.';
      showToast('error', backendMsg, error);
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
      const backendMsg = error?.message || 'Error al guardar la plantilla.';
      showToast('error', backendMsg, error);
    }
  };

  const handleUpdateTemplate = async () => {
    // 🟢 VALIDACIÓN ESTRICTA: Verificamos tanto formData como si tiene un ID real
    if (!formData || !formData.id || String(formData.id).trim() === '') {
      showToast('error', 'Selecciona uno');
      return;
    }

    try {
      const templateData: NotificationTemplate = {
        name: formData.name || '',
        impact: formData.impact || '',
        functionality: (formData as any).functionality || 'Ok',
        jira: formData.jira || '',
        partnerCase: formData.partnerCase || '',
        affectedComponent: (formData as any).affectedComponent || '',
        description: formData.description || '',
        resolution: formData.resolution || '',
        affectedServices: (formData as any).affectedServices || [],
      };

      await notificationTemplateService.update(formData.id.toString(), templateData);
      showToast('success', 'Plantilla actualizada exitosamente.');
      await fetchTemplates();
    } catch (error: any) {
      const backendMsg = error?.message || 'Error al actualizar la plantilla.';
      showToast('error', backendMsg, error);
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
      const backendMsg = error?.message || 'Error al eliminar la plantilla.';
      showToast('error', backendMsg, error);
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