import { isObservable } from 'rxjs'
import { EdgeType } from '../lib2/priv/no-sig-types/edge-types'

export const isOscillatorNode = (o: any): o is OscillatorNode => {
  return o instanceof OscillatorNode
}

export const isAudioNode = (o: any): o is AudioNode => {
  return o instanceof AudioNode
}

export const verifySigType = (sigType: EdgeType, value: any) => {
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
    case EdgeType.Signal:
      if (!isObservable(value) && !isAudioNode(value)) {
        errorOut()
      }
      return
    case EdgeType.AudioSignal:
      if (!isAudioNode(value)) {
        errorOut()
      }
      return
    case EdgeType.MidiSignal:
      throw new Error('cant support midiSignals yet')
    case EdgeType.Nothing:
      if (value !== 'nothing') {
        throw new Error('a nothing sig can only be nothing')
      }
      return
  }

  console.error('could not verify', { sigType, value })
  throw new Error('could not verify')
}
