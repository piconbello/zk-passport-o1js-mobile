import React, { useRef } from 'react';

type RefMemo = <T>(fn: (prev?: T) => T, deps: any[]) => T;

const useRefMemo: RefMemo = (fn, dependencies) => {
  const prevDeps = useRef<any[] | undefined>();
  const result = useRef<any>();

  if (
    !prevDeps.current ||
    // @ts-ignore
    dependencies.some((dep, index) => dep !== prevDeps.current[index])
  ) {
    prevDeps.current = dependencies;
    result.current = fn();
  }

  return result.current;
};

export default useRefMemo;