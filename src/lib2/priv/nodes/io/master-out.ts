import { AudioSignal, Signal } from '../../../sigs'
import { makeNodeMaker } from '../../makeNodeMaker'
import { EdgeType } from '../../no-sig-types/edge-types'
import { injectAudioContext } from '../../webaudio-utils'

const masterOutNodeType = 'io/masterOut' as const

type MasterOutConfig = {}

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

export const superMasterOutDef = {
  nodeType: masterOutNodeType,
  publicFunction: masterOut,
  inputs: { audioToOutput: EdgeType.AudioSignal },
  output: 'nothing',
  interactable: false,
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
} as const
