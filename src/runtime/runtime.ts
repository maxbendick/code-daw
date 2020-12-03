import { Observable } from 'rxjs'
import { LifecycleContext } from '../lifecycle/types'
import { injectAudioContext } from './utils'
// import { makeGain, makeObservableFromSend, makeOscillator } from './utils'

/*
Could try:
components/coolzones are in loading state until runtime started
when runtime started, pass a send function to each coolzone

what reprentations do i need?
*/

/*
 need: sine, masterOut, dial
*/

/*
need to make a generic way to create new nodes (sources and effects)

some dial.ts should be able to define a mapping from token+var to actual webaudio

for effects like gain: gain node is created first, and then inputs and outputs are

*/

/*
Next: 
* assemble audio graph from signal graph
*/

// const toMaster = (audioContext: AudioContext, source: AudioNode) => {
//   const outputGain = makeGain(audioContext, source, of(MASTER_GAIN))
//   outputGain.connect(audioContext.destination)
// }

export const startRuntime = async (context: LifecycleContext) => {
  console.log('graph roots :)', context.signalGraph.roots)
  console.log('graph leaves :0', context.signalGraph.leaves)

  // start with leaves, go to roots

  const audioContext = new (window.AudioContext ||
    ((window as any).webkitAudioContext as AudioContext))()

  const {
    toMaster,
    makeObservableFromSend,
    makeOscillator,
  } = injectAudioContext(audioContext)

  const idToZoneSend$ = {} as { [id: string]: Observable<number> }

  for (const zone of context.coolZones!) {
    idToZoneSend$[zone.codeDawVar.id] = makeObservableFromSend(zone) // TODO default value!!
  }

  const zoneFreq1 = idToZoneSend$[context.coolZones?.[0].codeDawVar?.id!]

  const osc = makeOscillator(zoneFreq1)

  toMaster(osc)

  // STARTS IT!!!
  // osc.start()

  await new Promise(resolve => {})
}

const assembleAudioGraph = (context: LifecycleContext) => {
  const { signalGraph } = context

  // find masterOut nodeType OR find roots
}

// note: AudioNode can be AudioScheduledSourceNode. which can be AudioBufferSourceNode,
// OscillatorNode, ConstantSourceNode, or others?

const testttt = () => {
  // create web audio api context
  const audioCtx = new (window.AudioContext ||
    ((window as any).webkitAudioContext as AudioContext))()

  // create Oscillator node
  const oscillator = audioCtx.createOscillator()
  oscillator.type = 'square'
  oscillator.frequency.setValueAtTime(440, audioCtx.currentTime) // value in hertz
  oscillator.connect(audioCtx.destination)
  oscillator.start()
}
