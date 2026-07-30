import { useState, useEffect } from 'react';
import { axiosClient } from '../../services/axiosClient';
import { IncidentSidebarLeft } from './components/IncidentSidebarLeft';
import { IncidentSidebarRight } from './components/IncidentSidebarRight';
import { IncidentFormContent } from './components/IncidentFormContent';
import { TemplateModal } from './components/templates/components/TemplateModal';
import { Toast } from './components/ui/Toast';

export default function IncidentManagementPage() {
  const [incidents, setIncidents] = useState<any[]>([]);
  const [availableServices, setAvailableServices] = useState<any[]>([]);
  const [templates, setTemplates] = useState<any[]>([]);
  
  const [selectedIncident, setSelectedIncident] = useState<any | null>(null);
  const [isCreating, setIsCreating] = useState<boolean>(false);
  const [filterType, setFilterType] = useState<'open' | 'closed_recent' | 'templates'>('open');
  const [loading, setLoading] = useState<boolean>(false);
  
  const [formData, setFormData] = useState<any>({
    partnerCase: '',
    aliasedCase: '',
    comments: [],
    updates: [],
    advances: []
  });
  const [affectedServices, setAffectedServices] = useState<any[]>([]);
  
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState<boolean>(false);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const showToast = (type: 'success' | 'error', message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4500);
  };

  useEffect(() => {
    fetchInitialData();
  }, [filterType]);

  // 🛡️ Sincroniza automáticamente aliasedCase con partnerCase para la BD
  useEffect(() => {
    if (formData?.aliasedCase && formData?.partnerCase !== formData?.aliasedCase) {
      setFormData((prev: any) => ({
        ...prev,
        partnerCase: prev.aliasedCase
      }));
    }
  }, [formData?.aliasedCase]);

  const fetchInitialData = async () => {
    try {
      setLoading(true);

      const srvRes = await axiosClient.get('/v1/api/services/all').catch(() => ({ data: [] }));
      const rawServices = srvRes.data;
      setAvailableServices(Array.isArray(rawServices) ? rawServices : (rawServices?.content || rawServices?.data || []));

      const tplRes = await axiosClient.get('/v1/api/notification-templates').catch(() => ({ data: [] }));
      const rawTpl = tplRes.data;
      setTemplates(Array.isArray(rawTpl) ? rawTpl : (rawTpl?.content || rawTpl?.data || []));

      if (filterType === 'open') {
        const openRes = await axiosClient.get('/v1/api/notifications/open').catch(() => ({ data: [] }));
        const rawOpen = openRes.data;
        setIncidents(Array.isArray(rawOpen) ? rawOpen : (rawOpen?.content || rawOpen?.data || []));
      } else if (filterType === 'closed_recent') {
        const closedRes = await axiosClient.get('/v1/api/notifications/closed/recent').catch(() => ({ data: [] }));
        const rawClosed = closedRes.data;
        setIncidents(Array.isArray(rawClosed) ? rawClosed : (rawClosed?.content || rawClosed?.data || []));
      } else if (filterType === 'templates') {
        setIncidents(Array.isArray(rawTpl) ? rawTpl : (rawTpl?.content || rawTpl?.data || []));
      }

    } catch (error) {
      showToast('error', 'Error al cargar los datos iniciales.');
    } finally {
      setLoading(false);
    }
  };

  const handleStartCreate = () => {
    setIsCreating(true);
    setSelectedIncident(null);
    setFormData({ 
      partnerCase: '', 
      aliasedCase: '',
      comments: [], 
      updates: [], 
      advances: [] 
    });
    setAffectedServices([]);
  };

  const handleSelectIncident = async (inc: any) => {
    setIsCreating(false);
    setSelectedIncident(inc);
    
    const initialAdvances = inc.advances || inc.comments || inc.updates || [];
    const caseValue = inc.partnerCase || inc.aliasedCase || '';

    setFormData({
      ...inc,
      partnerCase: caseValue,
      aliasedCase: caseValue,
      comments: initialAdvances,
      updates: initialAdvances,
      advances: initialAdvances
    });
    setAffectedServices(inc.affectedServices || inc.services || []);

    if (!inc?.id) return;

    try {
      setLoading(true);
      const res = await axiosClient.get(`/v1/api/notifications/${inc.id}`);
      const fullData = res.data;
      
      if (fullData.resolution && !fullData.solution) {
        fullData.solution = fullData.resolution;
      } else if (fullData.solution && !fullData.resolution) {
        fullData.resolution = fullData.solution;
      }

      const resolvedAdvances = fullData.advances || fullData.comments || fullData.updates || inc.advances || inc.comments || [];
      const resolvedCase = fullData.partnerCase || fullData.aliasedCase || inc.partnerCase || inc.aliasedCase || '';

      setFormData({
        ...inc,
        ...fullData,
        partnerCase: resolvedCase,
        aliasedCase: resolvedCase,
        comments: resolvedAdvances,
        updates: resolvedAdvances,
        advances: resolvedAdvances
      });
      setAffectedServices(fullData.affectedServices || inc.affectedServices || []);
    } catch (error) {
      console.error("Error al cargar el detalle completo del incidente:", error);
      showToast('error', 'No se pudieron actualizar todos los detalles, usando datos locales.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddService = () => {
    setAffectedServices([...affectedServices, { nameService: '', status: 'OK', startTime: '', endTime: '' }]);
  };

  const handleDeleteService = (index: number) => {
    const updated = affectedServices.filter((_, idx) => idx !== index);
    setAffectedServices(updated);
  };

  const handleServiceChange = (index: number, field: string, value: string) => {
    const updated = [...affectedServices];
    updated[index][field] = value;
    setAffectedServices(updated);
  };

  const handleApplyFirstStartTime = () => {
    if (affectedServices.length === 0) return;
    const firstTime = affectedServices[0].startTime;
    const updated = affectedServices.map(s => ({ ...s, startTime: firstTime }));
    setAffectedServices(updated);
  };

  const handleApplyFirstEndTime = () => {
    if (affectedServices.length === 0) return;
    const firstTime = affectedServices[0].endTime;
    const updated = affectedServices.map(s => ({ ...s, endTime: firstTime }));
    setAffectedServices(updated);
  };

  const handleApplyFirstAffectationType = () => {
    if (affectedServices.length === 0) return;
    const firstType = affectedServices[0].status;
    const updated = affectedServices.map(s => ({ ...s, status: firstType }));
    setAffectedServices(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // 🔍 Priorizamos formData.advances que es donde escribe el componente hijo
      const currentAdvances = formData.advances || formData.comments || formData.updates || [];
      const finalPartnerCase = formData.partnerCase || formData.aliasedCase || null;

      const payload = { 
        ...formData, 
        partnerCase: finalPartnerCase,
        aliasedCase: finalPartnerCase,
        affectedServices,
        comments: currentAdvances,
        updates: currentAdvances,
        advances: currentAdvances
      };
      
      if (isCreating) {
        await axiosClient.post('/v1/api/notifications', payload);
        showToast('success', 'Incidente registrado correctamente.');
        setIsCreating(false);
      } else {
        await axiosClient.put(`/v1/api/notifications/${selectedIncident?.id}`, payload);
        showToast('success', 'Incidente actualizado correctamente.');
      }
      
      fetchInitialData();
    } catch (error: any) {
      console.error("DATA DEL ERROR:", error?.response?.data);

      const errorData = error?.response?.data;
      let errorMessage = 'Error al guardar.';

      if (errorData && typeof errorData === 'object' && !Array.isArray(errorData)) {
        const messages = Object.values(errorData);
        if (messages.length > 0) {
          errorMessage = messages.join(' | ');
        } else if (errorData.message) {
          errorMessage = errorData.message;
        }
      } else if (typeof errorData === 'string') {
        errorMessage = errorData;
      }

      showToast('error', errorMessage);
    }
  };

  const handleCloseIncident = async () => {
    if (!selectedIncident?.id) return;

    const solutionText = formData.solution || formData.resolution;

    if (!solutionText || solutionText.trim() === '') {
      showToast('error', 'El campo de solución es obligatorio para cerrar el incidente.');
      return;
    }

    for (let i = 0; i < affectedServices.length; i++) {
      if (!affectedServices[i].endTime || affectedServices[i].endTime.trim() === '') {
        showToast('error', `La hora fin del servicio #${i + 1} (${affectedServices[i].nameService || 'Sin nombre'}) es obligatoria.`);
        return;
      }
    }

    try {
      // 🔍 Priorizamos formData.advances para asegurar que viajen al cerrar
      const currentAdvances = formData.advances || formData.comments || formData.updates || [];
      const finalPartnerCase = formData.partnerCase || formData.aliasedCase || null;

      const payload = { 
        ...formData, 
        partnerCase: finalPartnerCase,
        aliasedCase: finalPartnerCase,
        solution: solutionText,
        resolution: solutionText, 
        affectedServices,
        comments: currentAdvances,
        updates: currentAdvances,
        advances: currentAdvances
      };
      
      await axiosClient.put(`/v1/api/notifications/${selectedIncident.id}/close`, payload);
      
      showToast('success', 'Incidente cerrado correctamente.');
      setSelectedIncident(null);
      fetchInitialData();
    } catch (error: any) {
      console.error("DATA DEL ERROR:", error?.response?.data);

      const errorData = error?.response?.data;
      let errorMessage = 'Error al cerrar el incidente.';

      if (errorData && typeof errorData === 'object' && !Array.isArray(errorData)) {
        const messages = Object.values(errorData);
        if (messages.length > 0) {
          errorMessage = messages.join(' | ');
        } else if (errorData.message) {
          errorMessage = errorData.message;
        }
      } else if (typeof errorData === 'string') {
        errorMessage = errorData;
      }

      showToast('error', errorMessage);
    }
  };

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
          onCancelCreation={() => {
            setIsCreating(false);
            setFormData({ partnerCase: '', aliasedCase: '', comments: [], updates: [], advances: [] });
            setAffectedServices([]);
          }}
          onTemplateSelect={(type, name) => {
            const found = templates.find(t => t.name === name);
            if (found) {
              if (type === 'description') setFormData({ ...formData, description: found.messageTemplate });
              if (type === 'solution') setFormData({ ...formData, solution: found.messageTemplate, resolution: found.messageTemplate });
            }
          }}
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
        onSetCurrentStartTimeFirst={() => {
          if (affectedServices.length === 0) return;
          const nowStr = new Date().toISOString().slice(0, 16).replace('T', ' ');
          const updated = [...affectedServices];
          updated[0].startTime = nowStr;
          setAffectedServices(updated);
        }}
        onSetCurrentEndTimeFirst={() => {
          if (affectedServices.length === 0) return;
          const nowStr = new Date().toISOString().slice(0, 16).replace('T', ' ');
          const updated = [...affectedServices];
          updated[0].endTime = nowStr;
          setAffectedServices(updated);
        }}
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