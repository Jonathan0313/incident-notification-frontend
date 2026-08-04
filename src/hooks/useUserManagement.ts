// src/hooks/useUserManagement.ts
import { useState, useEffect } from 'react';
import { authService } from '../services/authService';
import { userService } from '../services/userService';

export function useUserManagement(showToast: (type: 'success' | 'error', msg: string) => void) {
  const [users, setUsers] = useState<any[]>([]);

  const fetchUsers = async () => {
    try {
      const data = await userService.getAll();
      setUsers(Array.isArray(data) ? data : []);
    } catch (err) {
      // Si el backend aún no expone un endpoint GET /users global, se maneja vacío sin romper la app
      setUsers([]);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleRegisterUser = async (userData: { username: string; password: string }) => {
    try {
      const response = await authService.register(userData);
      showToast('success', typeof response === 'string' ? response : 'Usuario registrado exitosamente');
      fetchUsers();
      return true;
    } catch (err: any) {
      const errorMsg = err?.response?.data || 'Error al registrar el usuario';
      showToast('error', typeof errorMsg === 'string' ? errorMsg : 'Error al registrar el usuario');
      return false;
    }
  };

  const handleChangePassword = async (passData: { currentPassword: string; newPassword: string }) => {
    try {
      const response = await authService.changePassword(passData);
      showToast('success', typeof response === 'string' ? response : 'Contraseña actualizada exitosamente');
      return true;
    } catch (err: any) {
      const errorMsg = err?.response?.data || 'Error al actualizar la contraseña';
      showToast('error', typeof errorMsg === 'string' ? errorMsg : 'Error al actualizar la contraseña');
      return false;
    }
  };

  const handleDeleteUser = async (id: string | number) => {
    try {
      const response = await authService.deleteAccount(id);
      showToast('success', typeof response === 'string' ? response : 'Usuario eliminado exitosamente');
      fetchUsers();
    } catch (err: any) {
      const errorMsg = err?.response?.data || 'No se pudo eliminar el usuario';
      showToast('error', typeof errorMsg === 'string' ? errorMsg : 'No se pudo eliminar el usuario');
    }
  };

  return {
    users,
    fetchUsers,
    handleRegisterUser,
    handleChangePassword,
    handleDeleteUser
  };
}