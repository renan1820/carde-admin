interface Props {
  onRetry: () => void;
}

export default function ConnectionError({ onRetry }: Props) {
  return (
    <div style={container}>
      <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <line x1="1" y1="1" x2="23" y2="23" />
        <path d="M16.72 11.06A10.94 10.94 0 0 1 19 12.55" />
        <path d="M5 12.55a10.94 10.94 0 0 1 5.17-2.39" />
        <path d="M10.71 5.05A16 16 0 0 1 22.56 9" />
        <path d="M1.42 9a15.91 15.91 0 0 1 4.7-2.88" />
        <path d="M8.53 16.11a6 6 0 0 1 6.95 0" />
        <line x1="12" y1="20" x2="12.01" y2="20" />
      </svg>
      <p style={title}>Sem conexão com o servidor</p>
      <p style={description}>
        Não foi possível conectar à API. O servidor pode estar inicializando
        (free tier) ou temporariamente offline.
      </p>
      <button onClick={onRetry} style={btn}>Tentar novamente</button>
    </div>
  );
}

const container: React.CSSProperties = {
  display: 'flex', flexDirection: 'column', alignItems: 'center',
  justifyContent: 'center', height: '60vh', gap: 16, padding: '0 24px',
};
const title: React.CSSProperties = {
  margin: 0, fontSize: 18, fontWeight: 600, color: '#fff',
  fontFamily: "'Big Shoulders Display', cursive", letterSpacing: 1,
};
const description: React.CSSProperties = {
  margin: 0, fontSize: 14, color: 'rgba(255,255,255,0.35)',
  textAlign: 'center', maxWidth: 360, lineHeight: 1.6,
};
const btn: React.CSSProperties = {
  marginTop: 8, padding: '10px 24px',
  background: '#fff', color: '#000',
  border: 'none', borderRadius: 4,
  cursor: 'pointer', fontSize: 14, fontWeight: 700, letterSpacing: 0.3,
};
