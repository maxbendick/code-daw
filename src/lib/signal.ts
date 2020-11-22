import { _Subscription, _SubscriptionLike } from './_subscription';

type SetupFn<A> = (set: (a: A) => void) => _SubscriptionLike;

export class Signal<A> {
  private listeners = new Set<() => void>();
  private initialized = false;

  _signal = true as const;
  _curr: A = null as any;

  constructor(setupFn: SetupFn<A>) {
    setupFn((a: A) => this._set(a));
    if (!this.initialized) {
      throw new Error('Must call set synchronously when constructing Signal');
    }
  }

  _set = (a: A) => {
    this.initialized = true;
    this._curr = a;
    this.listeners.forEach(listener => listener());
  };

  _subscribe = (f: () => void): _Subscription => {
    const fCopy = () => f();
    fCopy();
    this.listeners.add(fCopy);
    return new _Subscription(() => this.listeners.delete(fCopy));
  };

  _stealthSubscribe = (f: () => void) => {
    const fCopy = () => f();
    this.listeners.add(fCopy);
    return new _Subscription(() => this.listeners.delete(fCopy));
  };
}

export type SignalEffect<A, B> = (signal: Signal<A>) => Signal<B>;
