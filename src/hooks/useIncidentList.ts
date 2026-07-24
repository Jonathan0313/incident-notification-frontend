import { useState, useEffect } from 'react';
import type { Incident } from '../domain/incident';
import { incidentService } from '../services/incidentService';

export function useIncidentList() {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    fetchOpenIncidents();
  }, []);

  const fetchOpenIncidents = async () => {
    try {
      setLoading(true);
      const data = await incidentService.getOpenIncidents();
      setIncidents(data);
      if (data.length > 0 && !selectedIncident) {
        setSelectedIncident(data[0]);
      } else if (data.length === 0) {
        setSelectedIncident(null);
      }
    } catch (error) {
      console.error('Error al cargar los incidentes abiertos:', error);
    } finally {
      setLoading(false);
    }
  };

  return {
    incidents,
    selectedIncident,
    loading,
    setSelectedIncident,
    fetchOpenIncidents,
  };
}