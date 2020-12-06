import { Observable } from 'rxjs'
import { easyConnect } from '../../runtime/easy-connect'
import { MASTER_VOLUME$ } from './master-volume'

const MASTER_GAIN = 0.05
const MASTER_FADEOUT = 0.1
const MASTER_FADEIN = 0.05

export const toMaster = (audioContext: AudioContext, source: AudioNode) => {
  const volumeGain = audioContext.createGain()
  easyConnect(audioContext, MASTER_VOLUME$, volumeGain.gain)

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
}
export const makeOscillator = (
  audioContext: AudioContext,
  { type, frequency }: MakeOscillatorConfig,
): OscillatorNode => {
  const oscillator = audioContext.createOscillator()
  oscillator.type = type
  easyConnect(audioContext, frequency, oscillator.frequency)
  return oscillator
}

export const makeGain = (
  audioContext: AudioContext,
  gainValue: Observable<number> | AudioNode,
  source: AudioNode,
): AudioNode => {
  const gainNode = audioContext.createGain()
  easyConnect(audioContext, gainValue, gainNode.gain)
  source.connect(gainNode)
  return gainNode
}
