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

  const handleMatchEndTimeWithStartTime = () => {
    setAffectedServices(prevServices => {
      if (!prevServices || prevServices.length === 0) return prevServices;
      
      const updated = [...prevServices];
      const firstService = updated[0];

      updated[0] = {
        ...firstService,
        endTime: firstService.startTime || firstService.endTime || ''
      };
      
      return updated;
    });
  };

  // ==========================================
  // FUNCIÓN COPIAR PLANTILLA CON FORMATO HTML
  // ==========================================
  const handleCopyTemplate = async () => {
    if (!formData) return;

    const rawJiraInput = formData.jira || '';
    const ticketCode = rawJiraInput.includes('/') ? rawJiraInput.split('/').pop() : rawJiraInput;
    const fullJiraUrl = rawJiraInput.startsWith('http') 
      ? rawJiraInput 
      : `https://tu-empresa.atlassian.net/browse/${ticketCode}`;

    // Construcción de texto plano limpio
    let servicesPlainText = "Servicios Afectados:\n";
    if (affectedServices && affectedServices.length > 0) {
      affectedServices.forEach((srv: any) => {
        const statusUpper = (srv.status || 'OK').toUpperCase();
        let icon = '✔';
        if (statusUpper === 'TOTAL') icon = '❌';
        else if (statusUpper === 'PARCIAL') icon = '⚠️';

        const name = srv.nameService || srv.name || 'Sin servicio';
        const type = srv.status || 'OK';
        const start = srv.startTime || 'N/A';
        const end = srv.endTime || 'N/A';

        servicesPlainText += `- ${icon} Servicio: ${name} | Tipo de Afectación: ${type} | Hora Inicio: ${start} | Hora Fin: ${end}\n`;
      });
    } else {
      servicesPlainText += "- Ninguno\n";
    }

    const rawAdvances = formData.advances || formData.comments || formData.updates || [];
    let advancesPlainText = "";
    if (Array.isArray(rawAdvances) && rawAdvances.length > 0) {
      const validAdvances = rawAdvances.filter((adv: any) => (adv.content || adv.message || adv.text || '').trim() !== '');
      if (validAdvances.length > 0) {
        validAdvances.forEach((adv: any, idx: number) => {
          const text = adv.content || adv.message || adv.text || '';
          advancesPlainText += `• Avance ${idx + 1}: ${text}\n`;
        });
      }
    }

    const plainTextParts = [
      servicesPlainText,
      formData.impact ? `Impacto A Usuarios: ${formData.impact}` : '',
      formData.functionality ? `Funcionalidades OK: ${formData.functionality}` : '',
      ticketCode ? `Jira: ${ticketCode} (${fullJiraUrl})` : '',
      (formData.partnerCase || formData.aliasedCase)?.trim() ? `Caso Aliado: ${formData.partnerCase || formData.aliasedCase}` : '',
      formData.affectedComponent ? `Componente Afectado: ${formData.affectedComponent}` : '',
      formData.description ? `Descripción de la falla: ${formData.description}` : '',
      advancesPlainText.trim() ? `\n${advancesPlainText.trim()}` : '',
      (formData.solution || formData.resolution)?.trim() ? `Solución: ${formData.solution || formData.resolution}` : ''
    ];

    const finalPlainText = plainTextParts.filter(Boolean).join('\n');

    // HTML limpio SIN etiquetas <a> para evitar que se autogenere como hipervínculo o enlace azul
    const servicesRows = (affectedServices || [])
      .map((srv: any) => {
        const statusUpper = (srv.status || 'OK').toUpperCase();
        let icon = '✅';
        if (statusUpper === 'TOTAL') icon = '❌';
        else if (statusUpper === 'PARCIAL') icon = '⚠️';

        return `
          <tr>
            <td style="border: 1px solid #d1d5db; padding: 6px; text-align: center;">${icon}</td>
            <td style="border: 1px solid #d1d5db; padding: 6px;">${srv.nameService || srv.name || 'Sin servicio'}</td>
            <td style="border: 1px solid #d1d5db; padding: 6px;">${srv.status || 'OK'}</td>
            <td style="border: 1px solid #d1d5db; padding: 6px;">${srv.startTime || 'N/A'}</td>
            <td style="border: 1px solid #d1d5db; padding: 6px;">${srv.endTime || 'N/A'}</td>
          </tr>
        `;
      })
      .join('');

    const commentsHtml = rawAdvances
      .map((comment: any, idx: number) => {
        const text = comment?.content || comment?.message || comment?.text || '';
        return text ? `<li><b>Avance ${idx + 1}:</b> ${text}</li>` : '';
      })
      .filter(Boolean)
      .join('');

    const htmlContent = `
      <div style="font-family: Arial, sans-serif; font-size: 13px; color: #000000;">
        <p style="font-weight: bold; margin: 0 0 5px 0;">Servicios Afectados:</p>
        <table style="border-collapse: collapse; width: 100%; margin-bottom: 12px; font-size: 12px;">
          <thead>
            <tr style="background-color: #f3f4f6;">
              <th style="border: 1px solid #d1d5db; padding: 6px;">ESTADO</th>
              <th style="border: 1px solid #d1d5db; padding: 6px;">SERVICIO</th>
              <th style="border: 1px solid #d1d5db; padding: 6px;">TIPO DE AFECTACIÓN</th>
              <th style="border: 1px solid #d1d5db; padding: 6px;">HORA INICIO</th>
              <th style="border: 1px solid #d1d5db; padding: 6px;">HORA FIN</th>
            </tr>
          </thead>
          <tbody>
            ${servicesRows || '<tr><td colspan="5" style="border: 1px solid #d1d5db; padding: 6px; text-align: center;">Ninguno</td></tr>'}
          </tbody>
        </table>
        ${formData.impact ? `<p style="margin: 4px 0;"><b>Impacto A Usuarios:</b> ${formData.impact}</p>` : ''}
        ${formData.functionality ? `<p style="margin: 4px 0;"><b>Funcionalidades OK:</b> ${formData.functionality}</p>` : ''}
        ${ticketCode ? `<p style="margin: 4px 0;"><b>Jira:</b> ${ticketCode} (${fullJiraUrl})</p>` : ''}
        ${(formData.partnerCase || formData.aliasedCase)?.trim() ? `<p style="margin: 4px 0;"><b>Caso Aliado:</b> ${formData.partnerCase || formData.aliasedCase}</p>` : ''}
        ${formData.affectedComponent ? `<p style="margin: 4px 0;"><b>Componente Afectado:</b> ${formData.affectedComponent}</p>` : ''}
        ${formData.description ? `<p style="margin: 4px 0;"><b>Descripción de la falla:</b> ${formData.description}</p>` : ''}
        ${commentsHtml ? `<ul style="padding-left: 20px; margin: 8px 0;">${commentsHtml}</ul>` : ''}
        ${(formData.solution || formData.resolution)?.trim() ? `<p style="margin: 4px 0;"><b>Solución:</b> ${formData.solution || formData.resolution}</p>` : ''}
      </div>
    `;

    try {
      const clipboardItem = new ClipboardItem({
        'text/html': new Blob([htmlContent], { type: 'text/html' }),
        'text/plain': new Blob([finalPlainText], { type: 'text/plain' })
      });
      await navigator.clipboard.write([clipboardItem]);
      showToast('success', '¡Plantilla copiada correctamente!');
    } catch (err) {
      showToast('error', 'No se pudo copiar la plantilla.');
    }
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
    handleMatchEndTimeWithStartTime,
    handleCopyTemplate,
    handleSubmit, 
    handleCloseIncident, 
    handleTemplateSelect, 
    fetchInitialData
  };
}