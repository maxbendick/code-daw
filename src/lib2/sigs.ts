export interface AudioSignal {
  _audioSignal: true
}
export interface Signal<A> {
  _signal: true
}
export interface MidiSignal {
  _midiSignal: true
}

export type AnySig = AudioSignal | Signal<any> | MidiSignal
