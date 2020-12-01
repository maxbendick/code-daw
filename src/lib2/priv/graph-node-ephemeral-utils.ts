import { GraphNodeEphemeral } from './all-nodes'
import { SigToEdgeType } from './edge-and-node-types'
import { GraphNodeBaseType } from './graph-node-base-type'

export type ConfigOf<
  G extends GraphNodeEphemeral
> = G extends GraphNodeBaseType<any, any, any, infer Config> ? Config : never

export type InputsOf<
  G extends GraphNodeEphemeral
> = G extends GraphNodeBaseType<any, infer Inputs, any, any> ? Inputs : never

export type InputEdgeTypesOf<G extends GraphNodeEphemeral> = {
  [k in keyof InputsOf<G>]: SigToEdgeType<InputsOf<G>[k]>
}

export type OutputOf<
  G extends GraphNodeEphemeral
> = G extends GraphNodeBaseType<any, any, infer Output, any> ? Output : never

export type NodeTypeOf<
  G extends GraphNodeEphemeral
> = G extends GraphNodeBaseType<infer NodeT, any, any, any> ? NodeT : never
