import { useState, useEffect } from 'react';
import type { Incident } from '../../domain/incident';
import type { Service } from './ServiceManagementPage';
import { axiosClient } from '../../services/axiosClient';

export default function IncidentManagementPage() {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [loading, setLoading] = useState<boolean>(true);

  const [availableServices, setAvailableServices] = useState<Service[]>([]);
  const [formData, setFormData] = useState<Incident | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    fetchOpenIncidents();
    fetchAvailableServices();
  }, []);

  const getIconForAffectation = (type: string) => {
    const normalized = (type || '').trim().toLowerCase();
    if (normalized === 'total' || normalized === '❌') return '❌';
    if (normalized === 'parcial' || normalized === '⚠️') return '⚠️';
    return '✅';
  };

  const normalizeAffectationType = (type: string) => {
    const normalized = (type || '').trim().toLowerCase();
    if (normalized === 'total' || normalized === '❌') return 'Total';
    if (normalized === 'parcial' || normalized === '⚠️') return 'Parcial';
    return 'OK';
  };

  const getAvailableOptionsForServiceRow = (currentSelectedService: string) => {
    if (!formData) return [];
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
      const mappedServices = ((selectedIncident as any).affectedServices || []).map((srv: any) => {
        const rawType = srv.affectationType || srv.status || 'OK';
        const cleanType = normalizeAffectationType(rawType);
        
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
        comments: selectedIncident.comments || [],
        affectedServices: mappedServices
      } as any);
      setErrors({});
    }
  }, [selectedIncident]);

  const fetchOpenIncidents = async () => {
    try {
      setLoading(true);
      const response = await axiosClient.get('/v1/api/notifications/open');
      const rawData = response.data;
      const data = Array.isArray(rawData) 
        ? rawData 
        : (rawData?.content || rawData?.data || []);

      setIncidents(data);
      
      if (data.length > 0 && !selectedIncident && !isCreating) {
        setSelectedIncident(data[0]);
      } else if (data.length === 0) {
        setSelectedIncident(null);
        setFormData(null);
      }
    } catch (error) {
      console.error('Error al cargar los incidentes abiertos:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableServices = async () => {
    try {
      const response = await axiosClient.get<Service[]>('/v1/api/services/all');
      setAvailableServices(response.data || []);
    } catch (error) {
      console.error('Error al cargar la lista de servicios:', error);
    }
  };

  const handleStartCreate = () => {
    setIsCreating(true);
    setSelectedIncident(null);
    setErrors({});
    setFormData({
      id: '' as any,
      name: '',
      impact: '',
      functionality: '',
      jira: '',
      partnerCase: '',
      affectedComponent: 'En investigación',
      description: '',
      resolution: '',
      comments: [],
      affectedServices: []
    } as any);
  };

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

  const formatDateTimeIfNeeded = (inputVal: string): string => {
    const digits = inputVal.replace(/\D/g, '');
    if (digits.length === 12) {
      const day = digits.slice(0, 2);
      const month = digits.slice(2, 4);
      const year = digits.slice(4, 8);
      const hour = digits.slice(8, 10);
      const minute = digits.slice(10, 12);
      return `${day}/${month}/${year} ${hour}:${minute}`;
    }
    return inputVal;
  };

  const validateDateFormat = (dateStr: string): boolean => {
    const regex = /^(0[1-9]|[12][0-9]|3[01])\/(0[1-9]|1[0-2])\/\d{4} ([01][0-9]|2[0-3]):([0-5][0-9])$/;
    return regex.test(dateStr);
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
    } else if (field === 'startTime' || field === 'endTime') {
      const formattedValue = formatDateTimeIfNeeded(value);
      currentList[index] = { ...currentList[index], [field]: formattedValue };
    } else {
      currentList[index] = { ...currentList[index], [field]: value };
    }

    setFormData({
      ...formData,
      affectedServices: currentList
    } as any);
  };

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

  const validateForm = (): boolean => {
    if (!formData) return false;
    const newErrors: Record<string, string> = {};

    if (!formData.name?.trim()) newErrors.name = 'El nombre es obligatorio.';
    if (!formData.impact?.trim()) newErrors.impact = 'El impacto es obligatorio.';
    if (!((formData as any).functionality)?.trim()) newErrors.functionality = 'Las funcionalidades son obligatorias.';
    if (!((formData as any).affectedComponent)?.trim()) newErrors.affectedComponent = 'Los componentes afectados son obligatorios.';
    if (!formData.description?.trim()) newErrors.description = 'La descripción de la falla es obligatoria.';

    const services = (formData as any).affectedServices || [];
    if (services.length === 0) {
      newErrors.services = 'Debe agregar al menos un servicio afectado.';
    } else {
      for (let i = 0; i < services.length; i++) {
        const srv = services[i];
        if (!srv.startTime?.trim()) {
          newErrors.serviceStartTime = 'Todos los servicios afectados deben tener una hora de inicio obligatoria.';
          break;
        }
        if (!validateDateFormat(srv.startTime)) {
          newErrors.serviceStartTime = `La hora de inicio en el servicio #${i + 1} no tiene el formato válido (DD/MM/YYYY HH:mm).`;
          break;
        }
        if (!srv.endTime?.trim()) {
          newErrors.serviceEndTime = `La hora de fin en el servicio #${i + 1} es obligatoria.`;
          break;
        }
        if (!validateDateFormat(srv.endTime)) {
          newErrors.serviceEndTime = `La hora de fin en el servicio #${i + 1} no tiene el formato válido (DD/MM/YYYY HH:mm).`;
          break;
        }
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSaveAction = async () => {
    if (!validateForm()) return;

    try {
      if (isCreating) {
        await axiosClient.post('/v1/api/notifications', formData);
        alert('Nuevo incidente creado exitosamente.');
        setIsCreating(false);
        fetchOpenIncidents();
      } else {
        await axiosClient.put(`/v1/api/notifications/${formData.id}`, formData);
        alert('Cambios guardados exitosamente.');
        setSelectedIncident(formData);
        fetchOpenIncidents();
      }
    } catch (error) {
      console.error('Error al guardar el incidente:', error);
      alert('Ocurrió un error al guardar en el servidor.');
    }
  };

  const handleCloseIncident = async () => {
    if (!formData) return;

    if (!validateForm()) return;

    if (!formData.resolution || !formData.resolution.trim()) {
      setErrors((prev) => ({ ...prev, resolution: 'El campo Solución es obligatorio para cerrar la notificación.' }));
      alert('Debe registrar la solución antes de cerrar el incidente.');
      return;
    }

    const updatedServices = ((formData as any).affectedServices || []).map((srv: any) => ({
      ...srv,
      affectationType: 'OK',
      status: '✅'
    }));

    const dataToClose = {
      ...formData,
      affectedServices: updatedServices
    };

    try {
      await axiosClient.put(`/v1/api/notifications/${dataToClose.id}/close`, dataToClose);
      
      alert('Incidente cerrado exitosamente con todos sus servicios en OK.');
      setIsCreating(false);
      setSelectedIncident(null);
      setFormData(null);
      fetchOpenIncidents();
    } catch (error) {
      console.error('Error al cerrar el incidente:', error);
      alert('Ocurrió un error al intentar cerrar la notificación.');
    }
  };

  return (
    <div style={{ 
      width: '100vw', 
      maxWidth: '100%',
      height: 'calc(100vh - 70px)', 
      display: 'flex', 
      gap: '15px', 
      padding: '15px', 
      boxSizing: 'border-box', 
      backgroundColor: '#f1f5f9' 
    }}>
      
      {/* PANEL IZQUIERDO */}
      <div style={{ 
        width: '220px', 
        minWidth: '220px', 
        backgroundColor: '#ffffff', 
        borderRadius: '8px', 
        padding: '15px', 
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)', 
        overflowY: 'auto' 
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h3 style={{ margin: 0, fontSize: '14px', fontWeight: 700 }}>Notificaciones</h3>
          <button 
            onClick={handleStartCreate}
            style={{ backgroundColor: 'var(--primary, #2563eb)', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '6px', cursor: 'pointer', fontWeight: 600, fontSize: '12px' }}>
            + Nuevo
          </button>
        </div>

        {loading ? (
          <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Cargando...</p>
        ) : incidents.length === 0 ? (
          <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>No hay incidentes.</p>
        ) : (
          <div>
            {incidents.map((inc) => (
              <div 
                key={inc.id}
                onClick={() => { setSelectedIncident(inc); setIsCreating(false); }}
                style={{ 
                  cursor: 'pointer', 
                  padding: '10px', 
                  marginBottom: '8px', 
                  borderRadius: '6px', 
                  backgroundColor: !isCreating && selectedIncident?.id === inc.id ? '#e2e8f0' : 'transparent',
                  border: '1px solid transparent'
                }}>
                
                <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-main)' }}>
                  {inc.name}
                </div>

                {inc.jira && (
                  <div style={{ fontSize: '11px', color: 'var(--primary, #2563eb)', fontWeight: 500, marginTop: '4px' }}>
                    📌 {inc.jira}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* PANEL CENTRAL */}
      <div style={{ 
        flex: 1, 
        backgroundColor: '#ffffff', 
        borderRadius: '8px', 
        padding: '20px', 
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)', 
        overflowY: 'auto' 
      }}>
        {formData ? (
          <div>
            <h2 style={{ margin: '0 0 15px 0', fontSize: '20px', borderBottom: '2px solid var(--border-color, #e2e8f0)', paddingBottom: '10px' }}>
              {isCreating ? 'Crear Nuevo Incidente' : 'Editar Incidente'}
            </h2>

            {Object.keys(errors).length > 0 && (
              <div style={{ backgroundColor: '#ffeeec', border: '1px solid #ef4444', padding: '10px 14px', borderRadius: '6px', marginBottom: '15px', color: '#b91c1c', fontSize: '13px' }}>
                <strong>Por favor corrige los siguientes errores:</strong>
                <ul style={{ margin: '5px 0 0 20px', padding: 0 }}>
                  {Object.values(errors).map((err, idx) => (
                    <li key={idx}>{err}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* SECCIÓN: Tabla de Servicios Afectados */}
            <div style={{ marginBottom: '20px', background: '#f8fafc', padding: '12px', borderRadius: '8px', border: errors.services ? '1px solid #ef4444' : '1px solid var(--border-color, #e2e8f0)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <strong style={{ fontSize: '14px' }}>Lista de afectaciones: <span style={{ color: '#ef4444' }}>*</span></strong>
                <button 
                  type="button"
                  onClick={handleAddAffectedService}
                  style={{ backgroundColor: 'var(--primary, #2563eb)', color: 'white', border: 'none', borderRadius: '4px', width: '26px', height: '26px', cursor: 'pointer', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  title="Agregar Servicio Afectado">
                  +
                </button>
              </div>

              {((formData as any).affectedServices || []).length === 0 ? (
                <p style={{ fontSize: '13px', color: errors.services ? '#ef4444' : 'var(--text-muted, #64748b)', fontStyle: 'italic', margin: '5px 0' }}>
                  {errors.services || 'No hay servicios afectados agregados. Haz clic en [+] para registrar uno.'}
                </p>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', background: '#fff' }}>
                    <thead>
                      <tr style={{ background: '#e2e8f0', textAlign: 'left', borderBottom: '2px solid var(--border-color)' }}>
                        <th style={{ padding: '8px', width: '70px', textAlign: 'center' }}>ESTADO</th>
                        <th style={{ padding: '8px' }}>SERVICIO</th>
                        <th style={{ padding: '8px' }}>TIPO AFECTACIÓN</th>
                        <th style={{ padding: '8px' }}>HORA INICIO <span style={{ color: '#ef4444' }}>*</span></th>
                        <th style={{ padding: '8px' }}>HORA FIN <span style={{ color: '#ef4444' }}>*</span></th>
                        <th style={{ padding: '8px', width: '40px' }}></th>
                      </tr>
                    </thead>
                    <tbody>
                      {((formData as any).affectedServices || []).map((srvRow: any, index: number) => {
                        const isStartValid = srvRow.startTime?.trim() && validateDateFormat(srvRow.startTime);
                        const isEndValid = srvRow.endTime?.trim() && validateDateFormat(srvRow.endTime);

                        return (
                          <tr key={index} style={{ borderBottom: '1px solid var(--border-color)' }}>
                            <td style={{ padding: '6px', textAlign: 'center', fontSize: '18px', verticalAlign: 'middle' }}>
                              {getIconForAffectation(srvRow.affectationType)}
                            </td>
                            <td style={{ padding: '6px' }}>
                              <select 
                                value={srvRow.nameService ? srvRow.nameService.trim() : ''}
                                onChange={(e) => handleAffectedServiceChange(index, 'nameService', e.target.value)}
                                style={{ width: '100%', padding: '6px', borderRadius: '4px', border: '1px solid var(--border-color)' }}>
                                <option value="">-- Seleccione servicio --</option>
                                {srvRow.nameService?.trim() && (
                                  <option value={srvRow.nameService.trim()}>
                                    {srvRow.nameService.trim()}
                                  </option>
                                )}
                                {getAvailableOptionsForServiceRow(srvRow.nameService?.trim()).map((uniqueName, sIdx) => (
                                  <option key={sIdx} value={uniqueName}>
                                    {uniqueName}
                                  </option>
                                ))}
                              </select>
                            </td>
                            <td style={{ padding: '6px' }}>
                              <select
                                value={srvRow.affectationType || 'OK'}
                                onChange={(e) => handleAffectedServiceChange(index, 'affectationType', e.target.value)}
                                style={{ width: '100%', padding: '6px', borderRadius: '4px', border: '1px solid var(--border-color)', fontSize: '12px', fontWeight: 600 }}>
                                <option value="OK">OK</option>
                                <option value="Parcial">Parcial</option>
                                <option value="Total">Total</option>
                              </select>
                            </td>
                            <td style={{ padding: '6px' }}>
                              <input 
                                type="text" 
                                value={srvRow.startTime || ''}
                                onChange={(e) => handleAffectedServiceChange(index, 'startTime', e.target.value)}
                                placeholder="DD/MM/YYYY HH:mm"
                                style={{ width: '100%', padding: '6px', borderRadius: '4px', border: isStartValid ? '1px solid var(--border-color)' : '1px solid #ef4444', fontSize: '12px' }}
                              />
                            </td>
                            <td style={{ padding: '6px' }}>
                              <input 
                                type="text" 
                                value={srvRow.endTime || ''}
                                onChange={(e) => handleAffectedServiceChange(index, 'endTime', e.target.value)}
                                placeholder="DD/MM/YYYY HH:mm"
                                style={{ width: '100%', padding: '6px', borderRadius: '4px', border: isEndValid ? '1px solid var(--border-color)' : '1px solid #ef4444', fontSize: '12px' }}
                              />
                            </td>
                            <td style={{ padding: '6px', textAlign: 'center' }}>
                              <button 
                                type="button"
                                onClick={() => handleDeleteAffectedService(index)}
                                style={{ backgroundColor: '#ef4444', color: 'white', border: 'none', borderRadius: '4px', width: '24px', height: '24px', cursor: 'pointer', fontWeight: 'bold', fontSize: '12px' }}>
                                -
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* TABLA ESTRUCTURAL ESTRICTA (UNA FILA POR CADA CAMPO) */}
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
              <tbody>
                {/* Fila 1: Nombre */}
                <tr>
                  <td style={{ paddingBottom: '12px' }}>
                    <strong>Nombre: <span style={{ color: '#ef4444' }}>*</span></strong><br />
                    <input 
                      type="text" 
                      value={formData.name || ''} 
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      style={{ width: '100%', padding: '8px', borderRadius: '4px', border: errors.name ? '1px solid #ef4444' : '1px solid var(--border-color)', marginTop: '4px', boxSizing: 'border-box' }}
                    />
                  </td>
                </tr>

                {/* Fila 2: Impacto */}
                <tr>
                  <td style={{ paddingBottom: '12px' }}>
                    <strong>Impacto: <span style={{ color: '#ef4444' }}>*</span></strong><br />
                    <input 
                      type="text" 
                      value={formData.impact || ''} 
                      onChange={(e) => setFormData({...formData, impact: e.target.value})}
                      style={{ width: '100%', padding: '8px', borderRadius: '4px', border: errors.impact ? '1px solid #ef4444' : '1px solid var(--border-color)', marginTop: '4px', boxSizing: 'border-box' }}
                    />
                  </td>
                </tr>

                {/* Fila 3: Funcionalidades */}
                <tr>
                  <td style={{ paddingBottom: '12px' }}>
                    <strong>Funcionalidades: <span style={{ color: '#ef4444' }}>*</span></strong><br />
                    <input 
                      type="text" 
                      value={(formData as any).functionality || ''} 
                      onChange={(e) => setFormData({...formData, functionality: e.target.value} as any)}
                      placeholder="Ej: Módulo de pagos..."
                      style={{ width: '100%', padding: '8px', borderRadius: '4px', border: errors.functionality ? '1px solid #ef4444' : '1px solid var(--border-color)', marginTop: '4px', boxSizing: 'border-box' }}
                    />
                  </td>
                </tr>

                {/* Fila 4: Componentes Afectados */}
                <tr>
                  <td style={{ paddingBottom: '12px' }}>
                    <strong>Componentes Afectados: <span style={{ color: '#ef4444' }}>*</span></strong><br />
                    <input 
                      type="text" 
                      value={(formData as any).affectedComponent || ''} 
                      onChange={(e) => setFormData({...formData, affectedComponent: e.target.value} as any)}
                      placeholder="Ej: API Gateway..."
                      style={{ width: '100%', padding: '8px', borderRadius: '4px', border: errors.affectedComponent ? '1px solid #ef4444' : '1px solid var(--border-color)', marginTop: '4px', boxSizing: 'border-box' }}
                    />
                  </td>
                </tr>

                {/* Fila 5: Jira */}
                <tr>
                  <td style={{ paddingBottom: '12px' }}>
                    <strong>Jira:</strong><br />
                    <input 
                      type="text" 
                      value={formData?.jira ?? ''} 
                      onChange={(e) => setFormData(formData ? { ...formData, jira: e.target.value } : null)}
                      style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid var(--border-color)', marginTop: '4px', boxSizing: 'border-box' }}
                    />
                  </td>
                </tr>

                {/* Fila 6: Caso Aliado */}
                <tr>
                  <td style={{ paddingBottom: '12px' }}>
                    <strong>Caso Aliado:</strong><br />
                    <input 
                      type="text" 
                      value={formData?.partnerCase ?? ''} 
                      onChange={(e) => setFormData(formData ? { ...formData, partnerCase: e.target.value } : null)}
                      style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid var(--border-color)', marginTop: '4px', boxSizing: 'border-box' }}
                    />
                  </td>
                </tr>
              </tbody>
            </table>

            {/* SECCIONES DE ANCHO COMPLETO */}
            <div style={{ fontSize: '14px', marginTop: '15px' }}>
              
              <div style={{ marginBottom: '12px' }}>
                <strong>Descripción de la falla: <span style={{ color: '#ef4444' }}>*</span></strong><br />
                <textarea 
                  value={formData.description || ''} 
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  rows={3}
                  style={{ width: '100%', padding: '8px', borderRadius: '4px', border: errors.description ? '1px solid #ef4444' : '1px solid var(--border-color)', marginTop: '4px', boxSizing: 'border-box' }}
                />
              </div>

              {/* Avances dinámicos */}
              <div style={{ margin: '15px 0', borderTop: '1px dashed var(--border-color)', paddingTop: '15px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <strong>Avances:</strong>
                  <button 
                    type="button"
                    onClick={handleAddComment}
                    style={{ backgroundColor: 'var(--primary, #2563eb)', color: 'white', border: 'none', borderRadius: '4px', width: '26px', height: '26px', cursor: 'pointer', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    title="Agregar Avance">
                    +
                  </button>
                </div>

                {(!formData.comments || formData.comments.length === 0) ? (
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
                        value={comment.content || ''} 
                        onChange={(e) => handleCommentChange(index, e.target.value)}
                        placeholder="Escribe el avance aquí..."
                        rows={2}
                        style={{ width: '100%', padding: '6px', borderRadius: '4px', border: '1px solid var(--border-color)', fontSize: '13px', boxSizing: 'border-box' }}
                      />
                    </div>
                  ))
                )}
              </div>

              <div style={{ marginBottom: '15px', borderTop: '1px dashed var(--border-color)', paddingTop: '15px' }}>
                <strong>Solución: <span style={{ color: '#ef4444' }}>*</span></strong><br />
                <textarea 
                  value={formData.resolution || ''} 
                  onChange={(e) => {
                    setFormData({...formData, resolution: e.target.value});
                    if (errors.resolution) setErrors({ ...errors, resolution: '' });
                  }}
                  placeholder="Escriba la solución obligatoria para cerrar el incidente..."
                  rows={3}
                  style={{ width: '100%', padding: '8px', borderRadius: '4px', border: errors.resolution ? '1px solid #ef4444' : '1px solid var(--border-color)', marginTop: '4px', boxSizing: 'border-box' }}
                />
              </div>

            </div>

            <div style={{ marginTop: '25px', display: 'flex', gap: '10px', borderTop: '1px solid var(--border-color)', paddingTop: '20px' }}>
              <button 
                onClick={handleSaveAction} 
                style={{ backgroundColor: '#10b981', color: 'white', padding: '8px 16px', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 600 }}>
                {isCreating ? 'Guardar Nuevo Incidente' : 'Guardar Cambios'}
              </button>
              
              {isCreating ? (
                <button 
                  onClick={() => {
                    setIsCreating(false);
                    setErrors({});
                    if (incidents.length > 0) setSelectedIncident(incidents[0]);
                  }} 
                  style={{ padding: '8px 16px', border: '1px solid var(--border-color)', background: 'transparent', borderRadius: '6px', cursor: 'pointer' }}>
                  Cancelar
                </button>
              ) : (
                <button 
                  onClick={handleCloseIncident}
                  style={{ padding: '8px 16px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 600 }}>
                  Cerrar Incidente
                </button>
              )}
            </div>
          </div>
        ) : (
          <p style={{ color: 'var(--text-muted)' }}>Selecciona una notificación de la izquierda o haz clic en "+ Nuevo".</p>
        )}
      </div>

      {/* PANEL DERECHO */}
      <div style={{ 
        width: '220px', 
        minWidth: '220px', 
        backgroundColor: '#ffffff', 
        borderRadius: '8px', 
        padding: '15px', 
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)', 
        display: 'flex', 
        flexDirection: 'column', 
        overflowY: 'auto' 
      }}>
        <h3 style={{ margin: '0 0 15px 0', fontSize: '14px', fontWeight: 700, color: 'var(--text-main, #1e293b)', borderBottom: '1px solid var(--border-color, #e2e8f0)', paddingBottom: '10px' }}>
          Opciones
        </h3>
        <p style={{ fontSize: '12px', color: 'var(--text-muted, #64748b)', fontStyle: 'italic', margin: 0 }}>
          Próximamente...
        </p>
      </div>

    </div>
  );
}