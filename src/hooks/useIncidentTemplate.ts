export function useIncidentTemplate(formData: any, affectedServices: any[], showToast: (type: 'success' | 'error', msg: string) => void) {
  const handleCopyTemplate = async () => {
    if (!formData) return;

    const rawJiraInput = formData.jira || '';
    let ticketCode = '';
    let fullJiraUrl = '';

    if (typeof rawJiraInput === 'string' && rawJiraInput.trim() !== '') {
      const trimmedJira = rawJiraInput.trim();
      if (trimmedJira.startsWith('http')) {
        fullJiraUrl = trimmedJira;
        const parts = trimmedJira.split('/');
        ticketCode = parts[parts.length - 1] || trimmedJira;
      } else {
        ticketCode = trimmedJira;
        fullJiraUrl = `https://nequi.atlassian.net/browse/${ticketCode}`;
      }
    }

    let servicesPlainText = "Servicios Afectados:\n";
    if (Array.isArray(affectedServices) && affectedServices.length > 0) {
      affectedServices.forEach((srv: any) => {
        if (!srv) return;
        const statusUpper = (srv.status || 'OK').toUpperCase();
        let icon = '✔';
        if (statusUpper === 'TOTAL') icon = '❌';
        else if (statusUpper === 'PARCIAL') icon = '⚠️';

        const name = srv.nameService || srv.name || 'Sin servicio';
        const type = srv.status || 'OK';
        const start = srv.startTime || '';
        const end = srv.endTime || '';

        const timeInfo = (start || end) ? ` | Hora Inicio: ${start} | Hora Fin: ${end}` : '';
        servicesPlainText += `- ${icon} Servicio: ${name} | Tipo de Afectación: ${type}${timeInfo}\n`;
      });
    } else {
      servicesPlainText += "- Ninguno\n";
    }

    const rawAdvances = formData.advances || formData.comments || formData.updates || [];
    let advancesPlainText = "";
    if (Array.isArray(rawAdvances) && rawAdvances.length > 0) {
      const validAdvances = rawAdvances.filter((adv: any) => adv && (adv.content || adv.message || adv.text || '').trim() !== '');
      if (validAdvances.length > 0) {
        validAdvances.forEach((adv: any, idx: number) => {
          const text = adv.content || adv.message || adv.text || '';
          advancesPlainText += `• Avance ${idx + 1}: ${text}\n`;
        });
      }
    }

    // Validación de solución para texto plano
    const solutionText = (formData.solution || formData.resolution || '').trim();

    const plainTextParts = [
      servicesPlainText,
      formData.impact ? `Impacto A Usuarios: ${formData.impact}` : '',
      formData.functionality ? `Funcionalidades OK: ${formData.functionality}` : '',
      ticketCode ? `Jira: ${ticketCode} (${fullJiraUrl})` : '',
      (formData.partnerCase || formData.aliasedCase)?.trim() ? `Caso Aliado: ${formData.partnerCase || formData.aliasedCase}` : '',
      formData.affectedComponent ? `Componente Afectado: ${formData.affectedComponent}` : '',
      formData.description ? `Descripción de la falla: ${formData.description}` : '',
      advancesPlainText.trim() ? `\n${advancesPlainText.trim()}` : '',
      solutionText ? `Solución: ${solutionText}` : '' // <-- Solo se incluye si tiene contenido
    ];

    const finalPlainText = plainTextParts.filter(Boolean).join('\n');

    const servicesRows = (Array.isArray(affectedServices) ? affectedServices : [])
      .map((srv: any) => {
        if (!srv) return '';
        const statusUpper = (srv.status || 'OK').toUpperCase();
        let icon = '✅';
        if (statusUpper === 'TOTAL') icon = '❌';
        else if (statusUpper === 'PARCIAL') icon = '⚠️';

        return `
          <tr>
            <td style="border: 1px solid #d1d5db; padding: 6px; text-align: center; color: #000000; text-decoration: none;">${icon}</td>
            <td style="border: 1px solid #d1d5db; padding: 6px; color: #000000; text-decoration: none;">${srv.nameService || srv.name || 'Sin servicio'}</td>
            <td style="border: 1px solid #d1d5db; padding: 6px; color: #000000; text-decoration: none;">${srv.status || 'OK'}</td>
            <td style="border: 1px solid #d1d5db; padding: 6px; color: #000000; text-decoration: none;">${srv.startTime || ''}</td>
            <td style="border: 1px solid #d1d5db; padding: 6px; color: #000000; text-decoration: none;">${srv.endTime || ''}</td>
          </tr>
        `;
      })
      .filter(Boolean)
      .join('');

    const commentsHtml = Array.isArray(rawAdvances) 
      ? rawAdvances
          .map((comment: any, idx: number) => {
            const text = comment?.content || comment?.message || comment?.text || '';
            return text ? `<li style="color: #000000; text-decoration: none;"><b style="color: #000000;">Avance ${idx + 1}:</b> ${text}</li>` : '';
          })
          .filter(Boolean)
          .join('')
      : '';

    // Validación de solución para HTML (si está vacío, renderiza un string vacío)
    const solutionHtml = solutionText 
      ? `<div style="margin: 4px 0; color: #000000;"><b style="color: #000000;">Solución:</b> ${solutionText}</div>` 
      : '';

    const htmlContent = `
      <div style="font-family: Arial, sans-serif; font-size: 13px; color: #000000;">
        <div style="margin-bottom: 8px;">
          <p style="font-weight: bold; margin: 0 0 5px 0; color: #000000;">Servicios Afectados:</p>
          <table style="border-collapse: collapse; width: 100%; font-size: 12px; color: #000000;">
            <thead>
              <tr style="background-color: #f3f4f6;">
                <th style="border: 1px solid #d1d5db; padding: 6px; color: #000000;">ESTADO</th>
                <th style="border: 1px solid #d1d5db; padding: 6px; color: #000000;">SERVICIO</th>
                <th style="border: 1px solid #d1d5db; padding: 6px; color: #000000;">TIPO DE AFECTACIÓN</th>
                <th style="border: 1px solid #d1d5db; padding: 6px; color: #000000;">HORA INICIO</th>
                <th style="border: 1px solid #d1d5db; padding: 6px; color: #000000;">HORA FIN</th>
              </tr>
            </thead>
            <tbody>
              ${servicesRows || '<tr><td colspan="5" style="border: 1px solid #d1d5db; padding: 6px; text-align: center; color: #000000;">Ninguno</td></tr>'}
            </tbody>
          </table>
        </div>

        <div style="margin: 4px 0; color: #000000;"><b style="color: #000000;">Impacto A Usuarios:</b> ${formData.impact || ''}</div>
        <div style="margin: 4px 0; color: #000000;"><b style="color: #000000;">Funcionalidades OK:</b> ${formData.functionality || ''}</div>
        <div style="margin: 4px 0; color: #000000;"><b style="color: #000000;">Jira:</b> ${ticketCode ? `<a href="${fullJiraUrl}" target="_blank" style="color: #0052CC; text-decoration: underline;">${ticketCode}</a>` : ''}</div>
        <div style="margin: 4px 0; color: #000000;"><b style="color: #000000;">Caso Aliado:</b> ${formData.partnerCase || formData.aliasedCase || ''}</div>
        <div style="margin: 4px 0; color: #000000;"><b style="color: #000000;">Componente Afectado:</b> ${formData.affectedComponent || ''}</div>
        <div style="margin: 4px 0; color: #000000;"><b style="color: #000000;">Descripción de la falla:</b> ${formData.description || ''}</div>
        
        ${commentsHtml ? `<ul style="padding-left: 20px; margin: 8px 0; color: #000000;">${commentsHtml}</ul>` : ''}
        
        ${solutionHtml}
      </div>
    `;

    try {
      const clipboardItem = new ClipboardItem({
        'text/html': new Blob([htmlContent], { type: 'text/html' }),
        'text/plain': new Blob([finalPlainText], { type: 'text/plain' })
      });
      await navigator.clipboard.write([clipboardItem]);
      showToast('success', '¡Plantilla copiada correctamente!');
    } catch (err) {
      showToast('error', 'No se pudo copiar la plantilla.');
    }
  };

  return { handleCopyTemplate };
}