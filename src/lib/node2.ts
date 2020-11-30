import { AudioSignal } from './audio-signal'
import { MidiSignal } from './midi-signal'
import { Signal } from './signal'
import * as Signals from './signals'

export enum NodeType {
  Dial = 'dial',
  Output = 'output',
}

enum EdgeType {
  Signal = 'signal',
  AudioSignal = 'audioSignal',
  MidiSignal = 'midiSignal,',
}

type StringKeys<Value> = { [k: string]: Value }

// Arbitrary input types?
interface GraphNodeBaseType<
  Inputs extends StringKeys<Signal<any> | AudioSignal | MidiSignal>,
  Output,
  Config
> {
  nodeType: NodeType
  inputs: Inputs
  output: Output // usually a new empty signal?
  config: Config
}

// type for Signal?

export type DialNode = GraphNodeBaseType<
  {},
  Signal<number>,
  { start: number; end: number; defaultValue: number }
>
type MasterOutNode = GraphNodeBaseType<
  { audio: AudioSignal; testVolume: Signal<number> },
  {},
  {}
>

type GraphNode = DialNode | MasterOutNode

export type ConfigOf<G extends GraphNode> = G extends GraphNodeBaseType<
  any,
  any,
  infer Config
>
  ? Config
  : never
export type InputsOf<G extends GraphNode> = G extends GraphNodeBaseType<
  infer Inputs,
  any,
  any
>
  ? Inputs
  : never
export type OutputOf<G extends GraphNode> = G extends GraphNodeBaseType<
  any,
  infer Output,
  any
>
  ? Output
  : never

export class SignalGraph {
  private nodes = new Set<any>()

  addNode = (node: GraphNode) => {
    if (this.nodes.size > 100) {
      console.log('graph', this)
      console.log('trying to add', node)
      throw new Error('aborting addNode! too many nodes!')
    }
    this.nodes.add(node)
  }
}

type MakeSignalReturnerReturns<G extends GraphNode> = {
  nodeType: NodeType
  inputs: InputsOf<GraphNode>
  outputType: EdgeType
}

const makeSignalReturner = <A, Args extends any[], Config>(
  f: (...args: Args) => any,
) => {
  return (...args: Args) => {
    return Signals.of((1 as any) as A)
  }
}
