import { injectAudioContext } from '../../../../runtime/utils'
import { AudioSignal, Signal } from '../../../sigs'
import { makeNodeMaker } from '../../makeNodeMaker'
import { EdgeType } from '../../no-sig-types/edge-types'
import { GraphNodeBaseType } from '../../no-sig-types/graph-node-base-type'
import { SuperDef } from '../../no-sig-types/super-def'

export const masterOutNodeType = 'io/masterOut' as const

type MasterOutConfig = {}

export const masterOutGraphNodeDefinition: GraphNodeBaseType = {
  nodeType: masterOutNodeType,
  inputs: { audioToOutput: 'audioSignal' },
  output: EdgeType.Nothing,
  config: (null as any) as MasterOutConfig,
}

type MasterOutArgs = [signal: AudioSignal]

const masterOutRaw = makeNodeMaker<MasterOutArgs>(({ id }, audioToOutput) => {
  return {
    type: masterOutNodeType,
    inputs: { audioToOutput },
    config: {},
  }
})

// Available for editor
const masterOut: (...args: MasterOutArgs) => Signal<number> = (...args) => {
  console.log('master out!!!')
  return (masterOutRaw(...args) as any) as Signal<number>
}

export const superMasterOutDef: SuperDef = {
  nodeType: masterOutNodeType,
  publicFunction: masterOut,
  inputs: { audioToOutput: EdgeType.AudioSignal },
  output: 'nothing',
  interactable: true,
  verifyConfig: (config: MasterOutConfig) => {
    if (Object.keys(config).length !== 0) {
      throw new Error('bad master out config')
    }
  },
  makeOutput: (
    audioContext: AudioContext,
    config: MasterOutConfig,
    inputs: any,
  ) => {
    const { toMaster } = injectAudioContext(audioContext)
    toMaster(inputs['audioToOutput'] as AudioNode)
    return 'nothing'
  },

  get publicName() {
    const result = this.nodeType.split('/')[1]
    if (!result) {
      throw new Error('could not get publicName')
    }
    return result
  },
  get packageName() {
    const split = this.nodeType.split('/')
    const result = `code-daw/${split[0]}`
    if (!result) {
      throw new Error('could not get publicName')
    }
    return result
  },
}
