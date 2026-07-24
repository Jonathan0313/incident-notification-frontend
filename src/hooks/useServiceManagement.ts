import { useState, useEffect } from 'react';
import type { Service } from '../domain/service';
import { serviceService } from '../services/serviceService';

export function useServiceManagement() {
  const [services, setServices] = useState<Service[]>([]);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [searchCode, setSearchCode] = useState<string>('');

  const [formData, setFormData] = useState<Service>({
    code: '',
    name: '',
    isBia: false,
    active: true
  });

  useEffect(() => {
    fetchAllServices();
  }, []);

  useEffect(() => {
    if (selectedService) {
      setFormData(selectedService);
    } else {
      resetForm();
    }
  }, [selectedService]);

  const resetForm = () => {
    setFormData({ code: '', name: '', isBia: false, active: true });
    setSelectedService(null);
  };

  const fetchAllServices = async () => {
    try {
      setLoading(true);
      const data = await serviceService.getAllServices();
      setServices(data);
      setSearchCode('');
    } catch (error) {
      console.error('Error al cargar todos los servicios:', error);
    } finally {
      setLoading(false);
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
    } catch (error) {
      console.error('No se encontró el servicio:', error);
      setServices([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (selectedService) {
        await serviceService.updateService(formData.code, formData);
        alert('Servicio actualizado con éxito');
      } else {
        await serviceService.createService(formData);
        alert('Servicio creado con éxito');
      }
      fetchAllServices();
      resetForm();
    } catch (error) {
      console.error('Error al guardar el servicio:', error);
      alert('Ocurrió un error al guardar el servicio');
    }
  };

  return {
    services,
    selectedService,
    loading,
    searchCode,
    formData,
    setSearchCode,
    setFormData,
    setSelectedService,
    resetForm,
    fetchAllServices,
    handleSearchByCode,
    handleSave
  };
}