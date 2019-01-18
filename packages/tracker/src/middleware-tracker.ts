import { Client } from './client';
import { VendorAPIOptions, VendorAPIWrapper } from '@csod-oss/tracker-common';
import { MiddlewareSettings, PartialStore, GetVendorAPIOptions } from './types.middleware';
import { DispatchBuffer } from './dispatch-buffer';
import { ActionCreators, AnalyticsTrackAction, AnalyticsTrackActionThunkable, AnalyticsAction } from './types.actions';

export function createTrackerMiddleware<T extends VendorAPIOptions>(
  appSettings: MiddlewareSettings,
  API: VendorAPIWrapper<T>,
  getAPIOptions: GetVendorAPIOptions<T>,
  ac: ActionCreators
) {
  const { init, LOAD, INIT, TRACK, TRACK_WITH_STATE, PAUSE_TRACKING, RESUME_TRACKING, TERMINATE_USER_SESSION } = ac;
  const {
    resolveToTrackAction,
    LOAD_DONE,
    dispatchPendingActions,
    DISPATCH_PENDING_ACTIONS,
    SET_PENDING_ACTION,
    INIT_DONE
  } = ac.internal;
  const _client = new Client(appSettings, API, ac);
  return (store: PartialStore) => {
    _client.scheduleLoadDispatch().then(store.dispatch);
    const { bufferActions, resolveBufferedActions } = new DispatchBuffer();
    return (next: any) => (action: AnalyticsAction) => {
      if (!action || !action.type) return next(action);

      if (action.type === LOAD) {
        bufferActions(_client.load());
      } else if (action.type === LOAD_DONE) {
        _client.loadDone();
        const initDispatchPromise = getAPIOptions(store).then(apiOptions => {
          return apiOptions && init(apiOptions);
        }, () => null);
        bufferActions(initDispatchPromise);
      } else if (action.type === INIT) {
        bufferActions(_client.init(action));
      } else if (action.type === INIT_DONE) {
        bufferActions(_client.initDone(), Promise.resolve(dispatchPendingActions()));
      } else if (action.type === DISPATCH_PENDING_ACTIONS) {
        bufferActions(_client.dispatchPendingActions());
      } else if (action.type === SET_PENDING_ACTION) {
        _client.savePendingAction(action.meta);
      } else if (action.type === TRACK) {
        bufferActions(_client.track(action as AnalyticsTrackAction));
      } else if (action.type === TRACK_WITH_STATE) {
        const resolved = resolveToTrackAction(action as AnalyticsTrackActionThunkable, store.getState());
        bufferActions(Promise.resolve(resolved));
      } else if (action.type === PAUSE_TRACKING) {
        _client.controlTracking(true);
      } else if (action.type === RESUME_TRACKING) {
        _client.controlTracking(false);
      } else if (action.type === TERMINATE_USER_SESSION) {
        _client.terminateSession();
      }

      resolveBufferedActions().then((actions: AnalyticsAction[]) => {
        if (!actions.some(action => action.type === SET_PENDING_ACTION)) {
          next(action);
        }
        actions.forEach((a: AnalyticsAction) => store.dispatch(a));
      });
    };
  };
}
