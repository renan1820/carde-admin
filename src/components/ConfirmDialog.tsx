interface Props {
  message: string;
  confirmLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmDialog({ message, confirmLabel = 'Confirmar', onConfirm, onCancel }: Props) {
  return (
    <div style={overlay}>
      <div style={box}>
        <p style={msg}>{message}</p>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
          <button onClick={onCancel} style={btnSecondary}>Cancelar</button>
          <button onClick={onConfirm} style={btnDanger}>{confirmLabel}</button>
        </div>
      </div>
    </div>
  );
}

const overlay: React.CSSProperties = {
  position: 'fixed', inset: 0,
  background: 'rgba(0,0,0,0.8)',
  display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100,
};
const box: React.CSSProperties = {
  background: '#0f0f0f',
  border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: 4, padding: '28px 32px', maxWidth: 400, width: '90%',
};
const msg: React.CSSProperties = {
  margin: '0 0 24px', fontSize: 15, color: '#fff', lineHeight: 1.5,
};
const btnSecondary: React.CSSProperties = {
  padding: '9px 20px', borderRadius: 4,
  border: '1px solid rgba(255,255,255,0.12)',
  background: 'transparent', color: 'rgba(255,255,255,0.6)',
  cursor: 'pointer', fontSize: 14,
};
const btnDanger: React.CSSProperties = {
  padding: '9px 20px', borderRadius: 4,
  border: '1px solid rgba(239,68,68,0.3)',
  background: 'rgba(239,68,68,0.12)', color: '#ef4444',
  cursor: 'pointer', fontSize: 14, fontWeight: 600,
};
