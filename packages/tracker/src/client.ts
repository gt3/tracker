import { isBrowser, onDomReady, injectScript, scriptExists, isLocalhost, isLocalhostTrackingEnabled } from '@csod-oss/tracker-common/build/utils';
import { AppSettings, VendorAPI } from '@csod-oss/tracker-common';
import { load, pauseTracking, resumeTracking } from './actions';
import { loadDone, setPendingAction, initDone, initFail, trackDone, trackFail } from './actions.internal';
import { AnalyticsAction, AnalyticsTrackAction } from './types';

export class Client {
  private _times: Partial<Times> = {};
  private _pendingActions = new Set<AnalyticsAction>();
  private _vendorAPI: VendorAPI;
  private _appSettings: AppSettings;

  constructor(appSettings: AppSettings) {
    const { createVendorAPI } = appSettings;
    this._vendorAPI = createVendorAPI(appSettings);
    this._appSettings = appSettings;
    this._times.created = new Date().getTime();
  }

  get loadInvoked() {
    return typeof this._times.loadStart !== 'undefined';
  }

  get loadCompleted() {
    return typeof this._times.loadEnd !== 'undefined';
  }

  scheduleLoadDispatch() {
    const { preventAutoLoadInit } = this._appSettings;
    return new Promise((resolve, reject) => {
      if(!this.loadInvoked && !preventAutoLoadInit && isBrowser) {
        onDomReady().then(() => !this.loadInvoked ? resolve() : reject());
      }
      else reject();
    }).then(load);
  }

  load() {
    if(this.loadInvoked) return Promise.reject(new Error('Load already called.'));
    this._times.loadStart = new Date().getTime();
    const { env, scripts, getInstance } = this._vendorAPI;
    if(getInstance() || scriptExists(scripts)) return Promise.resolve(loadDone());
    return Promise.all(scripts[env].map(injectScript)).then(loadDone);
  }

  loadDone() {
    this._times.loadEnd = new Date().getTime();
    let action = null;
    if(isLocalhost) {
      action = !isLocalhostTrackingEnabled() ? pauseTracking() : resumeTracking();
    }
    return Promise.resolve(action);
  }

  init(action: AnalyticsAction) {
    // check if not loaded, add action to processing queue .. needed?
    if(!this.loadCompleted) return Promise.resolve(setPendingAction(action));
    this._times.initStart = new Date().getTime();
    // const { apiKey, ...rest } = action.payload as VendorAPIOptions;
    return this._vendorAPI.init(action.payload)
      .then(initDone, () => initFail(new Error('Could not call init on undefined instance.')));
  }

  initDone() {
    this._times.initEnd = new Date().getTime();
  }

  savePendingAction(action: AnalyticsAction) {
    this._pendingActions.add(action);
  }

  dispatchPendingActions() {
    if(!this.loadCompleted) return Promise.resolve(null);
    const actions: AnalyticsAction[] = [];
    this._pendingActions.forEach(action => actions.push(action));
    this._pendingActions.clear();
    return Promise.resolve(actions);
  }

  track(action: AnalyticsTrackAction) {
    // check if not loaded, add action to processing queue .. needed?
    if(!this.loadCompleted) return Promise.resolve(setPendingAction(action));
    return this._vendorAPI.track(action.payload.userData, action.payload.eventData)
      .then(trackDone, () => trackFail(new Error('Could not send track action.')));
  }

  controlTracking(value: boolean) {
    this._vendorAPI.controlTracking(value);
  }
}

type Times = {
  created: number;
  loadStart: number;
  loadEnd: number;
  initStart: number;
  initEnd: number;
}
