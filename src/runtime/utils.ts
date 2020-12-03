import { BehaviorSubject, isObservable, Observable, of } from 'rxjs'
import { CoolZone } from '../editor/cool-zone'
import { easyConnect } from './easy-connect'

const MASTER_GAIN = 0.11

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

export const isOscillatorNode = (o: any): o is OscillatorNode => {
  return o instanceof OscillatorNode
}

export const isAudioNode = (o: any): o is AudioNode => {
  return o instanceof AudioNode
}

export const verifySigType = (sigType: string, value: any) => {
  if (sigType === null || typeof sigType === 'undefined') {
    throw new Error('missing sigType')
  }
  if (value === null || typeof value === 'undefined') {
    throw new Error('missing value')
  }

  const errorOut = () => {
    console.error('sigType', sigType)
    console.error('value', value)
    throw new Error('type mismatch!')
  }

  switch (sigType) {
    // TODO narrow this? idk
    case 'signal':
      if (!isObservable(value) && !isAudioNode(value)) {
        errorOut()
      }
      return
    case 'audioSignal':
      if (!isAudioNode(value)) {
        errorOut()
      }
      return
    case 'midiSignal':
      throw new Error('cant support midiSignals yet')
  }
}
