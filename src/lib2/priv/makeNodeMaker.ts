import { NodeType } from './all-nodes'
import { StringKeys } from './no-sig-types/string-keys'
import { globalSignalGraph, Node } from './signal-graph'

export type NodeConstructor = {
  type: NodeType
  inputs: StringKeys<any>
  config: StringKeys<any>
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

export const makeNodeMaker = <Args extends any[]>(
  f: (injected: SignalMakerInjected, ...args: Args) => NodeConstructor,
) => {
  return (...args: Args): Node<any> => {
    const id = Math.random().toString(36).substring(7)

    const injected: SignalMakerInjected = { id }

    const { type, inputs, config } = f(injected, ...args)

    const index = incrGetIndex(type as NodeType)

    const inputIds: StringKeys<string> = {}
    for (const [k, v] of Object.entries(inputs)) {
      inputIds[k] = ((v as any) as Node<any>).id!
    }

    let result: Node<any> = {
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
