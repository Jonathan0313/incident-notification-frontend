import { useState, useEffect } from 'react';
import type { Incident } from '../domain/incident';
import type { Service } from '../domain/service';
import { incidentService } from '../services/incidentService';
import { getIconForAffectation, normalizeAffectationType, validateDateFormat, getCurrentFormattedDate } from '../utils/incidentHelpers';

export function useIncidentForm(selectedIncident: Incident | null, onIncidentSaved: () => void) {
  const [isCreating, setIsCreating] = useState(false);
  const [availableServices, setAvailableServices] = useState<Service[]>([]);
  const [formData, setFormData] = useState<Incident | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    fetchAvailableServices();
  }, []);

  const fetchAvailableServices = async () => {
    try {
      const data = await incidentService.getAvailableServices();
      
      // Tipamos 'a' y 'b' como Service
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
    
    const firstAffectationType = services[0].affectationType || 'OK';
    const firstIcon = getIconForAffectation(firstAffectationType);

    const updatedServices = services.map((srv: any) => ({
      ...srv,
      affectationType: firstAffectationType,
      status: firstIcon
    }));
    
    setFormData({ ...formData, affectedServices: updatedServices } as any);
  };

  useEffect(() => {
    if (selectedIncident && !isCreating) {
      const mappedServices = ((selectedIncident as any).affectedServices || []).map((srv: any) => {
        const rawType = srv.affectationType || srv.status || 'OK';
        const cleanType = normalizeAffectationType(rawType);
        
        const rawServiceName = 
          srv.nameService || srv.serviceName || srv.name || srv.service || 
          (typeof srv.service === 'object' ? srv.service?.name : '') || '';

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
  }, [selectedIncident, isCreating]);

  const handleStartCreate = () => {
    setIsCreating(true);
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
        if (srv.endTime && srv.endTime.trim() !== '') {
          if (!validateDateFormat(srv.endTime)) {
            newErrors.serviceEndTime = `La hora de fin en el servicio #${i + 1} no tiene el formato válido (DD/MM/YYYY HH:mm).`;
            break;
          }
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
        await incidentService.createIncident(formData!);
        alert('Nuevo incidente creado exitosamente.');
        setIsCreating(false);
      } else {
        await incidentService.updateIncident(formData!.id, formData!);
        alert('Cambios guardados exitosamente.');
      }
      onIncidentSaved();
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

    const dataToClose = { ...formData, affectedServices: updatedServices };

    try {
      await incidentService.closeIncident(dataToClose.id, dataToClose);
      alert('Incidente cerrado exitosamente con todos sus servicios en OK.');
      setIsCreating(false);
      setFormData(null);
      onIncidentSaved();
    } catch (error) {
      console.error('Error al cerrar el incidente:', error);
      alert('Ocurrió un error al intentar cerrar la notificación.');
    }
  };

  const handleCopyTemplate = async () => {
    if (!formData) return;

    const servicesRows = ((formData as any).affectedServices || [])
      .map((srv: any) => {
        const icon = srv.status || getIconForAffectation(srv.affectationType);
        const name = srv.nameService || 'Sin servicio';
        const type = srv.affectationType || 'OK';
        const start = srv.startTime || 'N/A';
        const end = srv.endTime || '';
        return `
          <tr>
            <td style="border: 1px solid #d1d5db; padding: 12px 10px; text-align: center; vertical-align: middle;">
              <span style="display: inline-block; text-align: center; width: 100%;">${icon.trim()}</span>
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
        <p><b>Funcionalidades OK:</b> ${(formData as any).functionality}</p>
        <p><b>Jira:</b> ${formData.jira}</p>
        ${formData.partnerCase?.trim() ? `<p><b>Caso Aliado:</b> ${formData.partnerCase}</p>` : ''}
        <p><b>Componente Afectado:</b> ${(formData as any).affectedComponent}</p>
        <p><b>Descripción de la falla:</b> ${formData.description}</p>

        ${commentsHtml ? `<ul style="padding-left: 20px; margin: 15px 0;">${commentsHtml}</ul>` : ''}

        ${formData.resolution?.trim() ? `<p style="margin-top: 15px;">✅ <b>Solución:</b> ${formData.resolution}</p>` : ''}
      </div>
    `;

    const plainText = `Servicios Afectados:\n[Tabla de servicios]\n\nImpacto A Usuarios: ${formData.impact}\nFuncionalidades OK: ${(formData as any).functionality}\nJira: ${formData.jira}\nDescripción de la falla: ${formData.description}`;

    try {
      const clipboardItem = new ClipboardItem({
        'text/html': new Blob([htmlContent], { type: 'text/html' }),
        'text/plain': new Blob([plainText], { type: 'text/plain' })
      });
      await navigator.clipboard.write([clipboardItem]);
    } catch (err) {
      console.error('Error al copiar con formato:', err);
      alert('No se pudo copiar al portapapeles.');
    }
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
  };
}