import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '../api/auth';

interface Props {
  onLogin: (token: string) => void;
}

export default function LoginPage({ onLogin }: Props) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await login(email, password);
      onLogin(res.token);
      navigate('/vehicles');
    } catch (err: unknown) {
      const status = (err as { response?: { status?: number } })?.response?.status;
      if (status === 401) {
        setError('E-mail ou senha incorretos.');
      } else if (!status) {
        setError('Erro de conexão — verifique o console (F12 → Network).');
      } else {
        setError(`Erro inesperado: ${status}`);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={page}>
      <div style={card}>
        <h1 style={title}>CARDE Admin</h1>
        <p style={subtitle}>Painel de Gestão</p>
        <form onSubmit={handleSubmit} style={form}>
          <label style={labelStyle}>E-mail</label>
          <input
            type="email" value={email} onChange={e => setEmail(e.target.value)}
            required style={inputStyle} autoFocus
          />
          <label style={labelStyle}>Senha</label>
          <input
            type="password" value={password} onChange={e => setPassword(e.target.value)}
            required style={inputStyle}
          />
          {error && <p style={errorStyle}>{error}</p>}
          <button type="submit" disabled={loading} style={btnStyle}>
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>
      </div>
    </div>
  );
}

const page: React.CSSProperties = {
  minHeight: '100vh', display: 'flex', alignItems: 'center',
  justifyContent: 'center', background: '#f7fafc',
};
const card: React.CSSProperties = {
  background: '#fff', borderRadius: 12, padding: '40px 40px',
  width: 360, boxShadow: '0 2px 16px rgba(0,0,0,0.08)',
};
const title: React.CSSProperties = { margin: 0, fontSize: 24, fontWeight: 700, color: '#1a202c' };
const subtitle: React.CSSProperties = { margin: '4px 0 28px', color: '#718096', fontSize: 14 };
const form: React.CSSProperties = { display: 'flex', flexDirection: 'column', gap: 4 };
const labelStyle: React.CSSProperties = { fontSize: 13, fontWeight: 600, color: '#4a5568', marginTop: 12 };
const inputStyle: React.CSSProperties = {
  padding: '10px 12px', borderRadius: 6, border: '1px solid #e2e8f0',
  fontSize: 14, outline: 'none', marginTop: 4,
};
const btnStyle: React.CSSProperties = {
  marginTop: 24, padding: '11px', borderRadius: 6, border: 'none',
  background: '#1a202c', color: '#fff', fontSize: 15, fontWeight: 600,
  cursor: 'pointer',
};
const errorStyle: React.CSSProperties = {
  color: '#e53e3e', fontSize: 13, margin: '8px 0 0', padding: '8px 12px',
  background: '#fff5f5', borderRadius: 6,
};
