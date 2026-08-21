import React, { useState, useEffect } from 'react'; 
import { pipelineService, type PipelineDto } from '../services/pipelineService'; 
 
interface PipelineBlock { 
  pipelineId: string; 
  variables: Record<string, string>; 
} 
 
export default function PipelineManagementPage() { 
  const [pipelines, setPipelines] = useState<PipelineDto[]>([]); 
  const [forms, setForms] = useState<any[]>([]); 
  const [servicesList, setServicesList] = useState<any[]>([]); 
  const [loading, setLoading] = useState(true); 
 
  // Estados del formulario 
  const [selectedService, setSelectedService] = useState(''); 
  const [blocks, setBlocks] = useState<PipelineBlock[]>([]); 
  const [isEditing, setIsEditing] = useState(false); 
 
  // Notificaciones Toast y Modales 
  const [successMessage, setSuccessMessage] = useState(''); 
  const [errorMessage, setErrorMessage] = useState(''); 
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false); 
  const [pipelineToDelete, setPipelineToDelete] = useState<string | null>(null); 
 
  useEffect(() => { 
    loadData(); 
  }, []); 
 
  const loadData = async () => { 
    try { 
      setLoading(true); 
      const [pipelinesData, formsData, servicesData] = await Promise.all([ 
        pipelineService.getAllPipelines(), 
        pipelineService.getForms(), 
        pipelineService.getServicesStatus() 
      ]); 
      setPipelines(pipelinesData || []); 
      setForms(formsData || []); 
      setServicesList(servicesData || []); 
    } catch (err) { 
      console.error('Error al cargar datos', err); 
      showToast('error', 'No se pudieron cargar los datos iniciales'); 
    } finally { 
      setLoading(false); 
    } 
  }; 
 
  const showToast = (type: 'success' | 'error', text: string) => { 
    if (type === 'success') { 
      setSuccessMessage(text); 
      setErrorMessage(''); 
    } else { 
      setErrorMessage(text); 
      setSuccessMessage(''); 
    } 
    setTimeout(() => { 
      setSuccessMessage(''); 
      setErrorMessage(''); 
    }, 4000); 
  }; 
 
  const handleAddBlock = () => { 
    setBlocks(prev => [...prev, { pipelineId: '', variables: { enabled: '', disabled: '' } }]); 
  }; 
 
  const handleRemoveBlock = (index: number) => { 
    setBlocks(prev => prev.filter((_, i) => i !== index)); 
  }; 
 
  const handleBlockFormChange = (index: number, pipelineId: string) => { 
    const chosenForm = forms.find((f: any) => f.pipelineId === pipelineId); 
    const initialVars: Record<string, string> = { 
      enabled: '', 
      disabled: '' 
    }; 
 
    if (chosenForm && chosenForm.variables) { 
      chosenForm.variables.forEach((v: string) => { 
        initialVars[v] = ''; 
      }); 
    } 
 
    setBlocks(prev => { 
      const updated = [...prev]; 
      updated[index] = { pipelineId, variables: initialVars }; 
      return updated; 
    }); 
  }; 
 
  const handleBlockVariableChange = (blockIndex: number, key: string, value: string) => { 
    setBlocks(prev => { 
      const updated = [...prev]; 
      updated[blockIndex].variables = { 
        ...updated[blockIndex].variables, 
        [key]: value 
      }; 
      return updated; 
    }); 
  }; 
 
  const handleSubmit = async (e: React.FormEvent) => { 
    e.preventDefault(); 
 
    if (blocks.length === 0) { 
      showToast('error', 'Debe agregar al menos una configuración y variables'); 
      return; 
    } 
 
    const payload = blocks.map(block => { 
        const { enabled, disabled, ...formVariables } = block.variables; 
 
        const variablesAsList = Object.entries(formVariables).map(([key, value]) => ({ 
            [key]: value 
        })); 
 
        // Agregamos Enabled y Disabled al final de la lista 
        variablesAsList.push({ Enabled: enabled || '' }); 
        variablesAsList.push({ Disabled: disabled || '' }); 
 
        return { 
            services: selectedService, 
            pipelineId: block.pipelineId, 
            variables: variablesAsList 
        }; 
    }); 
 
    try { 
      if (isEditing) { 
        await pipelineService.updatePipeline(selectedService, payload as any); 
      } else { 
        await pipelineService.createPipeline(payload as any); 
      } 
 
      showToast('success', isEditing ? 'Pipeline actualizado exitosamente' : 'Pipeline creado exitosamente'); 
      clearForm(); 
      loadData(); 
    } catch (err: any) { 
      console.error('Error detallado al guardar:', err); 
      showToast('error', err?.response?.data?.message || 'Error al guardar el pipeline'); 
    } 
  }; 
 
  const handleEditClick = (p: PipelineDto) => {
  setSelectedService(p.services);

  const allRecordsForService = pipelines.filter(
    item => item.services === p.services
  );

  const reconstructedBlocks: PipelineBlock[] = [];

  allRecordsForService.forEach(record => {
    const rawVariables = (record as PipelineDto & {
      variables?: any
    }).variables;

    // Si variables viene como lista, cada pareja Enabled/Disabled
    // representa una configuración diferente.
    if (Array.isArray(rawVariables)) {

      let currentVariables: Record<string, string> = {};

      rawVariables.forEach((vObj: any) => {

        if (typeof vObj !== 'object' || vObj === null) {
          return;
        }

        Object.entries(vObj).forEach(([key, value]) => {

          if (value === undefined || value === null) {
            return;
          }

          // Guardamos las variables normales
          if (key !== 'Enabled' && key !== 'Disabled') {
            currentVariables[key] = String(value);
          }

          // Enabled pertenece a la configuración actual
          if (key === 'Enabled') {
            currentVariables.enabled = String(value);
          }

          // Disabled completa la configuración actual
          if (key === 'Disabled') {
            currentVariables.disabled = String(value);

            reconstructedBlocks.push({
              pipelineId: record.pipelineId || '',
              variables: currentVariables
            });

            // Comenzamos una nueva configuración
            currentVariables = {};
          }
        });
      });

      // Por seguridad, si quedó alguna configuración incompleta
      if (Object.keys(currentVariables).length > 0) {
        reconstructedBlocks.push({
          pipelineId: record.pipelineId || '',
          variables: currentVariables
        });
      }

    } else if (
      typeof rawVariables === 'object' &&
      rawVariables !== null
    ) {

      // Compatibilidad si el backend devuelve variables como objeto
      const blockVariables: Record<string, string> = {
        enabled: '',
        disabled: ''
      };

      Object.entries(rawVariables).forEach(([key, value]) => {

        if (value === undefined || value === null) {
          return;
        }

        if (key === 'Enabled') {
          blockVariables.enabled = String(value);
        } else if (key === 'Disabled') {
          blockVariables.disabled = String(value);
        } else {
          blockVariables[key] = String(value);
        }

      });

      reconstructedBlocks.push({
        pipelineId: record.pipelineId || '',
        variables: blockVariables
      });
    }

    // Compatibilidad con enabled/disabled como propiedades directas
    if (
      !Array.isArray(rawVariables) &&
      (!rawVariables || typeof rawVariables !== 'object')
    ) {
      reconstructedBlocks.push({
        pipelineId: record.pipelineId || '',
        variables: {
          enabled: record.enabled || '',
          disabled: record.disabled || ''
        }
      });
    }
  });

  setBlocks(
    reconstructedBlocks.length > 0
      ? reconstructedBlocks
      : [{
          pipelineId: p.pipelineId || '',
          variables: {
            enabled: p.enabled || '',
            disabled: p.disabled || ''
          }
        }]
  );

  setIsEditing(true);
};
 
  const clearForm = () => { 
    setSelectedService(''); 
    setBlocks([]); 
    setIsEditing(false); 
  }; 
 
  const confirmDelete = (services: string) => { 
    setPipelineToDelete(services); 
    setIsDeleteModalOpen(true); 
  }; 
 
  const executeDelete = async () => { 
    if (!pipelineToDelete) return; 
    try { 
      await pipelineService.deletePipeline(pipelineToDelete); 
      showToast('success', 'Pipeline eliminado correctamente'); 
      loadData(); 
    } catch (err) { 
      showToast('error', 'Error al eliminar el pipeline'); 
    } 
  }; 
 
  const usedServices = new Set(pipelines.map(p => p.services)); 
  const availableServicesForCreation = isEditing  
    ? servicesList  
    : servicesList.filter((s: any) => !usedServices.has(s.name)); 
 
  return ( 
    <div style={{ padding: '30px', maxWidth: '1400px', margin: '0 auto' }}> 
      <h2 style={{ marginBottom: '20px' }}>Gestión de Pipelines</h2> 
 
      <div style={{ display: 'grid', gridTemplateColumns: '450px 1fr', gap: '30px', alignItems: 'start' }}> 
         
        {/* IZQUIERDA: Formulario */} 
        <div style={{ background: 'white', padding: '20px', borderRadius: '8px', border: '1px solid #d1d5db', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}> 
          <h3 style={{ marginTop: 0, marginBottom: '15px', fontSize: '16px', color: '#374151' }}> 
            {isEditing ? '✏️ Actualizar Pipeline' : '➕ Crear Nuevo Pipeline'} 
          </h3> 
          <form onSubmit={handleSubmit}> 
             
            <div style={{ marginBottom: '16px' }}> 
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', marginBottom: '4px' }}>Servicio</label> 
              <select 
                required 
                disabled={isEditing} 
                value={selectedService} 
                onChange={(e) => setSelectedService(e.target.value)} 
                style={{ width: '100%', padding: '8px', boxSizing: 'border-box', border: '1px solid #d1d5db', borderRadius: '4px', backgroundColor: isEditing ? '#f3f4f6' : 'white' }} 
              > 
                <option value="">Seleccione un servicio...</option> 
                {availableServicesForCreation.map((s: any) => ( 
                  <option key={s.name} value={s.name}>{s.name}</option> 
                ))} 
              </select> 
            </div> 
 
            {blocks.map((block, blockIndex) => { 
              const currentForm = forms.find(f => f.pipelineId === block.pipelineId); 
               
              const allKeysToRender = new Set<string>(); 
              if (currentForm && currentForm.variables) { 
                currentForm.variables.forEach((v: string) => allKeysToRender.add(v)); 
              } 
              if (block.variables) { 
                Object.keys(block.variables).forEach(k => { 
                  if (k !== 'enabled' && k !== 'disabled') allKeysToRender.add(k); 
                }); 
              } 
 
              return ( 
                <div key={blockIndex} style={{ background: '#f8fafc', padding: '14px', borderRadius: '6px', border: '1px solid #cbd5e1', marginBottom: '15px', position: 'relative' }}> 
                   
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}> 
                    <span style={{ fontSize: '12px', fontWeight: 'bold', color: '#1e293b' }}> 
                      ⚙️ Configuración #{blockIndex + 1} 
                    </span> 
                    {blocks.length > 1 && ( 
                      <button  
                        type="button"  
                        onClick={() => handleRemoveBlock(blockIndex)} 
                        style={{ background: 'transparent', border: 'none', color: '#dc2626', cursor: 'pointer', fontWeight: 'bold', fontSize: '14px' }} 
                      > 
                        ✕ 
                      </button> 
                    )} 
                  </div> 
 
                  <div style={{ marginBottom: '10px' }}> 
                    <label style={{ display: 'block', fontSize: '11px', fontWeight: 'bold', marginBottom: '3px' }}>Formulario Asociado</label> 
                    <select 
                      required 
                      value={block.pipelineId} 
                      onChange={(e) => handleBlockFormChange(blockIndex, e.target.value)} 
                      style={{ width: '100%', padding: '6px', boxSizing: 'border-box', border: '1px solid #d1d5db', borderRadius: '4px', fontSize: '13px' }} 
                    > 
                      <option value="">Seleccione un formulario...</option> 
                      {forms.map((f: any) => ( 
                        <option key={f.pipelineId} value={f.pipelineId}>{f.name}</option> 
                      ))} 
                    </select> 
                  </div> 
 
                  {block.pipelineId && ( 
                    <> 
                      <div style={{ marginBottom: '8px' }}> 
                        <label style={{ display: 'block', fontSize: '11px', fontWeight: '600', color: '#047857', marginBottom: '2px' }}>Estado Enabled</label> 
                        <input 
                          type="text" 
                          required 
                          placeholder="Ej: active, success" 
                          value={block.variables['enabled'] || ''} 
                          onChange={(e) => handleBlockVariableChange(blockIndex, 'enabled', e.target.value)} 
                          style={{ width: '100%', padding: '6px', boxSizing: 'border-box', border: '1px solid #a7f3d0', borderRadius: '4px', fontSize: '13px' }} 
                        /> 
                      </div> 
 
                      <div style={{ marginBottom: '10px' }}> 
                        <label style={{ display: 'block', fontSize: '11px', fontWeight: '600', color: '#b91c1c', marginBottom: '2px' }}>Estado Disabled</label> 
                        <input 
                          type="text" 
                          required 
                          placeholder="Ej: inactive, error" 
                          value={block.variables['disabled'] || ''} 
                          onChange={(e) => handleBlockVariableChange(blockIndex, 'disabled', e.target.value)} 
                          style={{ width: '100%', padding: '6px', boxSizing: 'border-box', border: '1px solid #fecaca', borderRadius: '4px', fontSize: '13px' }} 
                        /> 
                      </div> 
 
                      {Array.from(allKeysToRender).map((variableName: string) => ( 
                        <div key={variableName} style={{ marginBottom: '8px' }}> 
                          <label style={{ display: 'block', fontSize: '11px', color: '#475569', marginBottom: '2px' }}>{variableName}</label> 
                          <input 
                            type="text" 
                            required 
                            placeholder={`Valor para ${variableName}`} 
                            value={block.variables[variableName] || ''} 
                            onChange={(e) => handleBlockVariableChange(blockIndex, variableName, e.target.value)} 
                            style={{ width: '100%', padding: '6px', boxSizing: 'border-box', border: '1px solid #cbd5e1', borderRadius: '4px', fontSize: '13px' }} 
                          /> 
                        </div> 
                      ))} 
                    </> 
                  )} 
                </div> 
              ); 
            })} 
 
            <div style={{ textAlign: 'center', marginBottom: '20px' }}> 
              <button 
                type="button" 
                onClick={handleAddBlock} 
                style={{ width: '100%', padding: '8px', backgroundColor: '#f1f5f9', color: '#2563eb', border: '1px dashed #2563eb', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: '14px' }} 
              > 
                + Agregar otra configuración 
              </button> 
            </div> 
 
            <div style={{ display: 'flex', gap: '10px' }}> 
              <button  
                type="submit"  
                style={{ flex: 1, padding: '10px', backgroundColor: '#2563eb', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }} 
              > 
                {isEditing ? 'Actualizar' : 'Guardar'} 
              </button> 
              {isEditing && ( 
                <button  
                  type="button"  
                  onClick={clearForm} 
                  style={{ padding: '10px', backgroundColor: '#9ca3af', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }} 
                > 
                  Cancelar 
                </button> 
              )} 
            </div> 
          </form> 
        </div> 
 
        {/* DERECHA: Tabla de Pipelines Registrados */} 
        <div style={{ background: 'white', borderRadius: '8px', border: '1px solid #d1d5db', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', overflow: 'hidden', width: '100%', minWidth: 0 }}> 
          <div style={{ padding: '15px 20px', background: '#f9fafb', borderBottom: '1px solid #d1d5db', fontWeight: 'bold', color: '#374151' }}> 
            📋 Lista de Pipelines Asociados 
          </div> 
          {loading ? ( 
            <p style={{ padding: '20px', textAlign: 'center' }}>Cargando...</p> 
          ) : ( 
            <div style={{ width: '100%', overflowX: 'auto' }}> 
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '650px' }}> 
                <thead> 
                  <tr style={{ background: '#f3f4f6', borderBottom: '1px solid #d1d5db', fontSize: '13px' }}> 
                    <th style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>Servicio</th> 
                    <th style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>Formulario ID</th> 
                    <th style={{ padding: '12px 16px' }}>Variables y Configuración</th> 
                    <th style={{ padding: '12px 16px', textAlign: 'center', whiteSpace: 'nowrap' }}>Acciones</th> 
                  </tr> 
                </thead> 
                <tbody> 
                  {pipelines.length === 0 ? ( 
                    <tr> 
                      <td colSpan={4} style={{ padding: '30px', textAlign: 'center', color: '#6b7280' }}> 
                        No hay pipelines registrados. 
                      </td> 
                    </tr> 
                  ) : ( 
                    pipelines.map((p, index) => ( 
                      <tr key={index} style={{ borderBottom: '1px solid #e5e7eb', fontSize: '13px' }}> 
                        <td style={{ padding: '12px 16px', fontWeight: '600', whiteSpace: 'nowrap' }}>{p.services}</td> 
                        <td style={{ padding: '12px 16px', color: '#4b5563', whiteSpace: 'nowrap' }}>{p.pipelineId}</td> 
                        <td style={{ padding: '12px 16px', color: '#4b5563', maxWidth: '300px' }}> 
                          <code style={{ fontSize: '11px', background: '#f1f5f9', padding: '4px', borderRadius: '4px', display: 'inline-block', wordBreak: 'break-all' }}> 
                            {JSON.stringify({ enabled: p.enabled, disabled: p.disabled, variables: (p as any).variables })} 
                          </code> 
                        </td> 
                        <td style={{ padding: '12px 16px', textAlign: 'center', whiteSpace: 'nowrap' }}> 
                          <div style={{ display: 'flex', justifyContent: 'center', gap: '8px' }}> 
                            <button  
                              onClick={() => handleEditClick(p)} 
                              style={{ padding: '4px 10px', backgroundColor: '#2563eb', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }} 
                            > 
                              Editar 
                            </button> 
                            <button  
                              onClick={() => confirmDelete(p.services)} 
                              style={{ padding: '4px 10px', backgroundColor: '#dc2626', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }} 
                            > 
                              Eliminar 
                            </button> 
                          </div> 
                        </td> 
                      </tr> 
                    )) 
                  )} 
                </tbody> 
              </table> 
            </div> 
          )} 
        </div> 
 
      </div> 
 
      {/* MODAL DE ELIMINACIÓN */} 
      {isDeleteModalOpen && ( 
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}> 
          <div style={{ background: 'white', padding: '24px', borderRadius: '8px', width: '100%', maxWidth: '400px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}> 
            <h3 style={{ margin: '0 0 10px 0', fontSize: '18px', color: '#1f2937' }}>Confirmar Eliminación</h3> 
            <p style={{ margin: '0 0 20px 0', fontSize: '14px', color: '#4b5563' }}> 
              ¿Estás seguro de eliminar el pipeline del servicio <strong>{pipelineToDelete}</strong>? 
            </p> 
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}> 
              <button 
                onClick={() => setIsDeleteModalOpen(false)} 
                style={{ padding: '8px 16px', backgroundColor: '#e5e7eb', color: '#374151', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: '500' }} 
              > 
                Cancelar 
              </button> 
              <button 
                onClick={() => { 
                  executeDelete(); 
                  setIsDeleteModalOpen(false); 
                }} 
                style={{ padding: '8px 16px', backgroundColor: '#dc2626', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: '500' }} 
              > 
                Eliminar 
              </button> 
            </div> 
          </div> 
        </div> 
      )} 
 
      {/* TOASTS */} 
      {successMessage && ( 
        <div style={{ position: 'fixed', bottom: '20px', right: '20px', backgroundColor: '#059669', color: 'white', padding: '12px 20px', borderRadius: '6px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', zIndex: 1100, fontWeight: 'bold', fontSize: '14px' }}> 
          ✓ {successMessage} 
        </div> 
      )} 
      {errorMessage && ( 
        <div style={{ position: 'fixed', bottom: '20px', right: '20px', backgroundColor: '#dc2626', color: 'white', padding: '12px 20px', borderRadius: '6px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', zIndex: 1100, fontWeight: 'bold', fontSize: '14px' }}> 
          ✕ {errorMessage} 
        </div> 
      )} 
    </div> 
  ); 
}