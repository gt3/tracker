import { isBrowser, onDomReady, injectScript } from './utils';
import { Vendor, getVendorAPI, VendorAPI } from './vendor';
import { load } from './actions';
import { loadDone, setPendingAction, initDone, initFail, trackDone, trackFail } from './actions.internal';
import { Dispatch } from 'redux';
import { AnalyticsAction, AnalyticsTrackAction, Environments } from './types';

export type ClientInitSettings = {
  apiKey: string;
  // vendorOptions?: VendorOptions;
}

export type AppSettings = {
  vendor: Vendor;
  env: Environments;
  preventAutoLoadInit?: boolean;
};

export class Client {
  private _times: Partial<Times> = {};
  private _pendingActions = new Set<AnalyticsAction>();
  private _vendorAPI: VendorAPI;
  private _appSettings: AppSettings;

  constructor(appSettings: AppSettings) {
    const { vendor } = appSettings;
    this._times.created = new Date().getTime();
    this._vendorAPI = getVendorAPI(appSettings);
    this._appSettings = appSettings;
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
    const { env, scripts } = this._vendorAPI;
    return Promise.all(scripts[env].map(injectScript)).then(loadDone);
  }

  loadDone() {
    this._times.loadEnd = new Date().getTime();
  }

  init(action: AnalyticsAction) {
    // check if not loaded, add action to processing queue .. needed?
    if(!this.loadCompleted) return Promise.resolve(setPendingAction(action));
    this._times.initStart = new Date().getTime();
    const { apiKey, ...rest } = action.payload as ClientInitSettings;
    return this._vendorAPI.init(apiKey, rest)
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
}

type Times = {
  created: number;
  loadStart: number;
  loadEnd: number;
  initStart: number;
  initEnd: number;
}
