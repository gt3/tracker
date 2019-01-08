import { Client } from './client';
import { VendorAPIOptions, VendorAPIWrapper } from '@csod-oss/tracker-common';
import getActionCreators, { ActionCreators } from './actions';
import { Reducer, AnyAction } from 'redux';
import { AnalyticsTrackAction, AnalyticsTrackActionThunkable, MiddlewareSettings } from './types';
import { DispatchBuffer } from './dispatch-buffer';

export type GetVendorAPIOptions<T> = () => Promise<T | null | void>;

function createTrackerMiddleware<T extends VendorAPIOptions>(
  appSettings: MiddlewareSettings,
  API: VendorAPIWrapper<T>,
  getAPIOptions: GetVendorAPIOptions<T>,
  ac: ActionCreators
) {
  const {
    prefix,
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
    const { bufferActions, dispatchBufferedActions } = new DispatchBuffer(store, ac);
    return (next: any) => (action: AnyAction) => {
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
      } else {
        if (action.type && action.type.indexOf(prefix) === 0) {
          return;
        } else {
          return next(action);
        }
      }
      dispatchBufferedActions(next);
    };
  };
}

function buferedActionsEnhanceReducer(reducer: Reducer, ac: ActionCreators) {
  return (state: any, action: any) => {
    if (action.type === ac.internal.BUFFERED_ANALYTICS_ACTIONS) {
      state = action.meta.reduce(reducer, state);
    } else {
      state = reducer(state, action);
    }
    return state;
  };
}

export function createTrackerStoreEnhancer<T extends VendorAPIOptions>(
  appSettings: MiddlewareSettings,
  API: VendorAPIWrapper<T>,
  getAPIOptions: GetVendorAPIOptions<T>
) {
  const ac = getActionCreators(API.vendorKey);
  const middleware = createTrackerMiddleware(appSettings, API, getAPIOptions, ac);
  return (createStore: any) => (reducer: any, initialState: any, ...args: any[]) => {
    let store = createStore(buferedActionsEnhanceReducer(reducer, ac), initialState, ...args);
    let dispatch: any = (action: any) => void 0;
    const middlewareAPI = {
      getState: store.getState,
      dispatch: (action: any) => dispatch(action)
    };
    dispatch = middleware(middlewareAPI)(store.dispatch);
    return { ...store, dispatch };
  };
}
