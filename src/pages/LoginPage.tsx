import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '../api/auth';
import Spinner from '../components/Spinner';

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
        setError('Sem resposta do servidor. Tente novamente.');
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
        <div style={logoWrap}>
          <span style={logoText}>CARDE</span>
          <span style={logoSub}>GESTÃO</span>
        </div>

        <form onSubmit={handleSubmit} style={form}>
          <div style={fieldWrap}>
            <label style={labelStyle}>E-mail</label>
            <input
              type="email" value={email} onChange={e => setEmail(e.target.value)}
              required style={inputStyle} autoFocus disabled={loading}
              placeholder="admin@carde.com.br"
            />
          </div>
          <div style={fieldWrap}>
            <label style={labelStyle}>Senha</label>
            <input
              type="password" value={password} onChange={e => setPassword(e.target.value)}
              required style={inputStyle} disabled={loading}
              placeholder="••••••••"
            />
          </div>

          {error && <p style={errorStyle}>{error}</p>}

          <button type="submit" disabled={loading} style={btnStyle}>
            {loading ? (
              <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
                <Spinner size={17} color="#000" />
                Entrando...
              </span>
            ) : 'Entrar'}
          </button>
        </form>
      </div>
    </div>
  );
}

const page: React.CSSProperties = {
  minHeight: '100vh', display: 'flex', alignItems: 'center',
  justifyContent: 'center', background: '#000',
};

const card: React.CSSProperties = {
  width: 380, padding: '44px 40px',
  background: '#0f0f0f',
  border: '1px solid rgba(255,255,255,0.08)',
  borderRadius: 4,
};

const logoWrap: React.CSSProperties = { marginBottom: 36 };

const logoText: React.CSSProperties = {
  display: 'block',
  fontFamily: "'Big Shoulders Display', cursive",
  fontSize: 36, fontWeight: 900, letterSpacing: 4,
  color: '#fff', lineHeight: 1,
};

const logoSub: React.CSSProperties = {
  display: 'block',
  fontFamily: "'IBM Plex Sans', sans-serif",
  fontSize: 10, fontWeight: 500, letterSpacing: 5,
  color: '#D4A843', marginTop: 4, textTransform: 'uppercase',
};

const form: React.CSSProperties = { display: 'flex', flexDirection: 'column', gap: 16 };
const fieldWrap: React.CSSProperties = { display: 'flex', flexDirection: 'column', gap: 6 };
const labelStyle: React.CSSProperties = { fontSize: 12, fontWeight: 500, letterSpacing: 0.5, color: 'rgba(255,255,255,0.45)', textTransform: 'uppercase' };

const inputStyle: React.CSSProperties = {
  padding: '11px 14px', borderRadius: 4,
  border: '1px solid rgba(255,255,255,0.1)',
  background: 'rgba(255,255,255,0.04)',
  color: '#fff', fontSize: 14, outline: 'none',
};

const btnStyle: React.CSSProperties = {
  marginTop: 8, padding: '12px',
  borderRadius: 4, border: 'none',
  background: '#fff', color: '#000',
  fontSize: 14, fontWeight: 700, letterSpacing: 0.5,
  cursor: 'pointer', minHeight: 46,
  transition: 'background 0.15s',
};

const errorStyle: React.CSSProperties = {
  color: '#ef4444', fontSize: 13,
  padding: '10px 14px',
  background: 'rgba(239,68,68,0.08)',
  border: '1px solid rgba(239,68,68,0.2)',
  borderRadius: 4,
};
