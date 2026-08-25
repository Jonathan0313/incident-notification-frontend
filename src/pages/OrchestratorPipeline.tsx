import React, { useState, useEffect } from 'react';
import { orchestratorPipelineService } from '../services/orchestratorPipelineService';

interface OrchestratorPipelineProps {
  serviceName: string;
  showToast?: (type: 'success' | 'error', message: string) => void;
  iconOnly?: boolean;
}

export function OrchestratorPipeline({ serviceName, showToast }: OrchestratorPipelineProps) {
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [actionStatus, setActionStatus] = useState('1');
  
  const [toastNotification, setToastNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Ocultar la notificación automáticamente tras 4 segundos
  useEffect(() => {
    if (toastNotification) {
      const timer = setTimeout(() => {
        setToastNotification(null);
      }, 4000);

      return () => clearTimeout(timer);
    }
  }, [toastNotification]);

  const handleOpenClick = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    setToastNotification(null);

    if (!serviceName) {
      const msg = 'Debes seleccionar un servicio antes de ejecutar el orquestador.';
      if (showToast) {
        showToast('error', msg);
      } else {
        setToastNotification({ type: 'error', message: msg });
      }
      return;
    }

    try {
      setLoading(true);
      await orchestratorPipelineService.checkPipelineExists(serviceName);
      setIsModalOpen(true);
    } catch (error: any) {
      console.error('Error detallado:', error);
      
      const backendData = error?.response?.data;
      const backendMessage = typeof backendData === 'string' 
        ? backendData 
        : (backendData?.message || backendData?.error || backendData?.msg);
      
      const errorMessage = backendMessage || error?.message || 'Pipeline no encontrado para el servicio';
      
      if (showToast) {
        showToast('error', errorMessage);
      } else {
        setToastNotification({ type: 'error', message: errorMessage });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmTrigger = async () => {
    setToastNotification(null);
    try {
      setLoading(true);

      const payload = {
        serviceName: serviceName,
        status: actionStatus 
      };

      await orchestratorPipelineService.triggerPipeline(payload);

      const actionText = actionStatus === '1' ? 'Activado' : 'Inactivado';
      const successMsg = `Pipeline ejecutado con éxito: ${serviceName} - ${actionText}`;

      if (showToast) {
        showToast('success', successMsg);
      } else {
        setToastNotification({ type: 'success', message: successMsg });
      }
      setIsModalOpen(false);
    } catch (error: any) {
      console.error('Error al ejecutar el pipeline:', error);
      
      const backendData = error?.response?.data;
      const backendMessage = typeof backendData === 'string' 
        ? backendData 
        : (backendData?.message || backendData?.error || backendData?.msg);
        
      const errorMsg = backendMessage || error?.message || 'Error al ejecutar el flujo del pipeline';

      if (showToast) {
        showToast('error', errorMsg);
      } else {
        setToastNotification({ type: 'error', message: errorMsg });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={handleOpenClick}
        disabled={loading}
        style={{
          backgroundColor: loading ? '#94a3b8' : '#0284c7',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          width: '32px',
          height: '32px',
          cursor: loading ? 'not-allowed' : 'pointer',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '14px',
        }}
        title="Ejecutar Pipeline"
      >
        {loading ? '...' : '⚡'}
      </button>

      {/* Modal principal */}
      {isModalOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 9999
        }}>
          <div style={{
            backgroundColor: 'white',
            padding: '24px',
            borderRadius: '8px',
            width: '360px',
            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)',
            textAlign: 'left'
          }}>
            <h3 style={{ margin: '0 0 8px 0', fontSize: '18px', color: '#1e293b', fontWeight: 'bold' }}>
              Orquestador de Pipeline
            </h3>
            <p style={{ margin: '0 0 16px 0', fontSize: '13px', color: '#64748b' }}>
              Servicio: <strong>{serviceName}</strong>
            </p>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', color: '#475569', marginBottom: '6px' }}>
                Acción (Status):
              </label>
              <select
                value={actionStatus}
                onChange={(e) => setActionStatus(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: '6px',
                  border: '1px solid #cbd5e1',
                  fontSize: '13px',
                  backgroundColor: '#fff',
                  color: '#1e293b',
                  outline: 'none'
                }}
              >
                <option value="1">Activar</option>
                <option value="0">Inactivar</option>
              </select>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                disabled={loading}
                style={{
                  backgroundColor: '#e2e8f0',
                  color: '#334155',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '8px 16px',
                  fontSize: '13px',
                  fontWeight: 'bold',
                  cursor: 'pointer'
                }}
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmTrigger}
                disabled={loading}
                style={{
                  backgroundColor: '#2563eb',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '8px 16px',
                  fontSize: '13px',
                  fontWeight: 'bold',
                  cursor: loading ? 'not-allowed' : 'pointer'
                }}
              >
                {loading ? 'Ejecutando...' : 'Confirmar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Notificación Toast flotante que desaparece en 4s */}
      {toastNotification && (
        <div style={{
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          backgroundColor: toastNotification.type === 'success' ? '#22c55e' : '#ef4444',
          color: 'white',
          padding: '12px 16px',
          borderRadius: '8px',
          fontSize: '13px',
          fontWeight: 600,
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          zIndex: 10001,
          maxWidth: '400px'
        }}>
          <button
            onClick={() => setToastNotification(null)}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'white',
              fontSize: '14px',
              fontWeight: 'bold',
              cursor: 'pointer',
              padding: 0,
              lineHeight: 1
            }}
          >
            {toastNotification.type === 'success' ? '✓' : '✕'}
          </button>
          <span>{toastNotification.message}</span>
        </div>
      )}
    </>
  );
}