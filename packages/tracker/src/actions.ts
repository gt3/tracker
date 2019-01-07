import { VendorAPIOptions, VendorKey } from '@csod-oss/tracker-common';

//types
import { AnalyticsAction, AnalyticsTrackAction, TrackActionPayload, AnalyticsTrackActionThunkable, UserData, EventData, UserDataThunkable, EventDataThunkable } from './types';
import { memo1 } from '@csod-oss/tracker-common/build/utils';

export default memo1(getActionCreators);

function getActionCreators(vendorKey: VendorKey) {
  const prefix = `[${vendorKey}]`;

  const ac: ActionCreators = {
    prefix,

    // command action types
    LOAD_ANALYTICS: `${prefix} LOAD`,
    INIT_ANALYTICS: `${prefix} INIT`,
    TRACK_ANALYTICS: `${prefix} TRACK`,
    TRACK_ANALYTICS_WITH_STATE: `${prefix} TRACK_WITH_STATE`,
    PAUSE_ANALYTICS_TRACKING: `${prefix} PAUSE_TRACKING`,
    RESUME_ANALYTICS_TRACKING: `${prefix} RESUME_TRACKING`,

    load: () => ({
      type: ac.LOAD_ANALYTICS
    }),
    
    init: (payload) => {
      return ({
        type: ac.INIT_ANALYTICS,
        payload
      });
    },
    
    track: (payload) => ({
      type: ac.TRACK_ANALYTICS,
      payload
    }),
    
    trackWithState: (payload) => ({
      type: ac.TRACK_ANALYTICS_WITH_STATE,
      payload
    }),
    
    pauseTracking: () => ({
      type: ac.PAUSE_ANALYTICS_TRACKING
    }),
    
    resumeTracking: () => ({
      type: ac.RESUME_ANALYTICS_TRACKING
    }),

    internal: getInternalActionCreators(prefix)
  };
  return ac;
}

function getInternalActionCreators(prefix: string) {
  const ac: InternalActionCreators = {
    // command action types
    DISPATCH_PENDING_ANALYTICS_ACTIONS: `${prefix} DISPATCH_PENDING_ACTIONS`,

    // event action types
    LOAD_ANALYTICS_DONE: `${prefix} LOAD_DONE`,
    INIT_ANALYTICS_DONE: `${prefix} INIT_DONE`,
    INIT_ANALYTICS_ERR: `${prefix} INIT_ERR`,
    TRACK_ANALYTICS_DONE: `${prefix} TRACK_DONE`,
    TRACK_ANALYTICS_ERR: `${prefix} TRACK_ERR`,
    BUFFERED_ANALYTICS_ACTIONS: `${prefix} BUFFERED_ACTIONS`,

    // document action types
    SET_PENDING_ANALYTICS_ACTION: `${prefix} SET_PENDING_ACTION`,

    loadDone: () => ({
      type: ac.LOAD_ANALYTICS_DONE
    }),
    
    initDone: () => ({
      type: ac.INIT_ANALYTICS_DONE
    }),
    
    initFail: (err?: any) => ({
      type: ac.INIT_ANALYTICS_ERR,
      payload: err
    }),
    
    trackDone: () => ({
      type: ac.TRACK_ANALYTICS_DONE
    }),
    
    trackFail: (err) => ({
      type: ac.TRACK_ANALYTICS_ERR,
      payload: err
    }),
    
    dispatchPendingActions: () => ({
      type: ac.DISPATCH_PENDING_ANALYTICS_ACTIONS
    }),
    
    setPendingAction: (action) => ({
      type: ac.SET_PENDING_ANALYTICS_ACTION,
      meta: action
    }),
    
    bufferedActions: (actions) => ({
      type: ac.BUFFERED_ANALYTICS_ACTIONS,
      meta: actions
    })

  };
  return ac;
}

export type InternalActionCreators = {
  // command action types
  DISPATCH_PENDING_ANALYTICS_ACTIONS: string;

  // event action types
  LOAD_ANALYTICS_DONE: string;
  INIT_ANALYTICS_DONE: string;
  INIT_ANALYTICS_ERR: string;
  TRACK_ANALYTICS_DONE: string;
  TRACK_ANALYTICS_ERR: string;
  BUFFERED_ANALYTICS_ACTIONS: string;

  // document action types
  SET_PENDING_ANALYTICS_ACTION: string;

  loadDone: () => AnalyticsAction;
  initDone: () => AnalyticsAction;
  initFail: (err?: any) => AnalyticsAction;
  trackDone: () => AnalyticsAction;
  trackFail: (err?: any) => AnalyticsAction;
  dispatchPendingActions: () => AnalyticsAction;
  setPendingAction: (action: AnalyticsAction) => AnalyticsAction;
  bufferedActions: (action: AnalyticsAction[]) => AnalyticsAction;
};

export type ActionCreators = {
  prefix: string;
  // command action types
  LOAD_ANALYTICS: string;
  INIT_ANALYTICS: string;
  TRACK_ANALYTICS: string;
  TRACK_ANALYTICS_WITH_STATE: string;
  PAUSE_ANALYTICS_TRACKING: string;
  RESUME_ANALYTICS_TRACKING: string;
  load: () => AnalyticsAction;
  init: <T extends VendorAPIOptions> (payload: T) => AnalyticsAction;
  track: (payload: TrackActionPayload<UserData, EventData>) => AnalyticsTrackAction;
  trackWithState: (payload: TrackActionPayload<UserDataThunkable, EventDataThunkable>) => AnalyticsTrackActionThunkable;
  pauseTracking: () => AnalyticsAction;
  resumeTracking: () => AnalyticsAction;
  internal: InternalActionCreators;
};
