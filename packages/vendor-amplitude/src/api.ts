import { Env, VendorAPI, ScriptByEnvironment, Script, VendorKey, UserData, EventData } from '@csod-oss/tracker-common';
import { getInstance } from './instance';
import { AmplitudeAPIOptions, mergeDefaults } from './options';

export class AmplitudeAPI implements VendorAPI<AmplitudeAPIOptions> {
  static vendorKey: VendorKey = 'amplitude';

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

  static defaultAPIOptions: Partial<AmplitudeAPIOptions> = {
    logLevel: 'DISABLE',
    saveEvents: false,
    /* allow dma, os, platform, region, version_name */
    trackingOptions: {
      carrier: false,
      city: false,
      country: false,
      ip_address: false,
      language: false
    }
  };

  env: Env;

  constructor(env: Env) {
    this.env = env;
  }

  getInstance = () => {
    return getInstance<amplitude.AmplitudeClient>(AmplitudeAPI.vendorKey);
  };

  getScript = (): Script[] => {
    return AmplitudeAPI.scripts[this.env];
  };

  getFinalOptions = (options: AmplitudeAPIOptions) => {
    return mergeDefaults(AmplitudeAPI.defaultAPIOptions, options);
  };

  init = (options: AmplitudeAPIOptions) => {
    // todo: transform options => amplitude options
    const instance = this.getInstance();
    return new Promise<void>((resolve, reject) => {
      if (!instance) reject();
      const { apiKey, ...rest } = this.getFinalOptions(options);
      instance.init(apiKey, undefined, rest, () => resolve());
    });
  };

  track = (userData?: UserData, eventData?: EventData) => {
    const instance = this.getInstance();
    return new Promise<void>((resolve, reject) => {
      if (!instance) reject();
      if (userData && Object.keys(userData).length > 0) {
        const { userId, ...userProps } = userData;
        if (typeof userId !== 'undefined' && userId !== '') {
          // @ts-ignore
          instance.setUserId(userId);
        }
        if (Object.keys(userProps).length > 0) {
          instance.setUserProperties(userProps);
        }
      }
      if (eventData) {
        const { eventName, ...rest } = eventData;
        instance.logEvent(eventName, rest);
      }
      setTimeout(() => resolve(), 10);
    });
  };

  getDeviceId = () => {
    const instance = this.getInstance();
    return instance && instance.options.deviceId;
  };

  getSessionId = () => {
    const instance = this.getInstance();
    return instance && instance.getSessionId();
  };

  clearUserProperties = () => {
    const instance = this.getInstance();
    return instance && instance.clearUserProperties();
  };

  controlTracking = (value: boolean) => {
    const instance = this.getInstance();
    if (!instance) return;
    instance.setOptOut(value);
  };

  terminateSession = () => {
    const instance = this.getInstance();
    if (!instance) return;
    // @ts-ignore
    instance.setUserId(null);
    // @ts-ignore
    if (instance.resetSessionId !== undefined) instance.resetSessionId();
    instance.regenerateDeviceId();
  };
}
