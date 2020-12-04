import { StringKeys } from './no-sig-types/string-keys'
import { SuperDef } from './no-sig-types/super-def'
import { Node, SignalGraph } from './signal-graph'

const makeNodeMakerCopy = null as any

const nodeTypeToNextIndex = new Map<string, number>()

const incrGetIndex = (t: string) => {
  const currIndex = nodeTypeToNextIndex.get(t) ?? 0
  nodeTypeToNextIndex.set(t, currIndex + 1)
  return currIndex
}

export const makePublicFunction = <Def extends SuperDef, Args extends any[]>(
  def: Def,
  signalGraph: SignalGraph,
) => {
  return (...args: Args): Node<Def> => {
    const id = Math.random().toString(36).substring(7)

    const type = def.nodeType
    const inputs = def.argsToInputs(...args)
    const config = def.argsToConfig(...args)

    const index = incrGetIndex(type)

    const inputIds: StringKeys<string> = {}
    for (const [k, v] of Object.entries(inputs)) {
      inputIds[k] = ((v as any) as Node<any>).id!
    }

    let result: Node<Def> = {
      id,
      type,
      inputIds,
      config,
      index,
      lastObservedCompiledLineNumber: (window as any).codeDawCurrentLineNumber,
    }

    signalGraph.addNode(result)

    return result
  }
}

// export const makePublicFunction = <Def extends SuperDef>(def: Def) =>
//   makeNodeMakerCopy(({ id }: any, ...args: any) => {
//     return {
//       type: def.nodeType,
//       inputs: def.argsToInputs(...args),
//       config: def.argsToConfig(...args),
//     }
//   })
