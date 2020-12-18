import * as React from 'react'
import { BehaviorSubject } from 'rxjs'

// import { globalAudioContext, someFnToCallWheneverMakingNewNodeType, someFnToCallWheneverMakingNewNodeInstance } from './internal'

const createInteractable = null as any
const useSignal = null as any
const createSignalSubject = null as any
const interactable = null as any

const shmoof = createInteractable((args: any) => {
  return {
    component: () => {
      const name = useSignal(args.name)
      return <div>{name}</div>
    },
    output: args.myInputSignal,
  }
})

const shmoofInteractable = (args: any) => {
  const makeExtreme = (n: string) => n.concat('!')
  const extremeNameSignal = createSignalSubject(makeExtreme(args.name.current))
  return [
    extremeNameSignal,
    () => {
      const name = useSignal(args.name)
      const extremeName = useSignal(extremeNameSignal)
      return (
        <div onClick={() => extremeNameSignal.next(makeExtreme(name))}>
          name: {name} --- extremeName: {extremeName}
        </div>
      )
    },
  ]
}

const mySomeSignal = null as any

/// butt

// optional: export interactable(...) or [value, component]
export const relayAnExistingSignal = [
  mySomeSignal.maptodsoomethingelse,
  () => <div>hello</div>,
]

const shmoofArr2 = (args: any) =>
  interactable(args.myInputSignal, () => {
    const name = useSignal(args.name)
    return <div>{name}</div>
  })

type MyAudioOutput = {}

type PackagedForUser<A> = A

type ResolveFn = (
  value: 'audio node' | 'behavior subject' | any,
) => 'some user friendly signal' | 'some user friendly audio signal' | any

// TODO make this cast the type from audionode / behaviorsubject to signal/audiosignal
const createRawOperator = function <Args, Output>(c: {
  id: string
  output: (a: {
    args: Args
    audioContext: AudioContext
    resolve: ResolveFn
  }) => { output: Output; subscription: any }
}) {
  return (null as any) as (args: Args) => PackagedForUser<Output>
}
const easyConnect = null as any

interface SystemToUserTransformer {
  systemToUser: (a: BehaviorSubject<any> | 'audio node') => 'audio' | 'signal'
  userToFramework: (a: any) => any
}

const sine = createRawOperator<[config: { frequency: any }], OscillatorNode>({
  id: 'sine',
  output: ({ args: [config], resolve, audioContext }) => {
    const osc = audioContext.createOscillator()
    const subscription = easyConnect(
      audioContext,
      resolve(config.frequency),
      osc.frequency,
    )
    return {
      output: osc,
      subscription,
    }
  },
})

/*

userFn1(
  userFn2(systemFn(args)),
  userFn3(
    userFn4(),
    systemFn(4, systemFn(5))
  )
)


*/
