import { Observable } from 'rxjs'
import { CoolZone } from '../editor/cool-zone'
import { SignalGraph } from '../lib2/priv/signal-graph'
import { LifecycleContext } from '../lifecycle/types'
import { injectAudioContext, makeObservableFromSend } from './utils'
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

export const startRuntime = async (context: LifecycleContext) => {
  const { signalGraph } = context

  console.log('graph roots :)', signalGraph.roots)
  console.log('graph leaves :0', signalGraph.leaves)

  // start with leaves, go to roots

  const audioContext = new (window.AudioContext ||
    ((window as any).webkitAudioContext as AudioContext))()

  const { toMaster, makeOscillator } = injectAudioContext(audioContext)

  const idToZoneSend$ = {} as { [id: string]: Observable<number> }

  for (const zone of context.coolZones!) {
    idToZoneSend$[zone.codeDawVar.id] = makeObservableFromSend(zone) // TODO default value!!
  }

  // should send to master
  const evaluation = evalateGraph(audioContext, signalGraph, context.coolZones!)
  console.log('evaluation', evaluation)

  await new Promise(resolve => {})
}

type NN = typeof SignalGraph.prototype.masterOut

const evalateGraph = (
  audioContext: AudioContext,
  graph: SignalGraph,
  coolZones: CoolZone[],
) => {
  const { toMaster, makeOscillator } = injectAudioContext(audioContext)

  const existingOutputs = {} as { [id: string]: AudioNode | Observable<number> }
  const oscillatorNodes = [] as OscillatorNode[]

  for (const zone of coolZones) {
    existingOutputs[zone.codeDawVar.id] = makeObservableFromSend(zone) // TODO default value!!
  }

  const rec = (node: NN) => {
    const resolvedInputs = {} as {
      [slot: string]: Observable<number> | AudioNode
    }

    for (const [inputSlot, id] of Object.entries(node.inputIds)) {
      const inputNode = graph.getNode(id)
      if (!existingOutputs[id]) {
        rec(inputNode)
      }
      if (!existingOutputs[id]) {
        throw new Error('rec should have added to existingOutputs')
      }
      resolvedInputs[inputSlot] = existingOutputs[id]
    }

    // switch on node types
    if (node.type === 'dial') {
      throw new Error(
        'shouldnt be here because dials are handled with coolzones',
      )
    } else if (node.type === 'oscillators/sine') {
      const osc = makeOscillator(resolvedInputs['frequency'])
      existingOutputs[node.id] = osc
      oscillatorNodes.push(osc)
      console.log('on the sine node', node)
      return
    } else if (node.type === 'io/masterOut') {
      console.log('on the masterout', node)
      toMaster(resolvedInputs['audioToOutput'] as AudioNode)
      return
    }

    throw new Error(`unexpected node type ${node.type}`)
  }

  rec(graph.masterOut)

  console.log('oscilkllator nodes', oscillatorNodes)
  // STARTS IT
  // for (const osc of oscillatorNodes) {
  //   osc.start()
  // }

  return existingOutputs
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
