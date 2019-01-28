import {
  UserData,
  EventData,
  UserDataThunkable,
  EventDataThunkable,
  ValueThunk,
  EventName,
  VendorAPIOptions
} from '@csod-oss/tracker-common';

export type ActionTypeKeys = keyof ActionTypes & InternalActionTypes;

type CommandActionTypes = {
  LOAD: string;
  INIT: string;
  TRACK: string;
  TRACK_WITH_STATE: string;
  PAUSE_TRACKING: string;
  RESUME_TRACKING: string;
  TERMINATE_USER_SESSION: string;
};

export type ActionTypes = CommandActionTypes;

export type ActionCreators<T extends EventName = EventName> = ActionTypes & {
  prefix: string;
  load: () => AnalyticsAction;
  init: <T extends VendorAPIOptions>(payload: T) => AnalyticsAction;
  track: (payload: TrackActionPayload<UserData, EventData<T>>) => AnalyticsTrackAction;
  trackWithState: (
    payload: TrackActionPayload<UserDataThunkable, EventDataThunkable<T>> | ValueThunk<TrackActionPayload<UserData, EventData<T>>>
  ) => AnalyticsTrackActionThunkable;
  pauseTracking: () => AnalyticsAction;
  resumeTracking: () => AnalyticsAction;
  terminateSession: () => AnalyticsAction;
  internal: InternalActionCreators;
};

type InternalCommandActionTypes = {
  DISPATCH_PENDING_ACTIONS: string;
};

type InternalEventActionTypes = {
  LOAD_DONE: string;
  INIT_DONE: string;
  INIT_ERR: string;
  TRACK_DONE: string;
  TRACK_ERR: string;
  // BUFFERED_ACTIONS: string;
};

type InternalDocumentActionTypes = {
  SET_PENDING_ACTION: string;
};

export type InternalActionTypes = InternalCommandActionTypes & InternalEventActionTypes & InternalDocumentActionTypes;

export type InternalActionCreators = InternalActionTypes & {
  loadDone: () => AnalyticsAction;
  initDone: () => AnalyticsAction;
  initFail: (err?: any) => AnalyticsAction;
  trackDone: (meta: { action: AnalyticsTrackAction; anonymizedUserData?: boolean }) => AnalyticsAction;
  trackFail: (meta: { action: AnalyticsTrackAction }, err?: any) => AnalyticsAction;
  dispatchPendingActions: () => AnalyticsAction;
  setPendingAction: (action: AnalyticsAction) => AnalyticsAction;
  // bufferedActions: (action: AnalyticsAction[]) => AnalyticsAction;
  resolveToTrackAction: (action: AnalyticsTrackActionThunkable, state: any) => AnalyticsTrackAction;
};

type Action = {
  type: string;
};

export type AnalyticsAction = Action & {
  payload?: any;
  meta?: any;
};

export type TrackActionPayload<T, U> = {
  userData?: T;
  eventData?: U;
};

export type AnalyticsTrackAction = Action & {
  payload: TrackActionPayload<UserData, EventData>;
};

export type AnalyticsTrackActionThunkable = Action & {
  payload: TrackActionPayload<UserDataThunkable, EventDataThunkable> | ValueThunk<TrackActionPayload<UserData, EventData>>;
};
