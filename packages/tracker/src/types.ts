import { Action } from 'redux';
import { string, number } from 'prop-types';

export type Environments = 'development' | 'production';

export type AnalyticsAction = Action & {
  payload?: any;
  meta?: any;
};

export type SerializeablePrimitives = string | null | undefined | boolean | number;

export type SerializeableRecord = 
  Record<string, SerializeablePrimitives | SerializeablePrimitives[] | Record<string, SerializeablePrimitives | SerializeablePrimitives[]> | Record<string, SerializeablePrimitives | SerializeablePrimitives[]>[]>;

const xxx: SerializeableRecord = { xxx: [ { xx: {} } ] };


export type Serializeable = SerializeablePrimitives | SerializeablePrimitives[] | SerializeableRecord | SerializeableRecord[];

export type ValueThunk = (state: any) => Serializeable;

export type EventData = {
  eventName: string;
  [key: string]: Serializeable;
}

export type EventDataThunkable = {
  eventName: string;
  [key: string]: Serializeable | ValueThunk;
};

export type UserData = Record<string, Serializeable>;


const e: EventData = {
  eventName: '',
  xxx: { xx: { x: [{}] } }
};

export type UserDataWithState = UserData & ValueThunk;

export type TrackActionPayload = {
  userData?: UserData;
  eventData?: EventData;
}

export type TrackActionPayloadWithState = {
  userData?: UserDataWithState;
  eventData?: EventDataThunkable;
}

export type AnalyticsTrackAction = Action & {
  payload: TrackActionPayload;
}

export type AnalyticsTrackActionWithState = Action & {
  payload: TrackActionPayloadWithState;
}