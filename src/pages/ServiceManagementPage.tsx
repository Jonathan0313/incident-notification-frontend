import { useState, useEffect } from 'react';
import { axiosClient } from '../services/axiosClient';
import { ServiceForm } from './incident/components/services/ServiceForm';
import { ServiceTable } from './incident/components/services/ServiceTable';
import { Toast } from './incident/components/ui/Toast';

export interface Service {
  id?: number;
  name: string;
  isBia: boolean;
  active: boolean;
}

export default function ServiceManagementPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const showToast = (type: 'success' | 'error', message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3500);
  };

  useEffect(() => { fetchAllServices(); }, []);

  const fetchAllServices = async () => {
    try {
      setLoading(true);
      const response = await axiosClient.get<Service[]>('/v1/api/services/all');
      setServices(response.data);
    } catch (error: any) {
      showToast('error', error?.response?.data?.message || 'Error al cargar los servicios');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', gap: '20px', padding: '20px', position: 'relative', minHeight: '80vh' }}>
      <ServiceForm 
        selectedService={selectedService} 
        setSelectedService={setSelectedService} 
        refreshServices={fetchAllServices} 
        showToast={showToast} 
      />
      <ServiceTable 
        services={services} 
        loading={loading} 
        onEdit={(service) => setSelectedService(service)} 
        refreshServices={fetchAllServices}
        setServices={setServices}
        showToast={showToast}
      />
      {toast && <Toast type={toast.type} message={toast.message} />}
    </div>
  );
}