import { useState, type FormEvent } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import { createEvent, updateEvent } from '../api/events';
import type { MuseumEvent, EventRequest } from '../types';
import Spinner from '../components/Spinner';

function toDatetimeLocal(iso: string) {
  if (!iso) return '';
  return iso.slice(0, 16);
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
      if (isEdit) await updateEvent(id!, req);
      else await createEvent(req);
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
            <label htmlFor="featured" style={checkLabel}>Exibir em destaque no app</label>
          </div>

          <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
            <button type="submit" disabled={loading} style={btnSubmit}>
              {loading ? (
                <span style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <Spinner size={16} color="#000" /> Salvando...
                </span>
              ) : (isEdit ? 'Salvar alterações' : 'Criar evento')}
            </button>
            <button type="button" onClick={() => navigate('/events')} style={btnCancel} disabled={loading}>Cancelar</button>
          </div>
        </form>

        {loading && (
          <div style={formOverlay}>
            <Spinner size={36} color="#fff" />
            <span style={{ marginTop: 16, color: 'rgba(255,255,255,0.5)', fontSize: 14 }}>Salvando evento...</span>
          </div>
        )}
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <label style={labelStyle}>{label}</label>
      {children}
    </div>
  );
}

const header: React.CSSProperties = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 };
const pageTitle: React.CSSProperties = { margin: 0, fontFamily: "'Big Shoulders Display', cursive", fontSize: 28, fontWeight: 700, letterSpacing: 1, color: '#fff' };
const btnBack: React.CSSProperties = { background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer', fontSize: 14 };
const formStyle: React.CSSProperties = { display: 'flex', flexDirection: 'column', gap: 16, background: '#0f0f0f', padding: 28, borderRadius: 4, border: '1px solid rgba(255,255,255,0.07)' };
const labelStyle: React.CSSProperties = { fontSize: 11, fontWeight: 600, letterSpacing: 1, color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase' };
const checkLabel: React.CSSProperties = { fontSize: 14, color: 'rgba(255,255,255,0.6)', cursor: 'pointer' };
const input: React.CSSProperties = { padding: '10px 12px', borderRadius: 4, border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.04)', color: '#fff', fontSize: 14, width: '100%', boxSizing: 'border-box' };
const btnSubmit: React.CSSProperties = { padding: '11px 28px', background: '#fff', color: '#000', border: 'none', borderRadius: 4, cursor: 'pointer', fontSize: 14, fontWeight: 700, minHeight: 44, letterSpacing: 0.3 };
const btnCancel: React.CSSProperties = { padding: '11px 24px', background: 'transparent', color: 'rgba(255,255,255,0.45)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 4, cursor: 'pointer', fontSize: 14 };
const errorStyle: React.CSSProperties = { color: '#ef4444', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', padding: '10px 16px', borderRadius: 4, marginBottom: 20, fontSize: 14 };
const formOverlay: React.CSSProperties = { position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', borderRadius: 4, zIndex: 10 };
