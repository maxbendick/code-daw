// TODO: figure out how to work with this
const nodeTypes = ['dial', 'output'] as const

type ValuesOf<T extends readonly any[]> = T[number]

// export type NodeType = ValuesOf<typeof nodeTypes>

// const edgeTypes = ['signal', 'audiosignal', 'midisignal']
// export type EdgeType = ValuesOf<typeof edgeTypes>

enum NodeType {
  Dial = 'dial',
  Output = 'output',
}

enum EdgeType {
  Signal = 'signal',
  AudioSignal = 'audioSignal',
  MidiSignal = 'midiSignal,',
}

// for every graph node
// not every node is interactable
// export interface GraphNode {
//   type: NodeType
//   inputs: any
//   outputs: any
// }

type StringKeys = { [k: string]: EdgeType }

interface GraphNodeBase<
  NodeT extends NodeType,
  Inputs extends { [k: string]: EdgeType },
  Outputs extends { [k: string]: EdgeType }
> {
  nodeType: NodeT
  inputs: Inputs
  outputs: Outputs
}

// type for Signal?

type DialNode = GraphNodeBase<NodeType.Dial, {}, { signalOut: EdgeType.Signal }>
type MasterOutNode = GraphNodeBase<
  NodeType.Output,
  { audio: EdgeType.AudioSignal; testVolume: EdgeType.Signal },
  {}
>

export const pmfnghkftkhj = 'fdgjdfgjfdgj'

// type GraphNode = any

type GraphNode = DialNode | MasterOutNode

type OutputsOf<G extends GraphNode> = G extends GraphNodeBase<
  any,
  any,
  infer Out
>
  ? Out
  : never
type InputsOf<G extends GraphNode> = G extends GraphNodeBase<any, infer In, any>
  ? In
  : never

type FilteredKeys<T, U> = {
  [P in keyof T]: T[P] extends U ? P : never
}[keyof T]

// type OutputsOfType<T extends EdgeType, G extends GraphNode> = {
//   [K in keyof OutputsOf<G>]: OutputsOf<G>[K] extends T ? T : never
// }

type OutputsOfType<T extends EdgeType, G extends GraphNode> = FilteredKeys<
  OutputsOf<G>,
  T
>
type InputsOfType<T extends EdgeType, G extends GraphNode> = FilteredKeys<
  InputsOf<G>,
  T
>

// type OutputsOfType<T extends EdgeType, G extends GraphNode> = {
//   [K in keyof FilteredKeys<OutputsOf<G>, T>]: OutputsOf<G>[K]
// }

type SuitableEdge<
  T extends EdgeType,
  InputNode extends GraphNode,
  SelfNode extends GraphNode
> = OutputsOf<InputNode> & InputsOf<SelfNode>

// type SignalDialOutputs = OutputsOfType<EdgeType.Signal, DialNode>

const ssss: OutputsOfType<EdgeType.Signal, DialNode> = 'signalOut'

type AddEdgeArgs<
  T extends EdgeType = never,
  In extends GraphNodeBase<any, any, any> = never,
  Out extends GraphNodeBase<any, any, any> = never
> = {
  inputNode: In
  inputOutput: OutputsOfType<T, In>
  outputNode: Out
  outputInput: InputsOfType<T, Out>
}

type Edge<
  T extends EdgeType = never,
  In extends GraphNodeBase<any, any, any> = never,
  Out extends GraphNodeBase<any, any, any> = never
> = {
  edgeType: T
  inputNode: In
  inputOutput: OutputsOfType<T, In>
  outputNode: Out
  outputInput: InputsOfType<T, Out>
}

class SignalGraph {
  private edges = new Set<Edge<any, any, any>>()

  registerSelf = (node: GraphNode) => {}

  addEdge = <
    T extends EdgeType = never,
    In extends GraphNodeBase<any, any, any> = never,
    Out extends GraphNodeBase<any, any, any> = never
  >(
    args: AddEdgeArgs<T, In, Out>,
  ) => {
    const edgeType1 = args.inputNode.outputs[args.inputOutput]
    const edgeType2 = args.outputNode.inputs[args.outputInput]

    if (edgeType1 !== edgeType2) {
      throw new Error('edge type mismatch!')
    }

    const edge: Edge<T, In, Out> = {
      ...args,
      edgeType: edgeType1,
    }

    this.edges.add(edge)
  }

  getChildren = (node: GraphNode) => {}

  has = (node: GraphNode) => false

  doo = (dial: DialNode, masterOut: MasterOutNode) => {
    this.addEdge<EdgeType.Signal, DialNode, MasterOutNode>({
      inputNode: dial,
      inputOutput: 'signalOut', // how to get this??? - one output only?? - yes, refactor to one output
      outputNode: masterOut,
      outputInput: 'testVolume',
    })
  }
}

// { audio: EdgeType.AudioSignal; testVolume: EdgeType.Signal },
//

/*

in a node creator: create child nodes, add them to graph with addChild

/** 
 * osc(effect(dial))
 *
 * effect has access to dial
 * osc has access to effect
 * 
 * mutation model? key-value access? start simple - no mutation.
 * */
