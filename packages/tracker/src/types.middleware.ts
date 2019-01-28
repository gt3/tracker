import { EnvType, Env } from '@csod-oss/tracker-common';
import { ActionTypeKeys } from './types.actions';

export type PartialStore = {
  dispatch: any;
  getState: () => any;
};

export type GetVendorAPIOptions<T> = (store: PartialStore) => Promise<T | null | void>;

export type MiddlewareSettings<V extends EnvType = Env> = {
  env: V;
  preventAutoLoadInit?: boolean;
  anonymizeUserData?: string[];
  relayActions?: boolean | Partial<Record<ActionTypeKeys, boolean>>;
};
