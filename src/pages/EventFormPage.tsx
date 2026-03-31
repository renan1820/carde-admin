import { useState, type FormEvent } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import { createEvent, updateEvent } from '../api/events';
import type { MuseumEvent, EventRequest } from '../types';
import Spinner from '../components/Spinner';

function toDatetimeLocal(iso: string) {
  if (!iso) return '';
  return iso.slice(0, 16); // "2025-06-15T10:00"
}

export default function EventFormPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const existing = (location.state as { event?: MuseumEvent })?.event;
  const isEdit = !!id;

  const [title, setTitle] = useState(existing?.title ?? '');
  const [description, setDescription] = useState(existing?.description ?? '');
  const [date, setDate] = useState(existing ? toDatetimeLocal(existing.date) : '');
  const [imageUrl, setImageUrl] = useState(existing?.imageUrl ?? '');
  const [featured, setFeatured] = useState(existing?.isFeatured ?? false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    const req: EventRequest = {
      title, description,
      date: new Date(date).toISOString(),
      imageUrl, featured,
    };
    try {
      if (isEdit) {
        await updateEvent(id!, req);
      } else {
        await createEvent(req);
      }
      navigate('/events');
    } catch {
      setError('Erro ao salvar evento. Verifique os dados e tente novamente.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ maxWidth: 640 }}>
      <div style={header}>
        <h2 style={pageTitle}>{isEdit ? 'Editar Evento' : 'Novo Evento'}</h2>
        <button onClick={() => navigate('/events')} style={btnBack} disabled={loading}>← Voltar</button>
      </div>

      {error && <p style={errorStyle}>{error}</p>}

      <div style={{ position: 'relative' }}>
        <form onSubmit={handleSubmit} style={formStyle}>
          <Field label="Título *">
            <input value={title} onChange={e => setTitle(e.target.value)} required maxLength={300} style={input} disabled={loading} />
          </Field>
          <Field label="Descrição *">
            <textarea value={description} onChange={e => setDescription(e.target.value)} required rows={4} style={{ ...input, resize: 'vertical' }} disabled={loading} />
          </Field>
          <Field label="Data e horário *">
            <input type="datetime-local" value={date} onChange={e => setDate(e.target.value)} required style={input} disabled={loading} />
          </Field>
          <Field label="URL da imagem *">
            <input value={imageUrl} onChange={e => setImageUrl(e.target.value)} required style={input} placeholder="https://..." disabled={loading} />
          </Field>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <input type="checkbox" id="featured" checked={featured} onChange={e => setFeatured(e.target.checked)} style={{ width: 16, height: 16, cursor: 'pointer' }} disabled={loading} />
            <label htmlFor="featured" style={labelStyle}>Exibir em destaque no app</label>
          </div>

          <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
            <button type="submit" disabled={loading} style={btnSubmit}>
              {loading ? (
                <span style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <Spinner size={16} color="#fff" />
                  Salvando...
                </span>
              ) : (isEdit ? 'Salvar alterações' : 'Criar evento')}
            </button>
            <button type="button" onClick={() => navigate('/events')} style={btnCancel} disabled={loading}>Cancelar</button>
          </div>
        </form>

        {loading && (
          <div style={formOverlay}>
            <Spinner size={40} />
            <span style={{ marginTop: 16, color: '#4a5568', fontSize: 14, fontWeight: 500 }}>Salvando evento...</span>
          </div>
        )}
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <label style={labelStyle}>{label}</label>
      {children}
    </div>
  );
}

const header: React.CSSProperties = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 };
const pageTitle: React.CSSProperties = { margin: 0, fontSize: 22, fontWeight: 700, color: '#1a202c' };
const btnBack: React.CSSProperties = { background: 'transparent', border: 'none', color: '#4a5568', cursor: 'pointer', fontSize: 14 };
const formStyle: React.CSSProperties = { display: 'flex', flexDirection: 'column', gap: 16, background: '#fff', padding: 28, borderRadius: 8, boxShadow: '0 1px 6px rgba(0,0,0,0.06)' };
const labelStyle: React.CSSProperties = { fontSize: 13, fontWeight: 600, color: '#4a5568' };
const input: React.CSSProperties = { padding: '9px 12px', borderRadius: 6, border: '1px solid #e2e8f0', fontSize: 14, width: '100%', boxSizing: 'border-box' };
const btnSubmit: React.CSSProperties = { padding: '10px 24px', background: '#1a202c', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 14, fontWeight: 600, minHeight: 42 };
const btnCancel: React.CSSProperties = { padding: '10px 24px', background: '#fff', color: '#4a5568', border: '1px solid #e2e8f0', borderRadius: 6, cursor: 'pointer', fontSize: 14 };
const errorStyle: React.CSSProperties = { color: '#e53e3e', background: '#fff5f5', padding: '10px 16px', borderRadius: 6, marginBottom: 16 };
const formOverlay: React.CSSProperties = {
  position: 'absolute', inset: 0, background: 'rgba(255,255,255,0.82)',
  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
  borderRadius: 8, zIndex: 10,
};
