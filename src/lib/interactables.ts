import { AudioSignal } from './audio-signal'
import { DialConfig, _DialInteractable, _Interactable } from './interactable'
import { MidiSignal } from './midi-signal'
import { DialNode, NodeType, SignalGraph } from './node2'
import { Signal } from './signal'
import * as Signals from './signals'

interface Bus<SendT, ReceiveT> {
  send: (message: SendT) => void
  receive: (f: (message: ReceiveT) => void) => void
  destroy: () => void
  destroyed: boolean
  // TODO add onDestroyed?
}

type _DialSignal<A> = Signal<A> & {
  _interactable: _DialInteractable
}

type _InteractableSignal<A> = Signal<A> & _Interactable
type _InteractableAudioSignal = AudioSignal & _Interactable
type _InteractableMidiSignal = MidiSignal & _Interactable

/** mutate `into` to includ props of b and c */
const assignInto = <
  A,
  B extends { [k: string]: any },
  C extends { [k: string]: any } = any
>(
  into: A,
  b: B,
  c?: C,
): A & B & C => {
  for (const kb of Object.keys(b)) {
    ;(into as any)[kb] = b[kb]
  }
  if (c) {
    for (const kc of Object.keys(c)) {
      ;(into as any)[kc] = b[kc]
    }
  }
  return into as any
}

let nextDialIndex = 0

const graph = new SignalGraph()

const exampleSignalConsumer = (source: Signal<number>): Signal<number> => {
  const self = {
    ...source,
  }

  const node: DialNode = {
    nodeType: NodeType.Dial,
    inputs: {},
    output: source,
    config: { start: 0, end: 100, defaultValue: 50 },
  }

  graph.addNode({
    nodeType: NodeType.Dial,
    inputs: {},
    output: source,
    config: { start: 0, end: 100, defaultValue: 50 },
  })

  // graph.addEdge({
  //   input
  // })

  return source
}

/**
 * dial doesn't reference graph because it has no inputs
 */
export const dial: (config: DialConfig) => Signal<number> = config => {
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

  const signal = Signals.of(defaultValue)

  signal._interactable = {
    _index: dialIndex,
    _bus: bus,
    _type: 'dial' as const,
    _dial: true as const,
    _config: config,
    _compiledLineNumber: (window as any).codeDawCurrentLineNumber,
  }

  return signal
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
