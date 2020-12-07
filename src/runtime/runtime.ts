import { Observable, Subscription } from 'rxjs'
import { CoolZone } from '../editor/cool-zone'
import { getSuperDef } from '../lib2/priv/all-nodes'
import { EdgeType } from '../lib2/priv/no-sig-types/edge-types'
import { superMasterOutDef } from '../lib2/priv/nodes/io/master-out'
import { SignalGraph } from '../lib2/priv/signal-graph'
import { LifecycleContext } from '../lifecycle/types'
import { isOscillatorNode, verifySigType } from './utils'

const MASTER_STOP_DELAY = 300
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

// TODO runtime should take in a master node facade
// lifecycle will fade it out, then destroy it(?)
export const startRuntime = (context: LifecycleContext) => {
  const { signalGraph, audioContext: _audioContext } = context
  const audioContext = _audioContext!

  console.log('graph roots :)', signalGraph!.roots)
  console.log('graph leaves :0', signalGraph!.leaves)

  // should send to master
  const {
    outputs: evaluation,
    observableSubscriptions: subscription,
  } = evalateGraph(audioContext, signalGraph!, context.coolZones!)
  console.log('evaluation', evaluation)

  return {
    destroy: async () => {
      subscription.unsubscribe()
      superMasterOutDef.destroy()
      await new Promise(resolve => setTimeout(resolve, MASTER_STOP_DELAY)) // should be enough time to avoid clicks with MASTER_FADEOUT
    },
  }
}

type NN = typeof SignalGraph.prototype.masterOut

const evalateGraph = (
  audioContext: AudioContext,
  graph: SignalGraph,
  coolZones: CoolZone[],
) => {
  const existingOutputs = {} as { [id: string]: AudioNode | Observable<number> }
  const subscription = new Subscription()

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

    const send$ = coolZones.find(zone => zone.id === node.id)?.send$

    verifyInputs(superDef.inputs, resolvedInputs)
    const output = superDef.makeOutput(
      audioContext,
      node.config,
      resolvedInputs,
      send$,
    )
    verifyOutput(superDef.output, output.output)
    // TODO typing
    existingOutputs[node.id] = output.output as any
    subscription.add(output.subscription)
  }

  for (const node of graph.nodes) {
    if (!existingOutputs[node.id]) {
      rec(node)
    }
  }

  // STARTS IT
  for (const [id, node] of Object.entries(existingOutputs)) {
    if (isOscillatorNode(node)) {
      node.start()
    }
  }

  return {
    outputs: existingOutputs,
    observableSubscriptions: subscription,
  }
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
