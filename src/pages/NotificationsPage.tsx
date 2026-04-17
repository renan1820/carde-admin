import { useEffect, useState } from 'react';
import { getNotificationLogs, sendNotification, NotificationLog } from '../api/notifications';

export default function NotificationsPage() {
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [logs, setLogs] = useState<NotificationLog[]>([]);
  const [loadingLogs, setLoadingLogs] = useState(true);

  useEffect(() => {
    fetchLogs();
  }, []);

  async function fetchLogs() {
    try {
      setLogs(await getNotificationLogs());
    } catch {
      // silencioso — tabela pode estar vazia
    } finally {
      setLoadingLogs(false);
    }
  }

  async function handleSend() {
    if (!title.trim() || !body.trim()) return;
    setSending(true);
    setError(null);
    setSent(false);
    try {
      const log = await sendNotification({ title: title.trim(), body: body.trim() });
      setSent(true);
      setTitle('');
      setBody('');
      setLogs(prev => [log, ...prev]);
      setTimeout(() => setSent(false), 3000);
    } catch {
      setError('Falha ao enviar notificação. Tente novamente.');
    } finally {
      setSending(false);
    }
  }

  function formatDate(iso: string) {
    return new Date(iso).toLocaleString('pt-BR', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
  }

  const canSend = title.trim().length > 0 && body.trim().length > 0 && !sending;

  return (
    <div>
      <h1 style={pageTitle}>Notificações Push</h1>
      <p style={pageSubtitle}>Dispare mensagens para todos os usuários do app CARDE.</p>

      <div style={grid}>
        {/* Formulário */}
        <div style={card}>
          <p style={cardTitle}>Nova notificação</p>

          <label style={labelStyle}>Título <span style={counter}>{title.length}/100</span></label>
          <input
            style={input}
            value={title}
            maxLength={100}
            placeholder="Ex: Nova exposição no CARDE"
            onChange={e => setTitle(e.target.value)}
          />

          <label style={{ ...labelStyle, marginTop: 16 }}>Mensagem <span style={counter}>{body.length}/255</span></label>
          <textarea
            style={textarea}
            value={body}
            maxLength={255}
            rows={4}
            placeholder="Ex: Venha conhecer nossa nova exposição de carros clássicos dos anos 60."
            onChange={e => setBody(e.target.value)}
          />

          {error && <p style={errorStyle}>{error}</p>}

          <button
            style={{ ...sendBtn, opacity: canSend ? 1 : 0.5 }}
            disabled={!canSend}
            onClick={handleSend}
          >
            {sending ? 'Enviando...' : sent ? '✓ Enviado' : 'Disparar notificação'}
          </button>
        </div>

        {/* Preview */}
        <div style={card}>
          <p style={cardTitle}>Preview</p>
          <div style={previewPhone}>
            <div style={previewBar}>
              <span style={previewAppName}>CARDE Museu</span>
              <span style={previewTime}>agora</span>
            </div>
            <p style={previewTitle}>{title || 'Título da notificação'}</p>
            <p style={previewBody}>{body || 'Conteúdo da mensagem que será exibida no dispositivo do usuário.'}</p>
          </div>
          <p style={previewNote}>Aparência aproximada em Android</p>
        </div>
      </div>

      {/* Histórico */}
      <div style={{ ...card, marginTop: 24 }}>
        <p style={cardTitle}>Histórico de envios</p>
        {loadingLogs ? (
          <p style={emptyStyle}>Carregando...</p>
        ) : logs.length === 0 ? (
          <p style={emptyStyle}>Nenhuma notificação enviada ainda.</p>
        ) : (
          <table style={tableStyle}>
            <thead>
              <tr>
                {['Título', 'Mensagem', 'Enviado em', 'Por'].map(h => (
                  <th key={h} style={thStyle}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {logs.map(log => (
                <tr key={log.id} style={trStyle}>
                  <td style={tdStyle}>{log.title}</td>
                  <td style={{ ...tdStyle, color: 'rgba(255,255,255,0.5)', maxWidth: 300 }}>{log.body}</td>
                  <td style={{ ...tdStyle, whiteSpace: 'nowrap' }}>{formatDate(log.sentAt)}</td>
                  <td style={{ ...tdStyle, color: 'rgba(255,255,255,0.4)' }}>{log.sentBy}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────

const pageTitle: React.CSSProperties = {
  fontFamily: "'Big Shoulders Display', cursive",
  fontSize: 28, fontWeight: 800, color: '#fff',
  margin: '0 0 6px', letterSpacing: 1,
};

const pageSubtitle: React.CSSProperties = {
  fontFamily: "'IBM Plex Sans', sans-serif",
  fontSize: 14, color: 'rgba(255,255,255,0.4)',
  margin: '0 0 28px',
};

const grid: React.CSSProperties = {
  display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20,
};

const card: React.CSSProperties = {
  background: '#111', border: '1px solid rgba(255,255,255,0.08)',
  borderRadius: 10, padding: '24px',
};

const cardTitle: React.CSSProperties = {
  fontFamily: "'IBM Plex Sans', sans-serif",
  fontSize: 12, fontWeight: 600, letterSpacing: 2,
  color: '#D4A843', textTransform: 'uppercase',
  margin: '0 0 18px',
};

const labelStyle: React.CSSProperties = {
  display: 'flex', justifyContent: 'space-between',
  fontFamily: "'IBM Plex Sans', sans-serif",
  fontSize: 12, color: 'rgba(255,255,255,0.5)',
  marginBottom: 6,
};

const counter: React.CSSProperties = {
  color: 'rgba(255,255,255,0.25)',
};

const input: React.CSSProperties = {
  width: '100%', background: '#1a1a1a',
  border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: 6, padding: '10px 12px',
  color: '#fff', fontSize: 14,
  fontFamily: "'IBM Plex Sans', sans-serif",
  outline: 'none', boxSizing: 'border-box',
};

const textarea: React.CSSProperties = {
  ...input, resize: 'vertical', lineHeight: 1.5,
};

const errorStyle: React.CSSProperties = {
  fontFamily: "'IBM Plex Sans', sans-serif",
  fontSize: 13, color: '#CF6679',
  margin: '12px 0 0',
};

const sendBtn: React.CSSProperties = {
  marginTop: 20, width: '100%',
  background: '#D4A843', border: 'none',
  color: '#000', borderRadius: 6,
  padding: '12px 0', cursor: 'pointer',
  fontSize: 14, fontWeight: 700,
  fontFamily: "'IBM Plex Sans', sans-serif",
  transition: 'opacity 0.15s',
};

// Preview
const previewPhone: React.CSSProperties = {
  background: '#1e1e1e', borderRadius: 12,
  padding: '14px 16px',
  border: '1px solid rgba(255,255,255,0.08)',
};

const previewBar: React.CSSProperties = {
  display: 'flex', justifyContent: 'space-between',
  marginBottom: 6,
};

const previewAppName: React.CSSProperties = {
  fontFamily: "'IBM Plex Sans', sans-serif",
  fontSize: 11, fontWeight: 600,
  color: 'rgba(255,255,255,0.4)',
  textTransform: 'uppercase', letterSpacing: 1,
};

const previewTime: React.CSSProperties = {
  fontFamily: "'IBM Plex Sans', sans-serif",
  fontSize: 11, color: 'rgba(255,255,255,0.25)',
};

const previewTitle: React.CSSProperties = {
  fontFamily: "'IBM Plex Sans', sans-serif",
  fontSize: 14, fontWeight: 600, color: '#fff',
  margin: '0 0 4px',
};

const previewBody: React.CSSProperties = {
  fontFamily: "'IBM Plex Sans', sans-serif",
  fontSize: 13, color: 'rgba(255,255,255,0.55)',
  margin: 0, lineHeight: 1.4,
};

const previewNote: React.CSSProperties = {
  fontFamily: "'IBM Plex Sans', sans-serif",
  fontSize: 11, color: 'rgba(255,255,255,0.2)',
  textAlign: 'center', margin: '12px 0 0',
};

// Tabela
const tableStyle: React.CSSProperties = {
  width: '100%', borderCollapse: 'collapse',
};

const thStyle: React.CSSProperties = {
  fontFamily: "'IBM Plex Sans', sans-serif",
  fontSize: 11, fontWeight: 600, letterSpacing: 1,
  color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase',
  textAlign: 'left', padding: '0 16px 10px 0',
  borderBottom: '1px solid rgba(255,255,255,0.06)',
};

const trStyle: React.CSSProperties = {
  borderBottom: '1px solid rgba(255,255,255,0.04)',
};

const tdStyle: React.CSSProperties = {
  fontFamily: "'IBM Plex Sans', sans-serif",
  fontSize: 13, color: 'rgba(255,255,255,0.7)',
  padding: '12px 16px 12px 0',
  verticalAlign: 'top',
};

const emptyStyle: React.CSSProperties = {
  fontFamily: "'IBM Plex Sans', sans-serif",
  fontSize: 13, color: 'rgba(255,255,255,0.25)',
  margin: 0,
};
