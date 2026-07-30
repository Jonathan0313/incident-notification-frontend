import { useState, useEffect } from 'react';
import type { Template } from '../domain/template';
import { templateService } from '../services/templateService';

export const useTemplateManagement = () => {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      const data = await templateService.getAll();
      setTemplates(data);
      setError(null);
    } catch (err) {
      setError('Error al cargar las plantillas');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTemplates();
  }, []);

  const openCreateModal = () => {
    setSelectedTemplate(null);
    setIsModalOpen(true);
  };

  const openEditModal = (template: Template) => {
    setSelectedTemplate(template);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedTemplate(null);
  };

  const handleSave = async (request: Omit<Template, 'id' | 'createdAt'>) => {
    try {
      if (selectedTemplate && selectedTemplate.id) {
        await templateService.update(selectedTemplate.id, request);
      } else {
        await templateService.create(request);
      }
      closeModal();
      fetchTemplates();
    } catch (err) {
      setError('Error al guardar la plantilla');
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('¿Estás seguro de eliminar esta plantilla?')) {
      try {
        await templateService.delete(id);
        fetchTemplates();
      } catch (err) {
        setError('Error al eliminar la plantilla');
      }
    }
  };

  return {
    templates,
    loading,
    error,
    isModalOpen,
    selectedTemplate,
    openCreateModal,
    openEditModal,
    closeModal,
    handleSave,
    handleDelete,
  };
};