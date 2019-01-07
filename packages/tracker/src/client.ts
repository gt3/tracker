import { isBrowser, onDomReady, injectScript, scriptExists, isLocalhost, isLocalhostTrackingEnabled } from '@csod-oss/tracker-common/build/utils';
import { VendorAPI, ScriptByEnvironment, VendorAPIOptions, VendorAPIWrapper } from '@csod-oss/tracker-common';
import { ActionCreators } from './actions';
import { AnalyticsAction, AnalyticsTrackAction, AppSettings } from './types';

export class Client<T extends VendorAPIOptions> {
  private _times: Partial<Times> = {};
  private _pendingActions = new Set<AnalyticsAction>();
  private _vendorAPI: VendorAPI<T>;
  private _appSettings: AppSettings;
  private _allScripts: ScriptByEnvironment;
  private _ac: ActionCreators;

  constructor(appSettings: AppSettings, VendorAPI: VendorAPIWrapper<T>, ac: ActionCreators) {
    const { env } = appSettings;
    this._vendorAPI = new VendorAPI(env);
    this._appSettings = appSettings;
    this._allScripts = VendorAPI.scripts;
    this._ac = ac;
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
    }).then(this._ac.load);
  }

  load() {
    if(this.loadInvoked) return Promise.reject(new Error('Load already called.'));
    this._times.loadStart = new Date().getTime();
    const { getScript, getInstance } = this._vendorAPI;
    const { loadDone } = this._ac.internal;
    if(getInstance() || scriptExists(this._allScripts)) return Promise.resolve(loadDone());
    return Promise.all(getScript().map(injectScript)).then(loadDone);
  }

  loadDone() {
    this._times.loadEnd = new Date().getTime();
    let action = null;
    const { pauseTracking, resumeTracking } = this._ac;
    if(isLocalhost) {
      action = !isLocalhostTrackingEnabled() ? pauseTracking() : resumeTracking();
    }
    return Promise.resolve(action);
  }

  init(action: AnalyticsAction) {
    const { setPendingAction, initDone, initFail } = this._ac.internal;
    // check if not loaded, add action to processing queue .. needed?
    if(!this.loadCompleted) return Promise.resolve(setPendingAction(action));
    this._times.initStart = new Date().getTime();
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
    const { setPendingAction, trackDone, trackFail } = this._ac.internal;
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
