Use this library to integrate analytics vendor SDKs with your JavaScript app.

## Goals
- Abstract out vendor specific implementation to integrate with multiple vendors through a common API.
- Provide seamless integration for Redux-based apps.
  - Use middleware to communicate with vendor SDK.
  - Dispatch actions to manage tracking behavior.
  - Dispatch actions to track user activity.
  - Integrate with developer tools without additional configuration.
- Enforce consistency with Typescript types.


## Quick start

If you are new to JavaScript ecosystem, you may want to start with the [prerequisites](https://github.com/gt3/tracker/wiki).

### 1. Install dependencies

You'll need two or more packages depending on the vendor(s) you want to integrate with. To use Amplitude as an example, run the following commands in your app:

- `npm install @csod-oss/tracker`
- `npm install @csod-oss/tracker-vendor-amplitude`

### 2. Write configuration

There are two primary configuration options that the middleware accepts:
1. `MiddlewareSettings` - controls middleware behavior.
2. `VendorAPIOptions` - controls Vendor SDK behavior (used during initialization).

```typescript
// [MiddlewareSettings] is a type for configuration
import { MiddlewareSettings } from '@csod-oss/tracker';

// create config object of type [MiddlewareSettings]
const middlewareSettings: MiddlewareSettings = {
  env: 'development'
};

// [AmplitudeAPIOptions] is a type for API configuration for Amplitude SDK
import { AmplitudeAPIOptions } from '@csod-oss/tracker-vendor-amplitude';

// write a function that returns a Promise that resolves to [AmplitudeAPIOptions]
// ({ getState, dispatch }) => Promise<AmplitudeAPIOptions>
const getVendorAPIOptions = () => Promise.resolve({ apiKey: 'vendor-api-key' });

```
> Read more on configuration options [here](https://github.com/gt3/tracker/wiki#1-configuration).

### 3. Attach the middleware to Redux store

This part involves setting up the tracker middleware to prepare your app to send tracking events. To add the middleware, you'll use the `createTrackerStoreEnhancer` factory function and pass the result (store enhancer) to Redux's `createStore` function.

```typescript
// [createTrackerStoreEnhancer] creates the store enhancer/middleware
import { createTrackerStoreEnhancer } from '@csod-oss/tracker';

// To use Amplitude as a vendor, import the API [AmplitudeAPI]
import { AmplitudeAPI } from '@csod-oss/tracker-vendor-amplitude';

// include tracker store enhancer before applying other functional middlewares
const enhancer = compose(

  applyMiddleware(...otherMiddlewares),

  // create store enhancer with following arguments:
  // middlewareSettings, Vendor API, and function that resolves to Vendor API options
  createTrackerStoreEnhancer(middlewareSettings, AmplitudeAPI, getVendorAPIOptions),

  DevTools.instrument()
);

// finally create store by passing in the store enhancer as the last argument
export const store = createStore(rootReducer, {}, enhancer);
```

At this point, the middleware setup is complete. Next we'll look at how to implement tracking behavior.

### 4. Create actions

Create tracking actions by providing a payload to the action creator. The payload consists of two properties `userData` (user properties) and `eventData` (event properties) of type {object}.

If userData or eventData contains a property with value of type function, the action will be resolved by invoking the function with current state (`store.getState()`) as argument. 

You can also provide a function as the payload. The function gets called with current state and must return object of type `AnalyticsTrackAction`.

```typescript
// import function to retrieve action creators
import { getActionCreators } from "@csod-oss/tracker";

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

Or you may use values from app state (store) as shown below:

```typescript

// trackWithState action creator returns action of type [AnalyticsTrackActionThunkable]
trackWithState({
  userData: {
    numberOfProductsViewed: (state) => `${state.user.numberOfProductsViewed}`
  },
  eventData: {
    eventName: 'CART_CHECKOUT',
    itemIds: (state) => `${state.cart.addedIds}`
  }
})
```

`trackWithState` action gets transformed into `track` action by the middleware. Learn more about actions and the middleware lifecycle [here](https://github.com/gt3/tracker/wiki#4-actions-glossary).

### 5. Dispatch actions

Once the tracking actions are created, all that is left is to call `store.dispatch` on them. It is up to your app and your Redux setup on how `dispatch` is invoked. 

For React apps, [react-redux](https://github.com/reduxjs/react-redux) is a standard way to wire up container components to Redux store. Use helpers [mapDispatchToProps](https://github.com/reduxjs/react-redux/blob/master/docs/api/connect.md#mapdispatchtoprops-object--dispatch-ownprops--object) from react-redux or [bindActionCreators](https://github.com/reduxjs/redux/blob/master/docs/api/bindActionCreators.md) from redux to hook up the dispatch.

---

Next, review API documentation below to gain a deeper understanding and tackle advanced use cases.

## Documentation
- [Prerequisites](https://github.com/gt3/tracker/wiki#1-prerequisites)
- [Configuration](https://github.com/gt3/tracker/wiki#2-configuration)
- [Control Tracking Behavior](https://github.com/gt3/tracker/wiki#3-control-tracking-behavior)
- [Actions Glossary](https://github.com/gt3/tracker/wiki#4-actions-glossary)

## License

Released under the [MIT license](LICENSE.md).
