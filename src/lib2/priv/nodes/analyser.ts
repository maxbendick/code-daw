import { interval } from 'rxjs'
import { take } from 'rxjs/operators'
import { EdgeType } from '../no-sig-types/edge-types'
import { SuperDef } from '../no-sig-types/super-def'

type Config = {}

type Args = [source: AudioNode]

type Inputs = { source: AudioNode }

const nodeType = 'testing/analyser'

export const superAnalyserDef = {
  nodeType: nodeType,
  inputs: { source: EdgeType.AudioSignal },
  output: EdgeType.Nothing,
  interactable: false,
  argsToInputs: (...[source]: Args): Inputs => ({ source }),
  argsToConfig: (...[source]: Args): Config => ({}),
  makeOutput: (audioContext: AudioContext, config: Config, inputs: Inputs) => {
    const analyser = audioContext.createAnalyser()
    analyser.fftSize = 2048

    inputs.source.connect(analyser)

    // TODO unsubscribe
    interval(2000)
      .pipe(take(5))
      .subscribe(() => {
        const FFTData = new Float32Array(analyser.frequencyBinCount)
        analyser.getFloatFrequencyData(FFTData)
        console.log('fftdata', FFTData[0])
      })

    // TODO unsubscribe
    return 'nothing'
  },
} as const

const _proof: SuperDef = superAnalyserDef
