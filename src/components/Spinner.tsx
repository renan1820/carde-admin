let _injected = false;
function injectKeyframe() {
  if (_injected || typeof document === 'undefined') return;
  _injected = true;
  const el = document.createElement('style');
  el.textContent = '@keyframes _carde_spin { to { transform: rotate(360deg); } }';
  document.head.appendChild(el);
}

interface Props {
  size?: number;
  color?: string;
}

export default function Spinner({ size = 24, color = '#1a202c' }: Props) {
  injectKeyframe();
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      style={{ animation: '_carde_spin 0.75s linear infinite', display: 'block', flexShrink: 0 }}
    >
      <circle cx="12" cy="12" r="10" stroke={color} strokeWidth="2.5" strokeOpacity="0.2" />
      <path d="M22 12A10 10 0 0 0 12 2" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
}
