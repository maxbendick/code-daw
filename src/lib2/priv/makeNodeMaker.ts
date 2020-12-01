import { GraphNodeEphemeral, NodeType } from './all-nodes'
import { ConfigOf, InputsOf, NodeTypeOf } from './graph-node-ephemeral-utils'
import { Node, SignalGraph } from './signal-graph'
import { StringKeys } from './string-keys'

// TODO
// const isInteractable = (t: NodeType) => getGraphNodeDefinition(t).interactable

// TODO
// const getBusFromWindow = (t: NodeType, index: number): Bus<any, any> => {
//   //  const bus: Bus<any, any> = (window as any).buses?.dials?.[index]
//   return null as any
// }

export type NodeConstructor<G extends GraphNodeEphemeral> = {
  type: NodeTypeOf<G>
  inputs: InputsOf<G>
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

export const makeNodeMaker = <G extends GraphNodeEphemeral, Args extends any[]>(
  graph: SignalGraph,
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

    graph.addNode(result)

    return result
  }
}
