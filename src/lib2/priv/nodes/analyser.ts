import { interval } from 'rxjs'
import { EdgeType } from '../no-sig-types/edge-types'
import { SuperDef } from '../no-sig-types/super-def'

type Config = {}

type Args = [source: AudioNode]

type Inputs = { source: AudioNode }

const nodeType = 'testing/analyser'

const BUFFER_LENGTH = 2048

export const superAnalyserDef = {
  nodeType: nodeType,
  inputs: { source: EdgeType.AudioSignal },
  output: EdgeType.Nothing,
  interactable: false,
  argsToInputs: (...[source]: Args): Inputs => ({ source }),
  argsToConfig: (...[source]: Args): Config => ({}),
  makeOutput: (audioContext: AudioContext, config: Config, inputs: Inputs) => {
    const analyser = audioContext.createAnalyser()
    analyser.fftSize = BUFFER_LENGTH

    inputs.source.connect(analyser)

    const subscription = interval(2000).subscribe(() => {
      console.log(autoCorrelate(audioContext, analyser))
    })

    return { output: 'nothing' as const, subscription }
  },
} as const

const _proof: SuperDef = superAnalyserDef

function autoCorrelate(audioContext: AudioContext, analyser: AnalyserNode) {
  var buffer = new Float32Array(BUFFER_LENGTH)
  analyser.getFloatTimeDomainData(buffer)

  // Implements the ACF2+ algorithm
  var SIZE = buffer.length
  var rms = 0

  for (var i = 0; i < SIZE; i++) {
    var val = buffer[i]
    rms += val * val
  }
  rms = Math.sqrt(rms / SIZE)
  if (rms < 0.01)
    // not enough signal
    return -1

  var r1 = 0,
    r2 = SIZE - 1,
    thres = 0.2
  for (var i = 0; i < SIZE / 2; i++)
    if (Math.abs(buffer[i]) < thres) {
      r1 = i
      break
    }
  for (var i = 1; i < SIZE / 2; i++)
    if (Math.abs(buffer[SIZE - i]) < thres) {
      r2 = SIZE - i
      break
    }

  buffer = buffer.slice(r1, r2)
  SIZE = buffer.length

  var c = new Array(SIZE).fill(0)
  for (var i = 0; i < SIZE; i++)
    for (var j = 0; j < SIZE - i; j++) c[i] = c[i] + buffer[j] * buffer[j + i]

  var d = 0
  while (c[d] > c[d + 1]) d++
  var maxval = -1,
    maxpos = -1
  for (var i = d; i < SIZE; i++) {
    if (c[i] > maxval) {
      maxval = c[i]
      maxpos = i
    }
  }
  var T0 = maxpos

  var x1 = c[T0 - 1],
    x2 = c[T0],
    x3 = c[T0 + 1]
  const a = (x1 + x3 - 2 * x2) / 2
  const b = (x3 - x1) / 2
  if (a) T0 = T0 - b / (2 * a)

  return audioContext.sampleRate / T0
}
