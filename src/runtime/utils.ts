import { Observable } from 'rxjs'
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
  gainInput: AudioNode | Observable<number>,
): GainNode => {
  const gainNode = audioContext.createGain()
  easyConnect(audioContext, gainInput, gainNode.gain)
  return gainNode
}
