import { useState } from 'react';
import type { VehicleQrCode } from '../types';
import { generateVehicleQrCode } from '../api/vehicles';
import Spinner from './Spinner';
import ConfirmDialog from './ConfirmDialog';

interface Props {
  vehicleId: string;
  qrCode: VehicleQrCode | null;
  onQrCodeChange: (qr: VehicleQrCode) => void;
}

export default function VehicleQrCodeSection({ vehicleId, qrCode, onQrCodeChange }: Props) {
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState('');
  const [showConfirm, setShowConfirm] = useState(false);

  async function handleGenerate() {
    setGenerating(true);
    setError('');
    try {
      const generated = await generateVehicleQrCode(vehicleId);
      onQrCodeChange(generated);
    } catch {
      setError('Erro ao gerar QR Code. Tente novamente.');
    } finally {
      setGenerating(false);
    }
  }

  function handleDownload() {
    if (!qrCode) return;
    const link = document.createElement('a');
    link.href = qrCode.imageUrl;
    link.download = `qr-${vehicleId}.png`;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  return (
    <div style={sectionWrap}>
      <div style={sectionHeader}>
        <span style={sectionLabel}>QR Code</span>
      </div>

      {error && <p style={errorStyle}>{error}</p>}

      {showConfirm && (
        <ConfirmDialog
          message="Ao trocar o QR Code, o anterior deixará de funcionar. Deseja continuar?"
          confirmLabel="Substituir"
          onConfirm={() => { setShowConfirm(false); handleGenerate(); }}
          onCancel={() => setShowConfirm(false)}
        />
      )}

      {!qrCode ? (
        <div>
          <p style={hintStyle}>QR Code ainda não gerado para este veículo.</p>
          <button
            type="button"
            onClick={handleGenerate}
            disabled={generating}
            style={btnGenerate}
          >
            {generating ? (
              <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Spinner size={14} color="#000" /> Gerando...
              </span>
            ) : 'Gerar QR Code'}
          </button>
        </div>
      ) : (
        <div>
          <div style={qrWrap}>
            <img src={qrCode.imageUrl} alt="QR Code do veículo" style={qrImg} />
            <div style={qrMeta}>
              <p style={qrValueText}>{qrCode.qrValue}</p>
              <button type="button" onClick={handleDownload} style={btnDownload}>
                ↓ Baixar QR Code
              </button>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setShowConfirm(true)}
            disabled={generating}
            style={{ ...btnGenerate, marginTop: 12 }}
          >
            {generating ? (
              <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Spinner size={14} color="#000" /> Gerando...
              </span>
            ) : 'Trocar QR Code'}
          </button>
        </div>
      )}
    </div>
  );
}

const sectionWrap: React.CSSProperties = { borderTop: '1px solid rgba(255,255,255,0.07)', paddingTop: 16 };
const sectionHeader: React.CSSProperties = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 };
const sectionLabel: React.CSSProperties = { fontSize: 11, fontWeight: 600, letterSpacing: 1, color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase' };
const hintStyle: React.CSSProperties = { fontSize: 13, color: 'rgba(255,255,255,0.3)', marginBottom: 12, margin: '0 0 12px' };
const errorStyle: React.CSSProperties = { color: '#ef4444', fontSize: 13, marginBottom: 12 };
const btnGenerate: React.CSSProperties = { padding: '9px 20px', background: '#D4A843', color: '#000', border: 'none', borderRadius: 4, cursor: 'pointer', fontSize: 13, fontWeight: 700 };
const qrWrap: React.CSSProperties = { display: 'flex', gap: 20, alignItems: 'flex-start' };
const qrImg: React.CSSProperties = { width: 120, height: 120, borderRadius: 4, border: '1px solid rgba(255,255,255,0.1)' };
const qrMeta: React.CSSProperties = { display: 'flex', flexDirection: 'column', gap: 10, justifyContent: 'center' };
const qrValueText: React.CSSProperties = { fontSize: 11, color: 'rgba(255,255,255,0.35)', wordBreak: 'break-all', margin: 0 };
const btnDownload: React.CSSProperties = { padding: '7px 16px', background: 'transparent', color: '#D4A843', border: '1px solid rgba(212,168,67,0.3)', borderRadius: 4, cursor: 'pointer', fontSize: 13 };
