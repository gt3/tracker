import { createStore, Reducer, Store, AnyAction, compose, StoreEnhancer } from 'redux';
import { VendorAPIOptions, VendorAPIWrapper } from '@csod-oss/tracker-common';
import { createTrackerStoreEnhancer, MiddlewareSettings, GetVendorAPIOptions } from '@csod-oss/tracker';

const ident: Reducer = state => state;

export type TrackerOptions<T extends VendorAPIOptions> = {
  middlewareSettings: MiddlewareSettings;
  API: VendorAPIWrapper<T>;
  getAPIOptions: GetVendorAPIOptions<T>;
};

export type StoreOptions = {
  enhancers?: Array<StoreEnhancer>;
  rootReducer?: Reducer;
};

export class TrackerWithStore<T extends VendorAPIOptions> {
  // static store reference
  private static store: Store;

  static getState = () => {
    const { store } = TrackerWithStore;
    return store && store.getState();
  };

  static dispatch = (action: AnyAction) => {
    const { store } = TrackerWithStore;
    if (store) store.dispatch(action);
  };

  constructor(trackerOptions: TrackerOptions<T>, storeOptions?: StoreOptions) {
    const { middlewareSettings, API, getAPIOptions } = trackerOptions;
    const trackerStoreEnhancer = createTrackerStoreEnhancer(middlewareSettings, API, getAPIOptions);
    let enhancer = trackerStoreEnhancer,
      reducer = ident;
    if (storeOptions) {
      const { enhancers, rootReducer } = storeOptions;
      if (enhancers) {
        enhancer = compose(trackerStoreEnhancer, ...enhancers);
      }
      if (rootReducer) {
        reducer = rootReducer;
      }
    }
    TrackerWithStore.store = createStore(reducer, {}, enhancer);
  }
}

export * from '@csod-oss/tracker';
