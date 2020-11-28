import { AudioSignal } from './audio-signal'
import { MidiSignal } from './midi-signal'
import { Signal } from './signal'
import * as Signals from './signals'
import { Number_ } from './utility-types'

interface Bus<SendT, ReceiveT> {
  send: (message: SendT) => void
  receive: (f: (message: ReceiveT) => void) => void
  destroy: () => void
  destroyed: boolean
  // TODO add onDestroyed?
}

type InteractableType = 'dial' | 'mixer'

type DialSends = number
type DialReceives = number

// interface _Interactable<Type extends InteractableType> {
//   _bus: Type extends 'dial' ? Bus<DialBusSend, DialBusReceive> : Bus<any, any>
//   _type: Type
//   _index: number
// }

interface _Interactable<Sends, Receives> {
  _bus: Bus<Sends, Receives>
  _type: InteractableType
  _index: number
}

type _DialSignal<A> = Signal<A> & _Interactable<DialSends, DialReceives>

type _InteractableSignal<A> = Signal<A> & _Interactable<any, any>
type _InteractableAudioSignal = AudioSignal & _Interactable<any, any>
type _InteractableMidiSignal = MidiSignal & _Interactable<any, any>

const withInteractable = <A, Inter extends _Interactable<any, any>>(
  value: A,
  interactable: Inter,
): A & Inter => {
  const result = value as A & Inter
  result._bus = interactable._bus
  result._type = interactable._type
  result._index = interactable._index
  return value as any
}

let nextDialIndex = 0

export const dial: (config: {
  start: Number_
  end: Number_
  defaultValue: number
}) => _DialSignal<number> = config => {
  const { defaultValue } = config
  const dialIndex = nextDialIndex++
  const bus: Bus<any, any> = (window as any).buses?.dials?.[dialIndex]

  if (!bus) {
    console.warn('no bus registered for dial', dialIndex)
  } else {
    bus.receive(message => {
      console.log(`dial ${dialIndex} received message:`, message)
    })
  }

  return withInteractable(Signals.of(defaultValue), {
    _index: dialIndex,
    _bus: bus,
    _type: 'dial',
  })
}

export const polySine: (
  midiSignal: MidiSignal,
) => _InteractableAudioSignal = () => null as any

export const toggle: (config: {
  default: boolean
}) => _InteractableSignal<boolean> = () => null as any

type MixerInputConfig = unknown
interface MixerInputs {
  [name: string]: AudioSignal | MixerInputConfig
}

export const mixer: (inputs: MixerInputs) => _InteractableAudioSignal = () =>
  null as any

const show: <A>(a: A) => A = null as any // shows a UI element when it otherwise wouldn't be shown, like when a dial is referenced

/*
  Show buttons in UI
  API?
*/
export const switcher = <
  A extends number | string | { label: string | number }
>(
  options: Iterable<A>,
): _InteractableSignal<A> => {
  return null as any
}

// const dropdown = switcher; // could include another style

export const _interactables_exports = {
  packageName: 'code-daw/interactables' as const,
  content: {
    dial,
  },
}
