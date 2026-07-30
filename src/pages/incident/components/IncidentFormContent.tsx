import { AffectedServicesTable } from './AffectedServicesTable';
import React, { useRef } from 'react';

interface IncidentFormContentProps {
  formData: any;
  setFormData: (data: any) => void;
  affectedServices: any[];
  availableServices: any[];
  isCreating: boolean;
  templates: any[];
  onAddService: () => void;
  onDeleteService: (index: number) => void;
  onServiceChange: (index: number, field: string, value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  onCloseIncident?: () => void;
  onSaveAsTemplate?: () => void;
  onCancelCreation?: () => void;
  onTemplateSelect: (type: 'description' | 'solution', templateName: string) => void;
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

  const descriptionTemplates = templates.filter(t => t.typeTemplate === 'Descripción');
  const solutionTemplates = templates.filter(t => t.typeTemplate === 'Solución');
  const advanceTemplates = templates.filter(t => t.typeTemplate === 'Avances');

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // 1. Validar que exista al menos un servicio afectado
    if (!affectedServices || affectedServices.length === 0) {
      if (setTableError) setTableError(true);
      if (showToast) showToast('error', 'Debe agregar al menos un servicio afectado.');
      
      // Desplazar la vista hacia la tabla para que el usuario vea el error
      if (tableContainerRef.current) {
        tableContainerRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }

    // 2. Validar que cada servicio tenga un nombre válido y su fecha de inicio
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

    // Si todo es correcto
    if (setTableError) setTableError(false);
    onSubmit(e);
  };

  return (
    <div style={{ backgroundColor: '#fff', padding: '24px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', flex: 1, overflowY: 'auto' }}>
      <h2 style={{ marginTop: 0, fontSize: '18px', borderBottom: '1px solid #e2e8f0', paddingBottom: '12px' }}>
        {isCreating ? 'Crear Nuevo Incidente' : 'Editar Incidente'}
      </h2>

      <form onSubmit={handleFormSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '16px' }}>
        
        {/* Contenedor de la Tabla con Referencia para Scroll */}
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

        {/* Nombre */}
        <div>
          <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', marginBottom: '4px' }}>Nombre: *</label>
          <input 
            type="text" 
            required
            value={formData.name || ''} 
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }}
          />
        </div>

        {/* Impacto */}
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

        {/* Funcionalidades */}
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

        {/* Componentes Afectados */}
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
                if (e.target.value) {
                  onTemplateSelect('description', e.target.value); 
                  e.target.value = ''; 
                }
              }}
              style={{ fontSize: '11px', padding: '4px 8px', borderRadius: '4px', border: '1px solid #cbd5e1', backgroundColor: '#fff', cursor: 'pointer' }}
            >
              <option value="">📄 Cargar plantilla en Descripción...</option>
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

        {/* Sección de Avances */}
        <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '8px', border: '1px solid #e2e8f0', position: 'relative' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <label style={{ fontSize: '14px', fontWeight: 'bold', margin: 0 }}>Avances:</label>
            <button 
              type="button" 
              onClick={() => {
                const currentAdv = formData.advances || [];
                setFormData({ ...formData, advances: [...currentAdv, { message: '' }] });
              }} 
              style={{ backgroundColor: '#2563eb', color: 'white', border: 'none', borderRadius: '6px', width: '32px', height: '32px', cursor: 'pointer', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px' }}
            >
              +
            </button>
          </div>

          {(!formData.advances || formData.advances.length === 0) ? (
            <p style={{ fontSize: '13px', color: '#64748b', fontStyle: 'italic', margin: 0 }}>No hay avances registrados.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {formData.advances.map((adv: any, index: number) => (
                <div key={index} style={{ backgroundColor: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '8px', padding: '12px', display: 'flex', flexDirection: 'column', gap: '8px', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
                  
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '13px', fontWeight: 'bold', color: '#1e293b' }}>
                      Avance {index + 1}:
                    </span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <select 
                        onChange={(e) => { 
                          if (e.target.value) {
                            const found = advanceTemplates.find(t => t.name === e.target.value);
                            if (found) {
                              const updated = [...formData.advances];
                              updated[index].message = found.messageTemplate;
                              setFormData({ ...formData, advances: updated });
                            }
                            e.target.value = '';
                          }
                        }}
                        style={{ fontSize: '12px', padding: '4px 8px', borderRadius: '4px', border: '1px solid #cbd5e1', backgroundColor: '#fff', cursor: 'pointer' }}
                      >
                        <option value="">📄 Cargar plantilla en Avance...</option>
                        {advanceTemplates.map((t, idx) => (
                          <option key={idx} value={t.name}>{t.name}</option>
                        ))}
                      </select>
                      <button 
                        type="button" 
                        onClick={() => {
                          const updated = formData.advances.filter((_: any, i: number) => i !== index);
                          setFormData({ ...formData, advances: updated });
                        }} 
                        style={{ backgroundColor: '#ef4444', color: 'white', border: 'none', borderRadius: '4px', width: '26px', height: '26px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}
                      >
                        -
                      </button>
                    </div>
                  </div>

                  <textarea 
                    rows={3}
                    value={adv.message || ''}
                    onChange={(e) => {
                      const updated = [...formData.advances];
                      updated[index].message = e.target.value;
                      setFormData({ ...formData, advances: updated });
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
                if (e.target.value) {
                  onTemplateSelect('solution', e.target.value); 
                  e.target.value = ''; 
                }
              }}
              style={{ fontSize: '11px', padding: '4px 8px', borderRadius: '4px', border: '1px solid #cbd5e1', backgroundColor: '#fff', cursor: 'pointer' }}
            >
              <option value="">📄 Cargar plantilla en Solución...</option>
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

        {/* Botones inferiores de acción */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '15px', borderTop: '1px solid #e2e8f0', paddingTop: '15px' }}>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button type="submit" style={{ backgroundColor: '#10b981', color: 'white', border: 'none', padding: '10px 18px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '13px' }}>
              {isCreating ? 'Guardar Nuevo Incidente' : 'Guardar Cambios'}
            </button>
            {onSaveAsTemplate && (
              <button type="button" onClick={onSaveAsTemplate} style={{ backgroundColor: '#8b5cf6', color: 'white', border: 'none', padding: '10px 18px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '13px' }}>
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
              onCloseIncident && (
                <button type="button" onClick={onCloseIncident} style={{ backgroundColor: '#ef4444', color: 'white', border: 'none', padding: '10px 18px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '13px' }}>
                  Cerrar Incidente
                </button>
              )
            )}
          </div>
        </div>

      </form>
    </div>
  );
}