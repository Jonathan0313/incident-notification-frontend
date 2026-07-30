import { useState, useEffect } from 'react';
import { notificationTemplateService } from '../services/notificationTemplateService';

export interface NotificationTemplate {
  id?: string | number;
  name: string;
  subject?: string;
  body?: string;
  [key: string]: any;
}

export function useTemplateForm(
  selectedTemplate: NotificationTemplate | null, 
  onTemplateSaved: () => void, 
  showToast?: (type: 'success' | 'error', message: string) => void
) {
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState<NotificationTemplate | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (selectedTemplate && !isCreating) {
      setFormData({ ...selectedTemplate });
      setErrors({});
    }
  }, [selectedTemplate, isCreating]);

  const handleStartCreate = () => {
    setIsCreating(true);
    setErrors({});
    setFormData({
      name: '',
      subject: '',
      body: ''
    });
  };

  const validateForm = (): boolean => {
    if (!formData) return false;
    const newErrors: Record<string, string> = {};

    if (!formData.name?.trim()) {
      newErrors.name = 'El nombre de la plantilla es obligatorio.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSaveAction = async () => {
    if (!validateForm()) {
      throw new Error("Por favor corrige los errores de la plantilla.");
    }

    try {
      setIsSaving(true);
      if (isCreating) {
        await notificationTemplateService.create(formData);
        setIsCreating(false);
      } else if (formData?.id) {
        await notificationTemplateService.update(formData.id, formData);
      }
      onTemplateSaved();
      if (showToast) showToast('success', 'Plantilla guardada correctamente.');
    } catch (error: any) {
      const backendError = error?.response?.data;
      const msg = typeof backendError === 'string' ? backendError : (backendError?.message || 'Error al guardar la plantilla.');
      if (showToast) showToast('error', msg);
      throw new Error(msg);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteAction = async () => {
    if (!formData?.id) return;
    try {
      setIsSaving(true);
      await notificationTemplateService.delete(formData.id);
      setFormData(null);
      setIsCreating(false);
      onTemplateSaved();
      if (showToast) showToast('success', 'Plantilla eliminada correctamente.');
    } catch (error: any) {
      const backendError = error?.response?.data;
      const msg = typeof backendError === 'string' ? backendError : (backendError?.message || 'Error al eliminar la plantilla.');
      if (showToast) showToast('error', msg);
    } finally {
      setIsSaving(false);
    }
  };

  return {
    isCreating,
    formData,
    errors,
    isSaving,
    setIsCreating,
    setFormData,
    handleStartCreate,
    handleSaveAction,
    handleDeleteAction
  };
}