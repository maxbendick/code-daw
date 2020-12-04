import { Observable } from 'rxjs'
import { CoolZone } from '../editor/cool-zone'
import { EdgeType } from '../lib2/priv/no-sig-types/edge-types'
import { superDialDef } from '../lib2/priv/nodes/interactables/dial'
import { superMasterOutDef } from '../lib2/priv/nodes/io/master-out'
import { superSineDef } from '../lib2/priv/nodes/oscillators/sine'
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
      case superDialDef.nodeType:
        throw new Error(
          'shouldnt be here because interactables are handled with coolzones',
        )

      case superSineDef.nodeType: {
        superSineDef.verifyConfig(node.config as any)
        verifyInputs(superSineDef.inputs, resolvedInputs)
        const output = superSineDef.makeOutput(
          audioContext,
          node.config as any,
          resolvedInputs,
        )
        verifyOutput(superSineDef.output, output)

        existingOutputs[node.id] = output
        console.log('on the sine node', node)
        return
      }

      case superMasterOutDef.nodeType: {
        console.log('on the masterout', node)
        verifyInputs(superMasterOutDef.inputs, resolvedInputs)
        const output = superMasterOutDef.makeOutput(
          audioContext,
          node.config,
          resolvedInputs,
        )
        verifyOutput(superMasterOutDef.output, output)
        existingOutputs[node.id] = output
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

// TODO test because it's worth it
const verifyInputs = (inputConfig: any, inputs: any) => {
  // const inputConfig = getGraphNodeDefinition(node.type as any).inputs

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
