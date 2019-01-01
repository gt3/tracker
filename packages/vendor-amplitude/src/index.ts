import { AppSettings, VendorAPI } from '@csod-oss/tracker-common';
import { getInstance } from './instance';

// api implemention, sdk integration
export const createVendorAPI = (appSettings: AppSettings) => 
{
  const { vendorKey, env } = appSettings;
  const api: VendorAPI = {
      env,
      getInstance: () => getInstance<amplitude.AmplitudeClient>(vendorKey),
      scripts: {
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
      },
      init: (options) => {
        // todo: transform options => amplitude options
        const instance = api.getInstance();
        return new Promise((resolve, reject) => {
          if(!instance) reject();
          const { apiKey, ...rest } = options;
          instance.init(apiKey, undefined, rest, () => resolve());
        })
      },
      track: (userData, eventData) => {
        const instance = api.getInstance();
        return new Promise((resolve, reject) => {
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
      },
      getSessionId: () => {
        const instance = api.getInstance();
        return instance && instance.getSessionId();
      },
      clearUserProperties: () => {
        const instance = api.getInstance();
        return instance && instance.clearUserProperties();
      },
      controlTracking: (value: boolean) => {
        const instance = api.getInstance();
        if(!instance) return;
        instance.setOptOut(value);
      }
  }
  return api;
}
