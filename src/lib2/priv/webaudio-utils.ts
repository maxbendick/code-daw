import { Observable, of } from 'rxjs'
import { easyConnect } from '../../runtime/easy-connect'

const MASTER_GAIN = 0.081
const MASTER_FADEOUT = 0.1

export const toMaster = (audioContext: AudioContext, source: AudioNode) => {
  const outputGain = audioContext.createGain()
  easyConnect(audioContext, of(MASTER_GAIN), outputGain.gain)
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
      frequency: AudioNode | Observable<number>,
    ): OscillatorNode => {
      const oscillator = audioContext.createOscillator()
      oscillator.type = 'sine'
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
