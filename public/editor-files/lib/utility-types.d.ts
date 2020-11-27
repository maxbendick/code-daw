import { Signal } from './signal';
export declare type SignalLike<A> = A | Signal<A>;
export declare type Number_ = SignalLike<number>;
export declare type Hz = number;
export declare type Hz_ = SignalLike<Hz>;
export declare type Radians = number;
export declare type Phase_ = SignalLike<Radians>;
export declare type Percent = number;
export declare type Percent_ = SignalLike<Percent>;
