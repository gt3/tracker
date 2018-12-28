## `npm install @csod-oss/tracker`

Use this wrapper to integrate with product/web analytics sdks.

### Benefits
- Redux-friendly
  - Action-oriented design
  - Developer tools support
- Abstract out vendor specific implementation so your app can integrate with multiple vendors with a common API

### Quick start

## 1. Hookup middleware to Redux store

```typescript
import { trackerStoreEnhancer } from '@csod-oss/tracker';

// specify vendor and environment values here
const appSettings: AppSettings = {
  vendor: "amplitude",
  env: "development"
};

// function that returns a Promise that resolves to api options
const getClientSettings = () => Promise.resolve({ apiKey: 'vendor-api-key' });

const enhancer = compose(
  applyMiddleware(...otherMiddlewares),
  trackerStoreEnhancer(appSettings, getClientSettings),
  DevTools.instrument()
);

export const store = createStore(rootReducer, {}, enhancer);
```

## 2. Use builtin action creators to dispatch events

```typescript
import { track, trackWithState } from "@csod-oss/tracker";
track({
  userData: {},
  eventData: {
    eventName: 'CART_CHECKOUT'
  }
});
```

Or you may also use values from app state (store) as shown below:

```typescript
trackWithState({
  userData: {
    culture: state => `${state.user.culture}`
  },
  eventData: {
    eventName: 'cart_checkout',
    itemIds: state => `${state.cart.addedIds}`
  }
})
```
