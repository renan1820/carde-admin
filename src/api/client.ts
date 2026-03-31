import axios from 'axios';

const TOKEN_KEY = 'carde_admin_token';

export const client = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL as string,
});

client.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

client.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem(TOKEN_KEY);

      const toast = document.createElement('div');
      toast.textContent = 'Sessão expirada. Você será redirecionado para o login.';
      toast.style.cssText = [
        'position:fixed', 'bottom:24px', 'left:50%', 'transform:translateX(-50%)',
        'background:#1a202c', 'color:#fff', 'padding:12px 24px', 'border-radius:8px',
        'font-size:14px', 'font-weight:500', 'box-shadow:0 4px 16px rgba(0,0,0,0.18)',
        'z-index:9999', 'opacity:0', 'transition:opacity 0.2s',
        'font-family:inherit', 'white-space:nowrap',
      ].join(';');
      document.body.appendChild(toast);
      requestAnimationFrame(() => { toast.style.opacity = '1'; });

      setTimeout(() => {
        toast.style.opacity = '0';
        setTimeout(() => { window.location.href = '/login'; }, 300);
      }, 2500);
    }
    return Promise.reject(error);
  }
);

export { TOKEN_KEY };

export function isNetworkError(err: unknown): boolean {
  return !(err as { response?: unknown })?.response;
}
