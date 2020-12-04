import { NodeType } from './all-nodes'
import { StringKeys } from './no-sig-types/string-keys'
import { BaseSuperDef } from './no-sig-types/super-def'
import { globalSignalGraph, Node } from './signal-graph'

// TODO
// const isInteractable = (t: NodeType) => getGraphNodeDefinition(t).interactable

type SigTypeInputsOf<G> = any
// type SigTypeInputsOf<G extends GraphNodeEphemeral> = {
//   [k in keyof InputsOf<G>]: InputsOf<G>[k] extends 'signal'
//     ? Signal<any>
//     : InputsOf<G>[k] extends 'audioSignal'
//     ? AudioSignal
//     : InputsOf<G>[k] extends 'midiSignal'
//     ? MidiSignal
//     : never
// }

export type NodeConstructor<G> = any
// export type NodeConstructor<G extends GraphNodeEphemeral> = {
//   type: NodeTypeOf<G>
//   inputs: SigTypeInputsOf<G> // InputsOf<G> //
//   config: ConfigOf<G>
// }

export type SuperNodeConstructor<Def extends BaseSuperDef> = {
  // type: Def['nodeType']
  // inputs: Def['inputs']
  // config: SuperConfig<Def>
  type: any
  inputs: any
  config: any
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
  f: (injected: SignalMakerInjected, ...args: Args) => NodeConstructor<any>,
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
