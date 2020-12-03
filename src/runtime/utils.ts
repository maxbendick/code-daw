import { BehaviorSubject, Observable, of } from 'rxjs'
import { CoolZone } from '../editor/cool-zone'
import { easyConnect } from './easy-connect'

const MASTER_GAIN = 0.21

export const makeObservableFromSend = <A>(coolZone: CoolZone) => {
  const value$ = new BehaviorSubject<A>(coolZone.initialValue)
  coolZone.setSend((v: A) => value$.next(v))
  return value$.asObservable()
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

    toMaster: (source: AudioNode) => {
      const outputGain = self.makeGain(source, of(MASTER_GAIN))
      outputGain.connect(audioContext.destination)
    },
  }

  return self
}
