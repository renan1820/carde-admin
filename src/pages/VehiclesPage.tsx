import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { listVehicles, deleteVehicle } from '../api/vehicles';
import { isNetworkError } from '../api/client';
import type { Vehicle } from '../types';
import ConfirmDialog from '../components/ConfirmDialog';
import ConnectionError from '../components/ConnectionError';
import Spinner from '../components/Spinner';

function ImageCell({ imageUrls }: { imageUrls: string[] }) {
  const count = imageUrls.length;

  if (count === 0) {
    return (
      <div style={imgPlaceholder}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#a0aec0" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <circle cx="8.5" cy="8.5" r="1.5" />
          <polyline points="21 15 16 10 5 21" />
        </svg>
        <span style={imgLabel}>Sem foto</span>
      </div>
    );
  }

  return (
    <div style={imgCell}>
      <img src={imageUrls[0]} alt="" style={thumbImg} onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
      {count > 1 ? (
        <span style={imgBadgeMulti}>+{count - 1}</span>
      ) : (
        <span style={imgBadgeOne}>1 foto</span>
      )}
    </div>
  );
}

export default function VehiclesPage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState('');
  const [networkError, setNetworkError] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Vehicle | null>(null);
  const navigate = useNavigate();

  useEffect(() => { load(); }, []);

  async function load() {
    try {
      setLoading(true);
      setNetworkError(false);
      setError('');
      setVehicles(await listVehicles());
    } catch (err) {
      if (isNetworkError(err)) {
        setNetworkError(true);
      } else {
        setError('Erro ao carregar veículos.');
      }
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
      await deleteVehicle(target.id);
      setVehicles(v => v.filter(x => x.id !== target.id));
    } catch {
      setError('Erro ao excluir veículo.');
    } finally {
      setDeleting(false);
    }
  }

  if (networkError) return <ConnectionError onRetry={load} />;

  return (
    <div style={{ position: 'relative' }}>
      {deleting && (
        <div style={deletingOverlay}>
          <Spinner size={36} color="#fff" />
          <span style={{ color: '#fff', marginTop: 14, fontSize: 14, fontWeight: 500 }}>Excluindo...</span>
        </div>
      )}

      <div style={header}>
        <div>
          <h2 style={pageTitle}>Veículos</h2>
          {!loading && <span style={countLabel}>{vehicles.length} {vehicles.length === 1 ? 'veículo' : 'veículos'}</span>}
        </div>
        <button onClick={() => navigate('/vehicles/new')} style={btnPrimary} disabled={deleting}>
          + Novo Veículo
        </button>
      </div>

      {error && <p style={errorStyle}>{error}</p>}

      {loading ? (
        <div style={loadingBox}>
          <Spinner size={32} />
          <span style={loadingText}>Carregando veículos...</span>
        </div>
      ) : (
        <div style={tableWrap}>
          <table style={table}>
            <thead>
              <tr style={theadRow}>
                <th style={{ ...th, width: 100 }}>Foto</th>
                <th style={th}>Nome</th>
                <th style={th}>Marca</th>
                <th style={{ ...th, width: 72 }}>Ano</th>
                <th style={th}>Categoria</th>
                <th style={{ ...th, width: 140 }}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {vehicles.map(v => (
                <tr key={v.id} style={tbodyRow}>
                  <td style={{ ...td, paddingTop: 8, paddingBottom: 8 }}>
                    <ImageCell imageUrls={v.imageUrls ?? []} />
                  </td>
                  <td style={{ ...td, fontWeight: 500 }}>{v.name}</td>
                  <td style={{ ...td, color: '#718096' }}>{v.brand}</td>
                  <td style={td}>{v.year}</td>
                  <td style={td}><span style={badge}>{v.category}</span></td>
                  <td style={td}>
                    <div style={actionsCell}>
                      <button
                        onClick={() => navigate(`/vehicles/${v.id}/edit`, { state: { vehicle: v } })}
                        style={btnEdit}
                      >
                        Editar
                      </button>
                      <button onClick={() => setDeleteTarget(v)} style={btnDelete}>
                        Excluir
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {vehicles.length === 0 && (
                <tr>
                  <td colSpan={6} style={{ ...td, textAlign: 'center', color: '#a0aec0', padding: '48px 16px' }}>
                    Nenhum veículo cadastrado.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {deleteTarget && (
        <ConfirmDialog
          message={`Excluir "${deleteTarget.name}"? Esta ação não pode ser desfeita.`}
          onConfirm={confirmDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
}

const header: React.CSSProperties = { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 };
const pageTitle: React.CSSProperties = { margin: 0, fontSize: 22, fontWeight: 700, color: '#1a202c' };
const countLabel: React.CSSProperties = { fontSize: 13, color: '#a0aec0', marginTop: 2, display: 'block' };
const btnPrimary: React.CSSProperties = {
  padding: '9px 20px', background: '#1a202c', color: '#fff',
  border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 14, fontWeight: 600,
};
const loadingBox: React.CSSProperties = {
  display: 'flex', flexDirection: 'column', alignItems: 'center',
  justifyContent: 'center', padding: '64px 0', gap: 16,
};
const loadingText: React.CSSProperties = { fontSize: 14, color: '#718096' };
const tableWrap: React.CSSProperties = { overflowX: 'auto', borderRadius: 8, boxShadow: '0 1px 6px rgba(0,0,0,0.06)' };
const table: React.CSSProperties = { width: '100%', borderCollapse: 'collapse', background: '#fff' };
const theadRow: React.CSSProperties = { borderBottom: '2px solid #e2e8f0' };
const tbodyRow: React.CSSProperties = { borderBottom: '1px solid #edf2f7', transition: 'background 0.15s' };
const th: React.CSSProperties = { padding: '12px 16px', textAlign: 'left', fontSize: 12, fontWeight: 700, color: '#718096', textTransform: 'uppercase', letterSpacing: 0.5 };
const td: React.CSSProperties = { padding: '12px 16px', fontSize: 14, color: '#2d3748' };
const badge: React.CSSProperties = { background: '#edf2f7', borderRadius: 4, padding: '3px 10px', fontSize: 12, color: '#4a5568', fontWeight: 500 };
const actionsCell: React.CSSProperties = { display: 'flex', gap: 8, alignItems: 'center' };
const btnEdit: React.CSSProperties = {
  padding: '6px 14px', borderRadius: 6, border: '1px solid #e2e8f0',
  background: '#fff', cursor: 'pointer', fontSize: 13, fontWeight: 500,
  color: '#2d3748', whiteSpace: 'nowrap',
};
const btnDelete: React.CSSProperties = {
  padding: '6px 14px', borderRadius: 6, border: '1px solid #fed7d7',
  background: '#fff5f5', color: '#e53e3e', cursor: 'pointer', fontSize: 13,
  fontWeight: 500, whiteSpace: 'nowrap',
};
const errorStyle: React.CSSProperties = { color: '#e53e3e', background: '#fff5f5', padding: '10px 16px', borderRadius: 6, marginBottom: 16 };
const deletingOverlay: React.CSSProperties = {
  position: 'fixed', inset: 0, background: 'rgba(26,32,44,0.55)',
  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
  zIndex: 200,
};

// Image cell styles
const imgCell: React.CSSProperties = { position: 'relative', display: 'inline-flex', flexDirection: 'column', alignItems: 'center', gap: 4 };
const thumbImg: React.CSSProperties = { width: 64, height: 48, objectFit: 'cover', borderRadius: 6, border: '1px solid #e2e8f0', display: 'block' };
const imgBadgeMulti: React.CSSProperties = {
  fontSize: 11, fontWeight: 700, color: '#fff', background: '#1a202c',
  borderRadius: 3, padding: '1px 5px', lineHeight: 1.4,
};
const imgBadgeOne: React.CSSProperties = {
  fontSize: 11, color: '#718096', lineHeight: 1.4,
};
const imgPlaceholder: React.CSSProperties = {
  width: 64, height: 48, borderRadius: 6, border: '1px dashed #cbd5e0',
  background: '#f7fafc', display: 'flex', flexDirection: 'column',
  alignItems: 'center', justifyContent: 'center', gap: 3,
};
const imgLabel: React.CSSProperties = { fontSize: 10, color: '#a0aec0', fontWeight: 500 };
