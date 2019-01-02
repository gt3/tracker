import { Client } from './client';
import { VendorAPIOptions, VendorAPIWrapper } from '@csod-oss/tracker-common';
import { LOAD_ANALYTICS, INIT_ANALYTICS, init, TRACK_ANALYTICS, TRACK_ANALYTICS_WITH_STATE, track, ANALYTICS, PAUSE_ANALYTICS_TRACKING, RESUME_ANALYTICS_TRACKING } from './actions';
import { LOAD_ANALYTICS_DONE, dispatchPendingActions, DISPATCH_PENDING_ANALYTICS_ACTIONS, SET_PENDING_ANALYTICS_ACTION, INIT_ANALYTICS_DONE, bufferedActions, BUFFERED_ANALYTICS_ACTIONS } from './actions.internal';
import { Store, Reducer, AnyAction, Dispatch } from 'redux';
import { AnalyticsTrackAction, AnalyticsTrackActionThunkable, TrackActionPayload, UserData, EventData, AppSettings } from './types';
import { flatten1 } from '@csod-oss/tracker-common/build/utils';

const resolveWithState = (state: any, data: any) => {
  let newData = data;
  if(data) {
    newData = Object.keys(data).reduce((acc: any, k) => {
      const getData = data[k];
      acc[k] = typeof data[k] === 'function' ? getData(state) : getData;
      return acc;
    }, {});
  }
  return newData;
}

function resolveToTrackAction(action: AnalyticsTrackActionThunkable, state: any): AnalyticsTrackAction {
  if(!action.payload) {
    return track(action.payload);
  }
  const { userData, eventData, ...rest } = action.payload;
  const newPayload: TrackActionPayload<UserData, EventData> = {
    ...rest,
    userData: resolveWithState(state, userData),
    eventData: resolveWithState(state, eventData)
  };
  return track(newPayload);
}

function processBufferedActions(store: { dispatch: any, getState: any }, next: any, pactions: Promise<BufferedActionReturnTypes>[]) {
  if(pactions.length > 0) {
    Promise.all(pactions)
    .then(actions => flatten1(actions))
    .then(actions => actions.filter(Boolean))
    .then(actions => {
      if(!actions || actions.length === 0) return;
      actions.forEach((a: AnyAction) => store.dispatch(a));
      if(actions.length == 1) {
        next(actions[0])
      }
      else {
        next(bufferedActions(actions));
      }
    });
  }
}

type BufferedActionReturnTypes = AnyAction | AnyAction[] | null | void;

type DispatchBuffer<T = BufferedActionReturnTypes> = {
  getBufferedActions: () => Promise<T>[];
  bufferDispatch: (paction: Promise<T>) => void;
  reset: () => void;
};

const dispatchBuffer = () => {
  let _pactions: Promise<BufferedActionReturnTypes>[] = [];
  const dispatcher: DispatchBuffer = {
    getBufferedActions: () => _pactions,
    bufferDispatch: (paction) =>  {
      _pactions.push(paction);
    },
    reset: () => { _pactions = []; }
  };
  return dispatcher;
}

export type GetVendorAPIOptions<T> = () => Promise<T|null|void>;

function createTrackerMiddleware<T extends VendorAPIOptions>(appSettings: AppSettings, API: VendorAPIWrapper<T>, getAPIOptions: GetVendorAPIOptions<T>) {
  const _client = new Client(appSettings, API);
  return (store: { dispatch: any, getState: any }) => {
    _client.scheduleLoadDispatch().then(store.dispatch);
    const { getBufferedActions, bufferDispatch, reset } = dispatchBuffer();
    return (next: any) => (action: AnyAction) => {
      if (action.type === LOAD_ANALYTICS) {
        bufferDispatch(_client.load());
      }
      else if (action.type === LOAD_ANALYTICS_DONE) {
        bufferDispatch(_client.loadDone());
        const initDispatchPromise = getAPIOptions().then(apiOptions => {
          return apiOptions && [init(apiOptions), dispatchPendingActions()];
        }, () => null);
        bufferDispatch(initDispatchPromise);
      }
      else if (action.type === INIT_ANALYTICS) {
        bufferDispatch(_client.init(action));
      }
      else if (action.type === INIT_ANALYTICS_DONE) {
        _client.initDone();
      }
      else if (action.type === DISPATCH_PENDING_ANALYTICS_ACTIONS) {
        bufferDispatch(_client.dispatchPendingActions());
      }
      else if (action.type === SET_PENDING_ANALYTICS_ACTION) {
        _client.savePendingAction(action.meta);
      }
      else if (action.type === TRACK_ANALYTICS) {
        bufferDispatch(_client.track(action as AnalyticsTrackAction));
      }
      else if(action.type === TRACK_ANALYTICS_WITH_STATE) {
        const resolved = resolveToTrackAction(action as AnalyticsTrackActionThunkable, store.getState());
        bufferDispatch(Promise.resolve(resolved));
      }
      else if(action.type === PAUSE_ANALYTICS_TRACKING) {
        _client.controlTracking(true);
      }
      else if(action.type === RESUME_ANALYTICS_TRACKING) {
        _client.controlTracking(false);
      }
      else {
        if(action.type && action.type.indexOf(ANALYTICS) === 0) {
          return;
        }
        else {
          return next(action);
        }
      }
      let pactions = getBufferedActions();
      reset();
      processBufferedActions(store, next, pactions);
    }
  }
}

function buferedActionsEnhanceReducer(reducer: Reducer) {
	return (state: any, action: any) => {
    if (action.type === BUFFERED_ANALYTICS_ACTIONS) {
      state = action.meta.reduce(reducer, state);
    }
    else {
      state = reducer(state, action);
    }
		return state;
	};
}

export function createTrackerStoreEnhancer<T extends VendorAPIOptions>(appSettings: AppSettings, API: VendorAPIWrapper<T>, getAPIOptions: GetVendorAPIOptions<T>) {
  const middleware = createTrackerMiddleware(appSettings, API, getAPIOptions);
	return (createStore: any) => (reducer: any, initialState: any, ...args: any[]) => {
		let store = createStore(buferedActionsEnhanceReducer(reducer), initialState, ...args);
    let dispatch: any = (action: any) => void(0);
    const middlewareAPI = {
      getState: store.getState,
      dispatch: (action: any) => dispatch(action)
    };
    dispatch = middleware(middlewareAPI)(store.dispatch);
		return { ...store, dispatch };
	};
}
