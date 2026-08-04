// src/pages/UserManagementPage.tsx
import { useState, useEffect } from 'react';
import { authService } from '../services/authService';
import { axiosClient } from '../services/axiosClient';
import { UserTable } from '../components/users/UserTable';
import { UserForm } from '../components/users/UserForm';

export function UserManagementPage({ showToast }: { showToast: (type: 'success' | 'error', msg: string) => void }) {
  const [users, setUsers] = useState<any[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [userToEdit, setUserToEdit] = useState<any>(null);

  // Como el backend de ejemplo muestra endpoints de auth, asegúrate de tener un endpoint GET /users o ajustalo si el back lo provee aparte.
  const fetchUsers = async () => {
    try {
      const res = await axiosClient.get('/users'); // O la ruta que provea tu backend para enlistar usuarios
      setUsers(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      // Si el back no tiene GET /users todavía, puedes manejarlo de manera limpia
      setUsers([]);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleSaveUser = async (data: any) => {
    try {
      if (userToEdit) {
        // Cambio de contraseña según /auth/password
        if (data.newPassword) {
          await authService.changePassword({
            currentPassword: data.currentPassword,
            newPassword: data.newPassword
          });
          showToast('success', 'Contraseña actualizada exitosamente');
        }
      } else {
        // Registro de usuario según /auth/register
        await authService.register({
          username: data.username,
          password: data.password
        });
        showToast('success', 'Usuario registrado exitosamente');
      }
      setIsFormOpen(false);
      setUserToEdit(null);
      fetchUsers();
    } catch (err: any) {
      showToast('error', err?.response?.data || 'Ocurrió un error en la operación');
    }
  };

  const handleDeleteUser = async (id: any) => {
    if (!window.confirm('¿Estás seguro de eliminar este usuario?')) return;
    try {
      // Endpoint DELETE /auth/{id} especificado en la imagen
      await authService.deleteAccount(id);
      showToast('success', 'Usuario eliminado exitosamente');
      fetchUsers();
    } catch (err: any) {
      showToast('error', err?.response?.data || 'No se pudo eliminar el usuario');
    }
  };

  return (
    <div style={{ padding: '24px', fontFamily: 'Arial, sans-serif' }}>
      <h2>Gestión de Usuarios</h2>
      {!isFormOpen && (
        <button 
          onClick={() => { setUserToEdit(null); setIsFormOpen(true); }}
          style={{ marginBottom: '16px', padding: '8px 16px', backgroundColor: '#2563eb', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
        >
          + Registrar Nuevo Usuario
        </button>
      )}

      {isFormOpen && (
        <UserForm 
          userToEdit={userToEdit}
          onSave={handleSaveUser}
          onCancel={() => { setIsFormOpen(false); setUserToEdit(null); }}
        />
      )}

      <UserTable 
        users={users}
        onEdit={(u) => { setUserToEdit(u); setIsFormOpen(true); }}
        onDelete={handleDeleteUser}
      />
    </div>
  );
}