import { AudioEffect, AudioSignal } from './audio-signal'
import { Number_, SignalLike } from './utility-types'
export declare const reverb: (
  roomSize?: number | import('./signal').Signal<number> | undefined,
) => AudioEffect
export declare const gain: (gain: Number_) => AudioEffect
export declare const fm: (modulator: AudioSignal | Number_) => AudioEffect
export declare const fmSwap: (carrier: AudioSignal) => AudioEffect
export declare const mult: (a: Number_ | AudioSignal) => AudioEffect
export declare const add: (a: Number_ | AudioSignal) => AudioEffect
export declare const gate: (a: SignalLike<boolean>) => AudioEffect
