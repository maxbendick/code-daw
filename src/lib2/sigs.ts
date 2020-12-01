// import { GraphNodeBaseType } from "./priv/graph-node-base-type";

// export interface AudioSignal {
//   output: 'signal'
// }

export type AudioSignal = {
  _audioSignal: true
} // GraphNodeBaseType<any, any, any, any>

export interface Signal<A> {
  _signal: true
}
export interface MidiSignal {
  _midiSignal: true
}

export type AnySig = AudioSignal | Signal<any> | MidiSignal

// export type GraphNodeBaseType<
//   NodeT extends string, // NodeType,
//   Inputs extends StringKeys<Signal<any> | AudioSignal | MidiSignal>,
//   Output extends Signal<any> | AudioSignal | MidiSignal | null, // could loosen this to include arrays of signal|audiosignal|midisignal
//   Config
// > = {
//   nodeType: NodeT
//   inputs: Inputs
//   output: Output // usually a new empty signal?
//   config: Config
// }
