import { SerializeableRecord, SerializeablePrimitives, Serializable, ValueThunk } from './types.generic';

export type EventName = string;

export type EventData<T extends EventName = EventName> = SerializeableRecord<SerializeablePrimitives> & {
  eventName: T;
};

export type EventDataThunkable<T extends EventName = EventName> = {
  eventName: T;
  [key: string]: Serializable | ValueThunk<Serializable>;
};

export type UserData = SerializeableRecord<SerializeablePrimitives> & {
  userId?: string | null;
};

export type UserDataThunkable = {
  [key: string]: Serializable | ValueThunk<Serializable>;
};
