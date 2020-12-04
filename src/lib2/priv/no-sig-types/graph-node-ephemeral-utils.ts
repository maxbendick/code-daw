export type ConfigOf<G> = any
export type InputsOf<G> = any
export type OutputOf<G> = any
export type NodeTypeOf<G> = any
export type InputEdgeTypesOf<G> = any

// export type ConfigOf<
//   G extends GraphNodeEphemeral
// > = G extends GraphNodeBaseType<any, any, any, infer Config> ? Config : never

// export type InputsOf<
//   G extends GraphNodeEphemeral
// > = G extends GraphNodeBaseType<any, infer Inputs, any, any> ? Inputs : never

// export type OutputOf<
//   G extends GraphNodeEphemeral
// > = G extends GraphNodeBaseType<any, any, infer Output, any> ? Output : never

// export type NodeTypeOf<
//   G extends GraphNodeEphemeral
// > = G extends GraphNodeBaseType<infer NodeT, any, any, any> ? NodeT : never

// export type InputEdgeTypesOf<G extends GraphNodeEphemeral> = {
//   [k in keyof InputsOf<G>]: SigTypeToEdgeType<InputsOf<G>[k]>
// }
