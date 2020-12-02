import { Observable, of } from 'rxjs'
import { LifecycleContext } from '../lifecycle/types'
import { easyConnect } from './easy-connect'
/*
Could try:
components/coolzones are in loading state until runtime started
when runtime started, pass a send function to each coolzone

what reprentations do i need?
*/

/*
 need: sine, masterOut, dial
*/
const OUTPUT_GAIN = 0.05

export const startRuntime = async (context: LifecycleContext) => {
  console.log('graph roots :)', context.signalGraph.roots)
  // start with leaves, go to roots

  const audioContext = new (window.AudioContext ||
    ((window as any).webkitAudioContext as AudioContext))()

  const osc = makeOscillator(audioContext, of(300))

  const outputGain = audioContext.createGain()
  outputGain.gain.value = OUTPUT_GAIN

  osc.connect(outputGain)
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

const makeOscillator = (
  audioContext: AudioContext,
  frequency: AudioNode | Observable<number>,
): OscillatorNode => {
  const oscillator = audioContext.createOscillator()
  oscillator.type = 'sine'
  easyConnect(audioContext, frequency, oscillator.frequency)
  return oscillator
}

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
