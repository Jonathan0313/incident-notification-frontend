// src/pages/LoginPage.tsx
import React, { useState } from 'react';
import { authService } from '../services/authService';

export function LoginPage({ onLoginSuccess }: { onLoginSuccess: (token: string) => void }) {
  const [form, setForm] = useState({ username: '', password: '' });
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      const data = await authService.login(form);
      const token = data?.token || data;
      onLoginSuccess(token);
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.response?.data || 'Credenciales incorrectas');
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#f3f4f6' }}>
      <form onSubmit={handleSubmit} style={{ background: 'white', padding: '32px', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', width: '350px' }}>
        <h2 style={{ marginBottom: '20px', textAlign: 'center' }}>Iniciar Sesión</h2>
        {error && <div style={{ color: 'red', marginBottom: '12px', fontSize: '13px' }}>{error}</div>}
        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', marginBottom: '4px' }}>Usuario</label>
          <input 
            type="text" 
            required
            value={form.username} 
            onChange={e => setForm({ ...form, username: e.target.value })}
            style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }}
          />
        </div>
        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', marginBottom: '4px' }}>Contraseña</label>
          <input 
            type="password" 
            required
            value={form.password} 
            onChange={e => setForm({ ...form, password: e.target.value })}
            style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }}
          />
        </div>
        <button type="submit" style={{ width: '100%', padding: '10px', backgroundColor: '#2563eb', color: 'white', border: 'none', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer' }}>
          Ingresar
        </button>
      </form>
    </div>
  );
}