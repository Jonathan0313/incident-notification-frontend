import React, { useState } from 'react';
import { useIncidentManagement } from '../../hooks/useIncidentManagement';
import { IncidentSidebarLeft } from './components/IncidentSidebarLeft';
import { IncidentSidebarRight } from './components/IncidentSidebarRight';
import { IncidentFormContent } from './components/IncidentFormContent';
import { Toast } from './components/ui/Toast';
import { notificationTemplateService } from '../../services/notificationTemplateService';

export default function IncidentManagementPage() {
  const management = useIncidentManagement() || {};
  
  const [localToast, setLocalToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const {
    incidents = [],
    availableServices = [],
    templates = [],
    selectedIncident = null,
    setSelectedIncident = () => {},
    isCreating = false,
    setIsCreating = () => {},
    filterType = 'open',
    loading = false,
    formData = {},
    setFormData = () => {},
    affectedServices = [],
    setAffectedServices = () => {},
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

  // Manejador unificado para cerrar incidentes o eliminar plantillas según la vista
  const handleCloseOrDelete = async (currentComments?: any[]) => {
    if (filterType === 'templates') {
      try {
        if (!selectedIncident?.id) return;
        await notificationTemplateService.delete(selectedIncident.id);
        triggerToast('success', 'Plantilla eliminada exitosamente.');
        setSelectedIncident(null);
        setIsCreating(false);
        setFormData({});
        setAffectedServices([]);
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

  return (
    <div style={{ display: 'flex', gap: '15px', padding: '15px', height: 'calc(100vh - 40px)', boxSizing: 'border-box', backgroundColor: '#f1f5f9', position: 'relative' }}>
      
      <IncidentSidebarLeft 
        incidents={filterType === 'templates' ? templates : incidents}
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
          templates={templates}
          filterType={filterType}
          onAddService={handleAddService}
          onDeleteService={handleDeleteService}
          onServiceChange={handleServiceChange}
          onSubmit={handleSubmit}
          onCloseIncident={handleCloseOrDelete}
          onSaveAsTemplate={handleSaveAsTemplateDirectly}
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
        hasFormData={!isCreating && !!selectedIncident}
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