export type SerializeablePrimitives = string | null | undefined | boolean | number;

export interface SerializeableRecord<T> {
  [key: string]: T | SerializeableRecord<T> | Array<T | SerializeableRecord<T>>
}

export type Serializable = SerializeablePrimitives | SerializeableRecord<SerializeablePrimitives> | Array<SerializeablePrimitives | SerializeableRecord<SerializeablePrimitives>>;

export type ValueThunk<T> = (state: any) => T;