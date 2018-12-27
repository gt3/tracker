import { Client, AppSettings, ClientInitSettings } from './client';
import { LOAD_ANALYTICS, INIT_ANALYTICS, init, TRACK_ANALYTICS, TRACK_ANALYTICS_WITH_STATE, track } from './actions';
import { LOAD_ANALYTICS_DONE, dispatchPendingActions, DISPATCH_PENDING_ANALYTICS_ACTIONS, SET_PENDING_ANALYTICS_ACTION, INIT_ANALYTICS_DONE } from './actions.internal';
import { Store } from 'redux';
import { AnalyticsAction, AnalyticsTrackAction, ValueThunk, AnalyticsTrackActionWithState, TrackActionPayload } from './types';

const resolveWithState = (state: any, data: any) => {
  let newData = data;
  if(data) {
    newData = Object.keys(data).reduce((acc: any, k) => {
      const getData = data[k] as ValueThunk;
      acc[k] = typeof data[k] === 'function' ? getData(state) : getData;
      return acc;
    }, {});
  }
  return newData;
}

function resolveToTrackAction(action: AnalyticsTrackActionWithState, state: any): AnalyticsTrackAction {
  if(!action.payload) {
    return track(action.payload);
  }
  const { userData, eventData, ...rest } = action.payload;
  const newPayload: TrackActionPayload = {
    ...rest,
    userData: resolveWithState(state, userData),
    eventData: resolveWithState(state, eventData)
  };
  return track(newPayload);
}

export function createAnalyticsMiddleware(appSettings: AppSettings, clientInitSettings: ClientInitSettings) {
  const _client = new Client(appSettings);
  return ({ dispatch, getState }: Store) => {
    _client.scheduleLoadDispatch(dispatch);
    return (next: any) => (action: AnalyticsAction) => {
      next(action);
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
        dispatch(resolveToTrackAction(action as AnalyticsTrackActionWithState, getState()));
      }
    }
  }
}