import { AppSettings, VendorAPI, VendorAPIOptions, ScriptByEnvironment } from '@csod-oss/tracker-common';
import { getInstance } from './instance';
import { Env, AmplitudeAPIOptions } from './types';

export  { Env, AmplitudeAPIOptions };

export class AmplitudeAPI implements VendorAPI<Env, AmplitudeAPIOptions> {
  static vendorKey = 'amplitude';
  static scripts: ScriptByEnvironment<Env> = {
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
