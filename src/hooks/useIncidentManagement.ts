import { useState, useEffect } from 'react';
import type { Incident } from '../domain/incident';
import type { Service } from '../domain/service';
import { incidentService } from '../services/incidentService';

export function useIncidentManagement() {
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

  const fetchOpenIncidents = async () => {
    try {
      setLoading(true);
      const data = await incidentService.getOpenIncidents();
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
      const data = await incidentService.getAvailableServices();
      setAvailableServices(data);
    } catch (error) {
      console.error('Error al cargar la lista de servicios:', error);
    }
  };

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
  
  useEffect(() => {
    if (selectedIncident) {
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
  }, [selectedIncident]);

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

  const validateDateFormat = (dateStr: string): boolean => {
    const regex = /^(0[1-9]|[12][0-9]|3[01])\/(0[1-9]|1[0-2])\/\d{4} ([01][0-9]|2[0-3]):([0-5][0-9])$/;
    return regex.test(dateStr);
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
        fetchOpenIncidents();
      } else {
        await incidentService.updateIncident(formData!.id, formData!);
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

    const dataToClose = { ...formData, affectedServices: updatedServices };

    try {
      await incidentService.closeIncident(dataToClose.id, dataToClose);
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
      //alert('¡Plantilla copiada con éxito!');
    } catch (err) {
      console.error('Error al copiar con formato:', err);
      alert('No se pudo copiar al portapapeles.');
    }
  };

  return {
    incidents,
    selectedIncident,
    isCreating,
    loading,
    availableServices,
    formData,
    errors,
    setSelectedIncident,
    setIsCreating,
    setFormData,
    setErrors,
    fetchOpenIncidents,
    handleStartCreate,
    handleSaveAction,
    handleCloseIncident,
    getIconForAffectation,
    validateDateFormat,
    handleCopyTemplate
  };
}