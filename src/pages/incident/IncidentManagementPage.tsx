import { useIncidentList } from "../../hooks/useIncidentList";
import { useIncidentForm } from "../../hooks/useIncidentForm";
import { formatDateTimeIfNeeded, getIconForAffectation } from "../../utils/incidentHelpers";
import { IncidentSidebarLeft } from "./components/IncidentSidebarLeft";
import { IncidentSidebarRight } from "./components/IncidentSidebarRight";
import { AffectedServicesTable } from "./components/AffectedServicesTable";

export default function IncidentManagementPage() {
  const {
    incidents,
    selectedIncident,
    loading,
    filterType,
    setFilterType,
    setSelectedIncident,
    refreshCurrentList,
  } = useIncidentList();

  const {
    isCreating,
    availableServices,
    formData,
    errors,
    setIsCreating,
    setFormData,
    setErrors,
    handleStartCreate,
    handleSaveAction,
    handleCloseIncident,
    handleCopyTemplate,
    handleApplyFirstStartTime,
    handleApplyFirstEndTime,
    handleApplyFirstAffectationType,
    handleSetCurrentStartTimeFirstService,
    handleSetCurrentEndTimeFirstService,
  } = useIncidentForm(selectedIncident, refreshCurrentList);

  // Funciones de manipulación de tablas y comentarios que alimentan el form...
  const handleAddAffectedService = () => {
    if (!formData) return;
    const newServiceRow = { status: '✅', code: '', nameService: '', affectationType: 'OK', startTime: '', endTime: '' };
    setFormData({ ...formData, affectedServices: [...((formData as any).affectedServices || []), newServiceRow] } as any);
  };

  const handleDeleteAffectedService = (indexToDelete: number) => {
    if (!formData) return;
    const updatedList = ((formData as any).affectedServices || []).filter((_: any, index: number) => index !== indexToDelete);
    setFormData({ ...formData, affectedServices: updatedList } as any);
  };

  const handleAffectedServiceChange = (index: number, field: string, value: string) => {
    if (!formData) return;
    const currentList = [...((formData as any).affectedServices || [])];
    
    if (field === 'affectationType') {
      currentList[index] = { ...currentList[index], affectationType: value, status: getIconForAffectation(value) };
    } else if (field === 'nameService') {
      const matchedService = availableServices.find(s => s.name?.trim() === value.trim());
      currentList[index] = { 
        ...currentList[index], 
        nameService: value,
        code: matchedService ? (matchedService.code || matchedService.id?.toString() || '') : currentList[index].code
      };
    } else if (field === 'startTime' || field === 'endTime') {
      currentList[index] = { ...currentList[index], [field]: formatDateTimeIfNeeded(value) };
    } else {
      currentList[index] = { ...currentList[index], [field]: value };
    }

    setFormData({ ...formData, affectedServices: currentList } as any);
  };

  const handleAddComment = () => {
    if (!formData) return;
    setFormData({ ...formData, comments: [...formData.comments, { sequence: formData.comments.length + 1, content: '' }] });
  };

  const handleDeleteComment = (indexToDelete: number) => {
    if (!formData) return;
    const updatedComments = formData.comments.filter((_, index) => index !== indexToDelete).map((c, i) => ({ ...c, sequence: i + 1 }));
    setFormData({ ...formData, comments: updatedComments });
  };

  const handleCommentChange = (index: number, text: string) => {
    if (!formData) return;
    const updatedComments = [...formData.comments];
    updatedComments[index] = { ...updatedComments[index], content: text };
    setFormData({ ...formData, comments: updatedComments });
  };

  return (
    <div style={{ width: '100vw', maxWidth: '100%', height: 'calc(100vh - 70px)', display: 'flex', gap: '15px', padding: '15px', boxSizing: 'border-box', backgroundColor: '#f1f5f9' }}>
      
      <IncidentSidebarLeft 
        incidents={incidents}
        selectedIncident={selectedIncident}
        isCreating={isCreating}
        loading={loading}
        filterType={filterType}
        onSelectIncident={(inc) => { setSelectedIncident(inc); setIsCreating(false); }}
        onStartCreate={handleStartCreate}
        onFilterChange={setFilterType}
      />

      <div style={{ flex: 1, backgroundColor: '#ffffff', borderRadius: '8px', padding: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', overflowY: 'auto' }}>
        {formData ? (
          <div>
            <h2 style={{ margin: '0 0 15px 0', fontSize: '20px', borderBottom: '2px solid #e2e8f0', paddingBottom: '10px' }}>
              {isCreating ? 'Crear Nuevo Incidente' : 'Editar Incidente'}
            </h2>

            {Object.keys(errors).length > 0 && (
              <div style={{ backgroundColor: '#ffeeec', border: '1px solid #ef4444', padding: '10px 14px', borderRadius: '6px', marginBottom: '15px', color: '#b91c1c', fontSize: '13px' }}>
                <strong>Por favor corrige los siguientes errores:</strong>
                <ul style={{ margin: '5px 0 0 20px', padding: 0 }}>
                  {Object.values(errors).map((err, idx) => (<li key={idx}>{err}</li>))}
                </ul>
              </div>
            )}

            <AffectedServicesTable 
              affectedServices={(formData as any).affectedServices || []}
              availableServices={availableServices}
              hasError={!!errors.services}
              errorMessage={errors.services}
              onAddService={handleAddAffectedService}
              onDeleteService={handleDeleteAffectedService}
              onServiceChange={handleAffectedServiceChange}
            />

            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
              <tbody>
                <tr>
                  <td style={{ paddingBottom: '12px' }}>
                    <strong>Nombre: *</strong><br />
                    <input type="text" value={formData.name || ''} onChange={(e) => setFormData({...formData, name: e.target.value})} style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }} />
                  </td>
                </tr>
                <tr>
                  <td style={{ paddingBottom: '12px' }}>
                    <strong>Impacto: *</strong><br />
                    <input type="text" value={formData.impact || ''} onChange={(e) => setFormData({...formData, impact: e.target.value})} style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }} />
                  </td>
                </tr>
                <tr>
                  <td style={{ paddingBottom: '12px' }}>
                    <strong>Funcionalidades Ok: *</strong><br />
                    <input type="text" value={(formData as any).functionality || ''} onChange={(e) => setFormData({...formData, functionality: e.target.value} as any)} style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }} />
                  </td>
                </tr>
                <tr>
                  <td style={{ paddingBottom: '12px' }}>
                    <strong>Componentes Afectados: *</strong><br />
                    <input type="text" value={(formData as any).affectedComponent || ''} onChange={(e) => setFormData({...formData, affectedComponent: e.target.value} as any)} style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }} />
                  </td>
                </tr>
                <tr>
                  <td style={{ paddingBottom: '12px' }}>
                    <strong>Jira:</strong><br />
                    <input type="text" value={formData?.jira ?? ''} onChange={(e) => setFormData(formData ? { ...formData, jira: e.target.value } : null)} style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }} />
                  </td>
                </tr>
                <tr>
                  <td style={{ paddingBottom: '12px' }}>
                    <strong>Caso Aliado:</strong><br />
                    <input type="text" value={formData?.partnerCase ?? ''} onChange={(e) => setFormData(formData ? { ...formData, partnerCase: e.target.value } : null)} style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }} />
                  </td>
                </tr>
              </tbody>
            </table>

            <div style={{ fontSize: '14px', marginTop: '15px' }}>
              <div style={{ marginBottom: '12px' }}>
                <strong>Descripción de la falla: *</strong><br />
                <textarea value={formData.description || ''} onChange={(e) => setFormData({...formData, description: e.target.value})} rows={3} style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }} />
              </div>

              <div style={{ margin: '15px 0', borderTop: '1px dashed #e2e8f0', paddingTop: '15px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <strong>Avances:</strong>
                  <button type="button" onClick={handleAddComment} style={{ backgroundColor: '#2563eb', color: 'white', border: 'none', borderRadius: '4px', width: '26px', height: '26px', cursor: 'pointer' }}>+</button>
                </div>
                {(!formData.comments || formData.comments.length === 0) ? (
                  <p style={{ fontSize: '13px', color: '#64748b', fontStyle: 'italic' }}>No hay avances registrados.</p>
                ) : (
                  formData.comments.map((comment, index) => (
                    <div key={index} style={{ backgroundColor: '#f8fafc', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0', margin: '8px 0' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                        <span style={{ fontSize: '13px', fontWeight: 'bold' }}>Avance {index + 1}:</span>
                        <button type="button" onClick={() => handleDeleteComment(index)} style={{ backgroundColor: '#ef4444', color: 'white', border: 'none', borderRadius: '4px', width: '22px', height: '22px' }}>-</button>
                      </div>
                      <textarea value={comment.content || ''} onChange={(e) => handleCommentChange(index, e.target.value)} rows={2} style={{ width: '100%', padding: '6px', boxSizing: 'border-box' }} />
                    </div>
                  ))
                )}
              </div>

              <div style={{ marginBottom: '15px', borderTop: '1px dashed #e2e8f0', paddingTop: '15px' }}>
                <strong>Solución: *</strong><br />
                <textarea value={formData.resolution || ''} onChange={(e) => setFormData({...formData, resolution: e.target.value})} rows={3} style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }} />
              </div>
            </div>

            <div style={{ marginTop: '25px', display: 'flex', gap: '10px', borderTop: '1px solid #e2e8f0', paddingTop: '20px' }}>
              <button onClick={handleSaveAction} style={{ backgroundColor: '#10b981', color: 'white', padding: '8px 16px', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 600 }}>
                {isCreating ? 'Guardar Nuevo Incidente' : 'Guardar Cambios'}
              </button>
              {isCreating ? (
                <button onClick={() => { setIsCreating(false); setErrors({}); if (incidents.length > 0) setSelectedIncident(incidents[0]); }} style={{ padding: '8px 16px', border: '1px solid #e2e8f0', background: 'transparent', borderRadius: '6px', cursor: 'pointer' }}>
                  Cancelar
                </button>
              ) : (
                <button onClick={handleCloseIncident} style={{ padding: '8px 16px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 600 }}>
                  Cerrar Incidente
                </button>
              )}
            </div>
          </div>
        ) : (
          <p style={{ color: '#64748b' }}>Selecciona una notificación de la izquierda o haz clic en "+ Nuevo".</p>
        )}
      </div>

      <IncidentSidebarRight 
        hasFormData={!!formData}
        onCopyTemplate={handleCopyTemplate}
        onApplyFirstStartTime={handleApplyFirstStartTime}
        onApplyFirstEndTime={handleApplyFirstEndTime}
        onApplyFirstAffectationType={handleApplyFirstAffectationType}
        onSetCurrentStartTimeFirst={handleSetCurrentStartTimeFirstService}
        onSetCurrentEndTimeFirst={handleSetCurrentEndTimeFirstService}
      />

    </div>
  );
}