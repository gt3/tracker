import { AnyAction } from 'redux';
import { flatten1 } from '@csod-oss/tracker-common/build/utils';

export type DispatchBufferActionType = AnyAction | AnyAction[] | null | void;

export type DispatchBufferType<T = DispatchBufferActionType> = {
  bufferActions: (...pactions: Promise<T>[]) => number;
  reset: () => void;
  resolveBufferedActions: () => Promise<T[]>;
};

export class DispatchBuffer implements DispatchBufferType {
  private _pactions: Promise<DispatchBufferActionType>[] = [];

  bufferActions = (...pactions: Promise<DispatchBufferActionType>[]) => this._pactions.push(...pactions);

  reset = () => (this._pactions = []);

  resolveBufferedActions = () => {
    const pactions = this._pactions;
    this.reset();
    if (pactions.length == 0) return Promise.resolve([]);
    return Promise.all(pactions)
      .then(actions => flatten1(actions))
      .then(actions => actions.filter(Boolean));
  };
}
