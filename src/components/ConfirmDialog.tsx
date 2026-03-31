interface Props {
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmDialog({ message, onConfirm, onCancel }: Props) {
  return (
    <div style={overlay}>
      <div style={box}>
        <p style={{ margin: '0 0 24px', fontSize: 15 }}>{message}</p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
          <button onClick={onCancel} style={btnSecondary}>Cancelar</button>
          <button onClick={onConfirm} style={btnDanger}>Excluir</button>
        </div>
      </div>
    </div>
  );
}

const overlay: React.CSSProperties = {
  position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
  display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100,
};
const box: React.CSSProperties = {
  background: '#fff', borderRadius: 8, padding: '28px 32px', maxWidth: 400, width: '90%',
};
const btnSecondary: React.CSSProperties = {
  padding: '8px 20px', borderRadius: 6, border: '1px solid #ccc',
  background: '#fff', cursor: 'pointer', fontSize: 14,
};
const btnDanger: React.CSSProperties = {
  padding: '8px 20px', borderRadius: 6, border: 'none',
  background: '#e53e3e', color: '#fff', cursor: 'pointer', fontSize: 14,
};
