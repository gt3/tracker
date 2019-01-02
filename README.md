## `npm install @csod-oss/tracker`

Use this library to integrate analytics vendor sdks with your JavaScript app.

### Benefits
- Abstract out vendor specific implementation so your app can integrate with multiple vendors with a common API.
- Enforce consistency with Typescript types.
- Redux-friendly
  - Action-oriented design
  - Easy integration with developer tools


## Quick start

### 1. Hookup middleware to Redux store

This part involves setting up the tracker middleware to prepare your app to send tracking events.

There are two primary configuration options available:
1. App Settings - Controls tracker behavior.
2. Vendor API Options - Used for Vendor API initialization.

```typescript
// [createTrackerStoreEnhancer] creates the store enhancer/middleware, [AppSettings] is a type
import { createTrackerStoreEnhancer, AppSettings } from '@csod-oss/tracker';

// To use Amplitude as a vendor:
// Import vendor's API implementation [AmplitudeAPI] and type [AmplitudeAPIOptions]
import { AmplitudeAPI, AmplitudeAPIOptions } from '@csod-oss/tracker-vendor-amplitude';

// set [env] (development|production) in AppSettings
const appSettings: AppSettings = {
  env: 'development'
};

// function that returns a Promise that resolves to [AmplitudeAPIOptions]
// [GetVendorAPIOptions]: () => Promise<AmplitudeAPIOptions>
const getVendorAPIOptions = () => Promise.resolve({ apiKey: 'vendor-api-key' });

// include tracker store enhancer before applying other middleware
const enhancer = compose(
  applyMiddleware(...otherMiddlewares),
  // create store enhancer with following arguments:
  // appSettings, API implementation, and function that resolves to API options
  createTrackerStoreEnhancer(appSettings, AmplitudeAPI, getVendorAPIOptions),
  DevTools.instrument()
);

// finally create store by passing in the store enhancer
export const store = createStore(rootReducer, {}, enhancer);
```

### 2. Use builtin action creators to dispatch events

Now all that is left is to dispatch "tracking" actions. 

If you are using react-redux, you might be familiar with [mapDispatchToProps](https://github.com/reduxjs/react-redux/blob/master/docs/api/connect.md#mapdispatchtoprops-object--dispatch-ownprops--object) which is a nice helper to keep your code concise. There is also [bindActionCreators](https://github.com/reduxjs/redux/blob/master/docs/api/bindActionCreators.md) natively available in Redux.

You'll typically use one of these methods to dispatch actions created by the action creators shown below.

```typescript
import { track, trackWithState } from "@csod-oss/tracker";

track({
  userData: {
    language: 'en-us'
  },
  eventData: {
    eventName: 'CART_CHECKOUT',
    ...otherProps
  }
});
```

Or you may also use values from app state (store) as shown below:

```typescript
trackWithState({
  userData: {
    numberOfProductsViewed: state => `${state.user.numberOfProductsViewed}`
  },
  eventData: {
    eventName: 'CART_CHECKOUT',
    itemIds: state => `${state.cart.addedIds}`
  }
})
```

## Documentation
- [Tracker Middleware API](https://github.com/gt3/tracker/wiki)
- [Control Tracking Behavior](https://github.com/gt3/tracker/wiki)
- [Actions Glossary](https://github.com/gt3/tracker/wiki)
- [Vendor SDK Integration](https://github.com/gt3/tracker/wiki) (tbd)