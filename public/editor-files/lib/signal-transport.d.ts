import { Signal } from './signal';
import { _Subscription } from './_subscription';
export declare const SignalTransport: {
    curr: number;
    onSignalTick: (t: number) => _Subscription;
    tick: Signal<number>;
};
