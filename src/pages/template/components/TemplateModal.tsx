import React, { useState, useEffect } from 'react';
import type { Template } from '../../../domain/template';

interface TemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (request: Omit<Template, 'id' | 'createdAt'>) => Promise<void>;
  templateToEdit?: Template | null;
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
  
  // 🟢 Nuevo estado para guardar y mostrar el error en la interfaz
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (templateToEdit) {
      setTypeTemplate(templateToEdit.typeTemplate || 'Descripción');
      setName(templateToEdit.name);
      setMessageTemplate(templateToEdit.messageTemplate);
    } else {
      setTypeTemplate('Descripción');
      setName('');
      setMessageTemplate('');
    }
    // Limpiamos errores al abrir o cambiar de plantilla
    setErrorMessage(null);
  }, [templateToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMessage(null); // Limpiamos errores previos

    try {
      await onSave({ typeTemplate, name, messageTemplate });
      onClose(); // Cerramos el modal si todo sale bien
    } catch (err: any) {
      // 🟢 Extracción del mensaje exacto del backend (ej: "Ya existe una plantilla con este nombre...")
      const backendMsg = err?.message || 'Error al guardar la plantilla.';
      setErrorMessage(backendMsg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-lg shadow-xl">
        <h2 className="text-xl font-bold mb-4">
          {templateToEdit ? 'Editar Plantilla' : 'Nueva Plantilla'}
        </h2>

        {/* 🟢 Renderizado condicional de la alerta de error */}
        {errorMessage && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-md text-sm">
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Tipo de Template</label>
            <select
              value={typeTemplate}
              onChange={(e) => setTypeTemplate(e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded-md p-2 bg-white"
            >
              <option value="Descripción">Descripción</option>
              <option value="Avances">Avances</option>
              <option value="Solución">Solución</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Nombre</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded-md p-2"
              placeholder="Nombre descriptivo"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Mensaje de la Plantilla</label>
            <textarea
              required
              rows={4}
              value={messageTemplate}
              onChange={(e) => setMessageTemplate(e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded-md p-2"
              placeholder="Escribe el cuerpo del mensaje..."
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border rounded-md text-gray-600 hover:bg-gray-100"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50"
            >
              {submitting ? 'Guardando...' : 'Guardar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};