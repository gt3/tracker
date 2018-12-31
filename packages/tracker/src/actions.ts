import { VendorAPIOptions } from '@csod-oss/tracker-common';

//types
import { AnalyticsTrackAction, TrackActionPayload, AnalyticsTrackActionThunkable, UserData, EventData, UserDataThunkable, EventDataThunkable } from './types';

// feature name
export const ANALYTICS = '[Core.Analytics]';

// command action types
export const LOAD_ANALYTICS = `${ANALYTICS} LOAD`;
export const INIT_ANALYTICS = `${ANALYTICS} INIT`;
export const TRACK_ANALYTICS = `${ANALYTICS} TRACK`;
export const TRACK_ANALYTICS_WITH_STATE = `${ANALYTICS} TRACK_WITH_STATE`;
export const PAUSE_ANALYTICS_TRACKING = `${ANALYTICS} PAUSE_TRACKING`;
export const RESUME_ANALYTICS_TRACKING = `${ANALYTICS} RESUME_TRACKING`;

// action creators
export const load = () => ({
  type: LOAD_ANALYTICS
});

export const init = (payload: VendorAPIOptions) => {
  return ({
    type: INIT_ANALYTICS,
    payload
  });
};

export const track = (payload: TrackActionPayload<UserData, EventData>): AnalyticsTrackAction => ({
  type: TRACK_ANALYTICS,
  payload
});

export const trackWithState = (payload: TrackActionPayload<UserDataThunkable, EventDataThunkable>): AnalyticsTrackActionThunkable => ({
  type: TRACK_ANALYTICS_WITH_STATE,
  payload
});

export const pauseTracking = () => ({
  type: PAUSE_ANALYTICS_TRACKING
});

export const resueTracking = () => ({
  type: RESUME_ANALYTICS_TRACKING
});