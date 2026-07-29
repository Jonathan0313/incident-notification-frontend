import React from 'react';
import { AffectedServicesTable } from './AffectedServicesTable';

interface IncidentFormContentProps {
  formData: any;
  isCreating: boolean;
  filterType: string;
  isSaving: boolean;
  errors: Record<string, string>;
  availableServices: any[];
  dropdownTemplates: any[];
  setFormData: (data: any) => void;
  normalizeText: (str: string) => void;
  // Handlers de servicios
  handleAddAffectedService: () => void;
  handleDeleteAffectedService: (index: number) => void;
  handleAffectedServiceChange: (index: number, field: string, value: string) => void;
  // Handlers de comentarios
  handleAddComment: () => void;
  handleDeleteComment: (index: number) => void;
  handleCommentChange: (index: number, text: string) => void;
  // Handlers de botones principales
  onSaveClick: () => void;
  onCloseClick: () => void;
  handleUpdateTemplate: () => void;
  handleStartOpenIncident: () => void;
  handleSaveAsTemplate: () => void;
  handleDeleteTemplate: () => void;
  onCancelCreate: () => void;
}

export const IncidentFormContent: React.FC<IncidentFormContentProps> = ({
  formData,
  isCreating,
  filterType,
  isSaving,
  errors,
  availableServices,
  dropdownTemplates,
  setFormData,
  normalizeText,
  handleAddAffectedService,
  handleDeleteAffectedService,
  handleAffectedServiceChange,
  handleAddComment,
  handleDeleteComment,
  handleCommentChange,
  onSaveClick,
  onCloseClick,
  handleUpdateTemplate,
  handleStartOpenIncident,
  handleSaveAsTemplate,
  handleDeleteTemplate,
  onCancelCreate,
}) => {
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #e2e8f0', paddingBottom: '10px', marginBottom: '15px' }}>
        <h2 style={{ margin: 0, fontSize: '20px' }}>
          {isCreating ? 'Crear Nuevo Incidente' : (filterType === 'templates' ? 'Editar Plantilla' : 'Editar Incidente')}
        </h2>
        {isSaving && filterType !== 'templates' && (
          <span style={{ fontSize: '12px', color: '#64748b', fontStyle: 'italic' }}>
            Autoguardando cambios... 🔄
          </span>
        )}
      </div>

      {Object.keys(errors).length > 0 && (
        <div style={{ backgroundColor: '#ffeeec', border: '1px solid #ef4444', padding: '10px 14px', borderRadius: '6px', marginBottom: '15px', color: '#b91c1c', fontSize: '13px' }}>
          <strong>Por favor corrige los siguientes errores:</strong>
          <ul style={{ margin: '5px 0 0 20px', padding: 0 }}>
            {Object.values(errors).map((err, idx) => (<li key={idx}>{err}</li>))}
          </ul>
        </div>
      )}

      <AffectedServicesTable 
        affectedServices={formData.affectedServices || []}
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
              <strong>Componentes Afectados: *</strong><br />
              <input type="text" value={formData.affectedComponent || ''} onChange={(e) => setFormData({...formData, affectedComponent: e.target.value})} style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }} />
            </td>
          </tr>
          <tr>
            <td style={{ paddingBottom: '12px' }}>
              <strong>Jira:</strong><br />
              <input type="text" value={formData?.jira ?? ''} onChange={(e) => setFormData({ ...formData, jira: e.target.value })} style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }} />
            </td>
          </tr>
          <tr>
            <td style={{ paddingBottom: '12px' }}>
              <strong>Caso Aliado:</strong><br />
              <input type="text" value={formData?.partnerCase ?? ''} onChange={(e) => setFormData({ ...formData, partnerCase: e.target.value })} style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }} />
            </td>
          </tr>
        </tbody>
      </table>

      <div style={{ fontSize: '14px', marginTop: '15px' }}>
        <div style={{ marginBottom: '12px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
            <strong>Descripción de la falla: *</strong>
            <select
              onChange={(e) => {
                const val = e.target.value;
                if (!val) return;
                setFormData({ ...formData, description: val });
                e.target.value = '';
              }}
              style={{ fontSize: '12px', padding: '3px 6px', borderRadius: '4px', border: '1px solid #cbd5e1', backgroundColor: '#f8fafc', cursor: 'pointer' }}
            >
              <option value="">📋 Cargar plantilla en Descripción...</option>
              {dropdownTemplates
                .filter((t: any) => {
                  const type = normalizeText(t.typeTemplate);
                  return type.includes('desc') || type.includes('falla');
                })
                .map((t: any, idx: number) => (
                  <option key={idx} value={t.messageTemplate || ''}>{t.name}</option>
                ))}
            </select>
          </div>
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
            formData.comments.map((comment: any, index: number) => (
              <div key={index} style={{ backgroundColor: '#f8fafc', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0', margin: '8px 0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <span style={{ fontSize: '13px', fontWeight: 'bold' }}>Avance {index + 1}:</span>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <select
                      onChange={(e) => {
                        const val = e.target.value;
                        if (!val) return;
                        handleCommentChange(index, val);
                        e.target.value = '';
                      }}
                      style={{ fontSize: '11px', padding: '2px 4px', borderRadius: '4px', border: '1px solid #cbd5e1', backgroundColor: '#ffffff', cursor: 'pointer' }}
                    >
                      <option value="">📋 Plantilla...</option>
                      {dropdownTemplates
                        .filter((t: any) => {
                          const type = normalizeText(t.typeTemplate);
                          return type.includes('avan') || type.includes('seg');
                        })
                        .map((t: any, tIdx: number) => (
                          <option key={tIdx} value={t.messageTemplate || ''}>{t.name}</option>
                        ))}
                    </select>
                    <button type="button" onClick={() => handleDeleteComment(index)} style={{ backgroundColor: '#ef4444', color: 'white', border: 'none', borderRadius: '4px', width: '22px', height: '22px' }}>-</button>
                  </div>
                </div>
                <textarea value={comment.content || ''} onChange={(e) => handleCommentChange(index, e.target.value)} rows={2} style={{ width: '100%', padding: '6px', boxSizing: 'border-box' }} />
              </div>
            ))
          )}
        </div>

        <div style={{ marginBottom: '15px', borderTop: '1px dashed #e2e8f0', paddingTop: '15px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
            <strong>Solución: *</strong>
            <select
              onChange={(e) => {
                const val = e.target.value;
                if (!val) return;
                setFormData({ ...formData, resolution: val });
                e.target.value = '';
              }}
              style={{ fontSize: '12px', padding: '3px 6px', borderRadius: '4px', border: '1px solid #cbd5e1', backgroundColor: '#f8fafc', cursor: 'pointer' }}
            >
              <option value="">📋 Cargar plantilla en Solución...</option>
              {dropdownTemplates
                .filter((t: any) => {
                  const type = normalizeText(t.typeTemplate);
                  return type.includes('sol') || type.includes('cier');
                })
                .map((t: any, idx: number) => (
                  <option key={idx} value={t.messageTemplate || ''}>{t.name}</option>
                ))}
            </select>
          </div>
          <textarea value={formData.resolution || ''} onChange={(e) => setFormData({...formData, resolution: e.target.value})} rows={3} style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }} />
        </div>
      </div>

      <div style={{ marginTop: '25px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #e2e8f0', paddingTop: '20px' }}>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          {filterType === 'templates' ? (
            <>
              <button onClick={handleUpdateTemplate} style={{ backgroundColor: '#2563eb', color: 'white', padding: '8px 16px', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 600 }}>
                Actualizar Plantilla
              </button>
              {!isCreating && (
                <button onClick={handleStartOpenIncident} style={{ backgroundColor: '#0ea5e9', color: 'white', padding: '8px 16px', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 600 }}>
                  🚀 Crear Incidente
                </button>
              )}
            </>
          ) : (
            <button onClick={onSaveClick} style={{ backgroundColor: '#10b981', color: 'white', padding: '8px 16px', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 600 }}>
              {isCreating ? 'Guardar Nuevo Incidente' : 'Guardar Cambios'}
            </button>
          )}
          
          {filterType !== 'templates' && (
            <button onClick={handleSaveAsTemplate} style={{ backgroundColor: '#8b5cf6', color: 'white', padding: '8px 16px', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 600 }}>
              💾 Guardar como Plantilla
            </button>
          )}
        </div>

        {isCreating ? (
          <button onClick={onCancelCreate} style={{ padding: '8px 16px', border: '1px solid #e2e8f0', background: 'transparent', borderRadius: '6px', cursor: 'pointer' }}>
            Cancelar
          </button>
        ) : filterType === 'templates' ? (
          <button onClick={handleDeleteTemplate} style={{ padding: '8px 16px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 600 }}>
            Eliminar Plantilla 🗑️
          </button>
        ) : (
          <button onClick={onCloseClick} style={{ padding: '8px 16px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 600 }}>
            Cerrar Incidente
          </button>
        )}
      </div>
    </div>
  );
};