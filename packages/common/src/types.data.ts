import { SerializeableRecord, SerializeablePrimitives, Serializable, ValueThunk } from './types.generic';

export type EventData = SerializeableRecord<SerializeablePrimitives> & {
  eventName: string;
};

export type EventDataThunkable = {
  eventName: string;
  [key: string]: Serializable | ValueThunk<Serializable>;
};

export type UserData = SerializeableRecord<SerializeablePrimitives> & {
  userId?: string | null;
};

export type UserDataThunkable = {
  [key: string]: Serializable | ValueThunk<Serializable>;
};
