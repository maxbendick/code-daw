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

  getNode = (id: string) => {
    for (const n of this.nodes) {
      if (n.id === id) {
        return n
      }
    }
    throw new Error(`could not getNode ${id}`)
  }

  get roots(): Set<Node<any>> {
    const notInputted = new Set<string>()
    for (const node of this.nodes) {
      notInputted.add(node.id)
    }

    for (const node of this.nodes) {
      for (const inputId of Object.keys(node.inputIds)) {
        notInputted.delete(inputId)
      }
    }

    const result = new Set<Node<any>>()
    for (const nodeId of notInputted) {
      result.add(this.getNode(nodeId)!)
    }

    return result
  }

  get leaves(): Set<Node<any>> {
    const result = new Set<Node<any>>()
    for (const node of this.nodes) {
      if (Object.keys(node.inputIds).length === 0) {
        console.log('found a leaf!')
        result.add(node)
      }
    }
    return result
  }

  get masterOut(): Node<any> {
    for (const node of this.nodes) {
      if (node.type === 'io/masterOut') {
        return node
      }
    }
    throw new Error('no master out in graph!')
  }
}

export const globalSignalGraph = new SignalGraph()
;(window as any).globalSignalGraph = globalSignalGraph

export type Node<Def> = any
// export type Node<Def extends BaseSuperDef> = {
//   id: string
//   type: Def['nodeType']
//   inputIds: StringKeys<string>
//   config: SuperConfig<Def>
//   index: number
//   lastObservedCompiledLineNumber: number
// }
