import { VendorKey, EventName, memo1 } from '@csod-oss/tracker-common';
import { resolveToTrackAction } from './action-resolvers';
import { ActionCreators, InternalActionCreators } from './types.actions';

function getActionCreators<T extends EventName>(vendorKey: VendorKey) {
  const prefix = `[${vendorKey}]`;

  const ac: ActionCreators<T> = {
    prefix,

    // command action types
    LOAD: `${prefix} LOAD`,
    INIT: `${prefix} INIT`,
    TRACK: `${prefix} TRACK`,
    TRACK_WITH_STATE: `${prefix} TRACK_WITH_STATE`,
    PAUSE_TRACKING: `${prefix} PAUSE_TRACKING`,
    RESUME_TRACKING: `${prefix} RESUME_TRACKING`,
    TERMINATE_USER_SESSION: `${prefix} TERMINATE_USER_SESSION`,

    load: () => ({
      type: ac.LOAD
    }),

    init: payload => {
      return {
        type: ac.INIT,
        payload
      };
    },

    track: payload => ({
      type: ac.TRACK,
      payload
    }),

    trackWithState: payload => ({
      type: ac.TRACK_WITH_STATE,
      payload
    }),

    pauseTracking: () => ({
      type: ac.PAUSE_TRACKING
    }),

    resumeTracking: () => ({
      type: ac.RESUME_TRACKING
    }),

    terminateSession: () => ({
      type: ac.TERMINATE_USER_SESSION
    }),

    internal: getInternalActionCreators(prefix, () => ac as ActionCreators)
  };
  return ac;
}

function getInternalActionCreators(prefix: string, getActionCreators: () => ActionCreators) {
  const ac: InternalActionCreators = {
    // command action types
    DISPATCH_PENDING_ACTIONS: `${prefix} DISPATCH_PENDING_ACTIONS`,

    // event action types
    LOAD_DONE: `${prefix} LOAD_DONE`,
    INIT_DONE: `${prefix} INIT_DONE`,
    INIT_ERR: `${prefix} INIT_ERR`,
    TRACK_DONE: `${prefix} TRACK_DONE`,
    TRACK_ERR: `${prefix} TRACK_ERR`,
    // BUFFERED_ACTIONS: `${prefix} BUFFERED_ACTIONS`,

    // document action types
    SET_PENDING_ACTION: `${prefix} SET_PENDING_ACTION`,

    loadDone: () => ({
      type: ac.LOAD_DONE
    }),

    initDone: () => ({
      type: ac.INIT_DONE
    }),

    initFail: (err?: any) => ({
      type: ac.INIT_ERR,
      payload: err
    }),

    trackDone: meta => ({
      type: ac.TRACK_DONE,
      meta
    }),

    trackFail: (meta, err) => ({
      type: ac.TRACK_ERR,
      payload: err,
      meta
    }),

    dispatchPendingActions: () => ({
      type: ac.DISPATCH_PENDING_ACTIONS
    }),

    setPendingAction: action => ({
      type: ac.SET_PENDING_ACTION,
      meta: action
    }),

    /*
    bufferedActions: actions => ({
      type: ac.BUFFERED_ACTIONS,
      meta: actions
    }),
    */

    resolveToTrackAction: resolveToTrackAction(getActionCreators)
  };
  return ac;
}

const memod: { <T extends EventName>(vendorKey: VendorKey): ActionCreators<T> } = memo1(getActionCreators);

export { memod as getActionCreators };
