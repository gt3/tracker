import { VendorAPIOptions, VendorAPIWrapper } from '@csod-oss/tracker-common';
import { MiddlewareSettings, GetVendorAPIOptions } from './types.middleware';
import { getActionCreators } from './actions';
import { createFilterMiddleware } from './middleware-filter';
import { createTrackerMiddleware } from './middleware-tracker';
import { pipe } from '@csod-oss/tracker-common';

export function createTrackerStoreEnhancer<T extends VendorAPIOptions>(
  appSettings: MiddlewareSettings,
  API: VendorAPIWrapper<T>,
  getAPIOptions: GetVendorAPIOptions<T>
) {
  const ac = getActionCreators(API.vendorKey);
  const middlewares = [
    createFilterMiddleware(appSettings, ac),
    createTrackerMiddleware(appSettings, API, getAPIOptions, ac)
  ].filter(Boolean) as Array<Function>;
  return (createStore: any) => (reducer: any, initialState: any, ...args: any[]) => {
    let store = createStore(reducer, initialState, ...args);
    let dispatch: any = (action: any) => void 0;
    const middlewareAPI = {
      getState: store.getState,
      dispatch: (action: any) => dispatch(action)
    };
    const pipeline = middlewares.map(middleware => middleware(middlewareAPI));
    dispatch = pipe(...pipeline)(store.dispatch);
    return { ...store, dispatch };
  };
}
