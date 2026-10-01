export function usePathname() {
  const base = import.meta.env.BASE_URL.replace(/\/$/, '');
  const path = window.location.pathname;
  const route = path.startsWith(base + '/') ? path.slice(base.length) : '/';
  return route.replace(/\/$/, '') || '/';
}
