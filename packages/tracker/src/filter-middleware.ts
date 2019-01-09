import { MiddlewareSettings } from './types';
import { AnyAction } from 'redux';
import { ActionTypeKeys, ActionCreators } from './types.actions';
import { runInNewContext } from 'vm';

export const relayActionsDefault: Partial<Record<ActionTypeKeys, boolean>> = {
  TRACK_ANALYTICS: true,
  PAUSE_ANALYTICS_TRACKING: true,
  RESUME_ANALYTICS_TRACKING: true,
  LOAD_ANALYTICS_DONE: true,
  INIT_ANALYTICS_DONE: true,
  INIT_ANALYTICS_ERR: true,
  TRACK_ANALYTICS_DONE: true,
  TRACK_ANALYTICS_ERR: true,
  SET_PENDING_ANALYTICS_ACTION: true
};

function relay(prefix: string, checks: Record<string, boolean>, action: AnyAction) {
  if (!action || !action.type || action.type.indexOf(prefix) !== 0) return true;
  return !!checks[action.type];
}

export function createFilterMiddleware(appSettings: MiddlewareSettings, ac: ActionCreators) {
  const { relayActions = {} } = appSettings;
  const { prefix } = ac;
  let checks = {};
  if (typeof relayActions === 'boolean') {
    // relay all => no need to apply filter middleware
    if (relayActions) return;
    // ows block all by default checks = {}
  } else {
    checks = { ...relayActionsDefault, ...relayActions };
  }
  const relayFn = relay.bind(null, prefix, checks);
  return (store: { dispatch: any; getState: any }) => {
    return (next: any) => (action: AnyAction) => {
      return relayFn(action) && next(action);
    };
  };
}
