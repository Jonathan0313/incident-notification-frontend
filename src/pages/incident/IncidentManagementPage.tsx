import { useState } from 'react';
import { useIncidentList } from "../../hooks/useIncidentList";
import { useIncidentForm } from "../../hooks/useIncidentForm";
import { useIncidentTemplates } from "../../hooks/useIncidentTemplates";
import { formatDateTimeIfNeeded, getIconForAffectation } from "../../utils/incidentHelpers";
import { incidentService } from "../../services/incidentService";

import { IncidentSidebarLeft } from "./components/IncidentSidebarLeft";
import { IncidentSidebarRight } from "./components/IncidentSidebarRight";
import { IncidentFormContent } from "./components/IncidentFormContent";

export default function IncidentManagementPage() {
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const showToast = (type: 'success' | 'error', message: string, errorObj?: any) => {
    let finalMessage = message;

    if (errorObj) {
      const backendMsg = 
        (typeof errorObj?.response?.data === 'string' ? errorObj.response.data : null) ||
        errorObj?.response?.data?.message || 
        errorObj?.response?.data?.error || 
        errorObj?.message;

      if (backendMsg) {
        finalMessage = backendMsg;
      }
    }

    setToast({ type, message: finalMessage });
    setTimeout(() => { setToast(null); }, 3500);
  };

  const {
    incidents, selectedIncident, loading, filterType, setFilterType, setSelectedIncident, refreshCurrentList,
  } = useIncidentList(showToast);

  const {
    isCreating, availableServices, formData, errors, isSaving, setIsCreating, setFormData, setErrors,
    handleStartCreate, handleSaveAction, handleCloseIncident, handleCopyTemplate,
    handleApplyFirstStartTime, handleApplyFirstEndTime, handleApplyFirstAffectationType,
    handleSetCurrentStartTimeFirstService, handleSetCurrentEndTimeFirstService,
  } = useIncidentForm(selectedIncident, refreshCurrentList, showToast);

  const {
    templates, dropdownTemplates, handleSaveAsTemplate, handleUpdateTemplate, handleDeleteTemplate, normalizeText
  } = useIncidentTemplates({
    formData, selectedIncident, filterType, setFilterType, setIsCreating, setFormData, setSelectedIncident, refreshCurrentList, showToast,
  });

  const onSaveClick = async () => {
    try {
      const wasCreating = isCreating;

      await handleSaveAction();
      
      setIsCreating(false);
      setFilterType('open');

      const updatedList = await refreshCurrentList(undefined, 'open');

      if (wasCreating && updatedList && updatedList.length > 0) {
        setSelectedIncident(updatedList[0]);
      }

      showToast('success', wasCreating ? 'Nuevo incidente creado exitosamente.' : 'Cambios guardados exitosamente.');
    } catch (error: any) {      
      const backendMessage = 
        (typeof error?.response?.data === 'string' ? error.response.data : null) ||
        error?.response?.data?.message || 
        error?.response?.data?.error || 
        error?.message || 
        'Error al crear el incidente.';
      showToast('error', backendMessage, error);
    }
  };

  const onCloseClick = async () => {
    try {
      await handleCloseIncident();
      showToast('success', 'Incidente cerrado exitosamente.');
    } catch (error: any) {
      const backendMessage = 
        (typeof error?.response?.data === 'string' ? error.response.data : null) ||
        error?.response?.data?.message || 
        error?.response?.data?.error || 
        error?.message || 
        'Error al cerrar.';
      showToast('error', backendMessage, error);
    }
  };

  const onCopyClick = async () => {
    try {
      await handleCopyTemplate();
      showToast('success', '¡Plantilla copiada al portapapeles!');
    } catch (error: any) {
      const backendMessage = 
        (typeof error?.response?.data === 'string' ? error?.response?.data : null) ||
        error?.response?.data?.message || 
        error?.response?.data?.error || 
        error?.message || 
        'No se pudo copiar.';
      showToast('error', backendMessage, error);
    }
  };

  const handleStartOpenIncident = async () => {
    const sourceData = formData || selectedIncident;
    if (!sourceData) return showToast('error', 'Selecciona una plantilla primero.');
    
    const { id, ...rest } = sourceData as any;
    
    try {
      const newIncidentData = {
        ...rest,
        id: undefined,
        name: sourceData.name || '',
        status: 'ACTIVE',
        comments: sourceData.comments || [],
        affectedServices: sourceData.affectedServices || []
      };

      await incidentService.createIncident(newIncidentData);

      setIsCreating(false);
      setFilterType('open');

      const updatedList = await refreshCurrentList(undefined, 'open');

      if (updatedList && updatedList.length > 0) {
        setSelectedIncident(updatedList[0]);
        setFormData(updatedList[0] as any);
      }

      showToast('success', 'Incidente creado exitosamente desde la plantilla.');
    } catch (error: any) {
      const backendMessage = 
        (typeof error?.response?.data === 'string' ? error.response.data : null) ||
        error?.response?.data?.message || 
        error?.response?.data?.error || 
        error?.message || 
        'Error al crear el incidente.';
      showToast('error', backendMessage, error);
    }
  };

  const handleAddAffectedService = () => {
    if (!formData) return;
    const row = { status: '✅', code: '', nameService: '', affectationType: 'OK', startTime: '', endTime: '' };
    setFormData({ ...formData, affectedServices: [...((formData as any).affectedServices || []), row] } as any);
  };

  const handleDeleteAffectedService = (idx: number) => {
    if (!formData) return;
    const list = ((formData as any).affectedServices || []).filter((_: any, i: number) => i !== idx);
    setFormData({ ...formData, affectedServices: list } as any);
  };

  const handleAffectedServiceChange = (index: number, field: string, value: string) => {
    if (!formData) return;
    const list = [...((formData as any).affectedServices || [])];
    if (field === 'affectationType') {
      list[index] = { ...list[index], affectationType: value, status: getIconForAffectation(value) };
    } else if (field === 'nameService') {
      const s = availableServices.find(item => item.name?.trim() === value.trim());
      list[index] = { ...list[index], nameService: value, code: s ? (s.code || s.id?.toString() || '') : list[index].code };
    } else if (field === 'startTime' || field === 'endTime') {
      list[index] = { ...list[index], [field]: formatDateTimeIfNeeded(value) };
    } else {
      list[index] = { ...list[index], [field]: value };
    }
    setFormData({ ...formData, affectedServices: list } as any);
  };

  const handleAddComment = () => {
    if (!formData) return;
    setFormData({ ...formData, comments: [...formData.comments, { sequence: formData.comments.length + 1, content: '' }] });
  };

  const handleDeleteComment = (idx: number) => {
    if (!formData) return;
    const comments = formData.comments.filter((_, i) => i !== idx).map((c, i) => ({ ...c, sequence: i + 1 }));
    setFormData({ ...formData, comments });
  };

  const handleCommentChange = (idx: number, text: string) => {
    if (!formData) return;
    const comments = [...formData.comments];
    comments[idx] = { ...comments[idx], content: text };
    setFormData({ ...formData, comments });
  };

  return (
    <div style={{ width: '100vw', maxWidth: '100%', height: 'calc(100vh - 70px)', display: 'flex', gap: '15px', padding: '15px', boxSizing: 'border-box', backgroundColor: '#f1f5f9', position: 'relative' }}>
      
      <IncidentSidebarLeft 
        incidents={filterType === 'templates' ? templates : incidents}
        selectedIncident={selectedIncident}
        isCreating={isCreating}
        loading={loading}
        filterType={filterType}
        onSelectIncident={(inc) => { setSelectedIncident(inc); setIsCreating(false); }}
        onStartCreate={() => handleStartCreate()}
        onFilterChange={setFilterType}
      />

      <div style={{ flex: 1, backgroundColor: '#ffffff', borderRadius: '8px', padding: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', overflowY: 'auto' }}>
        {formData ? (
          <IncidentFormContent 
            formData={formData}
            isCreating={isCreating}
            filterType={filterType}
            isSaving={isSaving}
            errors={errors}
            availableServices={availableServices}
            dropdownTemplates={dropdownTemplates}
            setFormData={setFormData}
            normalizeText={normalizeText}
            handleAddAffectedService={handleAddAffectedService}
            handleDeleteAffectedService={handleDeleteAffectedService}
            handleAffectedServiceChange={handleAffectedServiceChange}
            handleAddComment={handleAddComment}
            handleDeleteComment={handleDeleteComment}
            handleCommentChange={handleCommentChange}
            onSaveClick={onSaveClick}
            onCloseClick={onCloseClick}
            handleUpdateTemplate={handleUpdateTemplate}
            handleStartOpenIncident={handleStartOpenIncident}
            handleSaveAsTemplate={handleSaveAsTemplate}
            handleDeleteTemplate={handleDeleteTemplate}
            onCancelCreate={() => { setIsCreating(false); setErrors({}); if (incidents.length > 0) setSelectedIncident(incidents[0]); }}
          />
        ) : (
          <p style={{ color: '#64748b' }}>Selecciona una notificación de la izquierda o haz clic en "+ Nuevo".</p>
        )}
      </div>

      <IncidentSidebarRight 
        hasFormData={!!formData}
        onCopyTemplate={onCopyClick}
        onApplyFirstStartTime={handleApplyFirstStartTime}
        onApplyFirstEndTime={handleApplyFirstEndTime}
        onApplyFirstAffectationType={handleApplyFirstAffectationType}
        onSetCurrentStartTimeFirst={handleSetCurrentStartTimeFirstService}
        onSetCurrentEndTimeFirst={handleSetCurrentEndTimeFirstService}
      />

      {toast && (
        <div style={{ position: 'fixed', bottom: '25px', right: '25px', backgroundColor: toast.type === 'success' ? '#10b981' : '#ef4444', color: '#ffffff', padding: '12px 20px', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', fontSize: '14px', fontWeight: '500', zIndex: 9999, display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span>{toast.type === 'success' ? '✔' : '✖'}</span>
          <span>{toast.message}</span>
        </div>
      )}
    </div>
  );
}