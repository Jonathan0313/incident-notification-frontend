interface ToastProps {
  type: 'success' | 'error';
  message: string;
}

export function Toast({ type, message }: ToastProps) {
  return (
    <div style={{
      position: 'fixed', bottom: '25px', right: '25px',
      backgroundColor: type === 'success' ? '#10b981' : '#ef4444',
      color: '#ffffff', padding: '12px 20px', borderRadius: '8px',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', fontSize: '14px',
      fontWeight: '500', zIndex: 9999, display: 'flex', alignItems: 'center', gap: '8px'
    }}>
      <span>{type === 'success' ? '✔' : '✖'}</span>
      <span>{message}</span>
    </div>
  );
}