const API_URL = 'http://localhost:8080/v1/api/notification-templates';

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

export const notificationTemplateService = {
  async getAll(): Promise<NotificationTemplate[]> {
    const response = await fetch(API_URL);
    if (!response.ok) throw new Error('Error al obtener las plantillas');
    return response.json();
  },

  async create(template: NotificationTemplate): Promise<NotificationTemplate> {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(template),
    });
    if (!response.ok) throw new Error('Error al guardar la plantilla');
    return response.json();
  },

  // 🔄 NUEVO: Actualizar plantilla existente
  async update(id: string, template: NotificationTemplate): Promise<NotificationTemplate> {
    const response = await fetch(`${API_URL}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(template),
    });
    if (!response.ok) throw new Error('Error al actualizar la plantilla');
    return response.json();
  },

  // 🗑️ NUEVO: Eliminar plantilla por ID
  async delete(id: string): Promise<void> {
    const response = await fetch(`${API_URL}/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error('Error al eliminar la plantilla');
  }
};