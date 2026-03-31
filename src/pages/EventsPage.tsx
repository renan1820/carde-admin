import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { listEvents, deleteEvent } from '../api/events';
import type { MuseumEvent } from '../types';
import ConfirmDialog from '../components/ConfirmDialog';

export default function EventsPage() {
  const [events, setEvents] = useState<MuseumEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<MuseumEvent | null>(null);
  const navigate = useNavigate();

  useEffect(() => { load(); }, []);

  async function load() {
    try {
      setLoading(true);
      setEvents(await listEvents());
    } catch {
      setError('Erro ao carregar eventos.');
    } finally {
      setLoading(false);
    }
  }

  async function confirmDelete() {
    if (!deleteTarget) return;
    try {
      await deleteEvent(deleteTarget.id);
      setEvents(e => e.filter(x => x.id !== deleteTarget.id));
    } catch {
      setError('Erro ao excluir evento.');
    } finally {
      setDeleteTarget(null);
    }
  }

  function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
  }

  return (
    <div>
      <div style={header}>
        <h2 style={pageTitle}>Eventos</h2>
        <button onClick={() => navigate('/events/new')} style={btnPrimary}>+ Novo Evento</button>
      </div>

      {error && <p style={errorStyle}>{error}</p>}

      {loading ? (
        <p style={{ color: '#718096' }}>Carregando...</p>
      ) : (
        <div style={tableWrap}>
          <table style={table}>
            <thead>
              <tr style={theadRow}>
                <th style={th}>Título</th>
                <th style={th}>Data</th>
                <th style={th}>Destaque</th>
                <th style={{ ...th, width: 120 }}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {events.map(e => (
                <tr key={e.id} style={tbodyRow}>
                  <td style={td}>{e.title}</td>
                  <td style={td}>{formatDate(e.date)}</td>
                  <td style={td}>{e.isFeatured ? <span style={badgeGreen}>Sim</span> : <span style={badge}>Não</span>}</td>
                  <td style={td}>
                    <button
                      onClick={() => navigate(`/events/${e.id}/edit`, { state: { event: e } })}
                      style={btnEdit}
                    >Editar</button>
                    <button onClick={() => setDeleteTarget(e)} style={btnDelete}>Excluir</button>
                  </td>
                </tr>
              ))}
              {events.length === 0 && (
                <tr><td colSpan={4} style={{ ...td, textAlign: 'center', color: '#a0aec0' }}>Nenhum evento cadastrado.</td></tr>
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

const header: React.CSSProperties = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 };
const pageTitle: React.CSSProperties = { margin: 0, fontSize: 22, fontWeight: 700, color: '#1a202c' };
const btnPrimary: React.CSSProperties = { padding: '9px 20px', background: '#1a202c', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 14, fontWeight: 600 };
const tableWrap: React.CSSProperties = { overflowX: 'auto', borderRadius: 8, boxShadow: '0 1px 6px rgba(0,0,0,0.06)' };
const table: React.CSSProperties = { width: '100%', borderCollapse: 'collapse', background: '#fff' };
const theadRow: React.CSSProperties = { borderBottom: '2px solid #e2e8f0' };
const tbodyRow: React.CSSProperties = { borderBottom: '1px solid #edf2f7' };
const th: React.CSSProperties = { padding: '12px 16px', textAlign: 'left', fontSize: 12, fontWeight: 700, color: '#718096', textTransform: 'uppercase', letterSpacing: 0.5 };
const td: React.CSSProperties = { padding: '12px 16px', fontSize: 14, color: '#2d3748' };
const badge: React.CSSProperties = { background: '#edf2f7', borderRadius: 4, padding: '2px 8px', fontSize: 12, color: '#4a5568' };
const badgeGreen: React.CSSProperties = { background: '#f0fff4', borderRadius: 4, padding: '2px 8px', fontSize: 12, color: '#276749' };
const btnEdit: React.CSSProperties = { padding: '5px 12px', marginRight: 6, borderRadius: 5, border: '1px solid #e2e8f0', background: '#fff', cursor: 'pointer', fontSize: 13 };
const btnDelete: React.CSSProperties = { padding: '5px 12px', borderRadius: 5, border: 'none', background: '#fff5f5', color: '#e53e3e', cursor: 'pointer', fontSize: 13 };
const errorStyle: React.CSSProperties = { color: '#e53e3e', background: '#fff5f5', padding: '10px 16px', borderRadius: 6, marginBottom: 16 };
