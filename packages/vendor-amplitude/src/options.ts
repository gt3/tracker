import { VendorAPIOptions } from '@csod-oss/tracker-common';

export type TrackingOptions = Record<
'carrier'|'city'|'country'|'device_model'|'dma'|'ip_address'|'language'|'os_name'|'os_version'|'platform'|'region'|'version_name'
, boolean>;

export type AmplitudeAPIOptions = VendorAPIOptions & {
  deviceId?: string;
  // language?: string;
  logLevel?: 'DISABLE' | 'ERROR' | 'WARN' | 'INFO';
  optOut?: boolean;
  platform?: string;
  trackingOptions?: Partial<TrackingOptions>;
  saveEvents?: boolean;
  sessionTimeout?: number;
}

function merge(defaults: any, target: any = {}) {
  if(!defaults) return target;
  return {...defaults, ...target};
}

export function mergeDefaults(defaults: Partial<AmplitudeAPIOptions>, options: AmplitudeAPIOptions): AmplitudeAPIOptions {
  if(!options || !defaults) return options;
  const { trackingOptions: _trackingOptions, ..._rest } = defaults;
  const { trackingOptions, ...rest } = options;
  return { trackingOptions: merge(_trackingOptions, trackingOptions), ...merge(_rest, rest) };
}