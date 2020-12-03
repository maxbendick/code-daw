import { makeNodeMaker } from '../priv/makeNodeMaker'
import { GraphNodeBaseType } from '../priv/no-sig-types/graph-node-base-type'
import { AudioSignal, Signal } from '../sigs'

export const masterOutNodeType = 'io/masterOut' as const

export type MasterOutConfig = {}

export const MasterOutGraphNodeDefinition: GraphNodeBaseType<
  typeof masterOutNodeType,
  { audioToOutput: 'audioSignal' },
  null,
  MasterOutConfig
> = {
  nodeType: masterOutNodeType,
  inputs: { audioToOutput: 'audioSignal' },
  output: null, // EdgeType.AudioSignal,
  config: (null as any) as MasterOutConfig,
}

export type MasterOutEphemeral = typeof MasterOutGraphNodeDefinition

type MasterOutArgs = [signal: AudioSignal]

const masterOutRaw = makeNodeMaker<MasterOutEphemeral, MasterOutArgs>(
  ({ id }, audioToOutput) => {
    return {
      type: masterOutNodeType,
      inputs: { audioToOutput },
      config: {},
    }
  },
)

// TODO better typing
const masterOut: (...args: MasterOutArgs) => Signal<number> = (...args) => {
  console.log('master out!!!')
  return (masterOutRaw(...args) as any) as Signal<number>
}

export const _io_exports = {
  packageName: 'code-daw/io' as const,
  content: {
    masterOut,
  },
}
