import React, { useState, useEffect } from 'react';
import { useIncidentManagement } from '../../hooks/useIncidentManagement';
import { IncidentSidebarLeft } from './components/IncidentSidebarLeft';
import { IncidentSidebarRight } from './components/IncidentSidebarRight';
import { IncidentFormContent } from './components/IncidentFormContent';
import { Toast } from './components/ui/Toast';
import { notificationTemplateService } from '../../services/notificationTemplateService';
import { templateService } from '../../services/templateService';

export default function IncidentManagementPage() {
  const management = useIncidentManagement() || {};
  
  const [localToast, setLocalToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  
  // 1. Estado para la barra lateral (de notificationTemplateService)
  const [notificationTemplates, setNotificationTemplates] = useState<any[]>([]);
  
  // 2. Estado independiente para los listbox y selectores del formulario (de templateService)
  const [formTemplates, setFormTemplates] = useState<any[]>([]);

  const {
    incidents = [],
    availableServices = [],
    selectedIncident = null,
    setSelectedIncident = () => {},
    isCreating = false,
    setIsCreating = () => {},
    filterType = 'open',
    loading = false,
    formData = {},
    setFormData = () => {},
    affectedServices = [],
    setAffectedServices = (() => {}) as React.Dispatch<React.SetStateAction<any[]>>,
    toast = null,
    showToast,
    setFilterType = () => {},
    handleStartCreate = () => {},
    handleSelectIncident = () => {},
    handleAddService = () => {},
    handleDeleteService = () => {},
    handleServiceChange = () => {},
    handleApplyFirstStartTime = () => {},
    handleApplyFirstEndTime = () => {},
    handleApplyFirstAffectationType = () => {},
    handleSetCurrentStartTimeFirst = () => {},
    handleSetCurrentEndTimeFirst = () => {},
    handleMatchEndTimeWithStartTime = () => {},
    handleCopyTemplate = () => {},
    handleSubmit = () => {},
    handleCloseIncident = () => {},
    handleTemplateSelect = () => {},
    fetchInitialData = async () => {},
  } = management;

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

  // Cargar plantillas para alimentar los listbox y selectores del formulario
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

  const triggerToast = (type: 'success' | 'error', message: string) => {
    if (typeof showToast === 'function') {
      showToast(type, message);
    } else {
      setLocalToast({ type, message });
      setTimeout(() => setLocalToast(null), 4500);
    }
  };

  const handleSaveAsTemplateDirectly = async () => {
    try {
      if (!formData) return;

      const templatePayload = {
        name: formData.name || 'Plantilla de Incidente',
        subject: formData.jira ? `Incidente: ${formData.jira}` : 'Notificación de Incidente',
        impact: formData.impact || undefined,
        functionality: formData.functionality || undefined,
        affectedComponent: formData.affectedComponent || undefined,
        jira: formData.jira || undefined,
        partnerCase: formData.partnerCase || formData.aliasedCase || undefined,
        description: formData.description || undefined,
        solution: formData.solution || formData.resolution || undefined,
        resolution: formData.solution || formData.resolution || undefined,
        affectedServices: affectedServices && affectedServices.length > 0 ? affectedServices : [],
        comments: []
      };

      const response = await notificationTemplateService.create(templatePayload);
      const successMessage = response?.data?.message || response?.message || 'Plantilla guardada exitosamente.';
      
      triggerToast('success', successMessage);

      const updatedTemplates = await notificationTemplateService.getAll();
      setNotificationTemplates(Array.isArray(updatedTemplates) ? updatedTemplates : []);

      if (typeof fetchInitialData === 'function') {
        await fetchInitialData();
      }
    } catch (error: any) {
      const errorData = error?.response?.data;
      let errorMessage = 'Error al guardar la plantilla.';
      
      if (typeof errorData === 'string') {
        errorMessage = errorData;
      } else if (errorData?.message) {
        errorMessage = errorData.message;
      } else if (errorData?.error) {
        errorMessage = errorData.error;
      } else if (error?.message) {
        errorMessage = error.message;
      }

      triggerToast('error', errorMessage);
      throw new Error(errorMessage);
    }
  };

  // 🚀 Función para crear el incidente a través de la API de notificaciones
  const handleCreateNotification = async () => {
    try {
      if (!formData) return;

      const payload = {
        ...formData,
        affectedServices: affectedServices && affectedServices.length > 0 ? affectedServices : []
      };

      // Realiza la petición POST a tu API endpoint
      const response = await fetch('http://localhost:8080/v1/api/notifications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(errText || 'Error en la respuesta del servidor al crear notificación.');
      }

      triggerToast('success', '¡Incidente / Notificación creado exitosamente!');

      if (typeof fetchInitialData === 'function') {
        await fetchInitialData();
      }
    } catch (error: any) {
      const errorMsg = error?.message || 'Error de conexión al crear la notificación.';
      triggerToast('error', errorMsg);
      throw new Error(errorMsg);
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
        const errData = error?.response?.data;
        const msg = typeof errData === 'string' ? errData : (errData?.message || 'Error al eliminar la plantilla.');
        triggerToast('error', msg);
      }
    } else {
      await handleCloseIncident(currentComments);
    }
  };

  const activeToast = localToast || toast;
  const currentListSource = filterType === 'templates' ? notificationTemplates : incidents;

  return (
    <div style={{ display: 'flex', gap: '15px', padding: '15px', height: 'calc(100vh - 40px)', boxSizing: 'border-box', backgroundColor: '#f1f5f9', position: 'relative' }}>
      
      <IncidentSidebarLeft 
        incidents={currentListSource}
        selectedIncident={selectedIncident}
        isCreating={isCreating}
        loading={loading}
        filterType={filterType}
        onSelectIncident={handleSelectIncident}
        onStartCreate={handleStartCreate}
        onFilterChange={setFilterType}
      />

      {isCreating || selectedIncident ? (
        <IncidentFormContent 
          formData={formData}
          setFormData={setFormData}
          affectedServices={affectedServices}
          availableServices={availableServices}
          isCreating={isCreating}
          templates={formTemplates}
          filterType={filterType}
          onAddService={handleAddService}
          onDeleteService={handleDeleteService}
          onServiceChange={handleServiceChange}
          onSubmit={handleSubmit}
          onCloseIncident={handleCloseOrDelete}
          onSaveAsTemplate={handleSaveAsTemplateDirectly}
          onCreateNotification={handleCreateNotification}
          onCancelCreation={() => setIsCreating(false)}
          onTemplateSelect={handleTemplateSelect}
          showToast={triggerToast}
        />
      ) : (
        <div style={{ backgroundColor: '#fff', padding: '24px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', flex: 1, display: 'flex', alignItems: 'flex-start', paddingTop: '40px', paddingLeft: '40px' }}>
          <span style={{ color: '#64748b', fontSize: '15px' }}>
            Selecciona una notificación de la izquierda o haz clic en "+ Nuevo".
          </span>
        </div>
      )}

      <IncidentSidebarRight 
        hasFormData={isCreating || !!selectedIncident}
        onCopyTemplate={handleCopyTemplate}
        onApplyFirstStartTime={handleApplyFirstStartTime}
        onApplyFirstEndTime={handleApplyFirstEndTime}
        onApplyFirstAffectationType={handleApplyFirstAffectationType}
        onSetCurrentStartTimeFirst={handleSetCurrentStartTimeFirst}
        onSetCurrentEndTimeFirst={handleSetCurrentEndTimeFirst}
        onMatchEndTimeWithStartTime={handleMatchEndTimeWithStartTime}
      />

      {activeToast && <Toast type={activeToast.type} message={activeToast.message} />}
    </div>
  );
}