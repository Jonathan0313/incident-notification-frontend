import { useState, useEffect, useRef } from 'react';
import { incidentService } from '../pages/incident/components/services/incidentService';

export interface Service {
  id?: string | number;
  name?: string;
  code?: string;
  [key: string]: any;
}

export interface Incident {
  id: string | number;
  name: string;
  impact: string;
  functionality?: string;
  affectedComponent?: string;
  jira?: string;
  partnerCase?: string;
  description: string;
  resolution?: string;
  comments?: any[];
  affectedServices?: any[];
  [key: string]: any;
}

const getIconForAffectation = (type: string) => {
  switch (type) {
    case 'OK': return '✅';
    case 'Parcial': return '⚠️';
    case 'Total': return '❌';
    default: return '✅';
  }
};

const validateDateFormat = (dateStr: string) => {
  const regex = /^\d{2}\/\d{2}\/\d{4} \d{2}:\d{2}$/;
  return regex.test(dateStr);
};

const getCurrentFormattedDate = () => {
  const now = new Date();
  const day = String(now.getDate()).padStart(2, '0');
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const year = now.getFullYear();
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  return `${day}/${month}/${year} ${hours}:${minutes}`;
};

export function useIncidentForm(selectedIncident: Incident | null, onIncidentSaved: () => void, _showToast?: (type: 'success' | 'error', defaultMessage: string, errorObj?: any) => void) {
  const [isCreating, setIsCreating] = useState(false);
  const [availableServices, setAvailableServices] = useState<Service[]>([]);
  const [formData, setFormData] = useState<Incident | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);

  const isInitialMount = useRef(true);

  useEffect(() => {
    fetchAvailableServices();
  }, []);

  const fetchAvailableServices = async () => {
    try {
      const data = await incidentService.getAvailableServices();
      const sortedServices = data.sort((a: Service, b: Service) => {
        const nameA = a.name?.toLowerCase() || '';
        const nameB = b.name?.toLowerCase() || '';
        return nameA.localeCompare(nameB);
      });
      setAvailableServices(sortedServices);
    } catch (error) {
      console.error('Error al cargar la lista de servicios:', error);
    }
  };

  const handleSetCurrentStartTimeFirstService = () => {
    if (!formData) return;
    const services = (formData as any).affectedServices || [];
    if (services.length === 0) return;

    const currentDateTime = getCurrentFormattedDate();
    const updatedServices = services.map((srv: any, index: number) => {
      if (index === 0) {
        return { ...srv, startTime: currentDateTime };
      }
      return srv;
    });

    setFormData({ ...formData, affectedServices: updatedServices } as any);
  };

  const handleSetCurrentEndTimeFirstService = () => {
    if (!formData) return;
    const services = (formData as any).affectedServices || [];
    if (services.length === 0) return;

    const currentDateTime = getCurrentFormattedDate();
    const updatedServices = services.map((srv: any, index: number) => {
      if (index === 0) {
        return { ...srv, endTime: currentDateTime };
      }
      return srv;
    });

    setFormData({ ...formData, affectedServices: updatedServices } as any);
  };

  const handleApplyFirstAffectationType = () => {
    if (!formData) return;
    const services = (formData as any).affectedServices || [];
    if (services.length === 0) return;
    
    const firstStatus = services[0].status || 'OK';

    const updatedServices = services.map((srv: any) => ({
      ...srv,
      status: firstStatus
    }));
    
    setFormData({ ...formData, affectedServices: updatedServices } as any);
  };

  // 🚀 FUNCIÓN AÑADIDA: Limpiar las horas de inicio y fin de todos los servicios afectados
  const handleClearServiceTimes = () => {
    if (!formData) return;
    const services = (formData as any).affectedServices || [];
    if (services.length === 0) return;

    const updatedServices = services.map((srv: any) => ({
      ...srv,
      startTime: '',
      endTime: ''
    }));

    setFormData({ ...formData, affectedServices: updatedServices } as any);
  };

  useEffect(() => {
    if (selectedIncident && !isCreating) {
      isInitialMount.current = true;
      const mappedServices = ((selectedIncident as any).affectedServices || []).map((srv: any, idx: number) => {
        const rawType = srv.status || 'OK';
        const rawServiceName = srv.nameService || srv.serviceName || srv.name || '';

        return {
          ...srv,
          code: srv.code || srv.id || `SRV-${String(idx + 1).padStart(3, '0')}`,
          nameService: typeof rawServiceName === 'string' ? rawServiceName.trim() : rawServiceName,
          status: rawType
        };
      });

      setFormData({
        ...selectedIncident,
        functionality: selectedIncident.functionality || '',
        affectedComponent: selectedIncident.affectedComponent || '',
        comments: selectedIncident.comments || [],
        affectedServices: mappedServices
      } as any);
      setErrors({});
    }
  }, [selectedIncident, isCreating]);

  const buildPayload = (currentData: Incident) => {
    const func = currentData.functionality || '';
    const comp = currentData.affectedComponent || '';

    return {
      name: currentData.name || '',
      impact: currentData.impact || '',
      functionality: func,
      affectedComponent: comp,
      description: currentData.description || '',
      jira: currentData.jira || '',
      partnerCase: currentData.partnerCase || '',
      resolution: currentData.resolution || '',
      
      affectedServices: (currentData.affectedServices || []).map((srv: any, index: number) => {
        const serviceStatus = srv.status || 'OK';
        const serviceCode = srv.code || srv.id || `SRV-${String(index + 1).padStart(3, '0')}`;

        return {
          code: serviceCode,
          nameService: srv.nameService || srv.name || '',
          status: serviceStatus,
          startTime: srv.startTime || '',
          endTime: srv.endTime || ''
        };
      }),
      comments: currentData.comments || []
    };
  };

  useEffect(() => {
    if (!formData || isCreating || !formData.id) return;

    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    const timer = setTimeout(async () => {
      try {
        setIsSaving(true);
        const payloadToSend = buildPayload(formData);
        await incidentService.updateIncident(formData.id, payloadToSend);
        onIncidentSaved();
      } catch (error: any) {
        console.error('Error en el autoguardado:', error);
      } finally {
        setIsSaving(false);
      }
    }, 1500);

    return () => clearTimeout(timer);
  }, [formData]);

  const handleStartCreate = () => {
    setIsCreating(true);
    isInitialMount.current = false;
    setErrors({});
    setFormData({
      id: '' as any,
      name: '',
      impact: '',
      functionality: '',
      affectedComponent: '',
      jira: '',
      partnerCase: '',
      description: '',
      resolution: '',
      comments: [],
      affectedServices: []
    } as any);
  };

  const validateForm = (): boolean => {
    if (!formData) return false;
    const newErrors: Record<string, string> = {};

    if (!formData.name?.trim()) newErrors.name = 'El nombre es obligatorio.';
    if (!formData.impact?.trim()) newErrors.impact = 'El impacto es obligatorio.';
    if (!formData.functionality?.trim()) newErrors.functionality = 'El campo Funcionalidades es obligatorio.';
    if (!formData.affectedComponent?.trim()) newErrors.affectedComponent = 'El campo Componentes Afectados es obligatorio.';
    if (!formData.description?.trim()) newErrors.description = 'La descripción de la falla es obligatoria.';

    const services = (formData as any).affectedServices || [];
    if (services.length === 0) {
      newErrors.services = 'Debe agregar al menos un servicio afectado.';
    } else {
      for (let i = 0; i < services.length; i++) {
        const srv = services[i];
        
        if (!srv.code && !srv.id) {
          newErrors.serviceCode = `El código del servicio es obligatorio en el servicio #${i + 1}.`;
          break;
        }

        const type = srv.status;
        if (!type || !String(type).trim()) {
          newErrors.serviceStatus = `El estado del servicio es obligatorio en el servicio #${i + 1}.`;
          break;
        }

        if (!srv.startTime?.trim()) {
          newErrors.serviceStartTime = 'Todos los servicios afectados deben tener una hora de inicio obligatoria.';
          break;
        }
        if (!validateDateFormat(srv.startTime)) {
          newErrors.serviceStartTime = `La hora de inicio en el servicio #${i + 1} no tiene el formato válido.`;
          break;
        }
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSaveAction = async () => {
    if (!validateForm()) {
      throw new Error("Por favor corrige los errores del formulario.");
    }
    
    try {
      const payloadToSend = buildPayload(formData!);

      if (isCreating) {
        await incidentService.createIncident(payloadToSend);
        setIsCreating(false);
      } else {
        await incidentService.updateIncident(formData!.id, payloadToSend);
      }
      onIncidentSaved();
    } catch (error: any) {
      const backendError = error?.response?.data;
      let detailedMessage = 'Ocurrió un error al procesar la solicitud en el servidor.';

      if (typeof backendError === 'string') {
        detailedMessage = backendError;
      } else if (backendError?.message) {
        detailedMessage = backendError.message;
      } else if (backendError?.errors) {
        if (typeof backendError.errors === 'object') {
          detailedMessage = Object.entries(backendError.errors)
            .map(([field, msg]) => `${field}: ${msg}`)
            .join(' | ');
        } else {
          detailedMessage = Object.values(backendError.errors).flat().join(', ');
        }
      } else if (error?.message) {
        detailedMessage = error.message;
      }

      throw new Error(detailedMessage);
    }
  };

  const handleCloseIncident = async (currentAdvancesFromUI?: any[]) => {
    if (!formData) return;
    
    const activeComments = currentAdvancesFromUI || formData.comments || (formData as any).advances || (formData as any).updates || [];

    const formWithComments = {
      ...formData,
      comments: activeComments
    };

    if (!validateForm()) {
      throw new Error("Por favor corrige los errores del formulario.");
    }

    if (!formWithComments.resolution || !formWithComments.resolution.trim()) {
      setErrors((prev) => ({ ...prev, resolution: 'El campo Solución es obligatorio para cerrar la notificación.' }));
      throw new Error("Debe registrar la solución antes de cerrar el incidente.");
    }

    const updatedServices = ((formWithComments as any).affectedServices || []).map((srv: any) => ({
      ...srv,
      status: 'OK'
    }));

    const dataToClose = buildPayload({ ...formWithComments, affectedServices: updatedServices });

    try {
      await incidentService.closeIncident(formData.id, dataToClose);
      setIsCreating(false);
      setFormData(null);
      onIncidentSaved();
    } catch (error: any) {
      const backendError = error?.response?.data;
      let detailedMessage = 'Error al cerrar el incidente en el servidor.';
      if (typeof backendError === 'string') detailedMessage = backendError;
      else if (backendError?.message) detailedMessage = backendError.message;
      throw new Error(detailedMessage);
    }
  };

  const handleCopyTemplate = async () => {
    if (!formData) return;

    const rawJiraInput = formData.jira || '';
    const ticketCode = rawJiraInput.includes('/') ? rawJiraInput.split('/').pop() : rawJiraInput;
    const fullJiraUrl = rawJiraInput.startsWith('http') 
      ? rawJiraInput 
      : `https://tu-empresa.atlassian.net/browse/${ticketCode}`;

    const servicesRows = ((formData as any).affectedServices || [])
      .map((srv: any) => {
        const icon = getIconForAffectation(srv.status);
        const name = srv.nameService || srv.name || 'Sin servicio';
        const type = srv.status || 'OK';
        const start = srv.startTime || 'N/A';
        const end = srv.endTime || '';
        return `
          <tr>
            <td style="border: 1px solid #d1d5db; padding: 12px 10px; text-align: center; vertical-align: middle;">
              <span style="display: inline-block; text-align: center; width: 100%;">${icon}</span>
            </td>
            <td style="border: 1px solid #d1d5db; padding: 12px 10px; vertical-align: middle; text-align: left;">${name}</td>
            <td style="border: 1px solid #d1d5db; padding: 12px 10px; vertical-align: middle; text-align: left;">${type}</td>
            <td style="border: 1px solid #d1d5db; padding: 12px 10px; vertical-align: middle; text-align: left;">${start}</td>
            <td style="border: 1px solid #d1d5db; padding: 12px 10px; vertical-align: middle; text-align: left;">${end}</td>
          </tr>
        `;
      })
      .join('');

    const commentsHtml = (formData.comments || [])
      .map((comment: any, idx: number) => {
        const text = comment?.content || comment?.text || '';
        return text ? `<li><b>Avance ${idx + 1}:</b> ${text}</li>` : '';
      })
      .filter(Boolean)
      .join('');

    const htmlContent = `
      <div style="font-family: Arial, sans-serif; font-size: 14px; color: #111827;">
        <p style="font-weight: bold; margin-bottom: 5px;">Servicios Afectados:</p>
        <table style="border-collapse: collapse; width: 100%; margin-bottom: 15px; font-size: 13px;">
          <thead>
            <tr style="background-color: #f3f4f6;">
              <th style="border: 1px solid #d1d5db; padding: 10px; text-align: center; vertical-align: middle; width: 80px;">ESTADO</th>
              <th style="border: 1px solid #d1d5db; padding: 10px; text-align: left; vertical-align: middle;">SERVICIO</th>
              <th style="border: 1px solid #d1d5db; padding: 10px; text-align: left; vertical-align: middle;">TIPO DE AFECTACIÓN</th>
              <th style="border: 1px solid #d1d5db; padding: 10px; text-align: left; vertical-align: middle;">HORA INICIO</th>
              <th style="border: 1px solid #d1d5db; padding: 10px; text-align: left; vertical-align: middle;">HORA FIN</th>
            </tr>
          </thead>
          <tbody>
            ${servicesRows || '<tr><td colspan="5" style="border: 1px solid #d1d5db; padding: 10px; text-align: center;">Ninguno</td></tr>'}
          </tbody>
        </table>

        <p><b>Impacto A Usuarios:</b> ${formData.impact}</p>
        <p><b>Jira:</b> <a href="${fullJiraUrl}" target="_blank" rel="noopener noreferrer">${ticketCode}</a></p>
        ${formData.partnerCase?.trim() ? `<p><b>Caso Aliado:</b> ${formData.partnerCase}</p>` : ''}
        <p><b>Componente Afectado:</b> ${formData.affectedComponent}</p>
        <p><b>Descripción de la falla:</b> ${formData.description}</p>

        ${commentsHtml ? `<ul style="padding-left: 20px; margin: 15px 0;">${commentsHtml}</ul>` : ''}

        ${formData.resolution?.trim() ? `<p style="margin-top: 15px;"><b>Solución:</b> ${formData.resolution}</p>` : ''}
      </div>
    `;

    const servicesPlainText = ((formData as any).affectedServices || [])
      .map((srv: any) => {
        const icon = getIconForAffectation(srv.status);
        const name = srv.nameService || srv.name || 'Sin servicio';
        const type = srv.status || 'OK';
        const start = srv.startTime || 'N/A';
        const end = srv.endTime || '';
        return `- ${icon} Servicio: ${name} | Estado: ${type} | Inicio: ${start} | Fin: ${end}`;
      })
      .join('\n');

    const commentsPlainText = (formData.comments || [])
      .map((comment: any, idx: number) => {
        const text = comment?.content || comment?.text || '';
        return text ? `Avance ${idx + 1}: ${text}` : '';
      })
      .filter(Boolean)
      .join('\n');

    const plainText = [
      `Servicios Afectados:`,
      servicesPlainText || '- Ninguno',
      ``,
      `Impacto A Usuarios: ${formData.impact}`,
      `Jira: ${ticketCode} (${fullJiraUrl})`,
      formData.partnerCase?.trim() ? `Caso Aliado: ${formData.partnerCase}` : '',
      `Componente Afectado: ${formData.affectedComponent}`,
      `Descripción de la falla: ${formData.description}`,
      commentsPlainText ? `\n${commentsPlainText}` : '',
      formData.resolution?.trim() ? `\nSolución: ${formData.resolution}` : ''
    ].filter(Boolean).join('\n');

    const clipboardItem = new ClipboardItem({
      'text/html': new Blob([htmlContent], { type: 'text/html' }),
      'text/plain': new Blob([plainText], { type: 'text/plain' })
    });
    await navigator.clipboard.write([clipboardItem]);
  };

  const handleApplyFirstStartTime = () => {
    if (!formData) return;
    const services = (formData as any).affectedServices || [];
    if (services.length === 0) return;
    
    const firstStartTime = services[0].startTime || '';
    const updatedServices = services.map((srv: any) => ({
      ...srv,
      startTime: firstStartTime
    }));
    
    setFormData({ ...formData, affectedServices: updatedServices } as any);
  };

  const handleApplyFirstEndTime = () => {
    if (!formData) return;
    const services = (formData as any).affectedServices || [];
    if (services.length === 0) return;
    
    const firstEndTime = services[0].endTime || '';
    const updatedServices = services.map((srv: any) => ({
      ...srv,
      endTime: firstEndTime
    }));
    
    setFormData({ ...formData, affectedServices: updatedServices } as any);
  };

  return {
    isCreating,
    availableServices,
    formData,
    errors,
    isSaving,
    setIsCreating,
    setFormData,
    setErrors,
    handleStartCreate,
    handleSaveAction,
    handleCloseIncident,
    handleCopyTemplate,
    handleApplyFirstStartTime,
    handleApplyFirstEndTime,
    handleApplyFirstAffectationType,
    handleSetCurrentStartTimeFirstService,
    handleSetCurrentEndTimeFirstService,
    handleClearServiceTimes, // 👈 Exportado aquí correctamente
  };
}