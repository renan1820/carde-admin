import { useRef, useState, type ChangeEvent, type FormEvent } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import { createVehicle, updateVehicle } from '../api/vehicles';
import { uploadImage } from '../api/cloudinary';
import type { Vehicle, VehicleCategory, VehicleRequest } from '../types';
import Spinner from '../components/Spinner';

const CATEGORIES: VehicleCategory[] = ['car', 'motorcycle', 'truck', 'bus', 'racing', 'classic'];
const CATEGORY_LABELS: Record<VehicleCategory, string> = {
  car: 'Carro', motorcycle: 'Moto', truck: 'Caminhão',
  bus: 'Ônibus', racing: 'Corrida', classic: 'Clássico',
};

type SpecRow = { key: string; value: string };

export default function VehicleFormPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const existing = (location.state as { vehicle?: Vehicle })?.vehicle;
  const isEdit = !!id;

  const [name, setName] = useState(existing?.name ?? '');
  const [brand, setBrand] = useState(existing?.brand ?? '');
  const [year, setYear] = useState(existing?.year?.toString() ?? '');
  const [category, setCategory] = useState<VehicleCategory>((existing?.category as VehicleCategory) ?? 'car');
  const [shortDescription, setShortDescription] = useState(existing?.shortDescription ?? '');
  const [fullHistory, setFullHistory] = useState(existing?.fullHistory ?? '');
  const [imageUrls, setImageUrls] = useState<string[]>(existing?.imageUrls ?? []);
  const [engineSoundUrl, setEngineSoundUrl] = useState(existing?.engineSoundUrl ?? '');
  const [specs, setSpecs] = useState<SpecRow[]>(() => {
    if (!existing?.specs) return [];
    return Object.entries(existing.specs).map(([key, value]) => ({ key, value }));
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function addSpec() { setSpecs(s => [...s, { key: '', value: '' }]); }
  function removeSpec(i: number) { setSpecs(s => s.filter((_, idx) => idx !== i)); }
  function updateSpec(i: number, field: 'key' | 'value', val: string) {
    setSpecs(s => s.map((row, idx) => idx === i ? { ...row, [field]: val } : row));
  }
  function removeImage(i: number) { setImageUrls(u => u.filter((_, idx) => idx !== i)); }

  async function handleFilesSelected(e: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;
    e.target.value = '';
    setUploading(true);
    setError('');
    try {
      const uploaded = await Promise.all(files.map(f => uploadImage(f)));
      setImageUrls(prev => [...prev, ...uploaded]);
    } catch {
      setError('Erro ao fazer upload da imagem. Verifique as configurações do Cloudinary.');
    } finally {
      setUploading(false);
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (imageUrls.length === 0) {
      setError('Adicione ao menos uma foto do veículo.');
      return;
    }
    setError('');
    setLoading(true);
    const req: VehicleRequest = {
      name, brand, year: parseInt(year), category,
      shortDescription, fullHistory, imageUrls,
      engineSoundUrl: engineSoundUrl || undefined,
      specs: specs.filter(s => s.key.trim()).map((s, i) => ({ key: s.key, value: s.value, sortOrder: i })),
    };
    try {
      if (isEdit) {
        await updateVehicle(id!, req);
      } else {
        await createVehicle(req);
      }
      navigate('/vehicles');
    } catch (err: unknown) {
      const status = (err as { response?: { status?: number } })?.response?.status;
      setError(status ? `Erro ao salvar veículo (HTTP ${status}).` : 'Erro ao salvar veículo. Sem resposta do servidor.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ maxWidth: 720 }}>
      <div style={header}>
        <h2 style={pageTitle}>{isEdit ? 'Editar Veículo' : 'Novo Veículo'}</h2>
        <button onClick={() => navigate('/vehicles')} style={btnBack} disabled={loading}>← Voltar</button>
      </div>

      {error && <p style={errorStyle}>{error}</p>}

      <div style={{ position: 'relative' }}>
        <form onSubmit={handleSubmit} style={formStyle}>
          <div style={row}>
            <Field label="Nome *">
              <input value={name} onChange={e => setName(e.target.value)} required style={input} disabled={loading} />
            </Field>
            <Field label="Marca *">
              <input value={brand} onChange={e => setBrand(e.target.value)} required style={input} disabled={loading} />
            </Field>
          </div>
          <div style={row}>
            <Field label="Ano *">
              <input type="number" value={year} onChange={e => setYear(e.target.value)} required min={1800} max={2100} style={input} disabled={loading} />
            </Field>
            <Field label="Categoria *">
              <select value={category} onChange={e => setCategory(e.target.value as VehicleCategory)} style={input} disabled={loading}>
                {CATEGORIES.map(c => <option key={c} value={c}>{CATEGORY_LABELS[c]}</option>)}
              </select>
            </Field>
          </div>
          <Field label="Descrição curta *">
            <input value={shortDescription} onChange={e => setShortDescription(e.target.value)} required maxLength={500} style={input} disabled={loading} />
          </Field>
          <Field label="Histórico completo *">
            <textarea value={fullHistory} onChange={e => setFullHistory(e.target.value)} required rows={5} style={{ ...input, resize: 'vertical' }} disabled={loading} />
          </Field>

          {/* ── Fotos ── */}
          <div style={photoSection}>
            <div style={photoHeader}>
              <span style={sectionLabel}>Fotos do veículo *</span>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                style={btnAddPhoto}
                disabled={loading || uploading}
              >
                {uploading ? (
                  <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Spinner size={14} /> Enviando...
                  </span>
                ) : '+ Adicionar fotos'}
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                style={{ display: 'none' }}
                onChange={handleFilesSelected}
              />
            </div>

            {imageUrls.length === 0 && !uploading && (
              <p style={emptyPhotos}>Nenhuma foto adicionada. Adicione ao menos uma.</p>
            )}

            <div style={photoGrid}>
              {imageUrls.map((url, i) => (
                <div key={url + i} style={photoThumb}>
                  <img src={url} alt={`Foto ${i + 1}`} style={thumbImg} />
                  {i === 0 && <span style={capaBadge}>Capa</span>}
                  <button
                    type="button"
                    onClick={() => removeImage(i)}
                    style={btnRemovePhoto}
                    disabled={loading}
                    title="Remover foto"
                  >×</button>
                </div>
              ))}
              {uploading && (
                <div style={{ ...photoThumb, ...uploadingThumb }}>
                  <Spinner size={28} />
                </div>
              )}
            </div>
          </div>

          <Field label="URL do som do motor (opcional)">
            <input value={engineSoundUrl} onChange={e => setEngineSoundUrl(e.target.value)} style={input} placeholder="https://..." disabled={loading} />
          </Field>

          <div style={specsSection}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <span style={sectionLabel}>Especificações técnicas</span>
              <button type="button" onClick={addSpec} style={btnAddSpec} disabled={loading}>+ Adicionar</button>
            </div>
            {specs.map((s, i) => (
              <div key={i} style={specRow}>
                <input value={s.key} onChange={e => updateSpec(i, 'key', e.target.value)} placeholder="Chave (ex: Motor)" style={{ ...input, flex: 1 }} disabled={loading} />
                <input value={s.value} onChange={e => updateSpec(i, 'value', e.target.value)} placeholder="Valor (ex: V8 5.0)" style={{ ...input, flex: 2 }} disabled={loading} />
                <button type="button" onClick={() => removeSpec(i)} style={btnRemoveSpec} disabled={loading}>×</button>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
            <button type="submit" disabled={loading || uploading} style={btnSubmit}>
              {loading ? (
                <span style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <Spinner size={16} color="#fff" />
                  Salvando...
                </span>
              ) : (isEdit ? 'Salvar alterações' : 'Criar veículo')}
            </button>
            <button type="button" onClick={() => navigate('/vehicles')} style={btnCancel} disabled={loading}>Cancelar</button>
          </div>
        </form>

        {loading && (
          <div style={formOverlay}>
            <Spinner size={40} />
            <span style={{ marginTop: 16, color: '#4a5568', fontSize: 14, fontWeight: 500 }}>Salvando veículo...</span>
          </div>
        )}
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4, flex: 1 }}>
      <label style={labelStyle}>{label}</label>
      {children}
    </div>
  );
}

const header: React.CSSProperties = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 };
const pageTitle: React.CSSProperties = { margin: 0, fontSize: 22, fontWeight: 700, color: '#1a202c' };
const btnBack: React.CSSProperties = { background: 'transparent', border: 'none', color: '#4a5568', cursor: 'pointer', fontSize: 14 };
const formStyle: React.CSSProperties = { display: 'flex', flexDirection: 'column', gap: 16, background: '#fff', padding: 28, borderRadius: 8, boxShadow: '0 1px 6px rgba(0,0,0,0.06)' };
const row: React.CSSProperties = { display: 'flex', gap: 16 };
const labelStyle: React.CSSProperties = { fontSize: 13, fontWeight: 600, color: '#4a5568' };
const input: React.CSSProperties = { padding: '9px 12px', borderRadius: 6, border: '1px solid #e2e8f0', fontSize: 14, width: '100%', boxSizing: 'border-box' };
const photoSection: React.CSSProperties = { borderTop: '1px solid #e2e8f0', paddingTop: 16 };
const photoHeader: React.CSSProperties = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 };
const sectionLabel: React.CSSProperties = { fontSize: 13, fontWeight: 600, color: '#4a5568' };
const btnAddPhoto: React.CSSProperties = { padding: '6px 14px', borderRadius: 6, border: '1px solid #e2e8f0', background: '#fff', cursor: 'pointer', fontSize: 13, fontWeight: 500 };
const emptyPhotos: React.CSSProperties = { fontSize: 13, color: '#a0aec0', margin: '8px 0' };
const photoGrid: React.CSSProperties = { display: 'flex', flexWrap: 'wrap', gap: 10 };
const photoThumb: React.CSSProperties = { position: 'relative', width: 90, height: 90, borderRadius: 6, overflow: 'hidden', border: '1px solid #e2e8f0' };
const uploadingThumb: React.CSSProperties = { display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f7fafc' };
const thumbImg: React.CSSProperties = { width: '100%', height: '100%', objectFit: 'cover' };
const capaBadge: React.CSSProperties = { position: 'absolute', top: 4, left: 4, background: '#1a202c', color: '#fff', fontSize: 10, fontWeight: 700, padding: '2px 6px', borderRadius: 3 };
const btnRemovePhoto: React.CSSProperties = { position: 'absolute', top: 2, right: 2, width: 20, height: 20, border: 'none', borderRadius: '50%', background: 'rgba(0,0,0,0.55)', color: '#fff', cursor: 'pointer', fontSize: 14, lineHeight: '20px', textAlign: 'center', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' };
const specsSection: React.CSSProperties = { borderTop: '1px solid #e2e8f0', paddingTop: 16 };
const btnAddSpec: React.CSSProperties = { padding: '5px 12px', borderRadius: 5, border: '1px solid #e2e8f0', background: '#fff', cursor: 'pointer', fontSize: 13 };
const specRow: React.CSSProperties = { display: 'flex', gap: 8, marginBottom: 8, alignItems: 'center' };
const btnRemoveSpec: React.CSSProperties = { padding: '6px 10px', borderRadius: 5, border: 'none', background: '#fff5f5', color: '#e53e3e', cursor: 'pointer', fontSize: 16, lineHeight: 1 };
const btnSubmit: React.CSSProperties = { padding: '10px 24px', background: '#1a202c', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 14, fontWeight: 600, minHeight: 42 };
const btnCancel: React.CSSProperties = { padding: '10px 24px', background: '#fff', color: '#4a5568', border: '1px solid #e2e8f0', borderRadius: 6, cursor: 'pointer', fontSize: 14 };
const errorStyle: React.CSSProperties = { color: '#e53e3e', background: '#fff5f5', padding: '10px 16px', borderRadius: 6, marginBottom: 16 };
const formOverlay: React.CSSProperties = {
  position: 'absolute', inset: 0, background: 'rgba(255,255,255,0.82)',
  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
  borderRadius: 8, zIndex: 10,
};
