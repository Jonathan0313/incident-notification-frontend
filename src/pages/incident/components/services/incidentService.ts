import { axiosClient } from '../../../../services/axiosClient'; // Ajusta los niveles de ruta '../' según sea necesario para llegar a la raíz donde está axiosClient.ts

export const incidentService = {
  // Obtener la lista de servicios disponibles para la tabla
  getAvailableServices: async () => {
    const response = await axiosClient.get('/v1/api/services'); // Cambia la ruta según tu endpoint real
    return response.data;
  },

  // Crear un nuevo incidente
  createIncident: async (incidentData: any) => {
    const response = await axiosClient.post('/v1/api/incidents', incidentData); // Cambia la ruta según tu endpoint real
    return response.data;
  },

  // Actualizar un incidente existente
  updateIncident: async (id: string | number, incidentData: any) => {
    const response = await axiosClient.put(`/v1/api/incidents/${id}`, incidentData); // Cambia la ruta según tu endpoint real
    return response.data;
  },

  // Cerrar un incidente
  closeIncident: async (id: string | number, incidentData: any) => {
    const response = await axiosClient.put(`/v1/api/incidents/${id}/close`, incidentData); // Cambia la ruta según tu endpoint real
    return response.data;
  }
};