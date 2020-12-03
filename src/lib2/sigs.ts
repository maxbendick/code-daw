export type AudioSignal = {
  output: 'audioSignal'
}

export interface Signal<A> {
  output: 'signal'
}
export interface MidiSignal {
  output: 'midiSignal'
}

export type AnySig = AudioSignal | Signal<any> | MidiSignal
