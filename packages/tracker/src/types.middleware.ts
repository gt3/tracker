import { EnvType, Env } from '@csod-oss/tracker-common';
import { ActionTypeKeys } from './types.actions';

export type MiddlewareSettings<V extends EnvType = Env> = {
  env: V;
  preventAutoLoadInit?: boolean;
  relayActions?: boolean | Partial<Record<ActionTypeKeys, boolean>>;
};
