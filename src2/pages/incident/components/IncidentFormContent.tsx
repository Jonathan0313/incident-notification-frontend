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
  const [isCreating, setIsCreating] = useState<boolean>(false); // Inicia en falso para mostrar la pantalla de bienvenida vacía
  const [filterType, setFilterType] = useState<'open' | 'closed_recent' | 'templates'>('open');
  const [loading, setLoading] = useState<boolean>(false);
  
  const [formData, setFormData] = useState<any>({});
  const [affectedServices, setAffectedServices] = useState<any[]>([]);
  
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState<boolean>(false);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const showToast = (type: 'success' | 'error', message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3500);
  };

  useEffect(() => {
    fetchInitialData();
  }, [filterType]);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      const srvRes = await axiosClient.get('/v1/api/services').catch(() => ({ data: [] }));
      setAvailableServices(srvRes.data || []);

      if (filterType === 'templates') {
        const tempRes = await axiosClient.get('/v1/api/templates').catch(() => ({ data: [] }));
        setIncidents(tempRes.data || []);
      } else {
        const endpoint = filterType === 'open' ? '/v1/api/incidents/open' : '/v1/api/incidents/closed';
        const incRes = await axiosClient.get(endpoint).catch(() => ({ data: [] }));
        setIncidents(incRes.data || []);
      }

      const allTemplatesRes = await axiosClient.get('/v1/api/templates').catch(() => ({ data: [] }));
      setTemplates(allTemplatesRes.data || []);

    } catch (error) {
      showToast('error', 'Error al sincronizar los datos con el servidor.');
    } finally {
      setLoading(false);
    }
  };

  const handleStartCreate = () => {
    setIsCreating(true);
    setSelectedIncident(null);
    setFormData({});
    setAffectedServices([]);
  };

  const handleSelectIncident = (inc: any) => {
    setIsCreating(false);
    setSelectedIncident(inc);
    setFormData(inc);
    setAffectedServices(inc.affectedServices || []);
  };

  const handleAddService = () => {
    setAffectedServices([...affectedServices, { nameService: '', affectationType: 'OK', startTime: '', endTime: '' }]);
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
    const firstType = affectedServices[0].affectationType;
    const updated = affectedServices.map(s => ({ ...s, affectationType: firstType }));
    setAffectedServices(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = { ...formData, affectedServices };
      if (isCreating) {
        await axiosClient.post('/v1/api/incidents', payload);
        showToast('success', 'Incidente registrado correctamente.');
      } else {
        await axiosClient.put(`/v1/api/incidents/${selectedIncident.id}`, payload);
        showToast('success', 'Incidente actualizado correctamente.');
      }
      fetchInitialData();
    } catch (error: any) {
      showToast('error', error?.response?.data?.message || 'Error al guardar el incidente.');
    }
  };

  return (
    <div style={{ display: 'flex', gap: '15px', padding: '15px', height: 'calc(100vh - 40px)', boxSizing: 'border-box', backgroundColor: '#f1f5f9', position: 'relative' }}>
      
      {/* Panel Izquierdo de Navegación */}
      <IncidentSidebarLeft 
        incidents={incidents}
        selectedIncident={selectedIncident}
        isCreating={isCreating}
        loading={loading}
        filterType={filterType}
        onSelectIncident={handleSelectIncident}
        onStartCreate={handleStartCreate}
        onFilterChange={setFilterType}
      />

      {/* Panel Central: Muestra el formulario si se está creando o editando, o el mensaje de bienvenida si no hay selección */}
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
          onCancelCreation={() => {
            setIsCreating(false);
            setFormData({});
            setAffectedServices([]);
          }}
          onTemplateSelect={(type, name) => {
            const found = templates.find(t => t.name === name);
            if (found) {
              if (type === 'description') setFormData({ ...formData, description: found.messageTemplate });
              if (type === 'solution') setFormData({ ...formData, solution: found.messageTemplate });
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

      {/* Panel Derecho de Opciones */}
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

      {/* Notificación Toast */}
      {toast && <Toast type={toast.type} message={toast.message} />}
    </div>
  );
}