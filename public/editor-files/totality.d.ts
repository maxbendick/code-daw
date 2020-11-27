declare module "lib/_subscription" {
    export type _SubscriptionLike = void | null | undefined | (() => void) | _Subscription;
    export class _Subscription {
        constructor(subscriptionLike?: _SubscriptionLike);
        unsubscribe: () => void;
        combine: (other: _Subscription) => _Subscription;
    }
}
declare module "lib/audio-signal" {
    export type AudioSignal = {
        _audioSignal: true;
    };
    export type AudioEffect = (input: AudioSignal) => AudioSignal;
}
declare module "lib/signal" {
    import { _Subscription, _SubscriptionLike } from "lib/_subscription";
    type SetupFn<A> = (set: (a: A) => void) => _SubscriptionLike;
    export class Signal<A> {
        private listeners;
        private initialized;
        _signal: true;
        _curr: A;
        constructor(setupFn: SetupFn<A>);
        _set: (a: A) => void;
        _subscribe: (f: () => void) => _Subscription;
        _stealthSubscribe: (f: () => void) => _Subscription;
    }
    export type SignalEffect<A, B> = (signal: Signal<A>) => Signal<B>;
}
declare module "lib/utility-types" {
    import { Signal } from "lib/signal";
    export type SignalLike<A> = A | Signal<A>;
    export type Number_ = SignalLike<number>;
    export type Hz = number;
    export type Hz_ = SignalLike<Hz>;
    export type Radians = number;
    export type Phase_ = SignalLike<Radians>;
    export type Percent = number;
    export type Percent_ = SignalLike<Percent>;
}
declare module "lib/audio-effects" {
    import { AudioEffect, AudioSignal } from "lib/audio-signal";
    import { Number_, SignalLike } from "lib/utility-types";
    export const reverb: (roomSize?: number | import("lib/signal").Signal<number> | undefined) => AudioEffect;
    export const gain: (gain: Number_) => AudioEffect;
    export const fm: (modulator: AudioSignal | Number_) => AudioEffect;
    export const fmSwap: (carrier: AudioSignal) => AudioEffect;
    export const mult: (a: Number_ | AudioSignal) => AudioEffect;
    export const add: (a: Number_ | AudioSignal) => AudioEffect;
    export const gate: (a: SignalLike<boolean>) => AudioEffect;
}
declare module "lib/audio-signals" {
    import { AudioSignal } from "lib/audio-signal";
    import { Signal } from "lib/signal";
    import { Hz_, Number_, Phase_ } from "lib/utility-types";
    type OscillatorMaker = (freqHz: Hz_, phaseRadians?: Phase_) => AudioSignal;
    export const sine: OscillatorMaker;
    export const triangle: OscillatorMaker;
    export const square: OscillatorMaker;
    export const add: (a: Number_ | AudioSignal, b: Number_ | AudioSignal) => AudioSignal;
    export const mult: (a: Number_ | AudioSignal, b: Number_ | AudioSignal) => AudioSignal;
    export const sample: (signal: AudioSignal, sampleRateHz: Hz_) => Signal<number>;
}
declare module "lib/midi-signal" {
    export type MidiSignal = {
        _midiSignal: true;
    };
}
declare module "lib/signals" {
    import { Signal } from "lib/signal";
    import { Number_, SignalLike } from "lib/utility-types";
    export const of: <A>(a: A) => Signal<A>;
    export const from: <A>(a: SignalLike<A>) => Signal<A>;
    export const add: (a: Number_, b: Number_) => Signal<number>;
    export const mult: (a: Number_, b: Number_) => Signal<number>;
    export const periodic: (...args: any) => (...args: any) => Signal<number>;
    export const sine: (...args: any) => Signal<number>;
    export const triangle: (...args: any) => Signal<number>;
    export const square: (...args: any) => Signal<number>;
    export const map: <A, B>(f: (a: A) => B, a: Signal<A>) => Signal<B>;
    export const combineMap: <A, B, C>(f: (a: A, b: B) => C, a: Signal<A>, b: Signal<B>) => Signal<C>;
    export const combine3: <A, B, C, D>(f: (a: A, b: B, c: C) => D, a: Signal<A>, b: Signal<B>, c: Signal<C>) => Signal<D>;
    export const pair: <A, B>(a: Signal<A>, b: Signal<B>) => Signal<[A, B]>;
}
declare module "lib/interactables" {
    import { AudioSignal } from "lib/audio-signal";
    import { MidiSignal } from "lib/midi-signal";
    import { Signal } from "lib/signal";
    import { Number_ } from "lib/utility-types";
    export const dial: (config: {
        start: Number_;
        end: Number_;
        default: Number_;
    }) => Signal<number>;
    export const polySine: (midiSignal: MidiSignal) => AudioSignal;
    export const toggle: (config: {
        default: boolean;
    }) => Signal<boolean>;
    type MixerInputConfig = unknown;
    interface MixerInputs {
        [name: string]: AudioSignal | MixerInputConfig;
    }
    export const mixer: (inputs: MixerInputs) => AudioSignal;
    export const switcher: <A extends string | number | {
        label: string | number;
    }>(options: Iterable<A>) => Signal<A>;
}
declare module "lib/io" {
    import { AudioSignal } from "lib/audio-signal";
    import { MidiSignal } from "lib/midi-signal";
    export const midiIn: (...x: any[]) => MidiSignal;
    export const midiOut: (midiSignal: MidiSignal, ...x: any[]) => void;
    export const audioIn: (...x: any[]) => AudioSignal;
    export const audioOut: (audioSignal: AudioSignal, ...x: any[]) => void;
}
declare module "lib/pipe" {
    type UnaryFunction<A, B> = (a: A) => B;
    export function pipe<T>(): UnaryFunction<T, T>;
    export function pipe<T, A>(fn1: UnaryFunction<T, A>): UnaryFunction<T, A>;
    export function pipe<T, A, B>(fn1: UnaryFunction<T, A>, fn2: UnaryFunction<A, B>): UnaryFunction<T, B>;
    export function pipe<T, A, B, C>(fn1: UnaryFunction<T, A>, fn2: UnaryFunction<A, B>, fn3: UnaryFunction<B, C>): UnaryFunction<T, C>;
    export function pipe<T, A, B, C, D>(fn1: UnaryFunction<T, A>, fn2: UnaryFunction<A, B>, fn3: UnaryFunction<B, C>, fn4: UnaryFunction<C, D>): UnaryFunction<T, D>;
    export function pipe<T, A, B, C, D, E>(fn1: UnaryFunction<T, A>, fn2: UnaryFunction<A, B>, fn3: UnaryFunction<B, C>, fn4: UnaryFunction<C, D>, fn5: UnaryFunction<D, E>): UnaryFunction<T, E>;
    export function pipe<T, A, B, C, D, E, F>(fn1: UnaryFunction<T, A>, fn2: UnaryFunction<A, B>, fn3: UnaryFunction<B, C>, fn4: UnaryFunction<C, D>, fn5: UnaryFunction<D, E>, fn6: UnaryFunction<E, F>): UnaryFunction<T, F>;
    export function pipe<T, A, B, C, D, E, F, G>(fn1: UnaryFunction<T, A>, fn2: UnaryFunction<A, B>, fn3: UnaryFunction<B, C>, fn4: UnaryFunction<C, D>, fn5: UnaryFunction<D, E>, fn6: UnaryFunction<E, F>, fn7: UnaryFunction<F, G>): UnaryFunction<T, G>;
    export function pipe<T, A, B, C, D, E, F, G, H>(fn1: UnaryFunction<T, A>, fn2: UnaryFunction<A, B>, fn3: UnaryFunction<B, C>, fn4: UnaryFunction<C, D>, fn5: UnaryFunction<D, E>, fn6: UnaryFunction<E, F>, fn7: UnaryFunction<F, G>, fn8: UnaryFunction<G, H>): UnaryFunction<T, H>;
    export function pipe<T, A, B, C, D, E, F, G, H, I>(fn1: UnaryFunction<T, A>, fn2: UnaryFunction<A, B>, fn3: UnaryFunction<B, C>, fn4: UnaryFunction<C, D>, fn5: UnaryFunction<D, E>, fn6: UnaryFunction<E, F>, fn7: UnaryFunction<F, G>, fn8: UnaryFunction<G, H>, fn9: UnaryFunction<H, I>): UnaryFunction<T, I>;
    export function pipe<T, A, B, C, D, E, F, G, H, I>(fn1: UnaryFunction<T, A>, fn2: UnaryFunction<A, B>, fn3: UnaryFunction<B, C>, fn4: UnaryFunction<C, D>, fn5: UnaryFunction<D, E>, fn6: UnaryFunction<E, F>, fn7: UnaryFunction<F, G>, fn8: UnaryFunction<G, H>, fn9: UnaryFunction<H, I>, ...fns: UnaryFunction<any, any>[]): UnaryFunction<T, {}>;
}
declare module "lib/signal-effects" {
    import { SignalEffect } from "lib/signal";
    import { Number_ } from "lib/utility-types";
    export const map: <A, B>(f: (a: A) => B) => SignalEffect<A, B>;
    export const mult: (a: Number_) => SignalEffect<number, number>;
}
declare module "lib/signal-transport" {
    import { Signal } from "lib/signal";
    import { _Subscription } from "lib/_subscription";
    export const SignalTransport: {
        curr: number;
        onSignalTick: (t: number) => _Subscription;
        tick: Signal<number>;
    };
}
