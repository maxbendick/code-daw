// export type GraphNodeBaseType<
//   NodeT extends string, // NodeType,
//   Inputs extends StringKeys<EdgeType>,
//   Output extends EdgeType | null, // could loosen this to include arrays of signal|audiosignal|midisignal
//   Config
// > = {
//   nodeType: NodeT
//   inputs: Inputs
//   output: Output // usually a new empty signal?
//   config: Config
// }

export interface GraphNodeBaseType {}
