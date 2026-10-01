import { lazy, Suspense } from "react";
import type { ComponentType } from "react";
export default function dynamic<P extends object>(
  load: () => Promise<ComponentType<P>>,
) {
  const Component = lazy(async () => ({ default: await load() }));
  return function Dynamic(props: P) {
    return (
      <Suspense fallback={null}>
        <Component {...props} />
      </Suspense>
    );
  };
}
