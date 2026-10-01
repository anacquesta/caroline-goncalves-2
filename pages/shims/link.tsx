import type { AnchorHTMLAttributes, PropsWithChildren } from 'react';

type Props = PropsWithChildren<AnchorHTMLAttributes<HTMLAnchorElement> & { href: string }>;

export default function Link({ href, children, ...props }: Props) {
  if (!href.startsWith('/')) return <a href={href} {...props}>{children}</a>;
  const [pathname, fragment] = href.split('#', 2);
  const base = import.meta.env.BASE_URL.replace(/\/$/, '');
  const route = pathname === '/' ? '/' : `${pathname.replace(/\/$/, '')}/`;
  return <a href={`${base}${route}${fragment ? `#${fragment}` : ''}`} {...props}>{children}</a>;
}
