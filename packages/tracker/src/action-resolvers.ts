import { UserData, EventData } from '@csod-oss/tracker-common';
import { ActionCreators, AnalyticsTrackActionThunkable, TrackActionPayload, AnalyticsTrackAction } from './types.actions';

const resolveWithState = (state: any, data: any) => {
  let newData = data;
  if (data) {
    if (typeof data === 'function') {
      newData = data(state);
    } else {
      newData = Object.keys(data).reduce((acc: any, k) => {
        const getData = data[k];
        acc[k] = typeof data[k] === 'function' ? getData(state) : getData;
        return acc;
      }, {});
    }
  }
  return newData;
};

export const resolveToTrackAction = (getActionCreators: () => ActionCreators) => (
  action: AnalyticsTrackActionThunkable,
  state: any
): AnalyticsTrackAction => {
  const { track } = getActionCreators();
  const { payload } = action;
  let newPayload: TrackActionPayload<UserData, EventData>;
  if (!payload) {
    return track(payload);
  }
  if (typeof payload === 'function') {
    newPayload = payload(state);
  } else {
    const { userData, eventData, ...rest } = payload;
    newPayload = {
      ...rest,
      userData: resolveWithState(state, userData),
      eventData: resolveWithState(state, eventData)
    };
  }
  return track(newPayload);
};
