import { AudioSignal } from './audio-signal';
import { MidiSignal } from './midi-signal';
import { Signal } from './signal';
import { Number_ } from './utility-types';
export declare const dial: (config: {
    start: Number_;
    end: Number_;
    default: Number_;
}) => Signal<number>;
export declare const polySine: (midiSignal: MidiSignal) => AudioSignal;
export declare const toggle: (config: {
    default: boolean;
}) => Signal<boolean>;
declare type MixerInputConfig = unknown;
interface MixerInputs {
    [name: string]: AudioSignal | MixerInputConfig;
}
export declare const mixer: (inputs: MixerInputs) => AudioSignal;
export declare const switcher: <A extends string | number | {
    label: string | number;
}>(options: Iterable<A>) => Signal<A>;
export {};
