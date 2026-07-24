import { useState, useEffect } from 'react';
import type { Incident } from '../domain/incident';
import { incidentService } from '../services/incidentService';

export function useIncidentList() {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  
  // Nuevo estado para controlar el filtro actual ('open' o 'closed_recent')
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

      setIncidents(data);
      if (data.length > 0) {
        setSelectedIncident(data[0]);
      } else {
        setSelectedIncident(null);
      }
    } catch (error) {
      console.error('Error al cargar los incidentes:', error);
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