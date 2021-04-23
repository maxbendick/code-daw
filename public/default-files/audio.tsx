// I don't recommend changing this file within the app

// Only press start while on the /index.tsx file

import { isObservable, Observable } from 'rxjs'
import { map, skip, take, throttleTime } from 'rxjs/operators'
import { cleanupOnDestroy, getAudioContext } from './internal'

export type ParamLike = number | Observable<number> | AudioNode

const SAFE_MODE_THROTTLE_TIME = 50
const RAMP_TIME_SECONDS = 0.005

const isAudioNode = (o: any): o is AudioNode => {
  return o instanceof AudioNode
}

export const easyConnect = (
  audioContext: AudioContext,
  input: ParamLike, // must emit immediately!!
  output: AudioParam,
): void => {
  if (isObservable(input)) {
    let initialValue = (null as any) as number
    input.pipe(take(1)).subscribe(val => {
      initialValue = val
    })

    if (typeof initialValue !== 'number') {
      console.error('initialValue is', initialValue)
      throw new Error('easy connect missing initial number value!')
    }

    output.setValueAtTime(initialValue, audioContext.currentTime)

    const subscription = input
      .pipe(skip(1), throttleTime(SAFE_MODE_THROTTLE_TIME))
      .subscribe(currentValue => {
        output.setTargetAtTime(
          currentValue,
          audioContext.currentTime + 0,
          RAMP_TIME_SECONDS,
        )
      })
    cleanupOnDestroy(subscription)
  } else if (isAudioNode(input)) {
    input.connect(output)
    return
  } else if (typeof input === 'number') {
    output.value = input
  } else {
    throw new Error('failed to connect node - not AudioNode or Observable')
  }
}

export const gain = ({
  gainValue,
  source,
}: {
  gainValue: ParamLike
  source: AudioNode
}): AudioNode => {
  const audioContext = getAudioContext()
  const result = audioContext.createGain()
  easyConnect(audioContext, gainValue, result.gain)
  source.connect(result)
  return result
}

export const oscillator = ({
  type,
  frequency,
  detune,
}: {
  type: OscillatorType
  frequency: ParamLike
  detune?: ParamLike
}): OscillatorNode => {
  const audioContext = getAudioContext()
  const result: OscillatorNode = audioContext.createOscillator()
  result.type = type
  easyConnect(audioContext, frequency, result.frequency)
  if (detune) {
    easyConnect(audioContext, detune, result.detune)
  }
  result.start()
  return result
}

export const combineAudio = (...nodes: AudioNode[]): AudioNode => {
  const output = getAudioContext().createGain()
  output.gain.value = 1

  const numChannels = nodes.reduce(
    (count, node) => count + node.numberOfOutputs,
    0,
  )

  console.log({
    nodes: nodes.map(node => ({
      numberOfInputs: node.numberOfInputs,
      numberOfOutputs: node.numberOfOutputs,
    })),
    rawNodes: nodes,
    mixNumInChannels: numChannels,
    acNumInputs: getAudioContext().destination.numberOfInputs,
    acNumOutputs: getAudioContext().destination.numberOfOutputs,
  })

  for (const node of nodes) {
    node.connect(output)
  }

  return output
}

export const lowpassFilter = ({
  source,
  frequency,
  q,
}: {
  source: AudioNode
  frequency: ParamLike
  q: ParamLike
}) => {
  const context = getAudioContext()
  const output = context.createBiquadFilter()
  output.type = 'lowpass'

  easyConnect(context, frequency, output.frequency)
  easyConnect(context, q, output.Q)
  source.connect(output)
  return output
}

export const highpassFilter = ({
  source,
  frequency,
  q,
}: {
  source: AudioNode
  frequency: ParamLike
  q: ParamLike
}) => {
  const context = getAudioContext()
  const output = context.createBiquadFilter()
  output.type = 'highpass'

  easyConnect(context, frequency, output.frequency)
  easyConnect(context, q, output.Q)
  source.connect(output)
  return output
}

const pin0to1 = (n: number) => Math.max(0, Math.min(n, 1))

const dryWetToDry = (dryWet: number) => pin0to1(1 - dryWet)
const dryWetToWet = (dryWet: number) => pin0to1(dryWet)

export const delayEffect = ({
  source,
  dryWet,
  feedback,
  delaySeconds,
}: {
  source: AudioNode
  dryWet: Observable<number>
  feedback: ParamLike
  delaySeconds: ParamLike
}): AudioNode => {
  const context = getAudioContext()

  // Create wet signal
  const delayNode = context.createDelay()
  easyConnect(context, delaySeconds, delayNode.delayTime)

  // Delay node takes as input: source, feedback signal
  source.connect(delayNode)
  gain({ source: delayNode, gainValue: feedback }).connect(delayNode)

  // Combine dry and wet signals
  const dryGained = gain({ source, gainValue: dryWet.pipe(map(dryWetToDry)) })
  const wetGained = gain({
    source: delayNode,
    gainValue: dryWet.pipe(map(dryWetToWet)),
  })

  return combineAudio(dryGained, wetGained)
}
