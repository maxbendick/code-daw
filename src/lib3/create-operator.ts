import { Subscription } from 'rxjs'
import { Node, PackagedForUser, ResolveFn, UnpackagedForUser } from './types'

type RawOperatorInputFn<Args extends any[], Output> = (a: {
  args: Args
  audioContext: AudioContext
  resolve: ResolveFn
  type: string
  id: string
}) => Promise<Node<Output>>

type RawOperatorResultFn<Args extends any[], Output> = (
  ...args: Args
) => { output: PackagedForUser<Output>; subscription: Subscription }

const resolveFn: ResolveFn = <A>(a: A) =>
  Promise.resolve(a as UnpackagedForUser<A>)

/*
EXPORT DEFAULT IS MASTER OUT

only one file is entry at a time
the entry file's export default is the master out
can use export default as a demo for the file

*/

interface Config<Args extends any[], Output> {
  type: string
  fn: RawOperatorInputFn<Args, Output>
}

let count = 1

const deferSub = (promise: Promise<Subscription>): Subscription => {
  const safeSub = new Subscription()

  promise.then(subscription => {
    if (safeSub.closed) {
      subscription.unsubscribe()
    }
    safeSub.add(subscription)
  })

  return safeSub
}

export const createRawOperatorFactory = (audioContext: AudioContext) => <
  Args extends any[],
  Output
>(
  config: Config<Args, Output>,
): RawOperatorResultFn<Args, Output> => {
  const { type, fn } = config
  return (...args: Args) => {
    const id = `${Math.random().toString(36).substring(7)}-${count++}`
    const fnResult = fn({
      type,
      id,
      args,
      audioContext,
      resolve: resolveFn,
    })

    return {
      type,
      id,
      output: fnResult.then(value => value.output) as any,
      subscription: deferSub(fnResult.then(({ subscription }) => subscription)),
    }
  }
}
