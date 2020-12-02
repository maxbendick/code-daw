import { GraphNodeEphemeral } from './all-nodes'
import { ConfigOf, NodeTypeOf } from './no-sig-types/graph-node-ephemeral-utils'
import { StringKeys } from './no-sig-types/string-keys'

export class SignalGraph {
  private nodes = new Set<Node<any>>()

  addNode = (node: Node<any>) => {
    if (this.nodes.size > 100) {
      console.log('graph', this)
      console.log('trying to add', node)
      throw new Error('aborting addNode! too many nodes!')
    }
    this.nodes.add(node)
  }

  get roots() {
    const notInputted = new Set<string>()
    for (const node of this.nodes) {
      notInputted.add(node.id)
    }

    for (const node of this.nodes) {
      for (const inputId of Object.keys(node.inputIds)) {
        notInputted.delete(inputId)
      }
    }

    return notInputted
  }
}

export type Node<G extends GraphNodeEphemeral> = {
  id: string
  type: NodeTypeOf<G>
  inputIds: StringKeys<string>
  config: ConfigOf<G>
  index: number
  lastObservedCompiledLineNumber: number
}

export const globalSignalGraph = new SignalGraph()
;(window as any).globalSignalGraph = globalSignalGraph
