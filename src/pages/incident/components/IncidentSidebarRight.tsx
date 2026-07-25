interface IncidentSidebarRightProps {
  hasFormData: boolean;
  onCopyTemplate: () => void;
  onApplyFirstStartTime: () => void;
  onApplyFirstEndTime: () => void;
  onApplyFirstAffectationType: () => void;
  onSetCurrentStartTimeFirst: () => void; // <-- Nueva prop
  onSetCurrentEndTimeFirst: () => void;   // <-- Nueva prop
}

export function IncidentSidebarRight({
  hasFormData,
  onCopyTemplate,
  onApplyFirstStartTime,
  onApplyFirstEndTime,
  onApplyFirstAffectationType,
  onSetCurrentStartTimeFirst,
  onSetCurrentEndTimeFirst,
}: IncidentSidebarRightProps) {
  return (
    <div style={{ width: '220px', minWidth: '220px', backgroundColor: '#ffffff', borderRadius: '8px', padding: '15px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '15px' }}>
      <div>
        <h3 style={{ margin: '0 0 15px 0', fontSize: '14px', fontWeight: 700, borderBottom: '1px solid #e2e8f0', paddingBottom: '10px' }}>Opciones</h3>
        {hasFormData ? (
          <button 
            type="button" 
            onClick={onCopyTemplate} 
            style={{ backgroundColor: '#0ea5e9', color: 'white', border: 'none', padding: '9px 10px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', width: '100%', fontSize: '12px' }}
          >
            📋 Copiar plantilla
          </button>
        ) : (
          <span style={{ fontSize: '12px', color: '#94a3b8' }}>Disponible al seleccionar un incidente.</span>
        )}
      </div>

      {hasFormData && (
        <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '15px' }}>
          <h4 style={{ margin: '0 0 10px 0', fontSize: '12px', fontWeight: 700, color: '#334155' }}>Acciones rápidas:</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            
            {/* Botones nuevos para la hora actual en el 1er servicio */}
            <button 
              type="button" 
              onClick={onSetCurrentStartTimeFirst}
              style={{ backgroundColor: '#059669', color: 'white', border: 'none', padding: '7px 8px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', width: '100%', fontSize: '11px' }}
            >
              🕒 Hora Inicio Actual (1ro)
            </button>
            <button 
              type="button" 
              onClick={onSetCurrentEndTimeFirst}
              style={{ backgroundColor: '#059669', color: 'white', border: 'none', padding: '7px 8px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', width: '100%', fontSize: '11px' }}
            >
              🕒 Hora Fin Actual (1ro)
            </button>

            <div style={{ borderTop: '1px dashed #cbd5e1', margin: '4px 0' }}></div>

            <button 
              type="button" 
              onClick={onApplyFirstStartTime}
              style={{ backgroundColor: '#2563eb', color: 'white', border: 'none', padding: '7px 8px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', width: '100%', fontSize: '11px' }}
            >
              ⏱️ Igualar Hora Inicio
            </button>
            <button 
              type="button" 
              onClick={onApplyFirstEndTime}
              style={{ backgroundColor: '#2563eb', color: 'white', border: 'none', padding: '7px 8px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', width: '100%', fontSize: '11px' }}
            >
              🏁 Igualar Hora Fin
            </button>
            <button 
              type="button" 
              onClick={onApplyFirstAffectationType}
              style={{ backgroundColor: '#2563eb', color: 'white', border: 'none', padding: '7px 8px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', width: '100%', fontSize: '11px' }}
            >
              ⚠️ Igualar Tipo Afectación
            </button>
          </div>
        </div>
      )}
    </div>
  );
}