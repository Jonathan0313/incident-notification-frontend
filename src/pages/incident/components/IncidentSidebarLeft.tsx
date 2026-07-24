import type { Incident } from "../../../domain/incident";

interface IncidentSidebarLeftProps {
  incidents: Incident[];
  selectedIncident: Incident | null;
  isCreating: boolean;
  loading: boolean;
  onSelectIncident: (incident: Incident) => void;
  onStartCreate: () => void;
}

export function IncidentSidebarLeft({
  incidents,
  selectedIncident,
  isCreating,
  loading,
  onSelectIncident,
  onStartCreate,
}: IncidentSidebarLeftProps) {
  return (
    <div style={{ width: '220px', minWidth: '220px', backgroundColor: '#ffffff', borderRadius: '8px', padding: '15px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', overflowY: 'auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h3 style={{ margin: 0, fontSize: '14px', fontWeight: 700 }}>Notificaciones</h3>
        <button onClick={onStartCreate} style={{ backgroundColor: '#2563eb', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '6px', cursor: 'pointer', fontWeight: 600, fontSize: '12px' }}>
          + Nuevo
        </button>
      </div>

      {loading ? (
        <p style={{ fontSize: '13px', color: '#64748b' }}>Cargando...</p>
      ) : incidents.length === 0 ? (
        <p style={{ fontSize: '13px', color: '#64748b' }}>No hay incidentes.</p>
      ) : (
        <div>
          {incidents.map((inc) => (
            <div 
              key={inc.id} 
              onClick={() => onSelectIncident(inc)}
              style={{ 
                cursor: 'pointer', 
                padding: '10px', 
                marginBottom: '8px', 
                borderRadius: '6px', 
                backgroundColor: !isCreating && selectedIncident?.id === inc.id ? '#e2e8f0' : 'transparent' 
              }}
            >
              <div style={{ fontSize: '13px', fontWeight: 600 }}>{inc.name}</div>
              {inc.jira && <div style={{ fontSize: '11px', color: '#2563eb', marginTop: '4px' }}>📌 {inc.jira}</div>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}