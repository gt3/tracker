import { VendorAPIOptions } from '@csod-oss/tracker-common';

export type PrivacyOptions = Record<
'carrier'|'city'|'country'|'device_model'|'dma'|'ip_address'|'language'|'os_name'|'os_version'|'platform'|'region'|'version_name'
, boolean>;

export type AmplitudeAPIOptions = VendorAPIOptions & {
  deviceId?: string;
  // language?: string;
  logLevel?: 'DISABLE' | 'ERROR' | 'WARN' | 'INFO';
  optOut?: boolean;
  platform?: string;
  privacyOptions?: Partial<PrivacyOptions>;
  saveEvents?: boolean;
  sessionTimeout?: number;
}

function merge(defaults: any, target: any = {}) {
  if(!defaults) return target;
  return {...defaults, ...target};
}

export function mergeDefaults(defaults: Partial<AmplitudeAPIOptions>, options: AmplitudeAPIOptions) {
  if(!options || !defaults) return options;
  const { privacyOptions: _privacyOptions, ..._rest } = defaults;
  const { privacyOptions, ...rest } = options;
  return { trackingOptions: merge(_privacyOptions, privacyOptions), ...merge(_rest, rest) };
}