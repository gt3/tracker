import {
  AnalyticsAction,
  AnalyticsTrackAction,
  TrackActionPayload,
  AnalyticsTrackActionThunkable,
  UserData,
  EventData,
  UserDataThunkable,
  EventDataThunkable
} from './types';
import { VendorAPIOptions } from '@csod-oss/tracker-common';

export type ActionTypeKeys = keyof ActionTypes & InternalActionTypes;

type CommandActionTypes = {
  LOAD_ANALYTICS: string;
  INIT_ANALYTICS: string;
  TRACK_ANALYTICS: string;
  TRACK_ANALYTICS_WITH_STATE: string;
  PAUSE_ANALYTICS_TRACKING: string;
  RESUME_ANALYTICS_TRACKING: string;
  TERMINATE_ANALYTICS_USER_SESSION: string;
};

export type ActionTypes = CommandActionTypes;

export type ActionCreators = ActionTypes & {
  prefix: string;
  load: () => AnalyticsAction;
  init: <T extends VendorAPIOptions>(payload: T) => AnalyticsAction;
  track: (payload: TrackActionPayload<UserData, EventData>) => AnalyticsTrackAction;
  trackWithState: (payload: TrackActionPayload<UserDataThunkable, EventDataThunkable>) => AnalyticsTrackActionThunkable;
  pauseTracking: () => AnalyticsAction;
  resumeTracking: () => AnalyticsAction;
  terminateSession: () => AnalyticsAction;
  internal: InternalActionCreators;
};

type InternalCommandActionTypes = {
  DISPATCH_PENDING_ANALYTICS_ACTIONS: string;
};

type InternalEventActionTypes = {
  LOAD_ANALYTICS_DONE: string;
  INIT_ANALYTICS_DONE: string;
  INIT_ANALYTICS_ERR: string;
  TRACK_ANALYTICS_DONE: string;
  TRACK_ANALYTICS_ERR: string;
  // BUFFERED_ANALYTICS_ACTIONS: string;
};

type InternalDocumentActionTypes = {
  SET_PENDING_ANALYTICS_ACTION: string;
};

export type InternalActionTypes = InternalCommandActionTypes & InternalEventActionTypes & InternalDocumentActionTypes;

export type InternalActionCreators = InternalActionTypes & {
  loadDone: () => AnalyticsAction;
  initDone: () => AnalyticsAction;
  initFail: (err?: any) => AnalyticsAction;
  trackDone: () => AnalyticsAction;
  trackFail: (err?: any) => AnalyticsAction;
  dispatchPendingActions: () => AnalyticsAction;
  setPendingAction: (action: AnalyticsAction) => AnalyticsAction;
  // bufferedActions: (action: AnalyticsAction[]) => AnalyticsAction;
  resolveToTrackAction: (action: AnalyticsTrackActionThunkable, state: any) => AnalyticsTrackAction;
};
