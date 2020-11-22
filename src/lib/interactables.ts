import { AudioSignal } from './audio-signal';
import { MidiSignal } from './midi-signal';
import { Signal } from './signal';
import * as Signals from './signals';
import { Number_ } from './utility-types';

export const dial: (config: {
  start: Number_;
  end: Number_;
  default: Number_;
}) => Signal<number> = () => Signals.of(1) as any;

export const polySine: (midiSignal: MidiSignal) => AudioSignal = () =>
  null as any;

export const toggle: (config: { default: boolean }) => Signal<boolean> = () =>
  null as any;

type MixerInputConfig = unknown;
interface MixerInputs {
  [name: string]: AudioSignal | MixerInputConfig;
}

export const mixer: (inputs: MixerInputs) => AudioSignal = () => null as any;

const show: <A>(a: A) => A = null as any; // shows a UI element when it otherwise wouldn't be shown, like when a dial is referenced

/*
  Show buttons in UI
  API?
*/
export const switcher = <
  A extends number | string | { label: string | number }
>(
  options: Iterable<A>
): Signal<A> => {
  return null as any;
};

// const dropdown = switcher; // could include another style
