import { AnyAction } from 'redux';
import { ActionCreators } from './actions';
import { flatten1 } from '@csod-oss/tracker-common/build/utils';

export type BufferedActionReturnTypes = AnyAction | AnyAction[] | null | void;

export type DispatchBufferType<T = BufferedActionReturnTypes> = {
  getBufferedActions: () => Promise<T>[];
  bufferDispatch: (...pactions: Promise<T>[]) => number;
  reset: () => void;
  processBufferedActions: (next: any) => void;
};

export class DispatchBuffer implements DispatchBufferType {
  private _pactions: Promise<BufferedActionReturnTypes>[] = [];
  private _store: { dispatch: any; getState: any };
  private _ac: ActionCreators;

  constructor(store: { dispatch: any; getState: any }, ac: ActionCreators) {
    this._store = store;
    this._ac = ac;
  }

  getBufferedActions = () => this._pactions;

  bufferDispatch = (...pactions: Promise<BufferedActionReturnTypes>[]) => this._pactions.push(...pactions);

  reset = () => (this._pactions = []);

  processBufferedActions = (next: any) => {
    const { bufferedActions } = this._ac.internal;
    const pactions = this._pactions;
    this.reset();
    if (pactions.length > 0) {
      Promise.all(pactions)
        .then(actions => flatten1(actions))
        .then(actions => actions.filter(Boolean))
        .then(actions => {
          if (!actions || actions.length === 0) return;
          actions.forEach((a: AnyAction) => this._store.dispatch(a));
          if (actions.length == 1) {
            next(actions[0]);
          } else {
            next(bufferedActions(actions));
          }
        });
    }
  };
}
