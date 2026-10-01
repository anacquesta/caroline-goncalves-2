import { lazy, Suspense } from 'react';
import type { ComponentType } from 'react';

export default function dynamic<T extends ComponentType<any>>(load: () => Promise<T>) {
  const Component = lazy(async () => ({ default: await load() }));
  return function Dynamic(props: React.ComponentProps<T>) {
    return <Suspense fallback={null}><Component {...props} /></Suspense>;
  };
}
