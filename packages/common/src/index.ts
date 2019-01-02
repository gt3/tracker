export type Env = string;

export type VendorAPIOptions = {
  apiKey: string;
}

export type Script = {
  src: string;
  integrity?: string;
  crossorigin?: string;
}

export type ScriptByEnvironment<T extends Env> = Record<T, Script[]>;

export type VendorAPI<T, U extends VendorAPIOptions> = {
  env: T;
  getInstance: () => any;
  getScript: () => Script[];
  init: (options: U) => Promise<void>;
  track: (userData: any, eventData: any) => Promise<void>;
  getSessionId: () => undefined | number | string;
  clearUserProperties: () => void;
  controlTracking: (value: boolean) => void;
}

export interface VendorAPIWrapper<T extends Env, U extends VendorAPIOptions> {
  new(env: T): VendorAPI<T, U>;
  scripts: ScriptByEnvironment<T>;
  vendorKey: string;
}


export type AppSettings<T extends Env> = {
  env: T;
  preventAutoLoadInit?: boolean;
}
