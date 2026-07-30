interface AffectedService {
  nameService: string;
  status: string;
  startTime: string;
  endTime: string;
}

interface AffectedServicesTableProps {
  affectedServices: AffectedService[];
  availableServices: any[];
  hasError?: boolean;
  errorMessage?: string;
  onAddService: () => void;
  onDeleteService: (index: number) => void;
  onServiceChange: (index: number, field: string, value: string) => void;
}

export function AffectedServicesTable({
  affectedServices,
  availableServices,
  hasError,
  errorMessage,
  onAddService,
  onDeleteService,
  onServiceChange,
}: AffectedServicesTableProps) {
  
  // Asegurar que availableServices sea un arreglo plano y extraer su nombre correctamente
  const serviceList = Array.isArray(availableServices) ? availableServices : [];

  // Ordenar los servicios disponibles alfabéticamente
  const sortedAvailableServices = [...serviceList].sort((a, b) => {
    const nameA = (typeof a === 'string' ? a : (a.name || a.nameService || a.serviceName || '')).toLowerCase();
    const nameB = (typeof b === 'string' ? b : (b.name || b.nameService || b.serviceName || '')).toLowerCase();
    return nameA.localeCompare(nameB);
  });

  // Función para formatear automáticamente la fecha y hora mientras se escribe (DD/MM/YYYY HH:mm)
  const formatDateTimeInput = (value: string): string => {
    // 1. Remover todo lo que no sea número
    const numbers = value.replace(/\D/g, '').slice(0, 12); // Máximo 12 dígitos (DDMMYYYYHHmm)
    
    let formatted = '';

    if (numbers.length > 0) {
      // Día (DD)
      formatted += numbers.substring(0, 2);
    }
    if (numbers.length >= 3) {
      // Mes (MM)
      formatted += '/' + numbers.substring(2, 4);
    }
    if (numbers.length >= 5) {
      // Año (YYYY)
      formatted += '/' + numbers.substring(4, 8);
    }
    if (numbers.length >= 9) {
      // Hora (HH)
      formatted += ' ' + numbers.substring(8, 10);
    }
    if (numbers.length >= 11) {
      // Minutos (mm)
      formatted += ':' + numbers.substring(10, 12);
    }

    return formatted;
  };

  return (
    <div style={{ backgroundColor: '#f8fafc', padding: '16px', borderRadius: '8px', border: hasError ? '1px solid #ef4444' : '1px solid #e2e8f0' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
        <label style={{ fontSize: '14px', fontWeight: 'bold', color: '#1e293b' }}>
          Lista de afectaciones: *
        </label>
        <button 
          type="button" 
          onClick={onAddService}
          style={{ backgroundColor: '#2563eb', color: 'white', border: 'none', borderRadius: '6px', width: '32px', height: '32px', cursor: 'pointer', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px' }}
          title="Agregar servicio afectado"
        >
          +
        </button>
      </div>

      {(!affectedServices || affectedServices.length === 0) ? (
        <div style={{ backgroundColor: '#fff', padding: '16px', borderRadius: '6px', border: '1px solid #cbd5e1', color: '#64748b', fontStyle: 'italic', fontSize: '13px' }}>
          No hay servicios afectados agregados.
        </div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', backgroundColor: '#fff', borderRadius: '6px', overflow: 'hidden', border: '1px solid #cbd5e1' }}>
            <thead>
              <tr style={{ backgroundColor: '#f1f5f9', borderBottom: '1px solid #cbd5e1', textAlign: 'left', fontSize: '12px', color: '#475569' }}>
                <th style={{ padding: '8px', width: '70px', textAlign: 'center' }}>ESTADO</th>
                <th style={{ padding: '8px' }}>SERVICIO</th>
                <th style={{ padding: '8px', width: '130px' }}>TIPO</th>
                <th style={{ padding: '8px', width: '180px' }}>INICIO *</th>
                <th style={{ padding: '8px', width: '180px' }}>FIN</th>
                <th style={{ padding: '8px', width: '50px', textAlign: 'center' }}></th>
              </tr>
            </thead>
            <tbody>
              {affectedServices.map((service, index) => {
                const selectedServiceNames = affectedServices
                  .filter((_, idx) => idx !== index)
                  .map(s => s.nameService);

                const availableOptions = sortedAvailableServices.filter(s => {
                  const sName = typeof s === 'string' ? s : (s.name || s.nameService || s.serviceName);
                  return !selectedServiceNames.includes(sName);
                });

                const affectationUpper = (service.status || 'OK').toUpperCase();

                return (
                  <tr key={index} style={{ borderBottom: '1px solid #e2e8f0' }}>
                    
                    {/* Estado con iconos */}
                    <td style={{ padding: '8px', textAlign: 'center', fontSize: '16px' }}>
                      {affectationUpper === 'OK' ? (
                        <span title="OK">✅</span>
                      ) : affectationUpper === 'TOTAL' ? (
                        <span title="Total">❌</span>
                      ) : (
                        <span title="Parcial">⚠️</span>
                      )}
                    </td>

                    {/* Servicio */}
                    <td style={{ padding: '8px' }}>
                      <select 
                        required
                        value={service.nameService || ''}
                        onChange={(e) => onServiceChange(index, 'nameService', e.target.value)}
                        style={{ width: '100%', padding: '6px', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '13px', backgroundColor: '#fff' }}
                      >
                        <option value="">-- Seleccione --</option>
                        {service.nameService && !sortedAvailableServices.some(s => {
                          const sName = typeof s === 'string' ? s : (s.name || s.nameService || s.serviceName);
                          return sName === service.nameService;
                        }) && (
                          <option value={service.nameService}>{service.nameService}</option>
                        )}
                        {availableOptions.map((opt, optIdx) => {
                          const optName = typeof opt === 'string' ? opt : (opt.name || opt.nameService || opt.serviceName);
                          return (
                            <option key={optIdx} value={optName}>
                              {optName}
                            </option>
                          );
                        })}
                      </select>
                    </td>

                    {/* Tipo */}
                    <td style={{ padding: '8px' }}>
                      <select 
                        value={service.status || 'OK'}
                        onChange={(e) => onServiceChange(index, 'affectationType', e.target.value)}
                        style={{ width: '100%', padding: '6px', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '13px', backgroundColor: '#fff' }}
                      >
                        <option value="OK">OK</option>
                        <option value="Parcial">Parcial</option>
                        <option value="Total">Total</option>
                      </select>
                    </td>

                    {/* Inicio */}
                    <td style={{ padding: '8px' }}>
                      <input 
                        type="text" 
                        required
                        placeholder="DD/MM/YYYY HH:mm"
                        maxLength={16}
                        value={service.startTime || ''}
                        onChange={(e) => {
                          const formatted = formatDateTimeInput(e.target.value);
                          onServiceChange(index, 'startTime', formatted);
                        }}
                        style={{ width: '100%', padding: '6px', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '13px', boxSizing: 'border-box', backgroundColor: '#fff' }}
                      />
                    </td>

                    {/* Fin */}
                    <td style={{ padding: '8px' }}>
                      <input 
                        type="text" 
                        placeholder="DD/MM/YYYY HH:mm"
                        maxLength={16}
                        value={service.endTime || ''}
                        onChange={(e) => {
                          const formatted = formatDateTimeInput(e.target.value);
                          onServiceChange(index, 'endTime', formatted);
                        }}
                        style={{ width: '100%', padding: '6px', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '13px', boxSizing: 'border-box', backgroundColor: '#fff' }}
                      />
                    </td>

                    {/* Botón Eliminar */}
                    <td style={{ padding: '8px', textAlign: 'center' }}>
                      <button
            type="button"
            onClick={() => onDeleteService(index)}
            style={{
              backgroundColor: '#ef4444',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              width: '32px',
              height: '32px',
              cursor: 'pointer',
              fontWeight: 'bold',
              fontSize: '18px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            -
          </button>
                    </td>

                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {hasError && errorMessage && (
        <span style={{ color: '#ef4444', fontSize: '12px', marginTop: '6px', display: 'block' }}>
          {errorMessage}
        </span>
      )}
    </div>
  );
}