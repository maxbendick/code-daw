import { Observable, Subscription } from 'rxjs'
import { easyConnect } from '../../runtime/easy-connect'
import { MASTER_VOLUME$ } from './master-volume'

const MASTER_GAIN = 0.25
const MASTER_FADEOUT = 0.1
const MASTER_FADEIN = 0.05

export const toMaster = (audioContext: AudioContext, source: AudioNode) => {
  const volumeGain = audioContext.createGain()

  // TODO unsubscribe
  const masterSubscription = easyConnect(
    audioContext,
    MASTER_VOLUME$,
    volumeGain.gain,
  )

  const outputGain = audioContext.createGain()
  outputGain.gain.setValueAtTime(0, audioContext.currentTime)
  outputGain.gain.setTargetAtTime(
    MASTER_GAIN,
    audioContext.currentTime,
    MASTER_FADEIN,
  )

  source.connect(volumeGain)
  volumeGain.connect(outputGain)
  outputGain.connect(audioContext.destination)

  return {
    destroy: () => {
      outputGain.gain.setTargetAtTime(
        0,
        audioContext.currentTime,
        MASTER_FADEOUT,
      )
    },
  }
}

interface MakeOscillatorConfig {
  type: OscillatorNode['type']
  frequency: AudioNode | Observable<number>
  fm?: AudioNode
}
export const makeOscillator = (
  audioContext: AudioContext,
  { type, frequency, fm }: MakeOscillatorConfig,
): { output: OscillatorNode; subscription: Subscription } => {
  const oscillator = audioContext.createOscillator()
  oscillator.type = type
  const subscription = easyConnect(
    audioContext,
    frequency,
    oscillator.frequency,
  )

  // how to do this right?
  if (fm) {
    const sub2 = easyConnect(audioContext, fm, oscillator.detune)
    subscription.add(sub2)
  }

  return {
    output: oscillator,
    subscription,
  }
}

export const makeGain = (
  audioContext: AudioContext,
  gainValue: Observable<number> | AudioNode,
  source: AudioNode,
): { output: AudioNode; subscription: Subscription } => {
  const gainNode = audioContext.createGain()
  // TODO unsubscribe
  const subscription = easyConnect(audioContext, gainValue, gainNode.gain)
  source.connect(gainNode)
  return {
    output: gainNode,
    subscription,
  }
}
