export type Environments = 'development' | 'production';

export type Vendor = 'amplitude'; // | 'segment' | 'experiments'

export type PrivacyOptions = Record<
'city'|'country'|'device_model'|'dma'|'ip_address'|'language'|'os_name'|'os_version'|'platform'|'region'|'version_name'
, boolean>;

export type VendorAPIOptions = {
  apiKey: string;
  deviceId?: string;
  // language?: string;
  logLevel?: 'DISABLE' | 'ERROR' | 'WARN' | 'INFO';
  optOut?: boolean;
  platform?: string;
  privacyOptions?: Partial<PrivacyOptions>;
}

export type Script = {
  src: string;
  integrity?: string;
  crossorigin?: string;
}

export type ScriptByEnvironment = {
  [key in Environments]: Script[];
}

export type VendorAPI = {
  env: Environments;
  scripts: ScriptByEnvironment;
  getInstance: () => any;
  init: (options: VendorAPIOptions) => Promise<void>;
  track: (userData: any, eventData: any) => Promise<void>;
  getSessionId: () => undefined | number | string;
  clearUserProperties: () => void;
}

export type AppSettings = {
  vendorKey: Vendor;
  env: Environments;
  createVendorAPI: (appSettings: AppSettings) =>  VendorAPI;
  preventAutoLoadInit?: boolean;
};

