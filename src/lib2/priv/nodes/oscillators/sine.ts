import { Signal } from '../../../sigs'
import { makeNodeMaker } from '../../makeNodeMaker'
import { EdgeType } from '../../no-sig-types/edge-types'
import { GraphNodeBaseType } from '../../no-sig-types/graph-node-base-type'

export const sineNodeType = 'oscillators/sine' as const

export type SineConfig = {}

export const sineGraphNodeDefinition: GraphNodeBaseType<
  typeof sineNodeType,
  { frequency: 'signal' },
  'signal',
  SineConfig
> = {
  nodeType: sineNodeType,
  inputs: { frequency: 'signal' },
  output: EdgeType.Signal,
  config: (null as any) as SineConfig,
}

export type SineNodeEphemeral = typeof sineGraphNodeDefinition

type SineArgs = [frequency: Signal<number>, phase: Signal<number>]

export const sineRaw = makeNodeMaker<SineNodeEphemeral, SineArgs>(
  ({ id }, frequency) => {
    return {
      type: sineNodeType,
      inputs: { frequency } as any,
      config: {},
    }
  },
)

// TODO better typing
export const sine: (...args: SineArgs) => Signal<number> = (...args) => {
  return (sineRaw(...args) as any) as Signal<number>
}

export const _oscillators_exports = {
  packageName: 'code-daw/oscillators' as const,
  content: {
    sine,
  },
}
