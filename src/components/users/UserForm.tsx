// src/components/users/UserForm.tsx
import React, { useState, useEffect } from 'react';

interface UserFormProps {
  userToEdit: any;
  onSave: (data: any) => void;
  onCancel: () => void;
}

export function UserForm({ userToEdit, onSave, onCancel }: UserFormProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');

  useEffect(() => {
    if (userToEdit) {
      setUsername(userToEdit.username || '');
    } else {
      setUsername('');
      setPassword('');
    }
  }, [userToEdit]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (userToEdit) {
      onSave({ username, currentPassword, newPassword });
    } else {
      onSave({ username, password });
    }
  };

  // ⚠️ Asegúrate de que retorne este bloque JSX correctamente
  return (
    <div style={{ background: 'white', padding: '20px', borderRadius: '8px', border: '1px solid #d1d5db', maxWidth: '400px', marginBottom: '20px' }}>
      <h3>{userToEdit ? 'Modificar Usuario / Contraseña' : 'Crear Nuevo Usuario'}</h3>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '12px' }}>
          <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', marginBottom: '4px' }}>Usuario</label>
          <input 
            type="text" 
            required
            value={username} 
            onChange={(e) => setUsername(e.target.value)}
            style={{ width: '100%', padding: '6px', boxSizing: 'border-box' }}
          />
        </div>

        {!userToEdit ? (
          <div style={{ marginBottom: '12px' }}>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', marginBottom: '4px' }}>Contraseña</label>
            <input 
              type="password" 
              required
              value={password} 
              onChange={(e) => setPassword(e.target.value)}
              style={{ width: '100%', padding: '6px', boxSizing: 'border-box' }}
            />
          </div>
        ) : (
          <>
            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', marginBottom: '4px' }}>Contraseña Actual</label>
              <input 
                type="password" 
                value={currentPassword} 
                onChange={(e) => setCurrentPassword(e.target.value)}
                style={{ width: '100%', padding: '6px', boxSizing: 'border-box' }}
              />
            </div>
            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', marginBottom: '4px' }}>Nueva Contraseña</label>
              <input 
                type="password" 
                value={newPassword} 
                onChange={(e) => setNewPassword(e.target.value)}
                style={{ width: '100%', padding: '6px', boxSizing: 'border-box' }}
              />
            </div>
          </>
        )}

        <div style={{ display: 'flex', gap: '8px' }}>
          <button type="submit" style={{ padding: '8px 12px', backgroundColor: '#10b981', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
            Guardar
          </button>
          <button type="button" onClick={onCancel} style={{ padding: '8px 12px', backgroundColor: '#6b7280', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
}