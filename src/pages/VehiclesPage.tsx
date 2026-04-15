import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { listVehicles, deleteVehicle } from '../api/vehicles';
import { isNetworkError } from '../api/client';
import type { Vehicle } from '../types';
import ConfirmDialog from '../components/ConfirmDialog';
import ConnectionError from '../components/ConnectionError';
import Spinner from '../components/Spinner';

const CATEGORY_LABELS: Record<string, string> = {
  car: 'Carro', motorcycle: 'Moto', truck: 'Caminhão',
  bus: 'Ônibus', racing: 'Corrida', classic: 'Clássico',
};

function ImageCell({ imageUrls }: { imageUrls: string[] }) {
  const count = imageUrls.length;
  if (count === 0) {
    return (
      <div style={imgPlaceholder}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <circle cx="8.5" cy="8.5" r="1.5" />
          <polyline points="21 15 16 10 5 21" />
        </svg>
        <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.2)', marginTop: 3 }}>Sem foto</span>
      </div>
    );
  }
  return (
    <div style={imgCell}>
      <img src={imageUrls[0]} alt="" style={thumbImg} onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
      {count > 1 && <span style={imgBadge}>+{count - 1}</span>}
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
      if (isNetworkError(err)) setNetworkError(true);
      else setError('Erro ao carregar veículos.');
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
          <span style={{ color: 'rgba(255,255,255,0.7)', marginTop: 14, fontSize: 14 }}>Excluindo...</span>
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
          <Spinner size={32} color="#fff" />
          <span style={loadingText}>Carregando veículos...</span>
        </div>
      ) : (
        <div style={tableWrap}>
          <table style={table}>
            <thead>
              <tr>
                <th style={{ ...th, width: 88 }}>Foto</th>
                <th style={th}>Nome</th>
                <th style={th}>Marca</th>
                <th style={{ ...th, width: 72 }}>Ano</th>
                <th style={th}>Categoria</th>
                <th style={{ ...th, width: 96 }}>QR Code</th>
                <th style={{ ...th, width: 148 }}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {vehicles.map(v => (
                <tr key={v.id} style={tbodyRow}>
                  <td style={{ ...td, paddingTop: 8, paddingBottom: 8 }}>
                    <ImageCell imageUrls={v.imageUrls ?? []} />
                  </td>
                  <td style={{ ...td, fontWeight: 500, color: '#fff' }}>{v.name}</td>
                  <td style={{ ...td, color: 'rgba(255,255,255,0.45)' }}>{v.brand}</td>
                  <td style={{ ...td, color: 'rgba(255,255,255,0.45)' }}>{v.year}</td>
                  <td style={td}><span style={badge}>{CATEGORY_LABELS[v.category] ?? v.category}</span></td>
                  <td style={td}>
                    {v.qrCodeImageUrl
                      ? <span style={qrBadgeOk}>✓ Gerado</span>
                      : <span style={qrBadgePending}>Pendente</span>}
                  </td>
                  <td style={td}>
                    <div style={actionsCell}>
                      <button onClick={() => navigate(`/vehicles/${v.id}/edit`, { state: { vehicle: v } })} style={btnEdit}>
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
                  <td colSpan={6} style={{ ...td, textAlign: 'center', color: 'rgba(255,255,255,0.2)', padding: '56px 16px' }}>
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
const badge: React.CSSProperties = { background: 'rgba(212,168,67,0.1)', border: '1px solid rgba(212,168,67,0.25)', borderRadius: 3, padding: '3px 9px', fontSize: 11, color: '#D4A843', fontWeight: 500, letterSpacing: 0.3 };
const actionsCell: React.CSSProperties = { display: 'flex', gap: 8, alignItems: 'center' };
const btnEdit: React.CSSProperties = { padding: '6px 14px', borderRadius: 4, border: '1px solid rgba(255,255,255,0.12)', background: 'transparent', cursor: 'pointer', fontSize: 13, color: '#fff', fontWeight: 500 };
const btnDelete: React.CSSProperties = { padding: '6px 14px', borderRadius: 4, border: '1px solid rgba(239,68,68,0.25)', background: 'rgba(239,68,68,0.08)', color: '#ef4444', cursor: 'pointer', fontSize: 13, fontWeight: 500 };
const errorStyle: React.CSSProperties = { color: '#ef4444', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', padding: '10px 16px', borderRadius: 4, marginBottom: 20, fontSize: 14 };
const deletingOverlay: React.CSSProperties = { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', zIndex: 200 };
const imgCell: React.CSSProperties = { position: 'relative', display: 'inline-flex', flexDirection: 'column', alignItems: 'center', gap: 4 };
const thumbImg: React.CSSProperties = { width: 60, height: 44, objectFit: 'cover', borderRadius: 3, border: '1px solid rgba(255,255,255,0.1)', display: 'block' };
const imgBadge: React.CSSProperties = { fontSize: 10, fontWeight: 700, color: '#D4A843', background: 'rgba(212,168,67,0.12)', borderRadius: 3, padding: '1px 5px' };
const imgPlaceholder: React.CSSProperties = { width: 60, height: 44, borderRadius: 3, border: '1px dashed rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.02)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' };
const qrBadgeOk: React.CSSProperties = { background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.25)', borderRadius: 3, padding: '3px 9px', fontSize: 11, color: '#22c55e', fontWeight: 600, letterSpacing: 0.3, whiteSpace: 'nowrap' };
const qrBadgePending: React.CSSProperties = { background: 'transparent', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 3, padding: '3px 9px', fontSize: 11, color: 'rgba(255,255,255,0.25)', fontWeight: 500, letterSpacing: 0.3, whiteSpace: 'nowrap' };
