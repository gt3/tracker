import { MiddlewareSettings } from './types';
import { AnyAction } from 'redux';
import { ActionTypeKeys, ActionCreators } from './types.actions';

export const relayActionsDefault: Partial<Record<ActionTypeKeys, boolean>> = {
  TRACK_ANALYTICS: true,
  PAUSE_ANALYTICS_TRACKING: true,
  RESUME_ANALYTICS_TRACKING: true,
  TERMINATE_ANALYTICS_USER_SESSION: true,
  LOAD_ANALYTICS_DONE: true,
  INIT_ANALYTICS_DONE: true,
  INIT_ANALYTICS_ERR: true,
  TRACK_ANALYTICS_DONE: true,
  TRACK_ANALYTICS_ERR: true,
  SET_PENDING_ANALYTICS_ACTION: true
};

export function createFilterMiddleware(appSettings: MiddlewareSettings, ac: ActionCreators) {
  const { relayActions = {} } = appSettings;
  const { prefix } = ac;
  let actionKeyChecks = {};
  if (typeof relayActions === 'boolean') {
    // relay all => no need to apply filter middleware
    if (relayActions) return;
    // ows block all by default checks = {}
  } else {
    actionKeyChecks = { ...relayActionsDefault, ...relayActions };
  }
  const checks = transformActionKeys(ac, actionKeyChecks);
  const relayFn = relay.bind(null, prefix, checks);
  return (store: { dispatch: any; getState: any }) => {
    return (next: any) => (action: AnyAction) => {
      return relayFn(action) && next(action);
    };
  };
}

function transformActionKeys(ac: ActionCreators, checks: Partial<Record<ActionTypeKeys, boolean>>) {
  let res = Object.keys(checks).reduce((acc: any, key) => {
    if (ac.hasOwnProperty(key)) {
      // @ts-ignore
      acc[ac[key]] = checks[key];
    } else if (ac.internal.hasOwnProperty(key)) {
      // @ts-ignore
      acc[ac.internal[key]] = checks[key];
    }
    return acc;
  }, {});
  return res;
}

function relay(prefix: string, checks: Record<string, boolean>, action: AnyAction) {
  if (!action || !action.type || action.type.indexOf(prefix) !== 0) return true;
  return !!checks[action.type];
}
