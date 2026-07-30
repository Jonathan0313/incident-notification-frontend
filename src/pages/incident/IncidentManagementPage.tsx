import { useIncidentManagement } from '../../hooks/useIncidentManagement';
import { IncidentSidebarLeft } from './components/IncidentSidebarLeft';
import { IncidentSidebarRight } from './components/IncidentSidebarRight';
import { IncidentFormContent } from './components/IncidentFormContent';
import { TemplateModal } from './components/templates/components/TemplateModal';
import { Toast } from './components/ui/Toast';

export default function IncidentManagementPage() {
  const {
    incidents,
    availableServices,
    templates,
    selectedIncident,
    isCreating,
    setIsCreating,
    filterType,
    loading,
    formData,
    setFormData,
    affectedServices,
    isTemplateModalOpen,
    setIsTemplateModalOpen,
    toast,
    setFilterType,
    handleStartCreate,
    handleSelectIncident,
    handleAddService,
    handleDeleteService,
    handleServiceChange,
    handleApplyFirstStartTime,
    handleApplyFirstEndTime,
    handleApplyFirstAffectationType,
    handleSetCurrentStartTimeFirst, // <-- 1. Añadido aquí
    handleSetCurrentEndTimeFirst,   // <-- 1. Añadido aquí
    handleSubmit,
    handleCloseIncident,
    handleTemplateSelect,
    fetchInitialData,
  } = useIncidentManagement();

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
          onAddService={handleAddService}
          onDeleteService={handleDeleteService}
          onServiceChange={handleServiceChange}
          onSubmit={handleSubmit}
          onCloseIncident={handleCloseIncident}
          onSaveAsTemplate={() => setIsTemplateModalOpen(true)}
          onCancelCreation={() => setIsCreating(false)}
          onTemplateSelect={handleTemplateSelect}
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
        onCopyTemplate={() => setIsTemplateModalOpen(true)}
        onApplyFirstStartTime={handleApplyFirstStartTime}
        onApplyFirstEndTime={handleApplyFirstEndTime}
        onApplyFirstAffectationType={handleApplyFirstAffectationType}
        onSetCurrentStartTimeFirst={handleSetCurrentStartTimeFirst} // <-- 2. Conectado aquí
        onSetCurrentEndTimeFirst={handleSetCurrentEndTimeFirst}     // <-- 2. Conectado aquí
      />

      {isTemplateModalOpen && (
        <TemplateModal 
          isOpen={isTemplateModalOpen} 
          onClose={() => setIsTemplateModalOpen(false)} 
          onSave={() => {
            setIsTemplateModalOpen(false);
            fetchInitialData();
          }}
        />
      )}

      {toast && <Toast type={toast.type} message={toast.message} />}
    </div>
  );
}