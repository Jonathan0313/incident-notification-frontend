import { useState, useEffect } from 'react';
import type { Incident } from '../domain/incident';
import { incidentService } from '../services/incidentService';

export function useIncidentList(showToast?: (type: 'success' | 'error', defaultMessage: string, errorObj?: any) => void) {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  
  // Estado para controlar el filtro actual ('open' o 'closed_recent')
  const [filterType, setFilterType] = useState<'open' | 'closed_recent'>('open');

  useEffect(() => {
    fetchIncidentsByType(filterType);
  }, [filterType]);

  const fetchIncidentsByType = async (type: 'open' | 'closed_recent') => {
    try {
      setLoading(true);
      let data: Incident[] = [];
      
      if (type === 'open') {
        data = await incidentService.getOpenIncidents();
      } else {
        data = await incidentService.getRecentClosedIncidents();
      }

      // Ordenamiento base por ID descendiente
      data.sort((a, b) => Number(b.id) - Number(a.id));

      // 🟢 TRUCO CLAVE: Si hay un incidente seleccionado actualmente, 
      // lo sacamos de la lista y lo ponemos obligatoriamente de primero para que no baje de posición.
      if (selectedIncident) {
        const currentId = selectedIncident.id;
        const index = data.findIndex(inc => inc.id === currentId);
        if (index !== -1) {
          const [foundItem] = data.splice(index, 1);
          data.unshift(foundItem); // Lo coloca siempre en la cima visual de la lista izquierda
        }
      }

      setIncidents(data);

      if (data.length > 0) {
        if (selectedIncident) {
          const currentId = selectedIncident.id;
          const found = data.find(inc => inc.id === currentId);
          setSelectedIncident(found || data[0]);
        } else {
          setSelectedIncident(data[0]);
        }
      } else {
        setSelectedIncident(null);
      }
    } catch (error) {
      console.error('Error al cargar los incidentes:', error);
      if (showToast) {
        showToast('error', 'No se pudieron cargar los incidentes desde el servidor.', error);
      }
    } finally {
      setLoading(false);
    }
  };

  const refreshCurrentList = () => {
    fetchIncidentsByType(filterType);
  };

  return {
    incidents,
    selectedIncident,
    loading,
    filterType,
    setFilterType,
    setSelectedIncident,
    refreshCurrentList,
  };
}