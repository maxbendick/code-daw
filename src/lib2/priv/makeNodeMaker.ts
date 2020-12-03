import { AudioSignal, MidiSignal, Signal } from '../sigs'
import { GraphNodeEphemeral, NodeType } from './all-nodes'
import { GraphNodeBaseType } from './no-sig-types/graph-node-base-type'
import {
  ConfigOf,
  InputsOf,
  NodeTypeOf,
} from './no-sig-types/graph-node-ephemeral-utils'
import { StringKeys } from './no-sig-types/string-keys'
import { globalSignalGraph, Node } from './signal-graph'

// TODO
// const isInteractable = (t: NodeType) => getGraphNodeDefinition(t).interactable

type SigTypeInputsOf<G extends GraphNodeEphemeral> = {
  [k in keyof InputsOf<G>]: InputsOf<G>[k] extends 'signal'
    ? Signal<any>
    : InputsOf<G>[k] extends 'audioSignal'
    ? AudioSignal
    : InputsOf<G>[k] extends 'midiSignal'
    ? MidiSignal
    : never
}

export type NodeConstructor<G extends GraphNodeEphemeral> = {
  type: NodeTypeOf<G>
  inputs: SigTypeInputsOf<G> // InputsOf<G> //
  config: ConfigOf<G>
}

type SignalMakerInjected = {
  id: string
}

const nodeTypeToNextIndex = new Map<NodeType, number>()

const incrGetIndex = (t: NodeType) => {
  const currIndex = nodeTypeToNextIndex.get(t) ?? 0
  nodeTypeToNextIndex.set(t, currIndex + 1)
  return currIndex
}

// export const makeNodeMaker = <G extends GraphNodeEphemeral, Args extends any[]>(
export const makeNodeMaker = <
  G extends GraphNodeBaseType<any, any, any, any>,
  Args extends any[]
>(
  f: (injected: SignalMakerInjected, ...args: Args) => NodeConstructor<G>,
) => {
  return (...args: Args): Node<G> => {
    const id = Math.random().toString(36).substring(7)

    const injected: SignalMakerInjected = { id }

    const { type, inputs, config } = f(injected, ...args)

    const index = incrGetIndex(type as NodeType)

    const inputIds: StringKeys<string> = {}
    for (const [k, v] of Object.entries(inputs)) {
      inputIds[k] = ((v as any) as Node<G>).id!
    }

    let result: Node<G> = {
      id,
      type,
      inputIds,
      config,
      index,
      lastObservedCompiledLineNumber: (window as any).codeDawCurrentLineNumber,
    }

    globalSignalGraph.addNode(result)

    return result
  }
}
