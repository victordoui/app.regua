import React, { Suspense } from 'react';

interface LazyWrapperProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export const createLazyComponent = <Props extends object>(importFunc: () => Promise<{ default: React.ComponentType<Props> }>) => {
  const LazyComponent = React.lazy(importFunc);
  
  return (props: Props) => (
    <Suspense fallback={<div>Loading...</div>}>
      <LazyComponent {...props} />
    </Suspense>
  );
};

export default createLazyComponent;
