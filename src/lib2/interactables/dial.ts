import { makeNodeMaker } from '../priv/makeNodeMaker'
import { GraphNodeBaseType } from '../priv/no-sig-types/graph-node-base-type'
import { Signal } from '../sigs'

export const dialNodeType = 'dial' as const

export type DialConfig = {
  start: number
  end: number
  defaultValue: number
}

export const dialGraphNodeDefinition: GraphNodeBaseType<
  typeof dialNodeType,
  {},
  'signal',
  DialConfig
> = {
  nodeType: dialNodeType,
  inputs: {},
  output: 'signal' as const,
  config: (null as any) as DialConfig,
}

export type DialNodeEphemeral = typeof dialGraphNodeDefinition

const dialRaw = makeNodeMaker<DialNodeEphemeral, [config: DialConfig]>(
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

export const _interactables_exports = {
  packageName: 'code-daw/interactables' as const,
  content: {
    dial,
  },
}
