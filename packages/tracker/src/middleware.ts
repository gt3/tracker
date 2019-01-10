import { Client } from './client';
import { VendorAPIOptions, VendorAPIWrapper } from '@csod-oss/tracker-common';
import getActionCreators from './actions';
import { AnyAction, Middleware } from 'redux';
import { AnalyticsTrackAction, AnalyticsTrackActionThunkable, MiddlewareSettings } from './types';
import { DispatchBuffer } from './dispatch-buffer';
import { ActionCreators } from './types.actions';
import { pipe } from '@csod-oss/tracker-common/build/utils';
import { createFilterMiddleware } from './filter-middleware';

export type GetVendorAPIOptions<T> = () => Promise<T | null | void>;

function createTrackerMiddleware<T extends VendorAPIOptions>(
  appSettings: MiddlewareSettings,
  API: VendorAPIWrapper<T>,
  getAPIOptions: GetVendorAPIOptions<T>,
  ac: ActionCreators
) {
  const {
    LOAD_ANALYTICS,
    INIT_ANALYTICS,
    init,
    TRACK_ANALYTICS,
    TRACK_ANALYTICS_WITH_STATE,
    PAUSE_ANALYTICS_TRACKING,
    RESUME_ANALYTICS_TRACKING
  } = ac;
  const {
    LOAD_ANALYTICS_DONE,
    dispatchPendingActions,
    DISPATCH_PENDING_ANALYTICS_ACTIONS,
    SET_PENDING_ANALYTICS_ACTION,
    INIT_ANALYTICS_DONE,
    resolveToTrackAction
  } = ac.internal;
  const _client = new Client(appSettings, API, ac);
  return (store: { dispatch: any; getState: any }) => {
    _client.scheduleLoadDispatch().then(store.dispatch);
    const { bufferActions, resolveBufferedActions } = new DispatchBuffer();
    return (next: any) => (action: AnyAction) => {
      if (!action || !action.type) return next(action);

      if (action.type === LOAD_ANALYTICS) {
        bufferActions(_client.load());
      } else if (action.type === LOAD_ANALYTICS_DONE) {
        bufferActions(_client.loadDone());
        const initDispatchPromise = getAPIOptions().then(apiOptions => {
          return apiOptions && [init(apiOptions), dispatchPendingActions()];
        }, () => null);
        bufferActions(initDispatchPromise);
      } else if (action.type === INIT_ANALYTICS) {
        bufferActions(_client.init(action));
      } else if (action.type === INIT_ANALYTICS_DONE) {
        _client.initDone();
      } else if (action.type === DISPATCH_PENDING_ANALYTICS_ACTIONS) {
        bufferActions(_client.dispatchPendingActions());
      } else if (action.type === SET_PENDING_ANALYTICS_ACTION) {
        _client.savePendingAction(action.meta);
      } else if (action.type === TRACK_ANALYTICS) {
        bufferActions(_client.track(action as AnalyticsTrackAction));
      } else if (action.type === TRACK_ANALYTICS_WITH_STATE) {
        const resolved = resolveToTrackAction(action as AnalyticsTrackActionThunkable, store.getState());
        bufferActions(Promise.resolve(resolved));
      } else if (action.type === PAUSE_ANALYTICS_TRACKING) {
        _client.controlTracking(true);
      } else if (action.type === RESUME_ANALYTICS_TRACKING) {
        _client.controlTracking(false);
      }

      resolveBufferedActions().then((actions: AnyAction[]) => {
        if (!actions.some(action => action.type === SET_PENDING_ANALYTICS_ACTION)) {
          next(action);
        }
        actions.forEach((a: AnyAction) => store.dispatch(a));
      });
    };
  };
}

export function createTrackerStoreEnhancer<T extends VendorAPIOptions>(
  appSettings: MiddlewareSettings,
  API: VendorAPIWrapper<T>,
  getAPIOptions: GetVendorAPIOptions<T>
) {
  const ac = getActionCreators(API.vendorKey);
  const middlewares = [
    createFilterMiddleware(appSettings, ac),
    createTrackerMiddleware(appSettings, API, getAPIOptions, ac)
  ].filter(Boolean) as Array<Middleware>;
  return (createStore: any) => (reducer: any, initialState: any, ...args: any[]) => {
    let store = createStore(reducer, initialState, ...args);
    let dispatch: any = (action: any) => void 0;
    const middlewareAPI = {
      getState: store.getState,
      dispatch: (action: any) => dispatch(action)
    };
    const pipeline = middlewares.map(middleware => middleware(middlewareAPI));
    dispatch = pipe(...pipeline)(store.dispatch);
    return { ...store, dispatch };
  };
}
