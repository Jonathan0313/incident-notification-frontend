import { useState, useEffect } from 'react';
import { notificationTemplateService } from '../services/notificationTemplateService';
import { templateService } from '../services/templateService';
import { notificationService } from '../services/notificationService';

export function useIncidentActions({
  formData,
  affectedServices,
  selectedIncident,
  filterType,
  triggerToast,
  setSelectedIncident,
  setIsCreating,
  setFormData,
  setAffectedServices,
  fetchInitialData,
  handleCloseIncident
}: any) {
  const [notificationTemplates, setNotificationTemplates] = useState<any[]>([]);
  const [formTemplates, setFormTemplates] = useState<any[]>([]);

  // Cargar plantillas de notificación para la barra lateral
  useEffect(() => {
    const loadNotificationTemplates = async () => {
      try {
        const data = await notificationTemplateService.getAll();
        setNotificationTemplates(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('Error al cargar las plantillas de notificación:', error);
      }
    };
    loadNotificationTemplates();
  }, []);

  // Cargar plantillas para alimentar los listbox del formulario
  useEffect(() => {
    const loadTemplates = async () => {
      try {
        const data = await templateService.getAll();
        setFormTemplates(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('Error al cargar plantillas para los listbox:', error);
      }
    };
    loadTemplates();
  }, []);

  // Función para sanear caracteres corruptos (ej. arreglar ÇI, Ã³, etc.)
  const sanitizeText = (str: string): string => {
    if (!str) return '';
    try {
      // Intenta reparar doble codificación UTF-8
      let repaired = decodeURIComponent(encodeURIComponent(str));
      
      // Mapeo directo para secuencias de bytes mal mapeadas por Axios/Browser
      repaired = repaired
        .replace(/Ã³/g, 'ó')
        .replace(/Ã³/g, 'Ó')
        .replace(/Ã¡/g, 'á')
        .replace(/Ã©/g, 'é')
        .replace(/Ã/g, 'í')
        .replace(/Ãº/g, 'ú')
        .replace(/Ã±/g, 'ñ')
        .replace(/ÇI/g, 'ó')
        .replace(/Çi/g, 'ó')
        .replace(/Ç/g, 'ó');

      return repaired.normalize('NFC');
    } catch (e) {
      return str;
    }
  };

  // Extraer y estructurar los mensajes de error del backend
  const parseBackendErrorMessage = (error: any, defaultMsg: string): string => {
    const errorData = error?.response?.data;
    let message = defaultMsg;

    if (typeof errorData === 'string') {
      message = errorData;
    } else if (errorData && typeof errorData === 'object') {
      const validationErrors = Object.values(errorData).filter((val) => typeof val === 'string');

      if (validationErrors.length > 0) {
        message = validationErrors.join('\n');
      } else {
        message = errorData.message || errorData.error || message;
      }
    } else if (error?.message) {
      message = error.message;
    }

    return sanitizeText(message);
  };

  const handleSaveAsTemplateDirectly = async () => {
    try {
      if (!formData) return;

      const formattedServices = (affectedServices || [])
        .map((s: any) => ({
          ...s,
          nameService: s.nameService || s.name || '',
        }))
        .filter((s: any) => s.nameService && s.nameService.trim() !== '' && s.nameService !== '-- Seleccione --');

      const templatePayload = {
        name: formData.name?.trim(),
        subject: formData.jira ? `Incidente: ${formData.jira}` : 'Notificación de Incidente',
        impact: formData.impact || '',
        functionality: formData.functionality || '',
        affectedComponent: formData.affectedComponent || 'En investigación',
        jira: formData.jira || '',
        partnerCase: formData.partnerCase || formData.aliasedCase || '',
        description: formData.description || '',
        solution: formData.solution || formData.resolution || '',
        resolution: formData.solution || formData.resolution || '',
        affectedServices: formattedServices,
        comments: []
      };

      const response = await notificationTemplateService.create(templatePayload);
      const successMessage = response?.data?.message || response?.message || 'Plantilla guardada exitosamente.';
      
      triggerToast('success', sanitizeText(successMessage));

      const updatedTemplates = await notificationTemplateService.getAll();
      setNotificationTemplates(Array.isArray(updatedTemplates) ? updatedTemplates : []);

      if (typeof fetchInitialData === 'function') {
        await fetchInitialData();
      }
    } catch (error: any) {
      console.error('Error al guardar como plantilla:', error);
      const errorMessage = parseBackendErrorMessage(error, 'Error al guardar la plantilla.');
      triggerToast('error', errorMessage);
    }
  };

  const handleCreateNotification = async () => {
    try {
      if (!formData) return;

      const formattedServices = (affectedServices || [])
        .map((s: any) => ({
          ...s,
          nameService: s.nameService || s.name || '',
        }))
        .filter((s: any) => s.nameService && s.nameService.trim() !== '' && s.nameService !== '-- Seleccione --');

      const payload = {
        ...formData,
        impact: formData.impact || '',
        description: formData.description || '',
        affectedServices: formattedServices
      };

      await notificationService.create(payload);
      triggerToast('success', '¡Incidente / Notificación creado exitosamente!');

      if (typeof fetchInitialData === 'function') {
        await fetchInitialData();
      }
    } catch (error: any) {
      console.error('Error al crear la notificación:', error);
      const errorMsg = parseBackendErrorMessage(error, 'Error al crear la notificación.');
      triggerToast('error', errorMsg);
    }
  };

  const handleCloseOrDelete = async (currentComments?: any[]) => {
    if (filterType === 'templates') {
      try {
        if (!selectedIncident?.id) return;
        await notificationTemplateService.delete(String(selectedIncident.id));
        triggerToast('success', 'Plantilla eliminada exitosamente.');
        
        if (typeof setSelectedIncident === 'function') setSelectedIncident(null);
        if (typeof setIsCreating === 'function') setIsCreating(false);
        if (typeof setFormData === 'function') setFormData({});
        if (typeof setAffectedServices === 'function') setAffectedServices([]);
        
        const updatedTemplates = await notificationTemplateService.getAll();
        setNotificationTemplates(Array.isArray(updatedTemplates) ? updatedTemplates : []);
        await fetchInitialData();
      } catch (error: any) {
        const msg = parseBackendErrorMessage(error, 'Error al eliminar la plantilla.');
        triggerToast('error', msg);
      }
    } else {
      await handleCloseIncident(currentComments);
    }
  };

  return {
    notificationTemplates,
    formTemplates,
    handleSaveAsTemplateDirectly,
    handleCreateNotification,
    handleCloseOrDelete
  };
}