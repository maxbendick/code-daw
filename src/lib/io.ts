import { AudioSignal } from './audio-signal';
import { MidiSignal } from './midi-signal';

export const midiIn = (...x: any[]): MidiSignal => null as any;
export const midiOut = (midiSignal: MidiSignal, ...x: any[]): void =>
  null as any;
export const audioIn = (...x: any[]): AudioSignal => null as any;
export const audioOut = (audioSignal: AudioSignal, ...x: any[]): void =>
  null as any;
