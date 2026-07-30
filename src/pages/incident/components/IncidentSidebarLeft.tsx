interface IncidentSidebarLeftProps {
  incidents: any[];
  selectedIncident: any | null;
  isCreating: boolean;
  loading: boolean;
  filterType: 'open' | 'closed_recent' | 'templates';
  onSelectIncident: (incident: any) => void;
  onStartCreate: () => void;
  onFilterChange: (type: 'open' | 'closed_recent' | 'templates') => void;
}

export function IncidentSidebarLeft({
  incidents,
  selectedIncident,
  isCreating,
  loading,
  filterType,
  onSelectIncident,
  onStartCreate,
  onFilterChange,
}: IncidentSidebarLeftProps) {
  return (
    <div style={{ width: '260px', minWidth: '260px', backgroundColor: '#ffffff', borderRadius: '8px', padding: '15px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
        <h3 style={{ margin: 0, fontSize: '14px', fontWeight: 700 }}>Gestión</h3>
        <button onClick={onStartCreate} style={{ backgroundColor: '#2563eb', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '6px', cursor: 'pointer', fontWeight: 600, fontSize: '12px' }}>
          + Nuevo
        </button>
      </div>

      {/* Pestañas de los 3 Módulos */}
      <div style={{ display: 'flex', gap: '2px', marginBottom: '15px', backgroundColor: '#f1f5f9', padding: '3px', borderRadius: '6px' }}>
        <button 
          onClick={() => onFilterChange('open')}
          style={{ flex: 1, padding: '6px 4px', fontSize: '10px', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: filterType === 'open' ? 'bold' : 'normal', backgroundColor: filterType === 'open' ? '#fff' : 'transparent', color: filterType === 'open' ? '#0f172a' : '#64748b', boxShadow: filterType === 'open' ? '0 1px 2px rgba(0,0,0,0.05)' : 'none' }}
        >
          Abiertos
        </button>
        <button 
          onClick={() => onFilterChange('closed_recent')}
          style={{ flex: 1, padding: '6px 4px', fontSize: '10px', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: filterType === 'closed_recent' ? 'bold' : 'normal', backgroundColor: filterType === 'closed_recent' ? '#fff' : 'transparent', color: filterType === 'closed_recent' ? '#0f172a' : '#64748b', boxShadow: filterType === 'closed_recent' ? '0 1px 2px rgba(0,0,0,0.05)' : 'none' }}
        >
          Cerrados
        </button>
        <button 
          onClick={() => onFilterChange('templates')}
          style={{ flex: 1, padding: '6px 4px', fontSize: '10px', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: filterType === 'templates' ? 'bold' : 'normal', backgroundColor: filterType === 'templates' ? '#fff' : 'transparent', color: filterType === 'templates' ? '#0f172a' : '#64748b', boxShadow: filterType === 'templates' ? '0 1px 2px rgba(0,0,0,0.05)' : 'none' }}
        >
          Plantillas
        </button>
      </div>

      {/* Listado */}
      <div style={{ flex: 1, overflowY: 'auto' }}>
        {loading ? (
          <p style={{ fontSize: '13px', color: '#64748b' }}>Cargando...</p>
        ) : incidents.length === 0 ? (
          <p style={{ fontSize: '13px', color: '#64748b', fontStyle: 'italic' }}>
            {filterType === 'templates' ? 'No hay plantillas guardadas.' : 'No hay registros.'}
          </p>
        ) : (
          <div>
            {incidents.map((item, index) => {
              const itemId = item.id || item.name;
              // 🛡️ Buscamos primero name, luego title y si no, caemos en 'Sin nombre'
              const itemName = item.name || item.title || 'Sin nombre';
              const isSelected = !isCreating && selectedIncident?.id === item.id;

              return (
                <div 
                  key={itemId || index} 
                  onClick={() => onSelectIncident(item)}
                  style={{ 
                    cursor: 'pointer', 
                    padding: '10px', 
                    marginBottom: '8px', 
                    borderRadius: '6px', 
                    backgroundColor: isSelected ? '#e2e8f0' : 'transparent',
                    borderLeft: filterType === 'closed_recent' ? '3px solid #10b981' : filterType === 'templates' ? '3px solid #8b5cf6' : '3px solid transparent'
                  }}
                >
                  <div style={{ fontSize: '13px', fontWeight: 600 }}>{itemName}</div>
                  {filterType === 'templates' ? (
                    <div style={{ fontSize: '11px', color: '#8b5cf6', marginTop: '4px' }}>📄 {item.typeTemplate || 'Plantilla'}</div>
                  ) : (
                    item.jira && <div style={{ fontSize: '11px', color: '#2563eb', marginTop: '4px' }}>📌 {item.jira}</div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}