import { AudioSignal, MidiSignal, Signal } from '../sigs'
import { EdgeType } from './no-sig-types/edge-types'

export type EdgeTypeToSigType<S extends EdgeType> = S extends 'signal'
  ? Signal<any>
  : S extends 'audioSignal'
  ? AudioSignal
  : S extends 'midiSignal'
  ? MidiSignal
  : never

export type SigTypeToEdgeType<S> = S extends Signal<any>
  ? 'signal'
  : S extends AudioSignal
  ? 'audioSignal'
  : S extends MidiSignal
  ? 'midiSignal'
  : never
