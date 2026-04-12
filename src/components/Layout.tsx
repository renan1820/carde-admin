import { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';

interface Props {
  onLogout: () => void;
}

export default function Layout({ onLogout }: Props) {
  const navigate = useNavigate();
  const [showConfirm, setShowConfirm] = useState(false);

  function confirmLogout() {
    setShowConfirm(false);
    onLogout();
    navigate('/login');
  }

  return (
    <div style={root}>
      {showConfirm && (
        <div style={overlay}>
          <div style={dialog}>
            <p style={dialogTitle}>Sair da conta</p>
            <p style={dialogBody}>Tem certeza que deseja sair?</p>
            <div style={dialogActions}>
              <button onClick={() => setShowConfirm(false)} style={cancelBtn}>Cancelar</button>
              <button onClick={confirmLogout} style={confirmBtn}>Sair</button>
            </div>
          </div>
        </div>
      )}
      <aside style={sidebar}>
        <div style={logoWrap}>
          <span style={logoText}>CARDE</span>
          <span style={logoSub}>GESTÃO</span>
        </div>

        <nav style={nav}>
          <p style={navGroup}>Acervo</p>
          <NavLink to="/vehicles" style={navLinkStyle} end>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
              <rect x="1" y="3" width="15" height="13" rx="2" />
              <path d="M16 8h4l3 5v3h-7V8z" />
              <circle cx="5.5" cy="18.5" r="2.5" />
              <circle cx="18.5" cy="18.5" r="2.5" />
            </svg>
            Veículos
          </NavLink>
          <p style={{ ...navGroup, marginTop: 24 }}>Programação</p>
          <NavLink to="/events" style={navLinkStyle} end>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
              <rect x="3" y="4" width="18" height="18" rx="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
            Eventos
          </NavLink>
        </nav>

        <button onClick={() => setShowConfirm(true)} style={logoutBtn}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>
          Sair
        </button>
      </aside>

      <main style={main}>
        <Outlet />
      </main>
    </div>
  );
}

function navLinkStyle({ isActive }: { isActive: boolean }): React.CSSProperties {
  return {
    display: 'flex', alignItems: 'center', gap: 10,
    padding: '9px 12px', borderRadius: 6,
    color: isActive ? '#D4A843' : 'rgba(255,255,255,0.5)',
    background: isActive ? 'rgba(212,168,67,0.08)' : 'transparent',
    textDecoration: 'none', fontSize: 14, fontWeight: isActive ? 600 : 400,
    borderLeft: isActive ? '2px solid #D4A843' : '2px solid transparent',
    marginBottom: 2, transition: 'all 0.15s',
  };
}

const root: React.CSSProperties = { display: 'flex', minHeight: '100vh', background: '#000' };

const sidebar: React.CSSProperties = {
  width: 240, background: '#000',
  borderRight: '1px solid rgba(255,255,255,0.07)',
  display: 'flex', flexDirection: 'column',
  padding: '28px 16px 24px', flexShrink: 0,
};

const logoWrap: React.CSSProperties = {
  paddingLeft: 12, marginBottom: 36,
};

const logoText: React.CSSProperties = {
  display: 'block',
  fontFamily: "'Big Shoulders Display', cursive",
  fontSize: 28, fontWeight: 900, letterSpacing: 3,
  color: '#fff', lineHeight: 1,
};

const logoSub: React.CSSProperties = {
  display: 'block',
  fontFamily: "'IBM Plex Sans', sans-serif",
  fontSize: 10, fontWeight: 500, letterSpacing: 4,
  color: '#D4A843', marginTop: 3, textTransform: 'uppercase',
};

const nav: React.CSSProperties = { flex: 1 };

const navGroup: React.CSSProperties = {
  fontSize: 10, fontWeight: 600, letterSpacing: 2,
  color: 'rgba(255,255,255,0.25)', textTransform: 'uppercase',
  paddingLeft: 12, marginBottom: 6,
};

const logoutBtn: React.CSSProperties = {
  display: 'flex', alignItems: 'center', gap: 8,
  background: 'transparent', border: '1px solid rgba(255,255,255,0.1)',
  color: 'rgba(255,255,255,0.4)', borderRadius: 6,
  padding: '9px 14px', cursor: 'pointer', fontSize: 13, width: '100%',
  transition: 'border-color 0.15s, color 0.15s',
};

const main: React.CSSProperties = {
  flex: 1, padding: '36px 40px',
  background: '#0a0a0a', overflowY: 'auto', minHeight: '100vh',
};

const overlay: React.CSSProperties = {
  position: 'fixed', inset: 0,
  background: 'rgba(0,0,0,0.7)',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  zIndex: 1000,
};

const dialog: React.CSSProperties = {
  background: '#111', border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: 10, padding: '28px 32px', width: 320,
};

const dialogTitle: React.CSSProperties = {
  fontFamily: "'IBM Plex Sans', sans-serif",
  fontSize: 16, fontWeight: 600, color: '#fff',
  margin: '0 0 8px',
};

const dialogBody: React.CSSProperties = {
  fontFamily: "'IBM Plex Sans', sans-serif",
  fontSize: 14, color: 'rgba(255,255,255,0.5)',
  margin: '0 0 24px',
};

const dialogActions: React.CSSProperties = {
  display: 'flex', justifyContent: 'flex-end', gap: 10,
};

const cancelBtn: React.CSSProperties = {
  background: 'transparent', border: '1px solid rgba(255,255,255,0.15)',
  color: 'rgba(255,255,255,0.6)', borderRadius: 6,
  padding: '8px 18px', cursor: 'pointer', fontSize: 13,
  fontFamily: "'IBM Plex Sans', sans-serif",
};

const confirmBtn: React.CSSProperties = {
  background: '#D4A843', border: 'none',
  color: '#000', borderRadius: 6,
  padding: '8px 18px', cursor: 'pointer', fontSize: 13, fontWeight: 600,
  fontFamily: "'IBM Plex Sans', sans-serif",
};
