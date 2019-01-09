import { Action } from 'redux';
import { SerializeableRecord, SerializeablePrimitives, Serializable, ValueThunk } from './types.generic';
import { EnvType, Env } from '@csod-oss/tracker-common';
import { ActionTypeKeys } from './types.actions';

export type AnalyticsAction = Action & {
  payload?: any;
  meta?: any;
};

export type EventData = SerializeableRecord<SerializeablePrimitives> & {
  eventName: string;
};

export type EventDataThunkable = {
  eventName: string;
  [key: string]: Serializable | ValueThunk<Serializable>;
};

export type UserData = SerializeableRecord<SerializeablePrimitives>;

export type UserDataThunkable = {
  [key: string]: Serializable | ValueThunk<Serializable>;
};

export type TrackActionPayload<T, U> = {
  userData?: T;
  eventData?: U;
};

export type AnalyticsTrackAction = Action & {
  payload: TrackActionPayload<UserData, EventData>;
};

export type AnalyticsTrackActionThunkable = Action & {
  payload: TrackActionPayload<UserDataThunkable, EventDataThunkable>;
};

export type MiddlewareSettings<V extends EnvType = Env> = {
  env: V;
  preventAutoLoadInit?: boolean;
  relayActions?: boolean | Partial<Record<ActionTypeKeys, boolean>>;
};
