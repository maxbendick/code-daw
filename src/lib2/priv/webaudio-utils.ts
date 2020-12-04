import { Observable, of } from 'rxjs'
import { easyConnect } from '../../runtime/easy-connect'

const MASTER_GAIN = 0.081

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

    toMaster: (source: AudioNode) => {
      const outputGain = self.makeGain(source, of(MASTER_GAIN))
      outputGain.connect(audioContext.destination)
    },
  }

  return self
}
