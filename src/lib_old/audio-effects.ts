import { AudioEffect, AudioSignal } from './audio-signal'
import { Number_, SignalLike } from './utility-types'

export const reverb = (roomSize?: Number_): AudioEffect => () => null as any
export const gain = (gain: Number_): AudioEffect => () => null as any
export const fm = (modulator: AudioSignal | Number_): AudioEffect => () =>
  null as any
export const fmSwap = (carrier: AudioSignal): AudioEffect => () => null as any
export const mult = (a: Number_ | AudioSignal): AudioEffect => () => null as any
export const add = (a: Number_ | AudioSignal): AudioEffect => () => null as any
export const gate = (a: SignalLike<boolean>): AudioEffect => () => null as any
