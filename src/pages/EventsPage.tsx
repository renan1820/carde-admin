import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { listEvents, deleteEvent } from '../api/events';
import { isNetworkError } from '../api/client';
import type { MuseumEvent } from '../types';
import ConfirmDialog from '../components/ConfirmDialog';
import ConnectionError from '../components/ConnectionError';
import Spinner from '../components/Spinner';

export default function EventsPage() {
  const [events, setEvents] = useState<MuseumEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState('');
  const [networkError, setNetworkError] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<MuseumEvent | null>(null);
  const navigate = useNavigate();

  useEffect(() => { load(); }, []);

  async function load() {
    try {
      setLoading(true);
      setNetworkError(false);
      setError('');
      setEvents(await listEvents());
    } catch (err) {
      if (isNetworkError(err)) setNetworkError(true);
      else setError('Erro ao carregar eventos.');
    } finally {
      setLoading(false);
    }
  }

  async function confirmDelete() {
    if (!deleteTarget) return;
    const target = deleteTarget;
    setDeleteTarget(null);
    setDeleting(true);
    try {
      await deleteEvent(target.id);
      setEvents(e => e.filter(x => x.id !== target.id));
    } catch {
      setError('Erro ao excluir evento.');
    } finally {
      setDeleting(false);
    }
  }

  function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
  }

  if (networkError) return <ConnectionError onRetry={load} />;

  return (
    <div style={{ position: 'relative' }}>
      {deleting && (
        <div style={deletingOverlay}>
          <Spinner size={36} color="#fff" />
          <span style={{ color: 'rgba(255,255,255,0.7)', marginTop: 14, fontSize: 14 }}>Excluindo...</span>
        </div>
      )}

      <div style={header}>
        <div>
          <h2 style={pageTitle}>Eventos</h2>
          {!loading && <span style={countLabel}>{events.length} {events.length === 1 ? 'evento' : 'eventos'}</span>}
        </div>
        <button onClick={() => navigate('/events/new')} style={btnPrimary} disabled={deleting}>
          + Novo Evento
        </button>
      </div>

      {error && <p style={errorStyle}>{error}</p>}

      {loading ? (
        <div style={loadingBox}>
          <Spinner size={32} color="#fff" />
          <span style={loadingText}>Carregando eventos...</span>
        </div>
      ) : (
        <div style={tableWrap}>
          <table style={table}>
            <thead>
              <tr>
                <th style={th}>Título</th>
                <th style={th}>Data</th>
                <th style={th}>Destaque</th>
                <th style={{ ...th, width: 148 }}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {events.map(e => (
                <tr key={e.id} style={tbodyRow}>
                  <td style={{ ...td, fontWeight: 500, color: '#fff' }}>{e.title}</td>
                  <td style={{ ...td, color: 'rgba(255,255,255,0.45)' }}>{formatDate(e.date)}</td>
                  <td style={td}>
                    {e.isFeatured
                      ? <span style={badgeGold}>Destaque</span>
                      : <span style={badgeMuted}>Não</span>}
                  </td>
                  <td style={td}>
                    <div style={actionsCell}>
                      <button onClick={() => navigate(`/events/${e.id}/edit`, { state: { event: e } })} style={btnEdit}>
                        Editar
                      </button>
                      <button onClick={() => setDeleteTarget(e)} style={btnDelete}>
                        Excluir
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {events.length === 0 && (
                <tr>
                  <td colSpan={4} style={{ ...td, textAlign: 'center', color: 'rgba(255,255,255,0.2)', padding: '56px 16px' }}>
                    Nenhum evento cadastrado.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {deleteTarget && (
        <ConfirmDialog
          message={`Excluir "${deleteTarget.title}"? Esta ação não pode ser desfeita.`}
          onConfirm={confirmDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
}

const header: React.CSSProperties = { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28 };
const pageTitle: React.CSSProperties = { margin: 0, fontFamily: "'Big Shoulders Display', cursive", fontSize: 28, fontWeight: 700, letterSpacing: 1, color: '#fff' };
const countLabel: React.CSSProperties = { display: 'block', fontSize: 13, color: 'rgba(255,255,255,0.3)', marginTop: 3 };
const btnPrimary: React.CSSProperties = { padding: '9px 22px', background: '#fff', color: '#000', border: 'none', borderRadius: 4, cursor: 'pointer', fontSize: 13, fontWeight: 700, letterSpacing: 0.3 };
const loadingBox: React.CSSProperties = { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '80px 0', gap: 16 };
const loadingText: React.CSSProperties = { fontSize: 13, color: 'rgba(255,255,255,0.3)' };
const tableWrap: React.CSSProperties = { overflowX: 'auto', borderRadius: 4, border: '1px solid rgba(255,255,255,0.07)' };
const table: React.CSSProperties = { width: '100%', borderCollapse: 'collapse', background: '#0f0f0f' };
const th: React.CSSProperties = { padding: '11px 16px', textAlign: 'left', fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: 1, borderBottom: '1px solid rgba(255,255,255,0.07)', background: 'rgba(255,255,255,0.02)' };
const tbodyRow: React.CSSProperties = { borderBottom: '1px solid rgba(255,255,255,0.05)' };
const td: React.CSSProperties = { padding: '13px 16px', fontSize: 14, color: 'rgba(255,255,255,0.7)' };
const badgeGold: React.CSSProperties = { background: 'rgba(212,168,67,0.1)', border: '1px solid rgba(212,168,67,0.25)', borderRadius: 3, padding: '3px 9px', fontSize: 11, color: '#D4A843', fontWeight: 600, letterSpacing: 0.3 };
const badgeMuted: React.CSSProperties = { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 3, padding: '3px 9px', fontSize: 11, color: 'rgba(255,255,255,0.3)' };
const actionsCell: React.CSSProperties = { display: 'flex', gap: 8, alignItems: 'center' };
const btnEdit: React.CSSProperties = { padding: '6px 14px', borderRadius: 4, border: '1px solid rgba(255,255,255,0.12)', background: 'transparent', cursor: 'pointer', fontSize: 13, color: '#fff', fontWeight: 500 };
const btnDelete: React.CSSProperties = { padding: '6px 14px', borderRadius: 4, border: '1px solid rgba(239,68,68,0.25)', background: 'rgba(239,68,68,0.08)', color: '#ef4444', cursor: 'pointer', fontSize: 13, fontWeight: 500 };
const errorStyle: React.CSSProperties = { color: '#ef4444', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', padding: '10px 16px', borderRadius: 4, marginBottom: 20, fontSize: 14 };
const deletingOverlay: React.CSSProperties = { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', zIndex: 200 };
