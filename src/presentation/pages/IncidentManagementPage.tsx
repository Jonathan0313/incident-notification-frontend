import { useState, useEffect } from 'react';
import type { Incident } from '../../domain/incident';
import type { Service } from './ServiceManagementPage';
import { axiosClient } from '../../services/axiosClient';

export default function IncidentManagementPage() {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [loading, setLoading] = useState<boolean>(true);

  // Estado para la lista de servicios disponibles
  const [availableServices, setAvailableServices] = useState<Service[]>([]);

  // Estado del formulario
  const [formData, setFormData] = useState<Incident | null>(null);

  useEffect(() => {
    fetchOpenIncidents();
    fetchAvailableServices();
  }, []);

  // Función auxiliar para mapear el texto de BD a su icono correspondiente
  const getIconForAffectation = (type: string) => {
    const normalized = (type || '').trim().toLowerCase();
    if (normalized === 'total' || normalized === '❌') return '❌';
    if (normalized === 'parcial' || normalized === '⚠️') return '⚠️';
    return '✅';
  };

  // Función auxiliar para normalizar el tipo de afectación que viene de BD
  const normalizeAffectationType = (type: string) => {
    const normalized = (type || '').trim().toLowerCase();
    if (normalized === 'total' || normalized === '❌') return 'Total';
    if (normalized === 'parcial' || normalized === '⚠️') return 'Parcial';
    return 'OK';
  };

  // Función auxiliar para filtrar servicios ya seleccionados en otras filas
  const getAvailableOptionsForServiceRow = (currentSelectedService: string) => {
    const currentlyUsedServices = ((formData as any).affectedServices || [])
      .map((srv: any) => srv.nameService?.trim())
      .filter((name: string) => name && name !== currentSelectedService);

    const uniqueAvailableServices = Array.from(new Set(availableServices.map(s => s.name?.trim())));
    
    return uniqueAvailableServices.filter(
      serviceName => !currentlyUsedServices.includes(serviceName)
    );
  };

  useEffect(() => {
    if (selectedIncident) {
      // Mapeamos los servicios afectados buscando y limpiando exhaustivamente las propiedades
      const mappedServices = ((selectedIncident as any).affectedServices || []).map((srv: any) => {
        const rawType = srv.affectationType || srv.status || 'OK';
        const cleanType = normalizeAffectationType(rawType);
        
        // Búsqueda profunda de posibles nombres de atributos devueltos por el backend
        const rawServiceName = 
          srv.nameService || 
          srv.serviceName || 
          srv.name || 
          srv.service || 
          (typeof srv.service === 'object' ? srv.service?.name : '') || 
          '';

        return {
          ...srv,
          nameService: typeof rawServiceName === 'string' ? rawServiceName.trim() : rawServiceName,
          affectationType: cleanType,
          status: getIconForAffectation(cleanType)
        };
      });

      setFormData({
        ...selectedIncident,
        affectedServices: mappedServices
      } as any);
    }
  }, [selectedIncident]);

  const fetchOpenIncidents = async () => {
    try {
      setLoading(true);
      const response = await axiosClient.get<Incident[]>('/notifications/open');
      setIncidents(response.data);
      if (response.data.length > 0 && !selectedIncident && !isCreating) {
        setSelectedIncident(response.data[0]);
      }
    } catch (error) {
      console.error('Error al cargar los incidentes abiertos:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableServices = async () => {
    try {
      const response = await axiosClient.get<Service[]>('/services/all');
      setAvailableServices(response.data);
    } catch (error) {
      console.error('Error al cargar la lista de servicios:', error);
    }
  };

  // Manejar clic en el botón "+ Nuevo" para inicializar el formulario de creación limpia
  const handleStartCreate = () => {
    setIsCreating(true);
    setSelectedIncident(null);
    setFormData({
      id: 0,
      name: '',
      impact: '',
      jira: '',
      partnerCase: '',
      affectedComponent: '',
      description: '',
      resolution: '',
      comments: [],
      affectedServices: []
    } as any);
  };

  // Agregar nuevo servicio afectado
  const handleAddAffectedService = () => {
    if (!formData) return;
    const newServiceRow = {
      status: '✅',          
      code: '',              
      nameService: '',       
      affectationType: 'OK', 
      startTime: '',         
      endTime: ''
    };
    const currentList = (formData as any).affectedServices || [];
    setFormData({
      ...formData,
      affectedServices: [...currentList, newServiceRow]
    } as any);
  };

  const handleDeleteAffectedService = (indexToDelete: number) => {
    if (!formData) return;
    const currentList = (formData as any).affectedServices || [];
    const updatedList = currentList.filter((_: any, index: number) => index !== indexToDelete);
    setFormData({
      ...formData,
      affectedServices: updatedList
    } as any);
  };

  const handleAffectedServiceChange = (index: number, field: string, value: string) => {
    if (!formData) return;
    const currentList = [...((formData as any).affectedServices || [])];
    
    if (field === 'affectationType') {
      const icon = getIconForAffectation(value);
      currentList[index] = { 
        ...currentList[index], 
        affectationType: value,
        status: icon 
      };
    } else if (field === 'nameService') {
      const matchedService = availableServices.find(s => s.name?.trim() === value.trim());
      currentList[index] = { 
        ...currentList[index], 
        nameService: value,
        code: matchedService ? (matchedService.code || matchedService.id?.toString() || '') : currentList[index].code
      };
    } else {
      currentList[index] = { ...currentList[index], [field]: value };
    }

    setFormData({
      ...formData,
      affectedServices: currentList
    } as any);
  };

  // Funciones para Avances
  const handleAddComment = () => {
    if (!formData) return;
    const newSequence = formData.comments.length + 1;
    const newComment = { sequence: newSequence, content: '' };
    setFormData({
      ...formData,
      comments: [...formData.comments, newComment]
    });
  };

  const handleDeleteComment = (indexToDelete: number) => {
    if (!formData) return;
    const updatedComments = formData.comments
      .filter((_, index) => index !== indexToDelete)
      .map((comment, index) => ({
        ...comment,
        sequence: index + 1
      }));

    setFormData({
      ...formData,
      comments: updatedComments
    });
  };

  const handleCommentChange = (index: number, text: string) => {
    if (!formData) return;
    const updatedComments = [...formData.comments];
    updatedComments[index] = { ...updatedComments[index], content: text };
    setFormData({
      ...formData,
      comments: updatedComments
    });
  };

  return (
    <div className="dashboard-layout">
      
      {/* PANEL IZQUIERDO: Lista de Notificaciones Abiertas */}
      <div className="sidebar-list">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 700 }}>Notificaciones Abiertas</h3>
          <button 
            onClick={handleStartCreate}
            style={{ backgroundColor: 'var(--primary)', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontWeight: 600, fontSize: '13px' }}>
            + Nuevo
          </button>
        </div>

        {loading ? (
          <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Cargando casos...</p>
        ) : incidents.length === 0 ? (
          <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>No hay incidentes abiertos.</p>
        ) : (
          <div>
            {incidents.map((inc) => (
              <div 
                key={inc.id}
                onClick={() => { setSelectedIncident(inc); setIsCreating(false); }}
                className={`sidebar-item ${!isCreating && selectedIncident?.id === inc.id ? 'active' : ''}`}>
                
                <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-main)' }}>
                  {inc.name}
                </div>

                {inc.jira && (
                  <div style={{ fontSize: '11px', color: 'var(--primary)', fontWeight: 500, marginTop: '4px' }}>
                    📌 {inc.jira}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* PANEL DERECHO: Formulario (Edición o Creación) */}
      <div className="detail-panel">
        {formData ? (
          <div>
            <h2 style={{ margin: '0 0 15px 0', fontSize: '20px', borderBottom: '2px solid var(--border-color)', paddingBottom: '10px' }}>
              Servicios Afectados:
            </h2>

            {/* SECCIÓN: Tabla de Servicios Afectados */}
            <div style={{ marginBottom: '20px', background: '#f8fafc', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <strong style={{ fontSize: '14px' }}>Lista de afectaciones:</strong>
                <button 
                  type="button"
                  onClick={handleAddAffectedService}
                  style={{ backgroundColor: 'var(--primary)', color: 'white', border: 'none', borderRadius: '4px', width: '26px', height: '26px', cursor: 'pointer', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  title="Agregar Servicio Afectado">
                  +
                </button>
              </div>

              {((formData as any).affectedServices || []).length === 0 ? (
                <p style={{ fontSize: '13px', color: 'var(--text-muted)', fontStyle: 'italic', margin: '5px 0' }}>
                  No hay servicios afectados agregados. Haz clic en [+] para registrar uno.
                </p>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', background: '#fff' }}>
                    <thead>
                      <tr style={{ background: '#e2e8f0', textAlign: 'left', borderBottom: '2px solid var(--border-color)' }}>
                        <th style={{ padding: '6px', width: '70px', textAlign: 'center' }}>ESTADO</th>
                        <th style={{ padding: '6px' }}>SERVICIO</th>
                        <th style={{ padding: '6px' }}>TIPO AFECTACIÓN</th>
                        <th style={{ padding: '6px' }}>HORA INICIO</th>
                        <th style={{ padding: '6px' }}>HORA FIN</th>
                        <th style={{ padding: '6px', width: '40px' }}></th>
                      </tr>
                    </thead>
                    <tbody>
                      {((formData as any).affectedServices || []).map((srvRow: any, index: number) => (
                        <tr key={index} style={{ borderBottom: '1px solid var(--border-color)' }}>
                          
                          {/* ESTADO (Icono automático basado en el tipo de afectación) */}
                          <td style={{ padding: '6px', textAlign: 'center', fontSize: '18px', verticalAlign: 'middle' }}>
                            {getIconForAffectation(srvRow.affectationType)}
                          </td>

                          {/* SERVICIO */}
                          <td style={{ padding: '6px' }}>
                            <select 
                              value={srvRow.nameService ? srvRow.nameService.trim() : ''}
                              onChange={(e) => handleAffectedServiceChange(index, 'nameService', e.target.value)}
                              style={{ width: '100%', padding: '4px', borderRadius: '4px', border: '1px solid var(--border-color)' }}>
                              <option value="">-- Seleccione servicio --</option>
                              
                              {getAvailableOptionsForServiceRow(srvRow.nameService?.trim()).map((uniqueName, sIdx) => (
                                <option key={sIdx} value={uniqueName}>
                                  {uniqueName}
                                </option>
                              ))}
                            </select>
                          </td>

                          {/* TIPO AFECTACIÓN */}
                          <td style={{ padding: '6px' }}>
                            <select
                              value={srvRow.affectationType || 'OK'}
                              onChange={(e) => handleAffectedServiceChange(index, 'affectationType', e.target.value)}
                              style={{ width: '100%', padding: '4px', borderRadius: '4px', border: '1px solid var(--border-color)', fontSize: '12px', fontWeight: 600 }}>
                              <option value="OK">OK</option>
                              <option value="Parcial">Parcial</option>
                              <option value="Total">Total</option>
                            </select>
                          </td>

                          {/* HORA INICIO */}
                          <td style={{ padding: '6px' }}>
                            <input 
                              type="text" 
                              value={srvRow.startTime || ''}
                              onChange={(e) => handleAffectedServiceChange(index, 'startTime', e.target.value)}
                              placeholder="23/07/2026 02:26"
                              style={{ width: '100%', padding: '4px', borderRadius: '4px', border: '1px solid var(--border-color)', fontSize: '12px' }}
                            />
                          </td>

                          {/* HORA FIN */}
                          <td style={{ padding: '6px' }}>
                            <input 
                              type="text" 
                              value={srvRow.endTime || ''}
                              onChange={(e) => handleAffectedServiceChange(index, 'endTime', e.target.value)}
                              placeholder="23/07/2026 03:09"
                              style={{ width: '100%', padding: '4px', borderRadius: '4px', border: '1px solid var(--border-color)', fontSize: '12px' }}
                            />
                          </td>

                          {/* Botón Eliminar fila (-) */}
                          <td style={{ padding: '6px', textAlign: 'center' }}>
                            <button 
                              type="button"
                              onClick={() => handleDeleteAffectedService(index)}
                              style={{ backgroundColor: '#ef4444', color: 'white', border: 'none', borderRadius: '4px', width: '22px', height: '22px', cursor: 'pointer', fontWeight: 'bold', fontSize: '12px' }}>
                              -
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Resto de Metadatos y Campos */}
            <div style={{ fontSize: '14px', lineHeight: '1.8' }}>
              
              <div style={{ marginBottom: '12px' }}>
                <strong>Nombre:</strong><br />
                <input 
                  type="text" 
                  value={formData.name || ''} 
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid var(--border-color)', marginTop: '4px' }}
                />
              </div>

              <div style={{ marginBottom: '12px' }}>
                <strong>Impacto:</strong><br />
                <input 
                  type="text" 
                  value={formData.impact || ''} 
                  onChange={(e) => setFormData({...formData, impact: e.target.value})}
                  style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid var(--border-color)', marginTop: '4px' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '15px', marginBottom: '12px' }}>
                <div style={{ flex: 1 }}>
                  <strong>Jira:</strong><br />
                  <input 
                    type="text" 
                    value={formData?.jira ?? ''} 
                    onChange={(e) => setFormData(formData ? { ...formData, jira: e.target.value } : null)}
                    style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid var(--border-color)', marginTop: '4px' }}
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <strong>Caso Aliado:</strong><br />
                  <input 
                    type="text" 
                    value={formData?.partnerCase ?? ''} 
                    onChange={(e) => setFormData(formData ? { ...formData, partnerCase: e.target.value } : null)}
                    style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid var(--border-color)', marginTop: '4px' }}
                  />
                </div>
              </div>

              {/* Componentes Afectados */}
              <div style={{ marginBottom: '12px' }}>
                <strong>Componentes Afectados:</strong><br />
                <input 
                  type="text" 
                  value={(formData as any).affectedComponent || ''} 
                  onChange={(e) => setFormData({...formData, affectedComponent: e.target.value} as any)}
                  placeholder="Ej: API Gateway, Microservicio Auth..."
                  style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid var(--border-color)', marginTop: '4px' }}
                />
              </div>

              <div style={{ marginBottom: '12px' }}>
                <strong>Descripción de la falla:</strong><br />
                <textarea 
                  value={formData.description || ''} 
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  rows={3}
                  style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid var(--border-color)', marginTop: '4px' }}
                />
              </div>

              {/* Avances dinámicos */}
              <div style={{ margin: '15px 0', borderTop: '1px dashed var(--border-color)', paddingTop: '15px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <strong>Avances:</strong>
                  <button 
                    type="button"
                    onClick={handleAddComment}
                    style={{ backgroundColor: 'var(--primary)', color: 'white', border: 'none', borderRadius: '4px', width: '26px', height: '26px', cursor: 'pointer', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    title="Agregar Avance">
                    +
                  </button>
                </div>

                {formData.comments.length === 0 ? (
                  <p style={{ fontSize: '13px', color: 'var(--text-muted)', fontStyle: 'italic', margin: '5px 0' }}>
                    No hay avances registrados. Haz clic en el botón [+] para agregar uno.
                  </p>
                ) : (
                  formData.comments.map((comment, index) => (
                    <div key={index} style={{ backgroundColor: '#f8fafc', padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--border-color)', margin: '8px 0' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                        <span style={{ fontSize: '13px', fontWeight: 'bold', color: 'var(--text-main)' }}>
                          Avance {index + 1}:
                        </span>
                        <button 
                          type="button"
                          onClick={() => handleDeleteComment(index)}
                          style={{ backgroundColor: '#ef4444', color: 'white', border: 'none', borderRadius: '4px', width: '22px', height: '22px', cursor: 'pointer', fontWeight: 'bold', fontSize: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                          title="Eliminar avance">
                          -
                        </button>
                      </div>
                      <textarea 
                        value={comment.content} 
                        onChange={(e) => handleCommentChange(index, e.target.value)}
                        placeholder="Escribe el avance aquí..."
                        rows={2}
                        style={{ width: '100%', padding: '6px', borderRadius: '4px', border: '1px solid var(--border-color)', fontSize: '13px' }}
                      />
                    </div>
                  ))
                )}
              </div>

              <div style={{ marginBottom: '15px', borderTop: '1px dashed var(--border-color)', paddingTop: '15px' }}>
                <strong>Solución:</strong><br />
                <textarea 
                  value={formData.resolution || ''} 
                  onChange={(e) => setFormData({...formData, resolution: e.target.value})}
                  placeholder="Escriba la solución del incidente..."
                  rows={3}
                  style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid var(--border-color)', marginTop: '4px' }}
                />
              </div>

            </div>

            <div style={{ marginTop: '25px', display: 'flex', gap: '10px', borderTop: '1px solid var(--border-color)', paddingTop: '20px' }}>
              <button 
                onClick={() => {
                  if (isCreating) {
                    alert('Nuevo incidente creado exitosamente.');
                  } else {
                    setSelectedIncident(formData);
                    alert('Cambios guardados localmente.');
                  }
                }} 
                className="btn-action active" style={{ backgroundColor: '#10b981', color: 'white' }}>
                {isCreating ? 'Guardar Nuevo Incidente' : 'Guardar Cambios'}
              </button>
              {isCreating ? (
                <button 
                  onClick={() => {
                    setIsCreating(false);
                    if (incidents.length > 0) setSelectedIncident(incidents[0]);
                  }} 
                  className="btn-action">
                  Cancelar
                </button>
              ) : (
                <button className="btn-action danger">
                  Cerrar Incidente
                </button>
              )}
            </div>
          </div>
        ) : (
          <p style={{ color: 'var(--text-muted)' }}>Selecciona una notificación de la izquierda o haz clic en "+ Nuevo".</p>
        )}
      </div>

    </div>
  );
}