import { BehaviorSubject, of } from 'rxjs'
import { LifecycleContext } from '../lifecycle/types'
import { makeGain, makeOscillator } from './utils'

/*
Could try:
components/coolzones are in loading state until runtime started
when runtime started, pass a send function to each coolzone

what reprentations do i need?
*/

/*
 need: sine, masterOut, dial
*/
const OUTPUT_GAIN = 0.21

/*
need to make a generic way to create new nodes (sources and effects)

some dial.ts should be able to define a mapping from token+var to actual webaudio

for effects like gain: gain node is created first, and then inputs and outputs are

*/

export const startRuntime = async (context: LifecycleContext) => {
  console.log('graph roots :)', context.signalGraph.roots)
  // start with leaves, go to roots

  const audioContext = new (window.AudioContext ||
    ((window as any).webkitAudioContext as AudioContext))()

  const FREQ = new BehaviorSubject(300)
  ;(async () => {
    console.log('a')

    await new Promise(resolve => setTimeout(resolve, 2000))
    FREQ.next(400)
    console.log('a')

    await new Promise(resolve => setTimeout(resolve, 2000))
    FREQ.next(200)
    console.log('a')

    await new Promise(resolve => setTimeout(resolve, 2000))
    console.log('a')
  })()

  const osc = makeOscillator(audioContext, FREQ)

  const outputGain = makeGain(audioContext, osc, of(OUTPUT_GAIN))

  outputGain.connect(audioContext.destination)

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
