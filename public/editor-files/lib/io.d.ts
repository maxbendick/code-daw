import { AudioSignal } from './audio-signal';
import { MidiSignal } from './midi-signal';
export declare const midiIn: (...x: any[]) => MidiSignal;
export declare const midiOut: (midiSignal: MidiSignal, ...x: any[]) => void;
export declare const audioIn: (...x: any[]) => AudioSignal;
export declare const audioOut: (audioSignal: AudioSignal, ...x: any[]) => void;
