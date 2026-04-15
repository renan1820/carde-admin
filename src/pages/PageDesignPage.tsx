import { useState, useEffect } from 'react';
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { listEvents } from '../api/events';
import { listVehicles } from '../api/vehicles';
import { reorderEvents, reorderVehicles } from '../api/ordering';
import type { MuseumEvent, Vehicle } from '../types';
import Spinner from '../components/Spinner';

// ─── Drag handle icon ────────────────────────────────────────────────────────

function DragHandle(props: React.HTMLAttributes<HTMLSpanElement>) {
  return (
    <span {...props} style={dragHandleStyle} title="Arrastar para reordenar">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
        <circle cx="9" cy="5" r="1.5" />
        <circle cx="15" cy="5" r="1.5" />
        <circle cx="9" cy="12" r="1.5" />
        <circle cx="15" cy="12" r="1.5" />
        <circle cx="9" cy="19" r="1.5" />
        <circle cx="15" cy="19" r="1.5" />
      </svg>
    </span>
  );
}

// ─── Sortable row wrapper ─────────────────────────────────────────────────────

function SortableRow({ id, children }: { id: string; children: (handleProps: React.HTMLAttributes<HTMLSpanElement>) => React.ReactNode }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
    zIndex: isDragging ? 1 : 'auto',
    position: 'relative',
  };
  return (
    <div ref={setNodeRef} style={style}>
      {children({ ...attributes, ...listeners })}
    </div>
  );
}

// ─── Event card ──────────────────────────────────────────────────────────────

function EventCard({ event, index, handleProps }: { event: MuseumEvent; index: number; handleProps: React.HTMLAttributes<HTMLSpanElement> }) {
  const months = ['', 'Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
  const d = new Date(event.date);
  const dateStr = `${d.getDate()} ${months[d.getMonth() + 1]}`;

  return (
    <div style={cardRow}>
      <DragHandle {...handleProps} />
      <span style={indexBadge}>{index + 1}</span>
      <div style={cardThumb}>
        {event.imageUrl
          ? <img src={event.imageUrl} alt="" style={thumbImg} />
          : <span style={thumbPlaceholder}>📅</span>}
      </div>
      <div style={cardInfo}>
        <span style={cardTitle}>{event.title}</span>
        <span style={cardMeta}>{dateStr}</span>
      </div>
      <div style={cardBadges}>
        {event.isFeatured && <span style={badgeFeatured}>DESTAQUE</span>}
        {event.externalLink && <span style={badgeLink}>LINK</span>}
      </div>
    </div>
  );
}

// ─── Vehicle card ─────────────────────────────────────────────────────────────

function VehicleCard({ vehicle, index, handleProps }: { vehicle: Vehicle; index: number; handleProps: React.HTMLAttributes<HTMLSpanElement> }) {
  const thumb = vehicle.imageUrls?.[0];
  return (
    <div style={cardRow}>
      <DragHandle {...handleProps} />
      <span style={indexBadge}>{index + 1}</span>
      <div style={cardThumb}>
        {thumb
          ? <img src={thumb} alt="" style={thumbImg} />
          : <span style={thumbPlaceholder}>🚗</span>}
      </div>
      <div style={cardInfo}>
        <span style={cardTitle}>{vehicle.name}</span>
        <span style={cardMeta}>{vehicle.brand} · {vehicle.year}</span>
      </div>
    </div>
  );
}

// ─── Section component ────────────────────────────────────────────────────────

function Section<T extends { id: string }>({
  title,
  subtitle,
  items,
  onDragEnd,
  saving,
  saved,
  onSave,
  renderCard,
}: {
  title: string;
  subtitle: string;
  items: T[];
  onDragEnd: (event: DragEndEvent) => void;
  saving: boolean;
  saved: boolean;
  onSave: () => void;
  renderCard: (item: T, index: number, handleProps: React.HTMLAttributes<HTMLSpanElement>) => React.ReactNode;
}) {
  const sensors = useSensors(useSensor(PointerSensor));

  return (
    <div style={sectionBox}>
      <div style={sectionHeader}>
        <div>
          <h2 style={sectionTitle}>{title}</h2>
          <p style={sectionSubtitle}>{subtitle}</p>
        </div>
        <button
          onClick={onSave}
          disabled={saving}
          style={saving ? { ...saveBtn, opacity: 0.6, cursor: 'not-allowed' } : saveBtn}
        >
          {saving
            ? <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}><Spinner size={14} color="#000" /> Salvando...</span>
            : saved ? '✓ Ordem salva' : 'Salvar ordem'}
        </button>
      </div>

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
        <SortableContext items={items.map(i => i.id)} strategy={verticalListSortingStrategy}>
          <div style={listBox}>
            {items.map((item, index) => (
              <SortableRow key={item.id} id={item.id}>
                {(handleProps) => renderCard(item, index, handleProps)}
              </SortableRow>
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function PageDesignPage() {
  const [events, setEvents] = useState<MuseumEvent[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  const [savingEvents, setSavingEvents] = useState(false);
  const [savedEvents, setSavedEvents] = useState(false);
  const [savingVehicles, setSavingVehicles] = useState(false);
  const [savedVehicles, setSavedVehicles] = useState(false);

  useEffect(() => {
    Promise.all([listEvents(), listVehicles()])
      .then(([evts, vehs]) => {
        setEvents([...evts].sort((a, b) => a.displayOrder - b.displayOrder));
        setVehicles([...vehs].sort((a, b) => a.displayOrder - b.displayOrder));
      })
      .catch(() => setLoadError('Não foi possível carregar os dados. Verifique sua conexão.'))
      .finally(() => setLoading(false));
  }, []);

  function handleEventDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setEvents(prev => {
        const oldIndex = prev.findIndex(e => e.id === active.id);
        const newIndex = prev.findIndex(e => e.id === over.id);
        return arrayMove(prev, oldIndex, newIndex);
      });
      setSavedEvents(false);
    }
  }

  function handleVehicleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setVehicles(prev => {
        const oldIndex = prev.findIndex(v => v.id === active.id);
        const newIndex = prev.findIndex(v => v.id === over.id);
        return arrayMove(prev, oldIndex, newIndex);
      });
      setSavedVehicles(false);
    }
  }

  async function saveEventsOrder() {
    setSavingEvents(true);
    try {
      await reorderEvents(events.map((e, i) => ({ id: e.id, displayOrder: i })));
      setSavedEvents(true);
    } catch {
      alert('Erro ao salvar ordem dos eventos. Tente novamente.');
    } finally {
      setSavingEvents(false);
    }
  }

  async function saveVehiclesOrder() {
    setSavingVehicles(true);
    try {
      await reorderVehicles(vehicles.map((v, i) => ({ id: v.id, displayOrder: i })));
      setSavedVehicles(true);
    } catch {
      alert('Erro ao salvar ordem dos veículos. Tente novamente.');
    } finally {
      setSavingVehicles(false);
    }
  }

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, color: 'rgba(255,255,255,0.5)', marginTop: 60 }}>
        <Spinner size={20} color="rgba(255,255,255,0.5)" /> Carregando...
      </div>
    );
  }

  if (loadError) {
    return <p style={{ color: '#ef4444', marginTop: 40 }}>{loadError}</p>;
  }

  return (
    <div style={page}>
      <div style={pageHeader}>
        <div>
          <h1 style={pageTitle}>Page Design</h1>
          <p style={pageSubtitle}>Defina a ordem de exibição dos itens no app Flutter.</p>
        </div>
        <div style={phoneMockup}>
          <span style={phoneDot} />
          <div style={phoneScreen}>
            <div style={phoneRow}><span style={phoneLabel}>Eventos</span></div>
            {events.slice(0, 3).map((e, i) => (
              <div key={e.id} style={phoneItem}><span style={phoneIdx}>{i + 1}</span>{e.title}</div>
            ))}
            <div style={{ ...phoneRow, marginTop: 8 }}><span style={phoneLabel}>Acervo</span></div>
            {vehicles.slice(0, 3).map((v, i) => (
              <div key={v.id} style={phoneItem}><span style={phoneIdx}>{i + 1}</span>{v.name}</div>
            ))}
          </div>
        </div>
      </div>

      <Section
        title="Carrossel de Eventos"
        subtitle="Arraste para reordenar a sequência no carrossel do app."
        items={events}
        onDragEnd={handleEventDragEnd}
        saving={savingEvents}
        saved={savedEvents}
        onSave={saveEventsOrder}
        renderCard={(event, index, handleProps) => (
          <EventCard event={event} index={index} handleProps={handleProps} />
        )}
      />

      <Section
        title="Acervo — Carrossel de Veículos"
        subtitle="Arraste para reordenar a sequência no carrossel do app."
        items={vehicles}
        onDragEnd={handleVehicleDragEnd}
        saving={savingVehicles}
        saved={savedVehicles}
        onSave={saveVehiclesOrder}
        renderCard={(vehicle, index, handleProps) => (
          <VehicleCard vehicle={vehicle} index={index} handleProps={handleProps} />
        )}
      />
    </div>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const page: React.CSSProperties = { display: 'flex', flexDirection: 'column', gap: 32 };

const pageHeader: React.CSSProperties = {
  display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 24,
};

const pageTitle: React.CSSProperties = {
  fontFamily: "'Big Shoulders Display', cursive",
  fontSize: 32, fontWeight: 700, letterSpacing: 1,
  color: '#fff', margin: '0 0 4px',
};

const pageSubtitle: React.CSSProperties = {
  fontSize: 13, color: 'rgba(255,255,255,0.4)', margin: 0,
};

// Phone mockup (preview rápido)
const phoneMockup: React.CSSProperties = {
  background: '#111', border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: 16, padding: '12px 14px', width: 180,
  flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 2,
};
const phoneDot: React.CSSProperties = {
  width: 32, height: 4, background: 'rgba(255,255,255,0.15)',
  borderRadius: 4, alignSelf: 'center', marginBottom: 8,
};
const phoneScreen: React.CSSProperties = { display: 'flex', flexDirection: 'column', gap: 3 };
const phoneRow: React.CSSProperties = { display: 'flex', alignItems: 'center' };
const phoneLabel: React.CSSProperties = {
  fontSize: 8, fontWeight: 700, letterSpacing: 1.5,
  color: '#D4A843', textTransform: 'uppercase',
};
const phoneItem: React.CSSProperties = {
  display: 'flex', alignItems: 'center', gap: 4,
  fontSize: 9, color: 'rgba(255,255,255,0.5)',
  overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis',
};
const phoneIdx: React.CSSProperties = {
  fontSize: 8, color: 'rgba(255,255,255,0.25)',
  minWidth: 10, textAlign: 'right',
};

// Section
const sectionBox: React.CSSProperties = {
  background: '#0f0f0f', border: '1px solid rgba(255,255,255,0.07)',
  borderRadius: 8, padding: 24,
};
const sectionHeader: React.CSSProperties = {
  display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
  marginBottom: 20, gap: 16,
};
const sectionTitle: React.CSSProperties = {
  fontFamily: "'Big Shoulders Display', cursive",
  fontSize: 20, fontWeight: 700, letterSpacing: 0.5,
  color: '#fff', margin: '0 0 2px',
};
const sectionSubtitle: React.CSSProperties = {
  fontSize: 12, color: 'rgba(255,255,255,0.35)', margin: 0,
};
const saveBtn: React.CSSProperties = {
  padding: '9px 20px', background: '#D4A843', color: '#000',
  border: 'none', borderRadius: 6, cursor: 'pointer',
  fontSize: 13, fontWeight: 700, whiteSpace: 'nowrap', minHeight: 38,
};

// List
const listBox: React.CSSProperties = {
  display: 'flex', flexDirection: 'column', gap: 4,
};

// Card row
const cardRow: React.CSSProperties = {
  display: 'flex', alignItems: 'center', gap: 12,
  padding: '10px 12px',
  background: 'rgba(255,255,255,0.03)',
  border: '1px solid rgba(255,255,255,0.06)',
  borderRadius: 6,
  userSelect: 'none',
};
const dragHandleStyle: React.CSSProperties = {
  color: 'rgba(255,255,255,0.25)', cursor: 'grab', flexShrink: 0,
  display: 'flex', alignItems: 'center',
};
const indexBadge: React.CSSProperties = {
  fontSize: 11, color: 'rgba(255,255,255,0.2)',
  minWidth: 18, textAlign: 'right', flexShrink: 0,
};
const cardThumb: React.CSSProperties = {
  width: 40, height: 40, borderRadius: 4, overflow: 'hidden',
  background: 'rgba(255,255,255,0.05)', flexShrink: 0,
  display: 'flex', alignItems: 'center', justifyContent: 'center',
};
const thumbImg: React.CSSProperties = {
  width: '100%', height: '100%', objectFit: 'cover',
};
const thumbPlaceholder: React.CSSProperties = { fontSize: 18 };
const cardInfo: React.CSSProperties = {
  display: 'flex', flexDirection: 'column', gap: 2, flex: 1, minWidth: 0,
};
const cardTitle: React.CSSProperties = {
  fontSize: 13, fontWeight: 600, color: '#fff',
  overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis',
};
const cardMeta: React.CSSProperties = {
  fontSize: 11, color: 'rgba(255,255,255,0.35)',
};
const cardBadges: React.CSSProperties = {
  display: 'flex', gap: 6, flexShrink: 0,
};
const badgeFeatured: React.CSSProperties = {
  fontSize: 10, fontWeight: 700, letterSpacing: 0.8,
  padding: '2px 6px', borderRadius: 3,
  background: 'rgba(212,168,67,0.15)', color: '#D4A843',
};
const badgeLink: React.CSSProperties = {
  fontSize: 10, fontWeight: 700, letterSpacing: 0.8,
  padding: '2px 6px', borderRadius: 3,
  background: 'rgba(99,179,237,0.15)', color: '#63b3ed',
};
