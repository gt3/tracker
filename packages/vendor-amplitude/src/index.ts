import { Env, VendorAPI, VendorAPIOptions, ScriptByEnvironment } from '@csod-oss/tracker-common';
import { getInstance } from './instance';

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

export class AmplitudeAPI implements VendorAPI<AmplitudeAPIOptions> {
  static vendorKey = 'amplitude';
  static scripts: ScriptByEnvironment = {
    development: [
      {
        src: 'https://cdn.amplitude.com/libs/amplitude-4.5.2.js'
      }
    ],
    production: [
      {
        src: 'https://cdn.amplitude.com/libs/amplitude-4.5.2-min.js',
        integrity: 'sha384-f1maK8oMrCMNEWGGg3Hx3dMTOQBbXr4e1ZIjB/J0TcgJx5UeE0g5S5PM5BbWPe4E',
        crossorigin: 'anonymous'
      }
    ]
  };
  
  env: Env;

  constructor(env: Env) {
    this.env = env;
  }

  getInstance = () => {
    return getInstance<amplitude.AmplitudeClient>(AmplitudeAPI.vendorKey);
  }

  getScript = () => {
    return AmplitudeAPI.scripts[this.env];
  }

  init = (options: VendorAPIOptions) => {
    // todo: transform options => amplitude options
    const instance = this.getInstance();
    return new Promise<void>((resolve, reject) => {
      if(!instance) reject();
      const { apiKey, ...rest } = options;
      instance.init(apiKey, undefined, rest, () => resolve());
    })
  }

  track = (userData: any, eventData: any) => {
    const instance = this.getInstance();
    return new Promise<void>((resolve, reject) => {
      if(!instance) reject();
      if(userData && Object.keys(userData).length > 0) {
        instance.setUserProperties(userData);
      }
      if(eventData) {
        const { eventName, ...rest } = eventData;
        instance.logEvent(eventName, rest);
      }
      resolve();
    });
  }

  getSessionId = () => {
    const instance = this.getInstance();
    return instance && instance.getSessionId();
  }

  clearUserProperties = () => {
    const instance = this.getInstance();
    return instance && instance.clearUserProperties();
  }

  controlTracking = (value: boolean) => {
    const instance = this.getInstance();
    if(!instance) return;
    instance.setOptOut(value);
  }
}
