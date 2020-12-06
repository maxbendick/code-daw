import { SuperDef } from './no-sig-types/super-def'
import { Node } from './node'

export class SignalGraph<Def extends SuperDef = any> {
  private nodes = new Set<Node<Def>>()

  addNode = (node: Node<Def>) => {
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

  get roots(): Set<Node<Def>> {
    const notInputted = new Set<string>()
    for (const node of this.nodes) {
      notInputted.add(node.id)
    }

    for (const node of this.nodes) {
      for (const inputId of Object.keys(node.inputIds)) {
        notInputted.delete(inputId)
      }
    }

    const result = new Set<Node<Def>>()
    for (const nodeId of notInputted) {
      result.add(this.getNode(nodeId)!)
    }

    return result
  }

  get leaves(): Set<Node<Def>> {
    const result = new Set<Node<Def>>()
    for (const node of this.nodes) {
      if (Object.keys(node.inputIds).length === 0) {
        console.log('found a leaf!')
        result.add(node)
      }
    }
    return result
  }

  get masterOut(): Node<Def> {
    for (const node of this.nodes) {
      if (node.type === 'io/masterOut') {
        return node
      }
    }
    throw new Error('no master out in graph!')
  }

  destroy = () => {
    console.warn('signal graph may need special cleanup')
  }
}
