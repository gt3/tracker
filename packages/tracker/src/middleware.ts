import { Client, AppSettings, ClientInitSettings } from './client';
import { LOAD_ANALYTICS, INIT_ANALYTICS, init, TRACK_ANALYTICS, TRACK_ANALYTICS_WITH_STATE, track } from './actions';
import { LOAD_ANALYTICS_DONE, dispatchPendingActions, DISPATCH_PENDING_ANALYTICS_ACTIONS, SET_PENDING_ANALYTICS_ACTION, INIT_ANALYTICS_DONE, bufferedActions, BUFFERED_ANALYTICS_ACTIONS } from './actions.internal';
import { Store, Reducer, AnyAction, Dispatch } from 'redux';
import { AnalyticsAction, AnalyticsTrackAction, AnalyticsTrackActionThunkable, TrackActionPayload, UserData, EventData } from './types';

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

type DispatchBuffer = {
  getActions: () => AnyAction[];
  dispatch: Dispatch<AnyAction>;
  reset: () => void;
};

const dispatchBuffer = () => {
  let _actions: AnyAction[] = [];
  const dispatcher: DispatchBuffer = {
    getActions: () => _actions,
    dispatch: (action: any) =>  {
      _actions.push(action);
      return action;
    },
    reset: () => { _actions = []; }
  };
  return dispatcher;
}

export function createAnalyticsMiddleware(appSettings: AppSettings, clientInitSettings: ClientInitSettings) {
  const _client = new Client(appSettings);
  return ({ dispatch: _dispatch, getState }: { dispatch: any, getState: any }) => {
    _client.scheduleLoadDispatch(_dispatch);
    const { getActions, dispatch, reset } = dispatchBuffer();
    return (next: any) => (action: AnalyticsAction) => {
      if (action.type === LOAD_ANALYTICS) {
        _client.load(dispatch);
      }
      else if (action.type === LOAD_ANALYTICS_DONE) {
        _client.loadDone();
        dispatch(init(clientInitSettings));
        dispatch(dispatchPendingActions());
      }
      else if (action.type === INIT_ANALYTICS) {
        _client.init(dispatch, action);
      }
      else if (action.type === INIT_ANALYTICS_DONE) {
        _client.initDone();
      }
      else if (action.type === DISPATCH_PENDING_ANALYTICS_ACTIONS) {
        _client.dispatchPendingActions(dispatch);
      }
      else if (action.type === SET_PENDING_ANALYTICS_ACTION) {
        _client.savePendingAction(dispatch, action.meta);
      }
      else if (action.type === TRACK_ANALYTICS) {
        _client.track(dispatch, action as AnalyticsTrackAction);
      }
      else if(action.type === TRACK_ANALYTICS_WITH_STATE) {
        dispatch(resolveToTrackAction(action as AnalyticsTrackActionThunkable, getState()));
      }
      else {
        next(action);
      }
      let actions = getActions();
      if(actions.length > 0) {
        reset();
        _dispatch(bufferedActions(actions));
      }
    }
  }
}

export function buferedActionsEnhanceReducer(reducer: Reducer) {
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

/* export function multipleActionsEnhanceDispatch(dispatch: any) {
	return (action: any) => {
		var multipleAction;
    const { type, meta } = action;
		if (type === BUFFERED_ANALYTICS_ACTIONS) {
			//const bufferedActionType = meta.map((a) => a.type).join(' => ');
			multipleAction = {
				type,
				actions: action
			};
		}

		return dispatch(multipleAction || action);
	};
} */

export function trackerStoreEnhancer(appSettings: AppSettings, clientInitSettings: ClientInitSettings) {
  const middleware = createAnalyticsMiddleware(appSettings, clientInitSettings);
	return (createStore: any) => (reducer: any, initialState: any) => {
		let store = createStore(buferedActionsEnhanceReducer(reducer), initialState);
    // store.dispatch = multipleActionsEnhanceDispatch(store.dispatch);
    let dispatch = (action: any) => {};
    const middlewareAPI = {
      getState: store.getState,
      dispatch: (action: any) => dispatch(action)
    }
    dispatch = middleware(middlewareAPI)(store.dispatch);
		return { ...store, dispatch };
	};
}
