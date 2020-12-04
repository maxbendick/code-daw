import { Observable } from 'rxjs'
import { CoolZone } from '../editor/cool-zone'
import { getSuperDef } from '../lib2/priv/all-nodes'
import { EdgeType } from '../lib2/priv/no-sig-types/edge-types'
import { SignalGraph } from '../lib2/priv/signal-graph'
import { LifecycleContext } from '../lifecycle/types'
import {
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

  const audioContext = new (window.AudioContext ||
    ((window as any).webkitAudioContext as AudioContext))()

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

    const superDef = getSuperDef(node.type as any)

    if (superDef.interactable) {
      throw new Error(
        'shouldnt be here because interactables are handled with coolzones',
      )
    }

    verifyInputs(superDef.inputs, resolvedInputs)
    const output = superDef.makeOutput(
      audioContext,
      node.config,
      resolvedInputs,
    )
    verifyOutput(superDef.output, output)
    existingOutputs[node.id] = output
  }

  rec(graph.masterOut)

  // STARTS IT
  for (const [id, node] of Object.entries(existingOutputs)) {
    if (isOscillatorNode(node)) {
      node.start()
    }
  }

  return existingOutputs
}

// note: AudioNode can be AudioScheduledSourceNode. which can be AudioBufferSourceNode,
// OscillatorNode, ConstantSourceNode, or others?

// TODO test because it's worth it
const verifyInputs = (inputConfig: any, inputs: any) => {
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
    verifySigType(inputType as EdgeType, inputValue)
  }
}

const verifyOutput = (edgeType: EdgeType, output: any) => {
  console.log('verifying output', edgeType, output)
  verifySigType(edgeType, output)
}
