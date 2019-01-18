import { VendorKey, EventName, memo1 } from '@csod-oss/tracker-common';
import { resolveToTrackAction } from './action-resolvers';
import { ActionCreators, InternalActionCreators } from './types.actions';

function getActionCreators<T extends EventName>(vendorKey: VendorKey) {
  const prefix = `[${vendorKey}]`;

  const ac: ActionCreators<T> = {
    prefix,

    // command action types
    LOAD_ANALYTICS: `${prefix} LOAD`,
    INIT_ANALYTICS: `${prefix} INIT`,
    TRACK_ANALYTICS: `${prefix} TRACK`,
    TRACK_ANALYTICS_WITH_STATE: `${prefix} TRACK_WITH_STATE`,
    PAUSE_ANALYTICS_TRACKING: `${prefix} PAUSE_TRACKING`,
    RESUME_ANALYTICS_TRACKING: `${prefix} RESUME_TRACKING`,
    TERMINATE_ANALYTICS_USER_SESSION: `${prefix} TERMINATE_USER_SESSION`,

    load: () => ({
      type: ac.LOAD_ANALYTICS
    }),

    init: payload => {
      return {
        type: ac.INIT_ANALYTICS,
        payload
      };
    },

    track: payload => ({
      type: ac.TRACK_ANALYTICS,
      payload
    }),

    trackWithState: payload => ({
      type: ac.TRACK_ANALYTICS_WITH_STATE,
      payload
    }),

    pauseTracking: () => ({
      type: ac.PAUSE_ANALYTICS_TRACKING
    }),

    resumeTracking: () => ({
      type: ac.RESUME_ANALYTICS_TRACKING
    }),

    terminateSession: () => ({
      type: ac.TERMINATE_ANALYTICS_USER_SESSION
    }),

    internal: getInternalActionCreators(prefix, () => ac as ActionCreators)
  };
  return ac;
}

function getInternalActionCreators(prefix: string, getActionCreators: () => ActionCreators) {
  const ac: InternalActionCreators = {
    // command action types
    DISPATCH_PENDING_ANALYTICS_ACTIONS: `${prefix} DISPATCH_PENDING_ACTIONS`,

    // event action types
    LOAD_ANALYTICS_DONE: `${prefix} LOAD_DONE`,
    INIT_ANALYTICS_DONE: `${prefix} INIT_DONE`,
    INIT_ANALYTICS_ERR: `${prefix} INIT_ERR`,
    TRACK_ANALYTICS_DONE: `${prefix} TRACK_DONE`,
    TRACK_ANALYTICS_ERR: `${prefix} TRACK_ERR`,
    // BUFFERED_ANALYTICS_ACTIONS: `${prefix} BUFFERED_ACTIONS`,

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

    trackDone: action => ({
      type: ac.TRACK_ANALYTICS_DONE,
      meta: action
    }),

    trackFail: (action, err) => ({
      type: ac.TRACK_ANALYTICS_ERR,
      payload: err,
      meta: action
    }),

    dispatchPendingActions: () => ({
      type: ac.DISPATCH_PENDING_ANALYTICS_ACTIONS
    }),

    setPendingAction: action => ({
      type: ac.SET_PENDING_ANALYTICS_ACTION,
      meta: action
    }),

    /*
    bufferedActions: actions => ({
      type: ac.BUFFERED_ANALYTICS_ACTIONS,
      meta: actions
    }),
    */

    resolveToTrackAction: resolveToTrackAction(getActionCreators)
  };
  return ac;
}

const memod: { <T extends EventName>(vendorKey: VendorKey): ActionCreators<T> } = memo1(getActionCreators);

export { memod as getActionCreators };
