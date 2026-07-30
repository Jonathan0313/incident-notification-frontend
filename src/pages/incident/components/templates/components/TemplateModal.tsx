import React, { useState, useEffect } from 'react';

interface TemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (request: any) => Promise<void> | void;
  templateToEdit?: any | null;
}

export const TemplateModal: React.FC<TemplateModalProps> = ({
  isOpen,
  onClose,
  onSave,
  templateToEdit,
}) => {
  const [typeTemplate, setTypeTemplate] = useState('Descripción');
  const [name, setName] = useState('');
  const [messageTemplate, setMessageTemplate] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (templateToEdit) {
      setTypeTemplate(templateToEdit.typeTemplate || 'Descripción');
      setName(templateToEdit.name || '');
      setMessageTemplate(templateToEdit.messageTemplate || '');
    } else {
      setTypeTemplate('Descripción');
      setName('');
      setMessageTemplate('');
    }
    setErrorMessage(null);
  }, [templateToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMessage(null);

    try {
      await onSave({ typeTemplate, name, messageTemplate });
      onClose();
    } catch (err: any) {
      setErrorMessage(err?.message || 'Error al guardar la plantilla.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0, 0, 0, 0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px', zIndex: 50 }}>
      <div style={{ backgroundColor: 'white', borderRadius: '8px', padding: '24px', width: '100%', maxWidth: '512px', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)' }}>
        <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '16px', marginTop: 0, color: '#1e293b' }}>
          {templateToEdit ? 'Editar Plantilla' : 'Nueva Plantilla'}
        </h2>

        {errorMessage && (
          <div style={{ marginBottom: '16px', padding: '12px', backgroundColor: '#fee2e2', border: '1px solid #f87171', color: '#b91c1c', borderRadius: '6px', fontSize: '14px' }}>
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '4px' }}>Tipo de Template</label>
            <select
              value={typeTemplate}
              onChange={(e) => setTypeTemplate(e.target.value)}
              style={{ width: '100%', border: '1px solid #d1d5db', borderRadius: '6px', padding: '8px', backgroundColor: 'white', boxSizing: 'border-box' }}
            >
              <option value="Descripción">Descripción</option>
              <option value="Avances">Avances</option>
              <option value="Solución">Solución</option>
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '4px' }}>Nombre</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              style={{ width: '100%', border: '1px solid #d1d5db', borderRadius: '6px', padding: '8px', boxSizing: 'border-box' }}
              placeholder="Nombre descriptivo"
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '4px' }}>Mensaje de la Plantilla</label>
            <textarea
              required
              rows={4}
              value={messageTemplate}
              onChange={(e) => setMessageTemplate(e.target.value)}
              style={{ width: '100%', border: '1px solid #d1d5db', borderRadius: '6px', padding: '8px', boxSizing: 'border-box' }}
              placeholder="Escribe el cuerpo del mensaje..."
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', paddingTop: '16px' }}>
            <button
              type="button"
              onClick={onClose}
              style={{ padding: '8px 16px', border: '1px solid #d1d5db', borderRadius: '6px', color: '#4b5563', backgroundColor: 'transparent', cursor: 'pointer' }}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={submitting}
              style={{ padding: '8px 16px', backgroundColor: '#4f46e5', color: 'white', border: 'none', borderRadius: '6px', cursor: submitting ? 'not-allowed' : 'pointer', opacity: submitting ? 0.5 : 1, fontWeight: 500 }}
            >
              {submitting ? 'Guardando...' : 'Guardar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};