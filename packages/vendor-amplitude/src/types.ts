import { VendorAPIOptions } from "@csod-oss/tracker-common";

export type PrivacyOptions = Record<
'city'|'country'|'device_model'|'dma'|'ip_address'|'language'|'os_name'|'os_version'|'platform'|'region'|'version_name'
, boolean>;

export type AmplitudeAPIOptions = VendorAPIOptions & {
  deviceId?: string;
  // language?: string;
  logLevel?: 'DISABLE' | 'ERROR' | 'WARN' | 'INFO';
  optOut?: boolean;
  platform?: string;
  privacyOptions?: Partial<PrivacyOptions>;
}

export type Envs = 'development' | 'production';