import { useState, useEffect } from 'react';
import { notificationTemplateService } from '../services/notificationTemplateService';
import { templateService } from '../services/templateService';

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
}: any) {
  const [templates, setTemplates] = useState<any[]>([]);
  const [dropdownTemplates, setDropdownTemplates] = useState<any[]>([]);

  useEffect(() => {
    fetchDropdownTemplates();
  }, []);

  useEffect(() => {
    if (filterType === 'templates') {
      loadTemplatesSidebar();
    }
  }, [filterType]);

  const fetchDropdownTemplates = async () => {
    try {
      const data = await templateService.getAll();
      setDropdownTemplates(data || []);
    } catch (error) {
      console.error('Error al cargar plantillas para los desplegables', error);
    }
  };

  const loadTemplatesSidebar = async () => {
    try {
      const data = await notificationTemplateService.getAll();
      const mapped = (data || []).map((t: any) => ({
        id: t.id || '',
        name: t.name,
        typeTemplate: t.typeTemplate,
        messageTemplate: t.messageTemplate,
        impact: t.impact || '',
        functionality: t.functionality || 'General',
        jira: t.jira || '',
        partnerCase: t.partnerCase || '',
        affectedComponent: t.affectedComponent || '',
        description: t.description || '',
        resolution: t.resolution || '',
        affectedServices: t.affectedServices || [],
        comments: [],
        status: 'TEMPLATE',
        createdAt: t.createdAt || new Date().toISOString()
      }));
      setTemplates(mapped);
    } catch (error) {
      showToast('error', 'No se pudieron cargar las plantillas de la barra lateral.');
    }
  };

  const handleSaveAsTemplate = async () => {
    if (!formData) return;
    try {
      const templatePayload = {
        name: formData.name,
        impact: formData.impact,
        functionality: formData.functionality || 'General',
        jira: formData.jira,
        partnerCase: formData.partnerCase,
        affectedComponent: formData.affectedComponent,
        description: formData.description,
        resolution: formData.resolution,
        affectedServices: (formData.affectedServices || []).map((s: any) => ({
          code: s.code,
          nameService: s.nameService,
          status: s.status,
          startTime: s.startTime,
          endTime: s.endTime
        }))
      };

      await notificationTemplateService.create(templatePayload);
      showToast('success', '¡Plantilla guardada exitosamente!');
      if (filterType === 'templates') loadTemplatesSidebar();
    } catch (error) {
      showToast('error', 'Error al guardar la plantilla en el servidor.');
    }
  };

  const handleUpdateTemplate = async () => {
    if (!selectedIncident || !selectedIncident.id) return;
    try {
      const templatePayload = {
        name: formData.name,
        impact: formData.impact,
        functionality: formData.functionality || 'General',
        jira: formData.jira,
        partnerCase: formData.partnerCase,
        affectedComponent: formData.affectedComponent,
        description: formData.description,
        resolution: formData.resolution,
        affectedServices: (formData.affectedServices || []).map((s: any) => ({
          code: s.code,
          nameService: s.nameService,
          status: s.status,
          startTime: s.startTime,
          endTime: s.endTime
        }))
      };

      await notificationTemplateService.update(selectedIncident.id, templatePayload);
      showToast('success', '¡Plantilla actualizada exitosamente!');
      if (filterType === 'templates') loadTemplatesSidebar();
    } catch (error) {
      showToast('error', 'Error al actualizar la plantilla.');
    }
  };

  const handleDeleteTemplate = async () => {
    if (!selectedIncident || !selectedIncident.id) return;
    if (!window.confirm('¿Estás seguro de que deseas eliminar esta plantilla?')) return;
    
    try {
      await notificationTemplateService.delete(selectedIncident.id);
      showToast('success', 'Plantilla eliminada exitosamente.');
      loadTemplatesSidebar();
      setSelectedIncident(null);
    } catch (error) {
      showToast('error', 'Error al eliminar la plantilla.');
    }
  };

  const normalizeText = (str: string) => {
    return str ? str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim() : "";
  };

  return {
    templates,
    dropdownTemplates,
    handleSaveAsTemplate,
    handleUpdateTemplate,
    handleDeleteTemplate,
    normalizeText
  };
}