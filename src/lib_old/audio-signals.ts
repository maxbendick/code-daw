import { AudioSignal } from './audio-signal'
import { Signal } from './signal'
import { Hz_, Number_, Phase_ } from './utility-types'

type OscillatorMaker = (freqHz: Hz_, phaseRadians?: Phase_) => AudioSignal

export const sine: OscillatorMaker = () => null as any
export const triangle: OscillatorMaker = () => null as any
export const square: OscillatorMaker = () => null as any
export const add = (
  a: Number_ | AudioSignal,
  b: Number_ | AudioSignal
): AudioSignal => null as any
export const mult = (
  a: Number_ | AudioSignal,
  b: Number_ | AudioSignal
): AudioSignal => null as any
export const sample: (
  signal: AudioSignal,
  sampleRateHz: Hz_
) => Signal<number> = null as any
