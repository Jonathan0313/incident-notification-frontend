import React, { useRef, useState } from 'react';
import { AffectedServicesTable } from './AffectedServicesTable';

export function IncidentFormContent({
  formData,
  setFormData,
  affectedServices,
  availableServices,
  isCreating,
  templates,
  filterType,
  onAddService,
  onDeleteService,
  onServiceChange,
  onSubmit,
  onCloseIncident,
  onSaveAsTemplate,
  onCancelCreation,
  onCreateNotification,
  tableError,
  setTableError,
  showToast,
}: any) {
  const tableContainerRef = useRef<HTMLDivElement>(null);
  const isTemplateView = filterType === 'templates';

  // Estado para controlar el modal personalizado de confirmación
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState<boolean>(false);

  // Helper para buscar plantillas según el tipo
  const getTemplatesByType = (types: string[]) => {
    return templates.filter((t: any) => {
      const val = (t.typeTemplate || t.type || t.Tipo || '').trim().toLowerCase();
      return types.includes(val);
    });
  };

  const impactTemplates = getTemplatesByType(['impacto', 'impact', 'impactousuarios']);
  const descriptionTemplates = getTemplatesByType(['descripción', 'descripcion', 'description']);
  const advanceTemplates = getTemplatesByType(['avance', 'avances', 'advance', 'comments']);
  const solutionTemplates = getTemplatesByType(['solución', 'solucion', 'solution']);

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!isTemplateView) {
      if (!affectedServices || affectedServices.length === 0) {
        if (setTableError) setTableError(true);
        if (showToast) showToast('error', 'Debe agregar al menos un servicio afectado.');
        if (tableContainerRef.current) {
          tableContainerRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
        return;
      }

      const isValidServices = affectedServices.every(
        (service: any) =>
          service.nameService &&
          service.nameService.trim() !== '' &&
          service.nameService !== '-- Seleccione --' &&
          service.startTime &&
          service.startTime.trim() !== ''
      );

      if (!isValidServices) {
        if (setTableError) setTableError(true);
        if (showToast) showToast('error', 'Debe seleccionar un servicio válido y su fecha de inicio en todas las filas agregadas.');
        if (tableContainerRef.current) {
          tableContainerRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
        return;
      }
    }

    if (setTableError) setTableError(false);
    onSubmit(e);
  };

  const isClosed = formData.status?.toUpperCase() === 'CLOSED';
  const isTemplateNameDisabled = !isCreating && isTemplateView;

  // Lógica real que se ejecuta tras confirmar en el modal personalizado
  const executeDeleteOrClose = () => {
    if (onCloseIncident) {
      onCloseIncident(formData.comments);
    }
    setIsConfirmModalOpen(false);
  };

  return (
    <div style={{ backgroundColor: '#fff', padding: '24px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', flex: 1, overflowY: 'auto' }}>
      <h2 style={{ marginTop: 0, fontSize: '18px', borderBottom: '1px solid #e2e8f0', paddingBottom: '12px' }}>
        {isCreating
          ? isTemplateView
            ? 'Crear Nueva Plantilla'
            : 'Crear Nuevo Incidente'
          : isClosed
            ? 'Incidente Cerrado (Editar)'
            : isTemplateView
              ? 'Editar Plantilla'
              : 'Editar Incidente'}
      </h2>

      <form onSubmit={handleFormSubmit} noValidate style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '16px' }}>
        
        {/* Tabla de Servicios Afectados */}
        <div
          ref={tableContainerRef}
          style={{
            border: tableError ? '2px solid #ef4444' : '1px solid transparent',
            borderRadius: '8px',
            padding: tableError ? '8px' : '0',
            backgroundColor: tableError ? '#fef2f2' : 'transparent',
            transition: 'all 0.2s ease',
          }}
        >
          <AffectedServicesTable
            affectedServices={affectedServices}
            availableServices={availableServices}
            filterType={filterType}
            hasError={tableError}
            errorMessage={tableError ? 'Debe agregar y seleccionar un servicio válido junto con su fecha de inicio.' : undefined}
            onAddService={onAddService}
            onDeleteService={onDeleteService}
            onServiceChange={onServiceChange}
          />
          {tableError && (
            <span style={{ color: '#ef4444', fontSize: '12px', fontWeight: '500', marginTop: '4px', display: 'block' }}>
              ⚠️ Este campo es obligatorio y requiere al menos un servicio válido.
            </span>
          )}
        </div>

        {/* Nombre */}
        <div>
          <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', marginBottom: '4px' }}>Nombre: *</label>
          <input
            type="text"
            required={!isTemplateView}
            value={formData.name || ''}
            disabled={isTemplateNameDisabled}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            style={{
              width: '100%',
              padding: '8px',
              borderRadius: '6px',
              border: '1px solid #cbd5e1',
              boxSizing: 'border-box',
              backgroundColor: isTemplateNameDisabled ? '#f1f5f9' : '#fff',
              cursor: isTemplateNameDisabled ? 'not-allowed' : 'text',
              color: isTemplateNameDisabled ? '#64748b' : '#0f172a',
            }}
          />
        </div>

        {/* Impacto */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
            <label style={{ fontSize: '13px', fontWeight: 'bold' }}>Impacto: *</label>
            <select
              onChange={(e) => {
                const templateName = e.target.value;
                if (templateName) {
                  const selectedObj = impactTemplates.find((t: any) => t.name === templateName);
                  const textToFill = selectedObj?.messageTemplate || selectedObj?.description || selectedObj?.content || selectedObj?.text || templateName;
                  setFormData({ ...formData, impact: textToFill });
                  e.target.value = '';
                }
              }}
              style={{ fontSize: '11px', padding: '4px 8px', borderRadius: '4px', border: '1px solid #cbd5e1', backgroundColor: '#fff', cursor: 'pointer' }}
            >
              <option value="">📄 Cargar plantilla...</option>
              {impactTemplates.map((t: any, idx: number) => (
                <option key={t.id || idx} value={t.name}>{t.name}</option>
              ))}
            </select>
          </div>
          <input
            type="text"
            required={!isTemplateView}
            value={formData.impact || ''}
            onChange={(e) => setFormData({ ...formData, impact: e.target.value })}
            style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }}
          />
        </div>

        {/* Componentes Afectados */}
        <div>
          <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', marginBottom: '4px' }}>Componentes Afectados: *</label>
          <input
            type="text"
            required={!isTemplateView}
            value={formData.affectedComponent || 'En investigación'}
            onChange={(e) => setFormData({ ...formData, affectedComponent: e.target.value })}
            style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }}
          />
        </div>

        {/* Jira */}
        <div>
          <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', marginBottom: '4px' }}>Jira:</label>
          <input
            type="text"
            value={formData.jira || ''}
            onChange={(e) => setFormData({ ...formData, jira: e.target.value })}
            style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }}
          />
        </div>

        {/* Caso Aliado */}
        <div>
          <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', marginBottom: '4px' }}>Caso Aliado:</label>
          <input
            type="text"
            value={formData.aliasedCase || ''}
            onChange={(e) => setFormData({ ...formData, aliasedCase: e.target.value })}
            style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }}
          />
        </div>

        {/* Descripción de la falla */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
            <label style={{ fontSize: '13px', fontWeight: 'bold' }}>Descripción de la falla: *</label>
            <select
              onChange={(e) => {
                const templateName = e.target.value;
                if (templateName) {
                  const selectedObj = descriptionTemplates.find((t: any) => t.name === templateName);
                  const textToFill = selectedObj?.messageTemplate || selectedObj?.description || selectedObj?.content || selectedObj?.text || templateName;
                  setFormData({ ...formData, description: textToFill });
                  e.target.value = '';
                }
              }}
              style={{ fontSize: '11px', padding: '4px 8px', borderRadius: '4px', border: '1px solid #cbd5e1', backgroundColor: '#fff', cursor: 'pointer' }}
            >
              <option value="">📄 Cargar plantilla...</option>
              {descriptionTemplates.map((t: any, idx: number) => (
                <option key={t.id || idx} value={t.name}>{t.name}</option>
              ))}
            </select>
          </div>
          <textarea
            rows={4}
            required={!isTemplateView}
            value={formData.description || ''}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box', resize: 'vertical' }}
          />
        </div>

        {/* Sección de Avances */}
        <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <label style={{ fontSize: '14px', fontWeight: 'bold', margin: 0 }}>Avances:</label>
            <button
              type="button"
              onClick={() => {
                const currentComments = formData.comments || [];
                setFormData({
                  ...formData,
                  comments: [...currentComments, { sequence: currentComments.length + 1, content: '' }],
                });
              }}
              style={{ backgroundColor: '#2563eb', color: 'white', border: 'none', borderRadius: '6px', width: '32px', height: '32px', cursor: 'pointer', fontWeight: 'bold', fontSize: '16px' }}
            >
              +
            </button>
          </div>

          {(!formData.comments || formData.comments.length === 0) ? (
            <p style={{ fontSize: '13px', color: '#64748b', fontStyle: 'italic', margin: 0 }}>No hay avances registrados.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {formData.comments.map((comm: any, index: number) => (
                <div key={index} style={{ backgroundColor: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '8px', padding: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '13px', fontWeight: 'bold', color: '#1e293b' }}>
                      Avance {index + 1}:
                    </span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <select
                        onChange={(e) => {
                          const templateName = e.target.value;
                          if (templateName) {
                            const selectedObj = advanceTemplates.find((t: any) => t.name === templateName);
                            const textToFill = selectedObj?.messageTemplate || selectedObj?.description || selectedObj?.content || selectedObj?.text || templateName;

                            const updatedComments = [...(formData.comments || [])];
                            updatedComments[index] = {
                              ...updatedComments[index],
                              sequence: index + 1,
                              content: textToFill,
                              message: textToFill,
                            };
                            setFormData({ ...formData, comments: updatedComments });
                            e.target.value = '';
                          }
                        }}
                        style={{ fontSize: '12px', padding: '4px 8px', borderRadius: '4px', border: '1px solid #cbd5e1', backgroundColor: '#fff', cursor: 'pointer' }}
                      >
                        <option value="">📄 Cargar plantilla...</option>
                        {advanceTemplates.map((t: any, idx: number) => (
                          <option key={t.id || idx} value={t.name}>{t.name}</option>
                        ))}
                      </select>
                      <button
                        type="button"
                        onClick={() => {
                          const updated = (formData.comments || [])
                            .filter((_: any, i: number) => i !== index)
                            .map((item: any, i: number) => ({ ...item, sequence: i + 1 }));
                          setFormData({ ...formData, comments: updated });
                        }}
                        style={{ backgroundColor: '#ef4444', color: 'white', border: 'none', borderRadius: '4px', width: '26px', height: '26px', cursor: 'pointer', fontWeight: 'bold' }}
                      >
                        -
                      </button>
                    </div>
                  </div>

                  <textarea
                    rows={3}
                    value={comm.content || comm.message || comm.text || ''}
                    onChange={(e) => {
                      const updated = [...(formData.comments || [])];
                      updated[index] = {
                        ...updated[index],
                        sequence: index + 1,
                        content: e.target.value,
                        message: e.target.value,
                      };
                      setFormData({ ...formData, comments: updated });
                    }}
                    style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px', boxSizing: 'border-box', resize: 'vertical' }}
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Solución */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
            <label style={{ fontSize: '13px', fontWeight: 'bold' }}>Solución: *</label>
            <select
              onChange={(e) => {
                const templateName = e.target.value;
                if (templateName) {
                  const selectedObj = solutionTemplates.find((t: any) => t.name === templateName);
                  const textToFill = selectedObj?.messageTemplate || selectedObj?.description || selectedObj?.content || selectedObj?.text || templateName;
                  setFormData({ ...formData, solution: textToFill });
                  e.target.value = '';
                }
              }}
              style={{ fontSize: '11px', padding: '4px 8px', borderRadius: '4px', border: '1px solid #cbd5e1', backgroundColor: '#fff', cursor: 'pointer' }}
            >
              <option value="">📄 Cargar plantilla...</option>
              {solutionTemplates.map((t: any, idx: number) => (
                <option key={t.id || idx} value={t.name}>{t.name}</option>
              ))}
            </select>
          </div>
          <textarea
            rows={4}
            value={formData.solution || ''}
            onChange={(e) => setFormData({ ...formData, solution: e.target.value })}
            style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box', resize: 'vertical' }}
          />
        </div>

        {/* Botones de Acción */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '15px', borderTop: '1px solid #e2e8f0', paddingTop: '15px' }}>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              type="submit"
              style={{ backgroundColor: '#10b981', color: 'white', border: 'none', padding: '10px 18px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '13px' }}
            >
              {isCreating
                ? isTemplateView
                  ? 'Guardar Nueva Plantilla'
                  : 'Guardar Nuevo Incidente'
                : 'Guardar Cambios'}
            </button>

            {onCreateNotification && isTemplateView && !isCreating && (
              <button
                type="button"
                onClick={onCreateNotification}
                style={{ backgroundColor: '#0284c7', color: 'white', border: 'none', padding: '10px 18px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '13px' }}
              >
                🚀 Crear Incidente
              </button>
            )}

            {onSaveAsTemplate && !isTemplateView && (
              <button
                type="button"
                onClick={onSaveAsTemplate}
                style={{ backgroundColor: '#8b5cf6', color: 'white', border: 'none', padding: '10px 18px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '13px' }}
              >
                💾 Guardar como Plantilla
              </button>
            )}
          </div>

          <div>
            {isCreating ? (
              onCancelCreation && (
                <button
                  type="button"
                  onClick={onCancelCreation}
                  style={{ backgroundColor: 'white', color: '#1e293b', border: '1px solid #cbd5e1', padding: '10px 18px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '13px' }}
                >
                  Cancelar
                </button>
              )
            ) : (
              !isClosed && onCloseIncident && (
              <button
                type="button"
                onClick={() => {
                  if (isTemplateView) {
                    setIsConfirmModalOpen(true);
                  } else {
                    onCloseIncident(formData.comments);
                  }
                }}
                style={{ backgroundColor: '#ef4444', color: 'white', border: 'none', padding: '10px 18px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '13px' }}
              >
                {isTemplateView ? 'Eliminar plantilla' : 'Cerrar Incidente'}
              </button>
              )
            )}
          </div>
        </div>

      </form>

      {/* Modal de Confirmación Personalizado */}
      {isConfirmModalOpen && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: 'white', padding: '24px', borderRadius: '8px', width: '100%', maxWidth: '400px', boxShadow: '0 10px 25px rgba(0,0,0,0.15)' }}>
            <h3 style={{ margin: '0 0 10px 0', fontSize: '18px', color: '#1f2937' }}>
              ⚠️ Confirmar {isTemplateView ? 'Eliminación' : 'Cierre'}
            </h3>
            <p style={{ margin: '0 0 20px 0', fontSize: '14px', color: '#4b5563', lineHeight: '1.5' }}>
              ¿Estás seguro de que deseas {isTemplateView ? 'eliminar esta plantilla' : 'cerrar este incidente'}? Esta acción no se puede deshacer.
            </p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button
                type="button"
                onClick={() => setIsConfirmModalOpen(false)}
                style={{ padding: '8px 16px', backgroundColor: '#f3f4f6', color: '#374151', border: '1px solid #d1d5db', borderRadius: '4px', cursor: 'pointer', fontWeight: '500' }}
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={executeDeleteOrClose}
                style={{ padding: '8px 16px', backgroundColor: '#dc2626', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: '500' }}
              >
                {isTemplateView ? 'Eliminar' : 'Cerrar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}