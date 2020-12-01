import { EdgeType } from '../priv/edge-and-node-types'
import { GraphNodeDefinition } from '../priv/graph-node-definition'
import { makeNodeMaker } from '../priv/makeNodeMaker'
import { Signal } from '../sigs'

export const dialNodeType = 'dial' as const

export type DialConfig = {
  start: number
  end: number
  defaultValue: number
}

export type DialNodeEphemeral = {
  nodeType: typeof dialNodeType
  inputs: {}
  output: Signal<number> // usually a new empty signal?
  config: DialConfig
}

export const dialGraphNodeDefinition: GraphNodeDefinition<DialNodeEphemeral> = {
  nodeType: dialNodeType,
  inputs: {},
  output: EdgeType.Signal,
}

const dialRaw = makeNodeMaker<DialNodeEphemeral, [config: DialConfig]>(
  null as any,
  ({ id }, config) => {
    return {
      type: dialNodeType,
      inputs: {},
      config,
    }
  },
)

// TODO better typing
export const dial: (config: DialConfig) => Signal<number> = dialRaw as any
