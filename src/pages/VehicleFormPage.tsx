import { useEffect, useRef, useState, type ChangeEvent, type FormEvent } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import { createVehicle, getVehicleQrCode, updateVehicle } from '../api/vehicles';
import { uploadImage } from '../api/cloudinary';
import type { Vehicle, VehicleCategory, VehicleQrCode, VehicleRequest } from '../types';
import Spinner from '../components/Spinner';
import VehicleQrCodeSection from '../components/VehicleQrCodeSection';

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
  const [qrCode, setQrCode] = useState<VehicleQrCode | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isEdit || !id) return;
    // Se o veículo já veio com qrCodeImageUrl do estado de navegação, constrói o objeto mínimo
    if (existing?.qrCodeImageUrl) {
      setQrCode({
        id: '',
        vehicleId: id,
        qrValue: `https://carde.app/vehicles/${id}`,
        imageUrl: existing.qrCodeImageUrl,
      });
      return;
    }
    // Caso contrário busca da API (ex: acesso direto por URL)
    getVehicleQrCode(id).then(setQrCode).catch(() => {});
  }, [id, isEdit]); // eslint-disable-line react-hooks/exhaustive-deps

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
    } catch (err: unknown) {
      const msg = (err as Error)?.message ?? 'Erro ao fazer upload.';
      setError(`Upload falhou: ${msg}`);
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
      if (isEdit) await updateVehicle(id!, req);
      else await createVehicle(req);
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
          <div style={sectionWrap}>
            <div style={sectionHeader}>
              <span style={sectionLabel}>Fotos do veículo *</span>
              <button type="button" onClick={() => fileInputRef.current?.click()} style={btnAddPhoto} disabled={loading || uploading}>
                {uploading ? (
                  <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Spinner size={13} color="#fff" /> Enviando...
                  </span>
                ) : '+ Adicionar fotos'}
              </button>
              <input ref={fileInputRef} type="file" accept="image/*" multiple style={{ display: 'none' }} onChange={handleFilesSelected} />
            </div>

            {imageUrls.length === 0 && !uploading && (
              <p style={emptyMsg}>Nenhuma foto adicionada. Adicione ao menos uma.</p>
            )}

            <div style={photoGrid}>
              {imageUrls.map((url, i) => (
                <div key={url + i} style={photoThumb}>
                  <img src={url} alt={`Foto ${i + 1}`} style={thumbImg} />
                  {i === 0 && <span style={capaBadge}>CAPA</span>}
                  <button type="button" onClick={() => removeImage(i)} style={btnRemovePhoto} disabled={loading} title="Remover foto">×</button>
                </div>
              ))}
              {uploading && (
                <div style={{ ...photoThumb, ...uploadingThumb }}>
                  <Spinner size={24} color="rgba(255,255,255,0.5)" />
                </div>
              )}
            </div>
          </div>

          <Field label="URL do som do motor (opcional)">
            <input value={engineSoundUrl} onChange={e => setEngineSoundUrl(e.target.value)} style={input} placeholder="https://..." disabled={loading} />
          </Field>

          {/* ── QR Code (apenas em modo edição) ── */}
          {isEdit && <VehicleQrCodeSection vehicleId={id!} initialQrCode={qrCode} />}

          {/* ── Specs ── */}
          <div style={sectionWrap}>
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
                  <Spinner size={16} color="#000" /> Salvando...
                </span>
              ) : (isEdit ? 'Salvar alterações' : 'Criar veículo')}
            </button>
            <button type="button" onClick={() => navigate('/vehicles')} style={btnCancel} disabled={loading}>Cancelar</button>
          </div>
        </form>

        {loading && (
          <div style={formOverlay}>
            <Spinner size={36} color="#fff" />
            <span style={{ marginTop: 16, color: 'rgba(255,255,255,0.5)', fontSize: 14 }}>Salvando veículo...</span>
          </div>
        )}
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, flex: 1 }}>
      <label style={labelStyle}>{label}</label>
      {children}
    </div>
  );
}

const header: React.CSSProperties = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 };
const pageTitle: React.CSSProperties = { margin: 0, fontFamily: "'Big Shoulders Display', cursive", fontSize: 28, fontWeight: 700, letterSpacing: 1, color: '#fff' };
const btnBack: React.CSSProperties = { background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer', fontSize: 14 };
const formStyle: React.CSSProperties = { display: 'flex', flexDirection: 'column', gap: 16, background: '#0f0f0f', padding: 28, borderRadius: 4, border: '1px solid rgba(255,255,255,0.07)' };
const row: React.CSSProperties = { display: 'flex', gap: 16 };
const labelStyle: React.CSSProperties = { fontSize: 11, fontWeight: 600, letterSpacing: 1, color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase' };
const input: React.CSSProperties = { padding: '10px 12px', borderRadius: 4, border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.04)', color: '#fff', fontSize: 14, width: '100%', boxSizing: 'border-box' };
const sectionWrap: React.CSSProperties = { borderTop: '1px solid rgba(255,255,255,0.07)', paddingTop: 16 };
const sectionHeader: React.CSSProperties = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 };
const sectionLabel: React.CSSProperties = { fontSize: 11, fontWeight: 600, letterSpacing: 1, color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase' };
const btnAddPhoto: React.CSSProperties = { padding: '6px 14px', borderRadius: 4, border: '1px solid rgba(255,255,255,0.12)', background: 'transparent', cursor: 'pointer', fontSize: 13, color: '#fff' };
const emptyMsg: React.CSSProperties = { fontSize: 13, color: 'rgba(255,255,255,0.2)', margin: '4px 0 8px' };
const photoGrid: React.CSSProperties = { display: 'flex', flexWrap: 'wrap', gap: 10 };
const photoThumb: React.CSSProperties = { position: 'relative', width: 90, height: 68, borderRadius: 4, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)' };
const uploadingThumb: React.CSSProperties = { display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.03)' };
const thumbImg: React.CSSProperties = { width: '100%', height: '100%', objectFit: 'cover' };
const capaBadge: React.CSSProperties = { position: 'absolute', top: 4, left: 4, background: '#D4A843', color: '#000', fontSize: 9, fontWeight: 700, padding: '2px 6px', borderRadius: 2, letterSpacing: 0.5 };
const btnRemovePhoto: React.CSSProperties = { position: 'absolute', top: 3, right: 3, width: 20, height: 20, border: 'none', borderRadius: '50%', background: 'rgba(0,0,0,0.7)', color: '#fff', cursor: 'pointer', fontSize: 14, padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', lineHeight: 1 };
const btnAddSpec: React.CSSProperties = { padding: '5px 12px', borderRadius: 4, border: '1px solid rgba(255,255,255,0.12)', background: 'transparent', cursor: 'pointer', fontSize: 13, color: 'rgba(255,255,255,0.6)' };
const specRow: React.CSSProperties = { display: 'flex', gap: 8, marginBottom: 8, alignItems: 'center' };
const btnRemoveSpec: React.CSSProperties = { padding: '6px 10px', borderRadius: 4, border: '1px solid rgba(239,68,68,0.2)', background: 'rgba(239,68,68,0.08)', color: '#ef4444', cursor: 'pointer', fontSize: 15, lineHeight: 1 };
const btnSubmit: React.CSSProperties = { padding: '11px 28px', background: '#fff', color: '#000', border: 'none', borderRadius: 4, cursor: 'pointer', fontSize: 14, fontWeight: 700, minHeight: 44, letterSpacing: 0.3 };
const btnCancel: React.CSSProperties = { padding: '11px 24px', background: 'transparent', color: 'rgba(255,255,255,0.45)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 4, cursor: 'pointer', fontSize: 14 };
const errorStyle: React.CSSProperties = { color: '#ef4444', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', padding: '10px 16px', borderRadius: 4, marginBottom: 20, fontSize: 14 };
const formOverlay: React.CSSProperties = { position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', borderRadius: 4, zIndex: 10 };
