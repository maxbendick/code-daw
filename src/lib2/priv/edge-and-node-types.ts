import { AudioSignal, MidiSignal, Signal } from '../sigs'

export type EdgeType = 'signal' | 'audioSignal' | 'midiSignal'
export const EdgeType = {
  Signal: 'signal' as const,
  AudioSignal: 'audioSignal' as const,
  MidiSignal: 'midiSignal' as const,
}

export type EdgeToSigT<EdgeType> = EdgeType extends typeof EdgeType.Signal
  ? Signal<any>
  : EdgeType extends typeof EdgeType.AudioSignal
  ? AudioSignal
  : EdgeType extends typeof EdgeType.MidiSignal
  ? MidiSignal
  : never

export type SigToEdgeType<SigT> = SigT extends Signal<any>
  ? typeof EdgeType.Signal
  : SigT extends AudioSignal
  ? typeof EdgeType.AudioSignal
  : SigT extends MidiSignal
  ? typeof EdgeType.MidiSignal
  : never
