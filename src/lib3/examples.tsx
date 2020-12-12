export {}

// import { BehaviorSubject, isObservable, Subscription } from 'rxjs'
// import { createRawOperatorFactory } from './create-operator'

// type TestRawOperatorSineArgs = [
//   config: {
//     frequency: BehaviorSubject<number> | AudioNode
//     detune: BehaviorSubject<number> | AudioNode
//   },
// ]

// export const __exampleRawOperatorSine = createRawOperatorFactory(
//   (null as any) as AudioContext,
// )<TestRawOperatorSineArgs, AudioNode>({
//   type: 'example raw sine',
//   fn: async ({ args: [{ frequency, detune }], audioContext, resolve }) => {
//     const rawFrequency = await resolve(frequency)
//     const osc = audioContext.createOscillator()

//     const subscription = new Subscription()
//     if (isObservable(frequency)) {
//       const sub = frequency.subscribe(f => {
//         console.log('freq!')
//       })
//       subscription.add(sub)
//     } else {
//       console.log('freq is not an observable')
//       if (!(frequency instanceof AudioNode)) {
//         console.error('frequency', frequency)
//         throw new Error('frequency is not audionode or behaviorsubject')
//       }
//     }

//     return {
//       output: audioContext.createOscillator(),
//       subscription: new Subscription(),
//     }
//   },
// })
