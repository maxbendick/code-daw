import { BehaviorSubject, Observable } from 'rxjs'
import { CoolZone } from '../editor/cool-zone'
import { easyConnect } from './easy-connect'

export const makeOscillator = (
  audioContext: AudioContext,
  frequency: AudioNode | Observable<number>,
): OscillatorNode => {
  const oscillator = audioContext.createOscillator()
  oscillator.type = 'sine'
  easyConnect(audioContext, frequency, oscillator.frequency)
  return oscillator
}

export const makeGain = (
  audioContext: AudioContext,
  source: AudioNode,
  gainInput: AudioNode | Observable<number>,
): GainNode => {
  const gainNode = audioContext.createGain()
  easyConnect(audioContext, gainInput, gainNode.gain)
  source.connect(gainNode)
  return gainNode
}

export const makeObservableFromSend = <A>(coolZone: CoolZone) => {
  const value$ = new BehaviorSubject<A>(coolZone.initialValue)
  console.log('set send', coolZone.initialValue)
  coolZone.setSend((v: A) => value$.next(v))
  return value$.asObservable()
}
