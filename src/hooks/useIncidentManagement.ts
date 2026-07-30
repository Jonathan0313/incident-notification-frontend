import { useState, useEffect } from 'react';
import { incidentService } from '../services/incidentService';
import { useAffectedServices } from './useAffectedServices';
import { useIncidentTemplate } from './useIncidentTemplate';

const initialFormState = {
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
  comments: []
};

export function useIncidentManagement() {
  const [incidents, setIncidents] = useState<any[]>([]);
  const [availableServices, setAvailableServices] = useState<any[]>([]);
  const [templates, setTemplates] = useState<any[]>([]);
  
  const [selectedIncident, setSelectedIncident] = useState<any | null>(null);
  const [isCreating, setIsCreating] = useState<boolean>(false);
  const [filterType, setFilterType] = useState<'open' | 'closed_recent' | 'templates'>('open');
  const [loading, setLoading] = useState<boolean>(false);
  
  const [formData, setFormData] = useState<any>(initialFormState);
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState<boolean>(false);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const showToast = (type: 'success' | 'error', message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4500);
  };

  const affectedServicesManager = useAffectedServices([]);
  const { affectedServices, setAffectedServices } = affectedServicesManager;

  const { handleCopyTemplate } = useIncidentTemplate(formData, affectedServices, showToast);

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

      const rawServices = await incidentService.getAllServices();
      setAvailableServices(Array.isArray(rawServices) ? rawServices : (rawServices?.content || rawServices?.data || []));

      const rawTpl = incidentService.getTemplates ? await incidentService.getTemplates() : [];
      const tplArray = Array.isArray(rawTpl) ? rawTpl : (rawTpl?.content || rawTpl?.data || []);

      const sortedTemplates = tplArray.sort((a: any, b: any) => {
        const nameA = a.name?.toLowerCase() || '';
        const nameB = b.name?.toLowerCase() || '';
        return nameA.localeCompare(nameB);
      });

      setTemplates(sortedTemplates);

      if (filterType === 'open') {
        const rawOpen = await incidentService.getOpen();
        setIncidents(Array.isArray(rawOpen) ? rawOpen : (rawOpen?.content || rawOpen?.data || []));
      } else if (filterType === 'closed_recent') {
        const rawClosed = await incidentService.getClosedRecent();
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
    setFormData(initialFormState);
    setAffectedServices([]);
  };

  const handleSelectIncident = async (inc: any) => {
    setIsCreating(false);
    setSelectedIncident(inc);
    
    const initialComments = Array.isArray(inc.comments) ? inc.comments : [];
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
      comments: initialComments
    });
    setAffectedServices(inc.affectedServices || inc.services || []);

    if (!inc?.id) return;

    try {
      setLoading(true);
      const fullData = await incidentService.getById(inc.id);
      
      const resolvedSol = fullData.solution || fullData.resolution || '';
      const rawFullComments = fullData.comments || inc.comments || [];
      const resolvedComments = Array.isArray(rawFullComments) ? rawFullComments : [];
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
        comments: resolvedComments
      });
      setAffectedServices(fullData.affectedServices || inc.affectedServices || []);
    } catch (error) {
      showToast('error', 'No se pudieron actualizar todos los detalles.');
    } finally {
      setLoading(false);
    }
  };

  const buildUnifiedPayload = (customFields: any = {}) => {
    const targetRaw = customFields.comments || formData.comments;
    const rawComments = Array.isArray(targetRaw) ? targetRaw : [];
    
    const formattedComments = rawComments
      .map((comm: any, idx: number) => ({
        sequence: comm?.sequence || idx + 1,
        content: comm?.content || comm?.message || comm?.text || ''
      }))
      .filter((comm: any) => comm.content.trim() !== '');

    const caseValue = formData.partnerCase || formData.aliasedCase || '';
    const solValue = customFields.solution || formData.solution || formData.resolution || '';

    const payload = {
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
      comments: formattedComments,
      ...customFields
    };

    return payload;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = buildUnifiedPayload();
      
      if (isCreating) {
        const responseData = await incidentService.create(payload);

        const createdIncident = {
          ...(responseData || {}),
          ...payload,
          id: responseData?.id || Date.now(),
          name: formData.name,
          title: formData.name
        };
        
        showToast('success', 'Incidente registrado correctamente.');
        setIsCreating(false);
        setIncidents(prev => [createdIncident, ...prev.filter(inc => inc.id !== createdIncident.id)]);
        setSelectedIncident(createdIncident);
      } else {
        const responseData = await incidentService.update(selectedIncident?.id, payload);

        const updatedIncident = {
          ...(responseData || {}),
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

  const handleCloseIncident = async (currentCommentsFromUI?: any[]) => {
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
      const rawSource = 
        (Array.isArray(currentCommentsFromUI) && currentCommentsFromUI.length > 0 ? currentCommentsFromUI : null) ||
        (Array.isArray(formData.comments) && formData.comments.length > 0 ? formData.comments : null) ||
        [];

      const formattedComments = rawSource
        .map((comm: any, idx: number) => ({
          sequence: comm?.sequence || idx + 1,
          content: comm?.content || comm?.message || comm?.text || ''
        }))
        .filter((comm: any) => comm.content.trim() !== '');

      const payload = buildUnifiedPayload({ 
        solution: solutionText, 
        resolution: solutionText,
        comments: formattedComments
      });

      await incidentService.close(selectedIncident.id, payload);
      
      showToast('success', 'Incidente cerrado correctamente.');
      setSelectedIncident(null);
      fetchInitialData();
    } catch (error: any) {
      const errorData = error?.response?.data;
      let errorMessage = 'Error al cerrar el incidente.';
      if (errorData && typeof errorData === 'object' && !Array.isArray(errorData)) {
        const messages = Object.values(errorData);
        errorMessage = messages.length > 0 ? messages.join(' | ') : (errorData.message || errorMessage);
      } else if (typeof errorData === 'string') {
        errorMessage = errorData;
      }
      showToast('error', errorMessage);
    }
  };

  const handleTemplateSelect = (type: string, templateName: string, commentIndex?: number) => {
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
      if (type === 'comments') {
        const currentComments = Array.isArray(prev.comments) ? [...prev.comments] : [];
          
        if (commentIndex !== undefined) {
          currentComments[commentIndex] = {
            ...(currentComments[commentIndex] || {}),
            sequence: commentIndex + 1,
            content: messageContent,
            message: messageContent
          };
        }
        return { ...prev, comments: currentComments };
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
    isTemplateModalOpen, 
    setIsTemplateModalOpen, 
    toast,
    setFilterType, 
    handleStartCreate, 
    handleSelectIncident,
    handleCopyTemplate,
    handleSubmit, 
    handleCloseIncident, 
    handleTemplateSelect, 
    fetchInitialData,
    ...affectedServicesManager
  };
}