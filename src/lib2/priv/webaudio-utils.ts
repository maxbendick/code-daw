import { Observable } from 'rxjs'
import { easyConnect } from '../../runtime/easy-connect'

const MASTER_GAIN = 0.081
const MASTER_FADEOUT = 0.1
const MASTER_FADEIN = 0.05

export const toMaster = (audioContext: AudioContext, source: AudioNode) => {
  const outputGain = audioContext.createGain()
  outputGain.gain.setValueAtTime(0, audioContext.currentTime)
  outputGain.gain.setTargetAtTime(
    MASTER_GAIN,
    audioContext.currentTime,
    MASTER_FADEIN,
  )
  source.connect(outputGain)
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

export const injectAudioContext = (audioContext: AudioContext) => {
  const self = {
    makeOscillator: (
      type: OscillatorNode['type'],
      frequency: AudioNode | Observable<number>,
    ): OscillatorNode => {
      const oscillator = audioContext.createOscillator()
      oscillator.type = type
      easyConnect(audioContext, frequency, oscillator.frequency)
      return oscillator
    },

    makeGain: (
      source: AudioNode,
      gainInput: AudioNode | Observable<number>,
    ): GainNode => {
      const gainNode = audioContext.createGain()
      easyConnect(audioContext, gainInput, gainNode.gain)
      source.connect(gainNode)
      return gainNode
    },
  }

  return self
}
