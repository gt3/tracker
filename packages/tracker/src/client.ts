import { isBrowser, onDomReady, injectScript } from './utils';
import { Vendor, getVendorAPI, VendorAPI } from './vendor';
import { load } from './actions';
import { loadDone, setPendingAction, initDone, initFail } from './actions.internal';
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
  private _pendingActions = new Set();
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

  scheduleLoadDispatch(dispatch: Dispatch) {
    const { preventAutoLoadInit } = this._appSettings;
    return new Promise((resolve, reject) => {
      if(!this.loadInvoked && !preventAutoLoadInit && isBrowser) {
        onDomReady().then(() => !this.loadInvoked ? resolve() : reject());
      }
      else reject();
    })
    .then(() => dispatch(load()));
  }

  load(dispatch: Dispatch) {
    if(this.loadInvoked) return Promise.reject(new Error('Load already called.'));
    this._times.loadStart = new Date().getTime();
    const { env, scripts } = this._vendorAPI;
    return Promise.all(scripts[env].map(injectScript))
      .then(() => dispatch(loadDone()));
  }

  loadDone() {
    this._times.loadEnd = new Date().getTime();
  }

  init(dispatch: Dispatch, action: AnalyticsAction) {
    // check if not loaded, add action to processing queue .. needed?
    if(!this.loadCompleted) return dispatch(setPendingAction(action));
    this._times.initStart = new Date().getTime();
    const { apiKey, ...rest } = action.payload as ClientInitSettings;
    return this._vendorAPI.init(apiKey, rest)
      .then(
        () => dispatch(initDone()),
        () => dispatch(initFail(new Error('Could not call init on undefined instance.')))
      );
  }

  initDone() {
    this._times.initEnd = new Date().getTime();
  }

  savePendingAction(dispatch: Dispatch, action: AnalyticsAction) {
    this._pendingActions.add(action);
  }

  dispatchPendingActions(dispatch: Dispatch) {
    if(!this.loadCompleted) return;
    this._pendingActions.forEach(action => dispatch(action));
    this._pendingActions.clear();
  }

  track(dispatch: Dispatch, action: AnalyticsTrackAction) {
    // check if not loaded, add action to processing queue .. needed?
    if(!this.loadCompleted) return dispatch(setPendingAction(action));
    return this._vendorAPI.track(action.payload.userData, action.payload.eventData);
  }
}

type Times = {
  created: number;
  loadStart: number;
  loadEnd: number;
  initStart: number;
  initEnd: number;
}
