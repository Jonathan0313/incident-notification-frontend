import { axiosClient } from './axiosClient';

export interface ServiceImpactDto {
  code: string;
  nameService: string;
  status: string;
  startTime?: string;
  endTime?: string;
}

export interface NotificationTemplate {
  id?: string;
  name: string;
  impact: string;
  functionality: string;
  jira?: string;
  partnerCase?: string;
  affectedComponent: string;
  description: string;
  resolution?: string;
  affectedServices: ServiceImpactDto[];
  status?: string;
  createdAt?: string;
}

// 🟢 Extractor universal enfocado en leer la propiedad "message" del backend
const extractBackendError = (error: any, defaultMsg: string): never => {
  const data = error?.response?.data;
  let errorMessage = '';

  if (data) {
    if (typeof data === 'string') {
      errorMessage = data;
    } else if (typeof data === 'object') {
      errorMessage = data.message || data.error || data.mensaje || data.details;
      if (!errorMessage) {
        errorMessage = JSON.stringify(data);
      }
    }
  }

  if (!errorMessage) {
    errorMessage = error?.message || defaultMsg;
  }

  throw new Error(errorMessage);
};

export const notificationTemplateService = {
  async getAll(): Promise<NotificationTemplate[]> {
    try {
      const response = await axiosClient.get('/v1/api/notification-templates');
      const rawData = response.data;
      return Array.isArray(rawData) ? rawData : (rawData?.content || rawData?.data || []);
    } catch (error) {
      extractBackendError(error, 'Error al obtener las plantillas');
    }
  },

  async create(template: NotificationTemplate): Promise<NotificationTemplate> {
    try {
      const response = await axiosClient.post('/v1/api/notification-templates', template);
      return response.data;
    } catch (error) {
      extractBackendError(error, 'Error al guardar la plantilla');
    }
  },

  async update(id: string, template: NotificationTemplate): Promise<NotificationTemplate> {
    // 🟢 DEFENSA TOTAL: Imprime en consola exactamente qué ID se está enviando a la API de plantillas
    console.log("🛠️ Intentando actualizar plantilla con ID:", id);

    if (!id || String(id).trim() === '' || String(id).length < 5) {
      throw new Error('ID de plantilla inválido o no seleccionado.');
    }

    try {
      const response = await axiosClient.put(`/v1/api/notification-templates/${id}`, template);
      return response.data;
    } catch (error) {
      extractBackendError(error, 'Error al actualizar la plantilla');
    }
  },

  async delete(id: string): Promise<void> {
    if (!id || String(id).trim() === '') {
      throw new Error('ID de plantilla inválido o no seleccionado.');
    }

    try {
      await axiosClient.delete(`/v1/api/notification-templates/${id}`);
    } catch (error) {
      extractBackendError(error, 'Error al eliminar la plantilla');
    }
  }
};