// import { AudioSignal } from '../audio-signal'
// import { MidiSignal } from '../midi-signal'
// import { Signal } from '../signal'
// import { NodeType } from './edge-and-node-types'
// import { StringKeys } from './string-keys'

// // Arbitrary input types?
// export type GraphNodeBaseType<
//   NodeT extends NodeType,
//   Inputs extends StringKeys<Signal<any> | AudioSignal | MidiSignal>,
//   Output extends Signal<any> | AudioSignal | MidiSignal | null, // could loosen this to include arrays of signal|audiosignal|midisignal
//   Config
// > = {
//   nodeType: NodeT
//   inputs: Inputs
//   output: Output // usually a new empty signal?
//   config: Config
// }

// // export type GraphNodeDefinition<G extends GraphNodeEphemeral> = {
// //   nodeType: NodeTypeOf<G>
// //   inputs: InputEdgeTypesOf<G>
// //   output: SigToEdgeType<OutputOf<G>>
// // }

// // const dialGraphNodeDefinition: GraphNodeDefinition<DialNodeEphemeral> = {
// //   nodeType: NodeType.Dial,
// //   inputs: {},
// //   output: EdgeType.Signal,
// // }

// // type for Signal?

// export type DialNodeEphemeral = GraphNodeBaseType<
//   typeof NodeType.Dial,
//   {},
//   Signal<number>,
//   { start: number; end: number; defaultValue: number }
// >
// type MasterOutNodeEphemeral = GraphNodeBaseType<
//   typeof NodeType.Output,
//   { audio: AudioSignal; testVolume: Signal<number> },
//   null, // not used
//   {}
// >

// type GraphNodeEphemeral = DialNodeEphemeral | MasterOutNodeEphemeral

// export type ConfigOf<
//   G extends GraphNodeEphemeral
// > = G extends GraphNodeBaseType<any, any, any, infer Config> ? Config : never
// export type InputsOf<
//   G extends GraphNodeEphemeral
// > = G extends GraphNodeBaseType<any, infer Inputs, any, any> ? Inputs : never

// export type InputEdgeTypesOf<G extends GraphNodeEphemeral> = {
//   [k in keyof InputsOf<G>]: SigToEdgeType<InputsOf<G>[k]>
// }

// export type OutputOf<
//   G extends GraphNodeEphemeral
// > = G extends GraphNodeBaseType<any, any, infer Output, any> ? Output : never

// export type NodeTypeOf<
//   G extends GraphNodeEphemeral
// > = G extends GraphNodeBaseType<infer NodeT, any, any, any> ? NodeT : never

// // export class SignalGraph {
// //   private nodes = new Set<any>()

// //   addNode = (node: Node<any>) => {
// //     if (this.nodes.size > 100) {
// //       console.log('graph', this)
// //       console.log('trying to add', node)
// //       throw new Error('aborting addNode! too many nodes!')
// //     }
// //     this.nodes.add(node)
// //   }
// // }

// // type Node<G extends GraphNodeEphemeral> = {
// //   id: string
// //   type: NodeTypeOf<G>
// //   inputIds: StringKeys<string>
// //   config: ConfigOf<G>
// //   interactable?: {
// //     index: number // dialIndex,
// //     compiledLineNumber: number
// //     bus?: Bus<any, any>
// //   }
// // }

// // type NodeConstructor<G extends GraphNodeEphemeral> = {
// //   type: NodeTypeOf<G>
// //   inputs: InputsOf<G>
// //   config: ConfigOf<G>
// // }

// // type SignalMakerInjected = {
// //   id: string
// //   // bus: Bus<any, any>
// // }

// // const nodeTypeToNextIndex = new Map<NodeType, number>()

// // const incrGetIndex = (t: NodeType) => {
// //   const currIndex = nodeTypeToNextIndex.get(t) ?? 0
// //   nodeTypeToNextIndex.set(t, currIndex + 1)
// //   return currIndex
// // }

// // // TODO
// // const isInteractable = (t: NodeType) => true

// // // TODO
// // const getBusFromWindow = (t: NodeType, index: number): Bus<any, any> => {
// //   //  const bus: Bus<any, any> = (window as any).buses?.dials?.[index]
// //   return null as any
// // }

// // export const makeNodeMaker = <G extends GraphNodeEphemeral, Args extends any[]>(
// //   graph: SignalGraph,
// //   f: (injected: SignalMakerInjected, ...args: Args) => NodeConstructor<G>,
// // ) => {
// //   return (...args: Args): Node<G> => {
// //     const id = Math.random().toString(36).substring(7)

// //     const injected: SignalMakerInjected = { id }

// //     const { type, inputs, config } = f(injected, ...args)

// //     const index = incrGetIndex(type)

// //     const inputIds: StringKeys<string> = {}
// //     for (const [k, v] of Object.entries(inputs)) {
// //       inputIds[k] = ((v as any) as Node<G>).id!
// //     }

// //     const result: Node<G> = {
// //       id,
// //       type,
// //       inputIds,
// //       config,
// //     }

// //     // add interactable based on node type
// //     if (isInteractable(type)) {
// //       const bus = getBusFromWindow(type, index)

// //       if (!bus) {
// //         console.warn('no bus registered for interactable', result)
// //       } else {
// //         bus.receive(message => {
// //           console.log('interactable received bus message', message)
// //         })
// //       }

// //       result.interactable = {
// //         index: index,
// //         compiledLineNumber: (window as any).codeDawCurrentLineNumber,
// //         bus: null as any,
// //       }
// //     }

// //     graph.addNode(result)

// //     return result
// //   }
// // }

// // const dial2 = makeNodeMaker<
// //   DialNodeEphemeral,
// //   [config: { start: number; end: number; defaultValue: number }]
// // >(null as any, ({ id }, config) => {
// //   return {
// //     type: NodeType.Dial,
// //     inputs: {},
// //     config,
// //   }
// // })

export const zpogdftdkrykdhfy = 'can prob delete this'
