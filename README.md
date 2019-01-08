Use this library to integrate analytics vendor sdks with your JavaScript app.

### Benefits
- Abstract out vendor specific implementation so your app can integrate with multiple vendors with a common API.
- Enforce consistency with Typescript types.
- Redux-friendly
  - Action-oriented design
  - Easy integration with developer tools


## Quick start

### 1. Install dependencies

You'll need two or more packages depending on the vendor(s) you want to integrate with. To use Amplitude as an example, run the following commands in your app:

- `npm install @csod-oss/tracker`
- `npm install @csod-oss/tracker-vendor-amplitude`

### 2. Create configuration

There are two primary configuration options that the middleware accepts:
1. `MiddlewareSettings` - controls middleware behavior.
2. `VendorAPIOptions` - controls Vendor SDK behavior (used during initialization).

```typescript
// [createTrackerStoreEnhancer] creates the store enhancer/middleware
// [MiddlewareSettings] is a type for configuration
import { createTrackerStoreEnhancer, MiddlewareSettings } from '@csod-oss/tracker';

// To use Amplitude as a vendor, import the API [AmplitudeAPI]
// [AmplitudeAPIOptions] is a type for API configuration
import { AmplitudeAPI, AmplitudeAPIOptions } from '@csod-oss/tracker-vendor-amplitude';

// create config object of type [MiddlewareSettings]
const trackerSettings: MiddlewareSettings = {
  env: 'development'
};

// write a function that returns a Promise that resolves to [AmplitudeAPIOptions]
// () => Promise<AmplitudeAPIOptions>
const getVendorAPIOptions = () => Promise.resolve({ apiKey: 'vendor-api-key' });

```

### 3. Hookup middleware to Redux store

This part involves setting up the tracker middleware to prepare your app to send tracking events. To add the middleware, you'll use the `createTrackerStoreEnhancer` factory function and pass the result (store enhancer) to Redux's `createStore` function.

```typescript

// include tracker store enhancer before applying other functional middlewares
const enhancer = compose(
  applyMiddleware(...otherMiddlewares),
  // create store enhancer with following arguments:
  // trackerSettings, Vendor API, and function that resolves to Vendor API options
  createTrackerStoreEnhancer(trackerSettings, AmplitudeAPI, getVendorAPIOptions),
  DevTools.instrument()
);

// finally create store by passing in the store enhancer as the last argument
export const store = createStore(rootReducer, {}, enhancer);
```

### 4. Use builtin action creators to dispatch events

Now all that is left is to dispatch "tracking" actions. 

If you are using react-redux, you might be familiar with [mapDispatchToProps](https://github.com/reduxjs/react-redux/blob/master/docs/api/connect.md#mapdispatchtoprops-object--dispatch-ownprops--object) which is a nice helper to keep your code concise. There is also [bindActionCreators](https://github.com/reduxjs/redux/blob/master/docs/api/bindActionCreators.md) natively available in Redux.

You'll typically use one of these methods to dispatch actions created by the action creators shown below.

```typescript
// import function to retrieve action creators
import getActionCreators from "@csod-oss/tracker";

// get action creators by supplying a VendorKey
// this will ensure all action creators use the supplied key as prefix
const { track, trackWithState } = getActionCreators('amplitude');

// track action creater returns action of type [AnalyticsTrackAction]
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

// trackWithState action creater returns action of type [AnalyticsTrackActionThunkable]
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