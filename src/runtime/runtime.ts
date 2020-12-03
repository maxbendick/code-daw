import { Observable } from 'rxjs'
import { CoolZone } from '../editor/cool-zone'
import { getGraphNodeDefinition } from '../lib2/priv/all-nodes'
import { resolveSineOutput } from '../lib2/priv/nodes/oscillators/sine'
import { SignalGraph } from '../lib2/priv/signal-graph'
import { LifecycleContext } from '../lifecycle/types'
import {
  injectAudioContext,
  isOscillatorNode,
  makeObservableFromSend,
  verifySigType,
} from './utils'
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
  const { toMaster } = injectAudioContext(audioContext)

  const existingOutputs = {} as { [id: string]: AudioNode | Observable<number> }

  for (const zone of coolZones) {
    existingOutputs[zone.codeDawVar.id] = makeObservableFromSend(zone) // TODO default value!!
  }

  const rec = (node: NN) => {
    const resolvedInputs = {} as {
      [slot: string]: Observable<number> | AudioNode
    }

    // Resolve inputs
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

    // Build webaudio nodes+edges
    switch (node.type) {
      case 'dial':
        throw new Error(
          'shouldnt be here because dials are handled with coolzones',
        )

      case 'oscillators/sine': {
        verifyInputs(node, resolvedInputs)
        const osc = resolveSineOutput(audioContext, node.config, resolvedInputs)
        verifyOutput(node, osc)

        existingOutputs[node.id] = osc
        console.log('on the sine node', node)
        return
      }

      case 'io/masterOut': {
        console.log('on the masterout', node)
        toMaster(resolvedInputs['audioToOutput'] as AudioNode)
        return
      }
    }

    throw new Error(`unexpected node type ${node.type}`)
  }

  rec(graph.masterOut)

  // STARTS IT
  for (const [id, node] of Object.entries(existingOutputs)) {
    if (isOscillatorNode(node)) {
      // node.start()
    }
  }

  return existingOutputs
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

// TODO test because it's worth it
const verifyInputs = (node: NN, inputs: any) => {
  const inputConfig = getGraphNodeDefinition(node.type as any).inputs

  if (inputConfig.length || inputs.length) {
    throw new Error('somehow got array input')
  }
  if (Object.keys(inputConfig).length !== Object.keys(inputs).length) {
    console.error('config', inputConfig)
    console.error('inputs', inputs)
    throw new Error('inputs and outputs length doesnt match')
  }
  for (const [id, inputType] of Object.entries(inputConfig)) {
    const inputValue = inputs[id]
    verifySigType(inputType as string, inputValue)
  }
}

const verifyOutput = (node: NN, output: any) => {
  verifySigType(node.type, output)
}
