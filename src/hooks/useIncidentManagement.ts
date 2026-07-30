import { useState, useEffect } from 'react';
import { axiosClient } from '../services/axiosClient';

export function useIncidentManagement() {
  const [incidents, setIncidents] = useState<any[]>([]);
  const [availableServices, setAvailableServices] = useState<any[]>([]);
  const [templates, setTemplates] = useState<any[]>([]);
  
  const [selectedIncident, setSelectedIncident] = useState<any | null>(null);
  const [isCreating, setIsCreating] = useState<boolean>(false);
  const [filterType, setFilterType] = useState<'open' | 'closed_recent' | 'templates'>('open');
  const [loading, setLoading] = useState<boolean>(false);
  
  const [formData, setFormData] = useState<any>({
    name: '',
    impact: '',
    functionality: '',
    affectedComponent: '',
    jira: '',
    partnerCase: '',
    aliasedCase: '',
    description: '',
    solution: '',
    resolution: '',
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

  useEffect(() => {
    if (formData?.aliasedCase !== undefined && formData?.partnerCase !== formData?.aliasedCase) {
      setFormData((prev: any) => ({
        ...prev,
        partnerCase: prev.aliasedCase || ''
      }));
    }
  }, [formData?.aliasedCase]);

  const fetchInitialData = async () => {
    try {
      setLoading(true);

      const srvRes = await axiosClient.get('/v1/api/services/all').catch(() => ({ data: [] }));
      const rawServices = srvRes.data;
      setAvailableServices(Array.isArray(rawServices) ? rawServices : (rawServices?.content || rawServices?.data || []));

      const tplRes = await axiosClient.get('/v1/api/templates').catch(() => ({ data: [] }));
      const rawTpl = tplRes.data;
      const tplArray = Array.isArray(rawTpl) ? rawTpl : (rawTpl?.content || rawTpl?.data || []);

      const sortedTemplates = tplArray.sort((a: any, b: any) => {
        const nameA = a.name?.toLowerCase() || '';
        const nameB = b.name?.toLowerCase() || '';
        return nameA.localeCompare(nameB);
      });

      setTemplates(sortedTemplates);

      if (filterType === 'open') {
        const openRes = await axiosClient.get('/v1/api/notifications/open').catch(() => ({ data: [] }));
        const rawOpen = openRes.data;
        setIncidents(Array.isArray(rawOpen) ? rawOpen : (rawOpen?.content || rawOpen?.data || []));
      } else if (filterType === 'closed_recent') {
        const closedRes = await axiosClient.get('/v1/api/notifications/closed/recent').catch(() => ({ data: [] }));
        const rawClosed = closedRes.data;
        setIncidents(Array.isArray(rawClosed) ? rawClosed : (rawClosed?.content || rawClosed?.data || []));
      } else if (filterType === 'templates') {
        setIncidents(sortedTemplates);
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
      name: '', impact: '', functionality: '', affectedComponent: '', jira: '', 
      partnerCase: '', aliasedCase: '', description: '', solution: '', resolution: '', 
      comments: [], updates: [], advances: [] 
    });
    setAffectedServices([]);
  };

  const handleSelectIncident = async (inc: any) => {
    setIsCreating(false);
    setSelectedIncident(inc);
    
    const initialAdvances = inc.advances || inc.comments || inc.updates || [];
    const caseValue = inc.partnerCase || inc.aliasedCase || '';
    const solValue = inc.solution || inc.resolution || '';

    setFormData({
      ...inc,
      name: inc.name || inc.title || '',
      impact: inc.impact || '',
      functionality: inc.functionality || '',
      affectedComponent: inc.affectedComponent || '',
      jira: inc.jira || '',
      description: inc.description || '',
      solution: solValue,
      resolution: solValue,
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
      
      const resolvedSol = fullData.solution || fullData.resolution || '';
      const resolvedAdvances = fullData.advances || fullData.comments || fullData.updates || inc.advances || inc.comments || [];
      const resolvedCase = fullData.partnerCase || fullData.aliasedCase || inc.partnerCase || inc.aliasedCase || '';

      setFormData({
        ...inc,
        ...fullData,
        name: fullData.name || fullData.title || inc.name || '',
        impact: fullData.impact || inc.impact || '',
        functionality: fullData.functionality || inc.functionality || '',
        affectedComponent: fullData.affectedComponent || inc.affectedComponent || '',
        jira: fullData.jira || inc.jira || '',
        description: fullData.description || inc.description || '',
        solution: resolvedSol,
        resolution: resolvedSol,
        partnerCase: resolvedCase,
        aliasedCase: resolvedCase,
        comments: resolvedAdvances,
        updates: resolvedAdvances,
        advances: resolvedAdvances
      });
      setAffectedServices(fullData.affectedServices || inc.affectedServices || []);
    } catch (error) {
      console.error("Error al cargar detalle:", error);
      showToast('error', 'No se pudieron actualizar todos los detalles.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddService = () => {
    setAffectedServices([...affectedServices, { nameService: '', status: 'OK', startTime: '', endTime: '' }]);
  };

  const handleDeleteService = (index: number) => {
    setAffectedServices(affectedServices.filter((_, idx) => idx !== index));
  };

  const handleServiceChange = (index: number, field: string, value: string) => {
    const updated = [...affectedServices];
    updated[index][field] = value;
    setAffectedServices(updated);
  };

  const handleApplyFirstStartTime = () => {
    if (affectedServices.length === 0) return;
    const firstTime = affectedServices[0].startTime;
    setAffectedServices(affectedServices.map(s => ({ ...s, startTime: firstTime })));
  };

  const handleApplyFirstEndTime = () => {
    if (affectedServices.length === 0) return;
    const firstTime = affectedServices[0].endTime;
    setAffectedServices(affectedServices.map(s => ({ ...s, endTime: firstTime })));
  };

  const handleApplyFirstAffectationType = () => {
    if (affectedServices.length === 0) return;
    const firstType = affectedServices[0].status;
    setAffectedServices(affectedServices.map(s => ({ ...s, status: firstType })));
  };

  const handleSetCurrentStartTimeFirst = () => {
    if (affectedServices.length === 0) return;
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const nowStr = `${day}/${month}/${year} ${hours}:${minutes}`;

    const updated = [...affectedServices];
    updated[0] = { ...updated[0], startTime: nowStr };
    setAffectedServices(updated);
  };

  const handleSetCurrentEndTimeFirst = () => {
    if (affectedServices.length === 0) return;
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const nowStr = `${day}/${month}/${year} ${hours}:${minutes}`;

    const updated = [...affectedServices];
    updated[0] = { ...updated[0], endTime: nowStr };
    setAffectedServices(updated);
  };

  const buildUnifiedPayload = (customFields = {}) => {
    const rawAdvances = formData.advances || formData.comments || formData.updates || [];
    const formattedAdvances = rawAdvances.map((adv: any, idx: number) => ({
      sequence: adv.sequence || idx + 1,
      content: adv.content || adv.message || ''
    }));

    const caseValue = formData.partnerCase || formData.aliasedCase || '';
    const solValue = formData.solution || formData.resolution || '';

    return {
      name: formData.name || '',
      title: formData.name || '',
      impact: formData.impact || '',
      functionality: formData.functionality || '',
      affectedComponent: formData.affectedComponent || '',
      jira: formData.jira || '',
      partnerCase: caseValue,
      aliasedCase: caseValue,
      description: formData.description || '',
      solution: solValue,
      resolution: solValue,
      affectedServices: affectedServices || [],
      comments: formattedAdvances,
      updates: formattedAdvances,
      advances: formattedAdvances,
      ...customFields
    };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = buildUnifiedPayload();
      
      if (isCreating) {
        const response = await axiosClient.post('/v1/api/notifications', payload);
        const createdIncident = {
          ...(response.data || {}),
          ...payload,
          id: response.data?.id || Date.now(),
          name: formData.name,
          title: formData.name
        };
        
        showToast('success', 'Incidente registrado correctamente.');
        setIsCreating(false);
        setIncidents(prev => [createdIncident, ...prev.filter(inc => inc.id !== createdIncident.id)]);
        setSelectedIncident(createdIncident);
      } else {
        const response = await axiosClient.put(`/v1/api/notifications/${selectedIncident?.id}`, payload);
        const updatedIncident = {
          ...(response.data || {}),
          ...payload,
          id: selectedIncident?.id,
          name: formData.name,
          title: formData.name
        };
        
        showToast('success', 'Incidente actualizado correctamente.');
        setIncidents(prev => [updatedIncident, ...prev.filter(inc => inc.id !== selectedIncident?.id && inc.id !== updatedIncident.id)]);
        setSelectedIncident(updatedIncident);
      }
    } catch (error: any) {
      const errorData = error?.response?.data;
      let errorMessage = 'Error al guardar.';
      if (errorData && typeof errorData === 'object' && !Array.isArray(errorData)) {
        const messages = Object.values(errorData);
        errorMessage = messages.length > 0 ? messages.join(' | ') : (errorData.message || errorMessage);
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
        showToast('error', `La hora fin del servicio #${i + 1} es obligatoria.`);
        return;
      }
    }

    try {
      const payload = buildUnifiedPayload({ solution: solutionText, resolution: solutionText });
      await axiosClient.put(`/v1/api/notifications/${selectedIncident.id}/close`, payload);
      
      showToast('success', 'Incidente cerrado correctamente.');
      setSelectedIncident(null);
      fetchInitialData();
    } catch (error: any) {
      showToast('error', 'Error al cerrar el incidente.');
    }
  };

  const handleTemplateSelect = (type: string, templateName: string, advanceIndex?: number) => {
    const found = templates.find(t => t.name === templateName);
    if (!found) return;

    const messageContent = found.message || found.messageTemplate || found.content || found.body || '';

    setFormData((prev: any) => {
      if (type === 'description') {
        return { ...prev, description: messageContent };
      }
      if (type === 'solution') {
        return { ...prev, solution: messageContent, resolution: messageContent };
      }
      if (type === 'advances') {
        const currentAdvances = [...(prev.advances || prev.comments || prev.updates || [])];
        if (advanceIndex !== undefined && currentAdvances[advanceIndex]) {
          currentAdvances[advanceIndex] = {
            ...currentAdvances[advanceIndex],
            sequence: advanceIndex + 1,
            content: messageContent,
            message: messageContent
          };
        }
        return { ...prev, comments: currentAdvances, updates: currentAdvances, advances: currentAdvances };
      }
      return prev;
    });
  };

  return {
    incidents, 
    availableServices, 
    templates, 
    selectedIncident, 
    isCreating,
    setIsCreating,
    filterType, 
    loading, 
    formData, 
    setFormData, 
    affectedServices,
    isTemplateModalOpen, 
    setIsTemplateModalOpen, 
    toast,
    setFilterType, 
    handleStartCreate, 
    handleSelectIncident,
    handleAddService, 
    handleDeleteService, 
    handleServiceChange,
    handleApplyFirstStartTime, 
    handleApplyFirstEndTime, 
    handleApplyFirstAffectationType,
    handleSetCurrentStartTimeFirst,
    handleSetCurrentEndTimeFirst,
    handleSubmit, 
    handleCloseIncident, 
    handleTemplateSelect, 
    fetchInitialData
  };
}