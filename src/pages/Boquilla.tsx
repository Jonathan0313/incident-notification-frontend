import { useBoquillaLogic } from '../hooks/boquillaLogic';

export default function Boquilla() {
  const {
    templates,
    copied,
    boquillaText,
    setCustomMessage,
    handleTemplateSelect,
    handleClear,
    handleCopy
  } = useBoquillaLogic();

  return (
    <div style={{ maxWidth: '800px', margin: '40px auto', padding: '24px', backgroundColor: '#fff', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', fontFamily: 'sans-serif' }}>
      
      <h2 style={{ fontSize: '20px', marginBottom: '20px', color: '#1e293b', marginTop: 0 }}>Generador de Boquilla</h2>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '20px' }}>

        <div>
          <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>
            Plantilla:
          </label>
          <select
            onChange={(e) => {
              handleTemplateSelect(e.target.value);
              e.target.value = '';
            }}
            defaultValue=""
            style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '14px', backgroundColor: '#fff', color: '#1e293b', boxSizing: 'border-box', cursor: 'pointer', outline: 'none' }}
          >
            <option value="" disabled>Seleccione un servicio...</option>
            {templates.map((tpl) => (
              <option key={tpl.id || tpl.name} value={tpl.name}>
                {tpl.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
          <label style={{ fontSize: '14px', fontWeight: 600, color: '#475569' }}>
            Mensaje / Vista previa:
          </label>
        </div>

        <textarea
          value={boquillaText}
          onChange={(e) => setCustomMessage(e.target.value)}
          rows={5}
          style={{ width: '100%', padding: '12px', backgroundColor: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '14px', color: '#334155', lineHeight: '1.5', boxSizing: 'border-box', resize: 'vertical' }}
        />
      </div>

      <div style={{ display: 'flex', gap: '10px' }}>
        <button
          onClick={handleCopy}
          style={{ backgroundColor: '#2563eb', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '6px', fontSize: '14px', fontWeight: 600, cursor: 'pointer' }}
        >
          {copied ? '¡Copiado al portapapeles!' : 'Copiar Boquilla'}
        </button>

        <button
          onClick={handleClear}
          style={{ backgroundColor: '#e2e8f0', color: '#475569', border: 'none', padding: '10px 20px', borderRadius: '6px', fontSize: '14px', fontWeight: 600, cursor: 'pointer' }}
        >
          Limpiar
        </button>
      </div>

    </div>
  );
}