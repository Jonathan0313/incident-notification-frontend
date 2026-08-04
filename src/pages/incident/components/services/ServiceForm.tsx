import { useState, useEffect } from 'react';
import { axiosClient } from '../../../../services/axiosClient';
import type { Service } from '../../../ServiceManagementPage';

interface ServiceFormProps {
  selectedService: Service | null;
  setSelectedService: (service: Service | null) => void;
  refreshServices: () => void;
  showToast: (type: 'success' | 'error', message: string) => void;
}

export function ServiceForm({ selectedService, setSelectedService, refreshServices, showToast }: ServiceFormProps) {
  const [formData, setFormData] = useState<Service>({
    id: undefined,
    name: '',
    isBia: false,
    active: true
  });

  useEffect(() => {
    if (selectedService) {
      setFormData(selectedService);
    } else {
      resetForm();
    }
  }, [selectedService]);

  const resetForm = () => {
    setFormData({ id: undefined, name: '', isBia: false, active: true });
    setSelectedService(null);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (selectedService) {
        // 💡 Usamos el nombre original (o el nuevo formData.name) según lo que espere tu backend para actualizar
        await axiosClient.put(`/v1/api/services/${encodeURIComponent(selectedService.name)}`, formData);
        showToast('success', 'Servicio actualizado con éxito');
      } else {
        await axiosClient.post('/v1/api/services', formData);
        showToast('success', 'Servicio creado con éxito');
      }
      refreshServices();
      resetForm();
    } catch (error: any) {
      console.error('Error al guardar el servicio:', error);
      
      const backendMessage = 
        error?.response?.data?.message || 
        error?.response?.data?.error || 
        (typeof error?.response?.data === 'string' ? error.response.data : null) ||
        error?.message || 
        'Ocurrió un error al guardar el servicio';

      showToast('error', backendMessage);
    }
  };

  return (
    <div style={{ flex: 1, background: '#fff', padding: '20px', borderRadius: '8px', border: '1px solid var(--border-color)', height: 'fit-content' }}>
      <h3 style={{ marginTop: 0 }}>
        {selectedService ? '✏️ Modificar Servicio' : '➕ Crear Nuevo Servicio'}
      </h3>
      
      <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <div>
          <label style={{ fontSize: '13px', fontWeight: 'bold' }}>Nombre del Servicio:</label>
          <input 
            type="text" 
            value={formData.name} 
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Ej. Servicio de Pagos"
            required
            style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid var(--border-color)', marginTop: '4px', boxSizing: 'border-box' }}
          />
        </div>

        <div style={{ display: 'flex', gap: '20px', marginTop: '5px' }}>
          <label style={{ fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
            <input 
              type="checkbox" 
              checked={formData.isBia} 
              onChange={(e) => setFormData({ ...formData, isBia: e.target.checked })}
            />
            Es BIA
          </label>

          <label style={{ fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
            <input 
              type="checkbox" 
              checked={formData.active} 
              onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
            />
            Activo
          </label>
        </div>

        <div style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
          <button type="submit" style={{ backgroundColor: '#2563eb', color: 'white', border: 'none', padding: '8px 15px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
            {selectedService ? 'Actualizar' : 'Guardar'}
          </button>
          {selectedService && (
            <button type="button" onClick={resetForm} style={{ backgroundColor: '#e2e8f0', border: 'none', padding: '8px 15px', borderRadius: '4px', cursor: 'pointer' }}>
              Cancelar
            </button>
          )}
        </div>
      </form>
    </div>
  );
}