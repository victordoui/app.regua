import React, { Suspense } from 'react';

interface LazyWrapperProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export const createLazyComponent = (importFunc: () => Promise<{ default: React.ComponentType<any> }>) => {
  const LazyComponent = React.lazy(importFunc);
  
  return (props: any) => (
    <Suspense fallback={<div>Loading...</div>}>
      <LazyComponent {...props} />
    </Suspense>
  );
};

export default createLazyComponent;