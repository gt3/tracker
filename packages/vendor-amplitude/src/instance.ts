const _ctx = Function('return this;')();

export function getInstance<T>(vendorKey: string, projectKey?: string): T {
  const instance = _ctx[vendorKey];
  return instance && (projectKey ? instance.getInstance(projectKey) : instance.getInstance());
}
