import { AffectedServicesTable } from './AffectedServicesTable';
import React, { useRef } from 'react';

interface IncidentFormContentProps {
  formData: any;
  setFormData: (data: any) => void;
  affectedServices: any[];
  availableServices: any[];
  isCreating: boolean;
  templates: any[];
  filterType?: string; // <-- Añadido para saber si estamos en plantillas
  onAddService: () => void;
  onDeleteService: (index: number) => void;
  onServiceChange: (index: number, field: string, value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  onCloseIncident?: (currentComments?: any[]) => void;
  onSaveAsTemplate?: () => void;
  onCancelCreation?: () => void;
  onTemplateSelect: (type: 'description' | 'solution' | 'comments', templateName: string, commentIndex?: number) => void;
  tableError?: boolean;
  setTableError?: (hasError: boolean) => void;
  showToast?: (type: 'success' | 'error', message: string) => void;
}

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
  onTemplateSelect,
  tableError,
  setTableError,
  showToast,
}: IncidentFormContentProps) {
  
  const tableContainerRef = useRef<HTMLDivElement>(null);

  const descriptionTemplates = templates.filter((t: any) => {
    const val = (t.typeTemplate || t.type || t.Tipo || '').trim().toLowerCase();
    return val === 'descripción' || val === 'descripcion' || val === 'description';
  });

  const advanceTemplates = templates.filter((t: any) => {
    const val = (t.typeTemplate || t.type || t.Tipo || '').trim().toLowerCase();
    return val === 'avance' || val === 'avances' || val === 'advance' || val === 'comments';
  });

  const solutionTemplates = templates.filter((t: any) => {
    const val = (t.typeTemplate || t.type || t.Tipo || '').trim().toLowerCase();
    return val === 'solución' || val === 'solucion' || val === 'solution';
  });

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!affectedServices || affectedServices.length === 0) {
      if (setTableError) setTableError(true);
      if (showToast) showToast('error', 'Debe agregar al menos un servicio afectado.');
      
      if (tableContainerRef.current) {
        tableContainerRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }

    const isValidServices = affectedServices.every(
      (service) => 
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

    if (setTableError) setTableError(false);
    onSubmit(e);
  };

  const isClosed = formData.status === 'Closed' || formData.status === 'CLOSED';
  const isTemplateView = filterType === 'templates'; // Detecta si estamos visualizando plantillas

  return (
    <div style={{ backgroundColor: '#fff', padding: '24px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', flex: 1, overflowY: 'auto' }}>
      <h2 style={{ marginTop: 0, fontSize: '18px', borderBottom: '1px solid #e2e8f0', paddingBottom: '12px' }}>
        {isCreating ? 'Crear Nuevo Incidente' : isClosed ? 'Incidente Cerrado (Editar)' : isTemplateView ? 'Editar Plantilla' : 'Editar Incidente'}
      </h2>

      <form onSubmit={handleFormSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '16px' }}>
        
        <div 
          ref={tableContainerRef}
          style={{ 
            border: tableError ? '2px solid #ef4444' : '1px solid transparent', 
            borderRadius: '8px', 
            padding: tableError ? '8px' : '0',
            backgroundColor: tableError ? '#fef2f2' : 'transparent',
            transition: 'all 0.2s ease'
          }}
        >
          <AffectedServicesTable 
            affectedServices={affectedServices}
            availableServices={availableServices}
            hasError={!!tableError}
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

        <div>
          <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', marginBottom: '4px' }}>Nombre: *</label>
          <input 
            type="text" 
            required
            readOnly={isTemplateView && !isCreating} // <-- El campo nombre no se permite modificar si es una plantilla existente
            value={formData.name || ''} 
            onChange={(e) => {
              if (!(isTemplateView && !isCreating)) {
                setFormData({ ...formData, name: e.target.value });
              }
            }}
            style={{ 
              width: '100%', 
              padding: '8px', 
              borderRadius: '6px', 
              border: '1px solid #cbd5e1', 
              boxSizing: 'border-box',
              backgroundColor: isTemplateView && !isCreating ? '#f1f5f9' : '#fff', // Apariencia visual de campo bloqueado
              cursor: isTemplateView && !isCreating ? 'not-allowed' : 'text'
            }}
          />
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', marginBottom: '4px' }}>Impacto: *</label>
          <input 
            type="text" 
            required
            value={formData.impact || ''} 
            onChange={(e) => setFormData({ ...formData, impact: e.target.value })}
            style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }}
          />
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', marginBottom: '4px' }}>Funcionalidades: *</label>
          <input 
            type="text" 
            required
            value={formData.functionality || ''} 
            onChange={(e) => setFormData({ ...formData, functionality: e.target.value })}
            style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }}
          />
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', marginBottom: '4px' }}>Componentes Afectados: *</label>
          <input 
            type="text" 
            required
            value={formData.affectedComponent || ''} 
            onChange={(e) => setFormData({ ...formData, affectedComponent: e.target.value })}
            style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }}
          />
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', marginBottom: '4px' }}>Jira:</label>
          <input 
            type="text" 
            value={formData.jira || ''} 
            onChange={(e) => setFormData({ ...formData, jira: e.target.value })}
            style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }}
          />
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', marginBottom: '4px' }}>Caso Aliado:</label>
          <input 
            type="text" 
            value={formData.aliasedCase || ''} 
            onChange={(e) => setFormData({ ...formData, aliasedCase: e.target.value })}
            style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }}
          />
        </div>

        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
            <label style={{ fontSize: '13px', fontWeight: 'bold' }}>Descripción de la falla: *</label>
            <select 
              onChange={(e) => { 
                if (e.target.value) {
                  onTemplateSelect('description', e.target.value); 
                  e.target.value = ''; 
                }
              }}
              style={{ fontSize: '11px', padding: '4px 8px', borderRadius: '4px', border: '1px solid #cbd5e1', backgroundColor: '#fff', cursor: 'pointer' }}
            >
              <option value="">📄 Cargar plantilla...</option>
              {descriptionTemplates.map((t, idx) => (
                <option key={idx} value={t.name}>{t.name}</option>
              ))}
            </select>
          </div>
          <textarea 
            rows={4}
            required
            value={formData.description || ''} 
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }}
          />
        </div>

        <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '8px', border: '1px solid #e2e8f0', position: 'relative' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <label style={{ fontSize: '14px', fontWeight: 'bold', margin: 0 }}>Avances:</label>
            <button 
              type="button" 
              onClick={() => {
                const currentComments = formData.comments || [];
                setFormData({ 
                  ...formData, 
                  comments: [...currentComments, { sequence: currentComments.length + 1, content: '' }] 
                });
              }} 
              style={{ backgroundColor: '#2563eb', color: 'white', border: 'none', borderRadius: '6px', width: '32px', height: '32px', cursor: 'pointer', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px' }}
            >
              +
            </button>
          </div>

          {(!formData.comments || formData.comments.length === 0) ? (
            <p style={{ fontSize: '13px', color: '#64748b', fontStyle: 'italic', margin: 0 }}>No hay avances registrados.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {formData.comments.map((comm: any, index: number) => (
                <div key={index} style={{ backgroundColor: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '8px', padding: '12px', display: 'flex', flexDirection: 'column', gap: '8px', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
                  
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '13px', fontWeight: 'bold', color: '#1e293b' }}>
                      Avance {index + 1}:
                    </span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <select 
                        onChange={(e) => { 
                          if (e.target.value) {
                            onTemplateSelect('comments', e.target.value, index);
                            e.target.value = '';
                          }
                        }}
                        style={{ fontSize: '12px', padding: '4px 8px', borderRadius: '4px', border: '1px solid #cbd5e1', backgroundColor: '#fff', cursor: 'pointer' }}
                      >
                        <option value="">📄 Cargar plantilla...</option>
                        {advanceTemplates.map((t, idx) => (
                          <option key={idx} value={t.name}>{t.name}</option>
                        ))}
                      </select>
                      <button 
                        type="button" 
                        onClick={() => {
                          const updated = formData.comments
                            .filter((_: any, i: number) => i !== index)
                            .map((item: any, i: number) => ({ ...item, sequence: i + 1 }));
                          setFormData({ ...formData, comments: updated });
                        }} 
                        style={{ backgroundColor: '#ef4444', color: 'white', border: 'none', borderRadius: '4px', width: '26px', height: '26px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}
                      >
                        -
                      </button>
                    </div>
                  </div>

                  <textarea 
                    rows={3}
                    value={comm.content || comm.message || comm.text || ''}
                    onChange={(e) => {
                      const updated = [...formData.comments];
                      updated[index] = {
                        ...updated[index],
                        sequence: index + 1,
                        content: e.target.value,
                        message: e.target.value
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

        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
            <label style={{ fontSize: '13px', fontWeight: 'bold' }}>Solución: *</label>
            <select 
              onChange={(e) => { 
                if (e.target.value) {
                  onTemplateSelect('solution', e.target.value); 
                  e.target.value = ''; 
                }
              }}
              style={{ fontSize: '11px', padding: '4px 8px', borderRadius: '4px', border: '1px solid #cbd5e1', backgroundColor: '#fff', cursor: 'pointer' }}
            >
              <option value="">📄 Cargar plantilla...</option>
              {solutionTemplates.map((t, idx) => (
                <option key={idx} value={t.name}>{t.name}</option>
              ))}
            </select>
          </div>
          <textarea 
            rows={4}
            value={formData.solution || ''} 
            onChange={(e) => setFormData({ ...formData, solution: e.target.value })}
            style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }}
          />
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '15px', borderTop: '1px solid #e2e8f0', paddingTop: '15px' }}>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button type="submit" style={{ backgroundColor: '#10b981', color: 'white', border: 'none', padding: '10px 18px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '13px' }}>
              {isCreating ? 'Guardar Nuevo Incidente' : 'Guardar Cambios'}
            </button>
            {onSaveAsTemplate && !isTemplateView && (
              <button 
                type="button" 
                onClick={async () => {
                  try {
                    await onSaveAsTemplate();
                  } catch (err: any) {}
                }} 
                style={{ backgroundColor: '#8b5cf6', color: 'white', border: 'none', padding: '10px 18px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '13px' }}
              >
                💾 Guardar como Plantilla
              </button>
            )}
          </div>

          <div>
            {isCreating ? (
              onCancelCreation && (
                <button type="button" onClick={onCancelCreation} style={{ backgroundColor: 'white', color: '#1e293b', border: '1px solid #cbd5e1', padding: '10px 18px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '13px' }}>
                  Cancelar
                </button>
              )
            ) : (
              (!isClosed && onCloseIncident) && (
                <button type="button" onClick={() => onCloseIncident(formData.comments)} style={{ backgroundColor: '#ef4444', color: 'white', border: 'none', padding: '10px 18px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '13px' }}>
                  {/* Cambia el texto del botón según si es plantilla o incidente */}
                  {isTemplateView ? 'Eliminar plantilla' : 'Cerrar Incidente'}
                </button>
              )
            )}
          </div>
        </div>

      </form>
    </div>
  );
}