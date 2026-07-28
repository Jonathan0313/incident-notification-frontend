import { useState, useEffect, useRef } from 'react';
import type { Service } from '../domain/service';
import { serviceService } from '../services/serviceService';

export function useServiceManagement(
  showToast?: (type: 'success' | 'error', defaultMessage: string, errorObj?: any) => void
) {
  const [services, setServices] = useState<Service[]>([]);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [searchCode, setSearchCode] = useState<string>('');
  const [isSaving, setIsSaving] = useState<boolean>(false);

  const [formData, setFormData] = useState<Service>({
    code: '',
    name: '',
    isBia: false,
    active: true
  });

  const isInitialMount = useRef(true);

  useEffect(() => {
    fetchAllServices();
  }, []);

  useEffect(() => {
    if (selectedService) {
      isInitialMount.current = true;
      setFormData(selectedService);
    } else {
      resetFormState();
    }
  }, [selectedService]);

  // Autoguardado silencioso con debounce
  useEffect(() => {
    if (!selectedService || !formData.code) return;

    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    const timer = setTimeout(async () => {
      try {
        setIsSaving(true);
        await serviceService.updateService(formData.code, formData);
        fetchAllServices(true);
      } catch (error: any) {
        console.error('Error silencioso en autoguardado:', error);
        if (showToast) {
          const backendMsg = error?.response?.data?.message || error?.response?.data?.error || error?.message;
          showToast('error', backendMsg || 'Error al autoguardar los cambios del servicio.', error);
        }
      } finally {
        setIsSaving(false);
      }
    }, 1500);

    return () => clearTimeout(timer);
  }, [formData]);

  const resetFormState = () => {
    isInitialMount.current = false;
    setFormData({ code: '', name: '', isBia: false, active: true });
  };

  const resetForm = () => {
    setSelectedService(null);
    resetFormState();
  };

  const fetchAllServices = async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      const data = await serviceService.getAllServices();
      setServices(data);
      if (!silent) setSearchCode('');
    } catch (error: any) {
      console.error('Error al cargar servicios:', error);
      if (showToast && !silent) {
        const backendMsg = error?.response?.data?.message || error?.response?.data?.error || error?.message;
        showToast('error', backendMsg || 'No se pudieron cargar los servicios desde el servidor.', error);
      }
    } finally {
      if (!silent) setLoading(false);
    }
  };

  const handleSearchByCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchCode.trim()) {
      fetchAllServices();
      return;
    }

    try {
      setLoading(true);
      const data = await serviceService.getServiceByCode(searchCode.trim());
      setServices(data ? [data] : []);
    } catch (error: any) {
      console.error('No se encontró el servicio:', error);
      setServices([]);
      if (showToast) {
        const backendMsg = error?.response?.data?.message || error?.response?.data?.error || error?.message;
        showToast('error', backendMsg || 'Error al buscar el servicio por código.', error);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSaving(true);
      if (selectedService) {
        await serviceService.updateService(formData.code, formData);
      } else {
        await serviceService.createService(formData);
        resetForm();
      }
      await fetchAllServices(true);
    } catch (error: any) {
      console.error('Error controlado al guardar:', error);
      
      // 🟢 EXTRACCIÓN DIRECTA: Obtenemos el mensaje real del backend (Ej: "El código ya existe")
      if (showToast) {
        const backendMsg = error?.response?.data?.message || error?.response?.data?.error || error?.message;
        showToast('error', backendMsg || 'Error al guardar el servicio.', error);
      }

      throw error; // Mantenemos la propagación por si la vista principal también lo necesita
    } finally {
      setIsSaving(false);
    }
  };

  return {
    services,
    selectedService,
    loading,
    searchCode,
    formData,
    isSaving,
    setSearchCode,
    setFormData,
    setSelectedService,
    resetForm,
    fetchAllServices,
    handleSearchByCode,
    handleSave
  };
}