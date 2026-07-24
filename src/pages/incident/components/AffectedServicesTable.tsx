import type { Service } from "../../../domain/service";
import { getIconForAffectation } from "../../../utils/incidentHelpers";

interface AffectedServicesTableProps {
  affectedServices: any[];
  availableServices: Service[];
  hasError: boolean;
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
  
  const getAvailableOptionsForServiceRow = (currentSelectedService: string) => {
    const currentlyUsedServices = affectedServices
      .map((srv: any) => srv.nameService?.trim())
      .filter((name: string) => name && name !== currentSelectedService);

    const uniqueAvailableServices = Array.from(new Set(availableServices.map(s => s.name?.trim())));
    return uniqueAvailableServices.filter(serviceName => !currentlyUsedServices.includes(serviceName));
  };

  return (
    <div style={{ marginBottom: '20px', background: '#f8fafc', padding: '12px', borderRadius: '8px', border: hasError ? '1px solid #ef4444' : '1px solid #e2e8f0' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
        <strong style={{ fontSize: '14px' }}>Lista de afectaciones: <span style={{ color: '#ef4444' }}>*</span></strong>
        <button type="button" onClick={onAddService} style={{ backgroundColor: '#2563eb', color: 'white', border: 'none', borderRadius: '4px', width: '26px', height: '26px', cursor: 'pointer', fontWeight: 'bold' }}>+</button>
      </div>

      {affectedServices.length === 0 ? (
        <p style={{ fontSize: '13px', color: hasError ? '#ef4444' : '#64748b', fontStyle: 'italic' }}>
          {errorMessage || 'No hay servicios afectados agregados.'}
        </p>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', background: '#fff' }}>
          <thead>
            <tr style={{ background: '#e2e8f0', textAlign: 'left' }}>
              <th style={{ padding: '8px', width: '70px', textAlign: 'center' }}>ESTADO</th>
              <th style={{ padding: '8px' }}>SERVICIO</th>
              <th style={{ padding: '8px' }}>TIPO</th>
              <th style={{ padding: '8px' }}>INICIO *</th>
              <th style={{ padding: '8px' }}>FIN</th>
              <th style={{ padding: '8px', width: '40px' }}></th>
            </tr>
          </thead>
          <tbody>
            {affectedServices.map((srvRow: any, index: number) => (
              <tr key={index} style={{ borderBottom: '1px solid #e2e8f0' }}>
                <td style={{ textAlign: 'center', fontSize: '18px' }}>{getIconForAffectation(srvRow.affectationType)}</td>
                <td>
                  <select value={srvRow.nameService?.trim() || ''} onChange={(e) => onServiceChange(index, 'nameService', e.target.value)} style={{ width: '100%', padding: '6px' }}>
                    <option value="">-- Seleccione --</option>
                    {srvRow.nameService?.trim() && <option value={srvRow.nameService.trim()}>{srvRow.nameService.trim()}</option>}
                    {getAvailableOptionsForServiceRow(srvRow.nameService?.trim()).map((name, sIdx) => (<option key={sIdx} value={name}>{name}</option>))}
                  </select>
                </td>
                <td>
                  <select value={srvRow.affectationType || 'OK'} onChange={(e) => onServiceChange(index, 'affectationType', e.target.value)} style={{ width: '100%', padding: '6px' }}>
                    <option value="OK">OK</option>
                    <option value="Parcial">Parcial</option>
                    <option value="Total">Total</option>
                  </select>
                </td>
                <td>
                  <input type="text" value={srvRow.startTime || ''} onChange={(e) => onServiceChange(index, 'startTime', e.target.value)} placeholder="DD/MM/YYYY HH:mm" style={{ width: '100%', padding: '6px' }} />
                </td>
                <td>
                  <input type="text" value={srvRow.endTime || ''} onChange={(e) => onServiceChange(index, 'endTime', e.target.value)} placeholder="DD/MM/YYYY HH:mm" style={{ width: '100%', padding: '6px' }} />
                </td>
                <td style={{ textAlign: 'center' }}>
                  <button type="button" onClick={() => onDeleteService(index)} style={{ backgroundColor: '#ef4444', color: 'white', border: 'none', borderRadius: '4px', width: '24px', height: '24px', cursor: 'pointer' }}>-</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}