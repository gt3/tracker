import { SerializeableRecord, SerializeablePrimitives, Serializable, ValueThunk } from './types.generic';

export type EventData = SerializeableRecord<SerializeablePrimitives> & {
  eventName: string;
};

export type EventDataThunkable =
  | ValueThunk<EventData>
  | {
      eventName: string;
      [key: string]: Serializable | ValueThunk<Serializable>;
    };

export type UserData = SerializeableRecord<SerializeablePrimitives> & {
  userId?: string | null;
};

export type UserDataThunkable =
  | ValueThunk<UserData>
  | {
      [key: string]: Serializable | ValueThunk<Serializable>;
    };
