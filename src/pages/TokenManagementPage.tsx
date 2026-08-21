import React, { useState, useEffect } from 'react';
import { tokenService } from '../services/tokenService';

export default function TokenManagementPage() {
  const [tokens, setTokens] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Estados del formulario
  const [platform, setPlatform] = useState('');
  const [tokenValue, setTokenValue] = useState('');
  const [expiresAt, setExpiresAt] = useState(''); // Solo fecha YYYY-MM-DD
  const [isEditing, setIsEditing] = useState(false);

  // Estados para notificaciones estilo toast (inferior derecha)
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Estados para la modal de confirmación personalizada
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [tokenToDelete, setTokenToDelete] = useState<{ platform: string; user: string } | null>(null);

  useEffect(() => {
    loadTokens();
  }, []);

  const showToast = (type: 'success' | 'error', text: string) => {
    if (type === 'success') {
      setSuccessMessage(text);
      setErrorMessage('');
    } else {
      setErrorMessage(text);
      setSuccessMessage('');
    }
    setTimeout(() => {
      setSuccessMessage('');
      setErrorMessage('');
    }, 4000);
  };

  const loadTokens = async () => {
    try {
      setLoading(true);
      const data = await tokenService.getTokens();
      setTokens(data);
    } catch (err) {
      console.error('Error cargando tokens', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const user = localStorage.getItem('username') || 'admin'; 

    const payload = {
      platform,
      tokenValue,
      expiresAt: `${expiresAt}T00:00:00`,
      user
    };

    try {
      if (isEditing) {
        await tokenService.updateToken(payload);
        showToast('success', 'Token actualizado con éxito');
      } else {
        await tokenService.createToken(payload);
        showToast('success', 'Token creado exitosamente');
      }

      // Limpiar formulario
      setPlatform('');
      setTokenValue('');
      setExpiresAt('');
      setIsEditing(false);
      loadTokens();
    } catch (err: any) {
      showToast('error', err?.response?.data?.message || 'Error al guardar el token');
    }
  };

  const handleEditClick = (token: any) => {
    setPlatform(token.platform);
    setTokenValue(''); // Por seguridad usualmente se deja en blanco para reescribir
    const cleanDate = token.expiresAt ? token.expiresAt.split('T')[0] : '';
    setExpiresAt(cleanDate);
    setIsEditing(true);
  };

  // Abre la modal personalizada en lugar de usar window.confirm
  const confirmDelete = (platformName: string, userName: string) => {
    setTokenToDelete({ platform: platformName, user: userName });
    setIsDeleteModalOpen(true);
  };

  // Ejecuta la eliminación real tras confirmar en la modal
  const executeDelete = async () => {
    if (!tokenToDelete) return;
    try {
      await tokenService.deleteToken(tokenToDelete.platform, tokenToDelete.user);
      showToast('success', 'Token eliminado correctamente');
      loadTokens();
    } catch (err) {
      showToast('error', 'Error al eliminar el token');
    }
  };

  return (
    <div style={{ padding: '30px', maxWidth: '1400px', margin: '0 auto' }}>
      <h2 style={{ marginBottom: '20px' }}>Gestión de Tokens de Plataformas</h2>

      <div style={{ display: 'grid', gridTemplateColumns: '350px 1fr', gap: '30px', alignItems: 'start' }}>
        
        {/* IZQUIERDA: Formulario */}
        <div style={{ background: 'white', padding: '20px', borderRadius: '8px', border: '1px solid #d1d5db', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <h3 style={{ marginTop: 0, marginBottom: '15px', fontSize: '16px', color: '#374151' }}>
            {isEditing ? '✏️ Actualizar Token' : '➕ Crear Nuevo Token'}
          </h3>
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', marginBottom: '5px' }}>Plataforma</label>
              <input 
                type="text" 
                placeholder="Ej: AWS, GitHub" 
                required 
                disabled={isEditing}
                value={platform}
                onChange={(e) => setPlatform(e.target.value)} 
                style={{ width: '100%', padding: '8px', boxSizing: 'border-box', border: '1px solid #d1d5db', borderRadius: '4px', backgroundColor: isEditing ? '#f3f4f6' : 'white' }}
              />
            </div>

            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', marginBottom: '5px' }}>Valor del Token (Secret)</label>
              <input 
                type="password" 
                placeholder="Ingresa el token" 
                required 
                value={tokenValue}
                onChange={(e) => setTokenValue(e.target.value)} 
                style={{ width: '100%', padding: '8px', boxSizing: 'border-box', border: '1px solid #d1d5db', borderRadius: '4px' }}
              />
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', marginBottom: '5px' }}>Fecha de Expiración</label>
              <input 
                type="date" 
                required 
                value={expiresAt}
                onChange={(e) => setExpiresAt(e.target.value)} 
                style={{ width: '100%', padding: '8px', boxSizing: 'border-box', border: '1px solid #d1d5db', borderRadius: '4px' }}
              />
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button 
                type="submit" 
                style={{ flex: 1, padding: '10px', backgroundColor: '#2563eb', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
              >
                {isEditing ? 'Actualizar' : 'Guardar'}
              </button>
              {isEditing && (
                <button 
                  type="button" 
                  onClick={() => { setIsEditing(false); setPlatform(''); setTokenValue(''); setExpiresAt(''); }}
                  style={{ padding: '10px', backgroundColor: '#9ca3af', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                >
                  Cancelar
                </button>
              )}
            </div>
          </form>
        </div>

        {/* DERECHA: Tabla de registros */}
        <div style={{ background: 'white', borderRadius: '8px', border: '1px solid #d1d5db', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
          <div style={{ padding: '15px 20px', background: '#f9fafb', borderBottom: '1px solid #d1d5db', fontWeight: 'bold', color: '#374151' }}>
            📋 Lista de Tokens Registrados
          </div>
          {loading ? (
            <p style={{ padding: '20px', textAlign: 'center' }}>Cargando...</p>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ background: '#f3f4f6', borderBottom: '1px solid #d1d5db', fontSize: '13px' }}>
                  <th style={{ padding: '12px 16px' }}>Plataforma</th>
                  <th style={{ padding: '12px 16px' }}>Usuario</th>
                  <th style={{ padding: '12px 16px' }}>Expira el</th>
                  <th style={{ padding: '12px 16px', textAlign: 'center' }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {tokens.length === 0 ? (
                  <tr>
                    <td colSpan={4} style={{ padding: '30px', textAlign: 'center', color: '#6b7280' }}>
                      No hay tokens registrados.
                    </td>
                  </tr>
                ) : (
                  tokens.map((t) => (
                    <tr key={`${t.platform}-${t.user}`} style={{ borderBottom: '1px solid #e5e7eb', fontSize: '13px' }}>
                      <td style={{ padding: '12px 16px', fontWeight: '500' }}>{t.platform}</td>
                      <td style={{ padding: '12px 16px', color: '#4b5563' }}>{t.user}</td>
                      <td style={{ padding: '12px 16px', color: '#4b5563' }}>{new Date(t.expiresAt).toLocaleDateString()}</td>
                      <td style={{ padding: '12px 16px', textAlign: 'center', display: 'flex', justifyContent: 'center', gap: '8px' }}>
                        <button 
                          onClick={() => handleEditClick(t)}
                          style={{ padding: '4px 10px', backgroundColor: '#2563eb', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}
                        >
                          Editar
                        </button>
                        <button 
                          onClick={() => confirmDelete(t.platform, t.user)}
                          style={{ padding: '4px 10px', backgroundColor: '#dc2626', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}
                        >
                          Eliminar
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>

      </div>

      {/* MODAL DE CONFIRMACIÓN PERSONALIZADA */}
      {isDeleteModalOpen && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: 'white', padding: '24px', borderRadius: '8px', width: '100%', maxWidth: '400px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
            <h3 style={{ margin: '0 0 10px 0', fontSize: '18px', color: '#1f2937' }}>Confirmar Eliminación</h3>
            <p style={{ margin: '0 0 20px 0', fontSize: '14px', color: '#4b5563' }}>
              ¿Estás seguro de eliminar el token de <strong>{tokenToDelete?.platform}</strong>?
            </p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button
                onClick={() => setIsDeleteModalOpen(false)}
                style={{ padding: '8px 16px', backgroundColor: '#e5e7eb', color: '#374151', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: '500' }}
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  executeDelete();
                  setIsDeleteModalOpen(false);
                }}
                style={{ padding: '8px 16px', backgroundColor: '#dc2626', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: '500' }}
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* NOTIFICACIONES TOAST (Esquina inferior derecha) */}
      {successMessage && (
        <div style={{ position: 'fixed', bottom: '20px', right: '20px', backgroundColor: '#059669', color: 'white', padding: '12px 20px', borderRadius: '6px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', zIndex: 1100, fontWeight: 'bold', fontSize: '14px' }}>
          ✓ {successMessage}
        </div>
      )}
      {errorMessage && (
        <div style={{ position: 'fixed', bottom: '20px', right: '20px', backgroundColor: '#dc2626', color: 'white', padding: '12px 20px', borderRadius: '6px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', zIndex: 1100, fontWeight: 'bold', fontSize: '14px' }}>
          ✕ {errorMessage}
        </div>
      )}
    </div>
  );
}