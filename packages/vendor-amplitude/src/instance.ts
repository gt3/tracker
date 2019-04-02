// todo: use context from utils (add dependency)
const _ctx = getGlobal();

export function getInstance<T>(vendorKey: string, projectKey?: string): T {
  const instance = _ctx[vendorKey];
  return instance && (projectKey ? instance.getInstance(projectKey) : instance.getInstance());
}

function getGlobal(): any {
  if (typeof self !== 'undefined') {
    return self;
  }
  if (typeof window !== 'undefined') {
    return window;
  }
  if (typeof global !== 'undefined') {
    return global;
  }
  throw new Error('unable to locate global object');
}
