import React, { useState } from 'react';
import { useIncidentManagement } from '../../hooks/useIncidentManagement';
import { useIncidentActions } from '../../hooks/useIncidentActions';

import { IncidentSidebarLeft } from './components/IncidentSidebarLeft';
import { IncidentSidebarRight } from './components/IncidentSidebarRight';
import { IncidentFormContent } from './components/IncidentFormContent';
import { Toast } from './components/ui/Toast';

export default function IncidentManagementPage() {
  const management = useIncidentManagement() || {};
  const [localToast, setLocalToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

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
    handleClearServiceTimes = () => {},
  } = management;

  const triggerToast = (type: 'success' | 'error', message: string) => {
    if (typeof showToast === 'function') {
      showToast(type, message);
    } else {
      setLocalToast({ type, message });
      setTimeout(() => setLocalToast(null), 4500);
    }
  };

  // Enganchamos las acciones extraídas
  const {
    notificationTemplates,
    formTemplates,
    handleSaveAsTemplateDirectly,
    handleCreateNotification,
    handleCloseOrDelete
  } = useIncidentActions({
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
  });

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
        onClearServiceTimes={handleClearServiceTimes}
      />

      {activeToast && <Toast type={activeToast.type} message={activeToast.message} />}
    </div>
  );
}