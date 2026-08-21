import React, { useState, useEffect } from 'react';
import { formService, type FormDto } from '../services/formService';

export default function FormManagementPage() {
  const [forms, setForms] = useState<FormDto[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Estados del formulario
  const [pipelineId, setPipelineId] = useState('');
  const [name, setName] = useState('');
  const [platform, setPlatform] = useState('');
  const [organization, setOrganization] = useState('');
  const [project, setProject] = useState('');
  const [variablesInput, setVariablesInput] = useState(''); // Se ingresan separadas por comas
  const [isEditing, setIsEditing] = useState(false);

  // Estados para notificaciones Toast
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Estados para la Modal de Eliminación
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [formToDelete, setFormToDelete] = useState<string | null>(null);

  useEffect(() => {
    loadForms();
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

  const loadForms = async () => {
    try {
      setLoading(true);
      const data = await formService.getForms();
      setForms(data);
    } catch (err) {
      console.error('Error cargando formularios', err);
      showToast('error', 'No se pudieron cargar los formularios');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Convertir el texto de variables separadas por comas en un List<String> (Array)
    const variablesArray = variablesInput
      ? variablesInput.split(',').map((v) => v.trim()).filter(v => v.length > 0)
      : [];

    const payload: FormDto = {
      pipelineId,
      name,
      platform,
      organization,
      project,
      variables: variablesArray
    };

    try {
      if (isEditing) {
        await formService.updateForm(payload);
        showToast('success', 'Formulario actualizado con éxito');
      } else {
        await formService.createForm(payload);
        showToast('success', 'Formulario creado exitosamente');
      }

      clearForm();
      loadForms();
    } catch (err: any) {
      showToast('error', err?.response?.data?.message || 'Error al guardar el formulario');
    }
  };

  const handleEditClick = (form: FormDto) => {
    setPipelineId(form.pipelineId);
    setName(form.name);
    setPlatform(form.platform);
    setOrganization(form.organization);
    setProject(form.project);
    setVariablesInput(form.variables ? form.variables.join(', ') : '');
    setIsEditing(true);
  };

  const clearForm = () => {
    setPipelineId('');
    setName('');
    setPlatform('');
    setOrganization('');
    setProject('');
    setVariablesInput('');
    setIsEditing(false);
  };

  const confirmDelete = (id: string) => {
    setFormToDelete(id);
    setIsDeleteModalOpen(true);
  };

  const executeDelete = async () => {
    if (!formToDelete) return;
    try {
      await formService.deleteForm(formToDelete);
      showToast('success', 'Formulario eliminado correctamente');
      loadForms();
    } catch (err) {
      showToast('error', 'Error al eliminar el formulario');
    }
  };

  return (
    <div style={{ padding: '30px', maxWidth: '1400px', margin: '0 auto' }}>
      <h2 style={{ marginBottom: '20px' }}>Gestión de Formularios y Pipelines</h2>

      <div style={{ display: 'grid', gridTemplateColumns: '380px 1fr', gap: '30px', alignItems: 'start' }}>
        
        {/* IZQUIERDA: Formulario */}
        <div style={{ background: 'white', padding: '20px', borderRadius: '8px', border: '1px solid #d1d5db', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <h3 style={{ marginTop: 0, marginBottom: '15px', fontSize: '16px', color: '#374151' }}>
            {isEditing ? '✏️ Actualizar Formulario' : '➕ Crear Nuevo Formulario'}
          </h3>
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', marginBottom: '4px' }}>Pipeline ID</label>
              <input 
                type="text" 
                placeholder="Ej: pipeline-aws-01" 
                required 
                disabled={isEditing}
                value={pipelineId}
                onChange={(e) => setPipelineId(e.target.value)} 
                style={{ width: '100%', padding: '8px', boxSizing: 'border-box', border: '1px solid #d1d5db', borderRadius: '4px', backgroundColor: isEditing ? '#f3f4f6' : 'white' }}
              />
            </div>

            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', marginBottom: '4px' }}>Nombre</label>
              <input 
                type="text" 
                placeholder="Nombre del formulario" 
                required 
                value={name}
                onChange={(e) => setName(e.target.value)} 
                style={{ width: '100%', padding: '8px', boxSizing: 'border-box', border: '1px solid #d1d5db', borderRadius: '4px' }}
              />
            </div>

            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', marginBottom: '4px' }}>Plataforma</label>
              <input 
                type="text" 
                placeholder="Ej: AWS, GitHub" 
                required 
                value={platform}
                onChange={(e) => setPlatform(e.target.value)} 
                style={{ width: '100%', padding: '8px', boxSizing: 'border-box', border: '1px solid #d1d5db', borderRadius: '4px' }}
              />
            </div>

            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', marginBottom: '4px' }}>Organización</label>
              <input 
                type="text" 
                placeholder="Organización" 
                required 
                value={organization}
                onChange={(e) => setOrganization(e.target.value)} 
                style={{ width: '100%', padding: '8px', boxSizing: 'border-box', border: '1px solid #d1d5db', borderRadius: '4px' }}
              />
            </div>

            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', marginBottom: '4px' }}>Proyecto</label>
              <input 
                type="text" 
                placeholder="Proyecto" 
                required 
                value={project}
                onChange={(e) => setProject(e.target.value)} 
                style={{ width: '100%', padding: '8px', boxSizing: 'border-box', border: '1px solid #d1d5db', borderRadius: '4px' }}
              />
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', marginBottom: '4px' }}>Variables (separadas por comas)</label>
              <input 
                type="text" 
                placeholder="env, region, branch" 
                value={variablesInput}
                onChange={(e) => setVariablesInput(e.target.value)} 
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
                  onClick={clearForm}
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
            📋 Lista de Formularios Registrados
          </div>
          {loading ? (
            <p style={{ padding: '20px', textAlign: 'center' }}>Cargando...</p>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ background: '#f3f4f6', borderBottom: '1px solid #d1d5db', fontSize: '13px' }}>
                  <th style={{ padding: '12px 16px' }}>Pipeline ID</th>
                  <th style={{ padding: '12px 16px' }}>Nombre</th>
                  <th style={{ padding: '12px 16px' }}>Plataforma</th>
                  <th style={{ padding: '12px 16px' }}>Proyecto</th>
                  <th style={{ padding: '12px 16px', textAlign: 'center' }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {forms.length === 0 ? (
                  <tr>
                    <td colSpan={5} style={{ padding: '30px', textAlign: 'center', color: '#6b7280' }}>
                      No hay formularios registrados.
                    </td>
                  </tr>
                ) : (
                  forms.map((f) => (
                    <tr key={f.pipelineId} style={{ borderBottom: '1px solid #e5e7eb', fontSize: '13px' }}>
                      <td style={{ padding: '12px 16px', fontWeight: '500' }}>{f.pipelineId}</td>
                      <td style={{ padding: '12px 16px', color: '#4b5563' }}>{f.name}</td>
                      <td style={{ padding: '12px 16px', color: '#4b5563' }}>{f.platform}</td>
                      <td style={{ padding: '12px 16px', color: '#4b5563' }}>{f.project}</td>
                      <td style={{ padding: '12px 16px', textAlign: 'center', display: 'flex', justifyContent: 'center', gap: '8px' }}>
                        <button 
                          onClick={() => handleEditClick(f)}
                          style={{ padding: '4px 10px', backgroundColor: '#2563eb', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}
                        >
                          Editar
                        </button>
                        <button 
                          onClick={() => confirmDelete(f.pipelineId)}
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

      {/* MODAL DE ELIMINACIÓN */}
      {isDeleteModalOpen && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: 'white', padding: '24px', borderRadius: '8px', width: '100%', maxWidth: '400px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
            <h3 style={{ margin: '0 0 10px 0', fontSize: '18px', color: '#1f2937' }}>Confirmar Eliminación</h3>
            <p style={{ margin: '0 0 20px 0', fontSize: '14px', color: '#4b5563' }}>
              ¿Estás seguro de eliminar el formulario con ID: <strong>{formToDelete}</strong>?
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

      {/* TOASTS */}
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