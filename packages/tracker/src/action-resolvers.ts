import { AnalyticsTrackActionThunkable, TrackActionPayload, UserData, EventData, AnalyticsTrackAction } from './types';
import { ActionCreators } from './actions';

const resolveWithState = (state: any, data: any) => {
  let newData = data;
  if (data) {
    newData = Object.keys(data).reduce((acc: any, k) => {
      const getData = data[k];
      acc[k] = typeof data[k] === 'function' ? getData(state) : getData;
      return acc;
    }, {});
  }
  return newData;
};

export const resolveToTrackAction = (getActionCreators: () => ActionCreators) => (
  action: AnalyticsTrackActionThunkable,
  state: any
): AnalyticsTrackAction => {
  const { track } = getActionCreators();
  if (!action.payload) {
    return track(action.payload);
  }
  const { userData, eventData, ...rest } = action.payload;
  const newPayload: TrackActionPayload<UserData, EventData> = {
    ...rest,
    userData: resolveWithState(state, userData),
    eventData: resolveWithState(state, eventData)
  };
  return track(newPayload);
};
