import { useState, useEffect } from 'react';
import { templateService } from '../services/templateService';

export function useBoquillaLogic() {
  const [templates, setTemplates] = useState<any[]>([]);
  const ICON_PREFIX = '📢 ';
  
  // Inicializamos la caja de texto solo con el icono obligatorio
  const [customMessage, setCustomMessage] = useState<string>(ICON_PREFIX);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        const rawTpl = await templateService.getAll();
        const tplArray = Array.isArray(rawTpl) ? rawTpl : (rawTpl?.content || rawTpl?.data || []);
        
        const filteredTemplates = tplArray.filter((t: any) => {
          const typeValue = (t.typeTemplate || '').toString().trim().toLowerCase();
          return typeValue === 'boquilla';
        });

        setTemplates(filteredTemplates);
      } catch (err) {
        console.error('Error loading templates:', err);
      }
    };
    fetchTemplates();
  }, []);

  const boquillaText = customMessage;

  const handleTemplateSelect = (templateName: string) => {
    if (!templateName) return;
    const found = templates.find(t => t.name === templateName);
    if (!found) return;

    let messageContent = found.messageTemplate || found.message || found.content || found.body || '';
    const textWithoutIcon = messageContent.replace(/^(📢\s*)+/, '');
    setCustomMessage(ICON_PREFIX + textWithoutIcon);
  };

  // Impide que el usuario borre o elimine el icono al editar el textarea
  const handleMessageChange = (value: string) => {
    const textWithoutIcon = value.replace(/^(📢\s*)+/, '');
    setCustomMessage(ICON_PREFIX + textWithoutIcon);
  };

  // Al limpiar, la caja vuelve a quedar únicamente con el icono obligatorio
  const handleClear = () => {
    setCustomMessage(ICON_PREFIX);
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(boquillaText);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
      return true;
    } catch (err) {
      console.error('Error copying text:', err);
      return false;
    }
  };

  return {
    templates,
    copied,
    boquillaText,
    setCustomMessage: handleMessageChange,
    handleTemplateSelect,
    handleClear,
    handleCopy
  };
}