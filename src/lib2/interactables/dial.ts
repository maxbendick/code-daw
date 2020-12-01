import { EdgeType } from '../priv/edge-and-node-types'
import { GraphNodeInteractableBaseType } from '../priv/graph-node-base-type'
import { GraphNodeDefinition } from '../priv/graph-node-definition'
import { makeNodeMaker } from '../priv/makeNodeMaker'
import { Signal } from '../sigs'

export const dialNodeType = 'dial' as const

type DialSends = number
type DialReceives = number

export type DialConfig = {
  start: number
  end: number
  defaultValue: number
}

export type DialNodeEphemeral = GraphNodeInteractableBaseType<
  typeof dialNodeType,
  {},
  Signal<number>,
  DialConfig,
  DialSends,
  DialReceives
>

export const dialGraphNodeDefinition: GraphNodeDefinition<DialNodeEphemeral> = {
  nodeType: dialNodeType,
  inputs: {},
  output: EdgeType.Signal,
  interactable: true,
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
