import { AudioSignal } from '../audio-signal'
import { MidiSignal } from '../midi-signal'
import { Signal } from '../signal'
import { StringKeys } from './string-keys'

export type GraphNodeBaseType<
  NodeT extends string, // NodeType,
  Inputs extends StringKeys<Signal<any> | AudioSignal | MidiSignal>,
  Output extends Signal<any> | AudioSignal | MidiSignal | null, // could loosen this to include arrays of signal|audiosignal|midisignal
  Config
> = {
  nodeType: NodeT
  inputs: Inputs
  output: Output // usually a new empty signal?
  config: Config
}

// export interface GraphNodeInteractableBaseType<
//   NodeT extends string, // NodeType,
//   Inputs extends StringKeys<Signal<any> | AudioSignal | MidiSignal>,
//   Output extends Signal<any> | AudioSignal | MidiSignal | null, // could loosen this to include arrays of signal|audiosignal|midisignal
//   Config,
//   Sends,
//   Receives
// > extends GraphNodeBaseType<NodeT, Inputs, Output, Config> {
//   sends: Sends
//   Receives: Receives
// }
