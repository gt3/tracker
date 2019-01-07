export type EnvType = string;
export type Env = EnvType & 'development' | 'production';

export type VendorKey = 'amplitude';

export type VendorAPIOptions = {
  apiKey: string;
}

export type Script = {
  src: string;
  integrity?: string;
  crossorigin?: string;
}

export type ScriptByEnvironment<V extends EnvType = Env> = Record<V, Script[]>;

export type VendorAPI<T extends VendorAPIOptions, V extends EnvType = Env> = {
  env: V;
  getInstance: () => any;
  getScript: () => Script[];
  init: (options: T) => Promise<void>;
  track: (userData: any, eventData: any) => Promise<void>;
  getSessionId: () => undefined | number | string;
  clearUserProperties: () => void;
  controlTracking: (value: boolean) => void;
}

export interface VendorAPIWrapper<T extends VendorAPIOptions, V extends EnvType = Env> {
  new(env: V): VendorAPI<T, V>;
  scripts: ScriptByEnvironment<V>;
  vendorKey: VendorKey;
}

