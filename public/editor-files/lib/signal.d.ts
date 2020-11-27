import { _Subscription, _SubscriptionLike } from './_subscription';
declare type SetupFn<A> = (set: (a: A) => void) => _SubscriptionLike;
export declare class Signal<A> {
    private listeners;
    private initialized;
    _signal: true;
    _curr: A;
    constructor(setupFn: SetupFn<A>);
    _set: (a: A) => void;
    _subscribe: (f: () => void) => _Subscription;
    _stealthSubscribe: (f: () => void) => _Subscription;
}
export declare type SignalEffect<A, B> = (signal: Signal<A>) => Signal<B>;
export {};
