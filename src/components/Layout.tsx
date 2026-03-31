import { NavLink, Outlet, useNavigate } from 'react-router-dom';

interface Props {
  onLogout: () => void;
}

export default function Layout({ onLogout }: Props) {
  const navigate = useNavigate();

  function handleLogout() {
    onLogout();
    navigate('/login');
  }

  return (
    <div style={root}>
      <aside style={sidebar}>
        <div style={logo}>CARDE Admin</div>
        <nav style={nav}>
          <NavLink to="/vehicles" style={navLinkStyle} end>Veículos</NavLink>
          <NavLink to="/events" style={navLinkStyle} end>Eventos</NavLink>
        </nav>
        <button onClick={handleLogout} style={logoutBtn}>Sair</button>
      </aside>
      <main style={main}>
        <Outlet />
      </main>
    </div>
  );
}

function navLinkStyle({ isActive }: { isActive: boolean }): React.CSSProperties {
  return {
    display: 'block', padding: '10px 16px', borderRadius: 6,
    color: isActive ? '#fff' : '#cbd5e0',
    background: isActive ? 'rgba(255,255,255,0.15)' : 'transparent',
    textDecoration: 'none', fontSize: 14, fontWeight: isActive ? 600 : 400,
    marginBottom: 4,
  };
}

const root: React.CSSProperties = { display: 'flex', minHeight: '100vh' };
const sidebar: React.CSSProperties = {
  width: 220, background: '#1a202c', display: 'flex',
  flexDirection: 'column', padding: '24px 16px', flexShrink: 0,
};
const logo: React.CSSProperties = {
  color: '#fff', fontWeight: 700, fontSize: 18,
  marginBottom: 32, paddingLeft: 8, letterSpacing: 0.5,
};
const nav: React.CSSProperties = { flex: 1 };
const main: React.CSSProperties = { flex: 1, padding: 32, background: '#f7fafc', overflowY: 'auto' };
const logoutBtn: React.CSSProperties = {
  background: 'transparent', border: '1px solid rgba(255,255,255,0.2)',
  color: '#a0aec0', borderRadius: 6, padding: '8px 16px',
  cursor: 'pointer', fontSize: 13, width: '100%',
};
