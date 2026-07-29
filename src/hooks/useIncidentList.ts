import { useState, useEffect } from 'react';
import type { Incident } from '../domain/incident';
import { incidentService } from '../services/incidentService';

export function useIncidentList(showToast?: (type: 'success' | 'error', defaultMessage: string, errorObj?: any) => void) {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  
  const [filterType, setFilterType] = useState<'open' | 'closed_recent'>('open');

  useEffect(() => {
    fetchIncidentsByType(filterType);
  }, [filterType]);

  const fetchIncidentsByType = async (type: 'open' | 'closed_recent', targetId?: string | number) => {
    try {
      setLoading(true);
      let data: Incident[] = [];
      
      if (type === 'open') {
        data = await incidentService.getOpenIncidents();
      } else {
        data = await incidentService.getRecentClosedIncidents();
      }

      // 1. Ordenamiento base descendiente por ID
      data.sort((a, b) => Number(b.id) - Number(a.id));

      // 2. Si hay un ID objetivo (creado o editado), lo priorizamos y movemos al inicio
      const idToPrioritize = targetId !== undefined ? targetId : selectedIncident?.id;

      if (idToPrioritize !== undefined && idToPrioritize !== null) {
        const index = data.findIndex(inc => inc.id == idToPrioritize);
        if (index !== -1) {
          const [prioritizedItem] = data.splice(index, 1);
          data.unshift(prioritizedItem); // <--- Lo colocamos estrictamente de primeras
        }
      }

      setIncidents(data);

      if (data.length > 0) {
        if (targetId !== undefined) {
          const foundTarget = data.find(inc => inc.id == targetId);
          setSelectedIncident(foundTarget || data[0]);
        } else if (selectedIncident) {
          const currentId = selectedIncident.id;
          const found = data.find(inc => inc.id == currentId);
          setSelectedIncident(found || data[0]);
        } else {
          setSelectedIncident(data[0]);
        }
      } else {
        setSelectedIncident(null);
      }
      
      return data;
    } catch (error) {
      console.error('Error al cargar los incidentes:', error);
      if (showToast) {
        showToast('error', 'No se pudieron cargar los incidentes desde el servidor.', error);
      }
      return [];
    } finally {
      setLoading(false);
    }
  };

  const refreshCurrentList = async (targetId?: string | number, forcedType?: 'open' | 'closed_recent') => {
    const typeToUse = forcedType || filterType;
    return await fetchIncidentsByType(typeToUse, targetId);
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