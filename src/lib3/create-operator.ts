import { Subscription } from 'rxjs'
import { PackagedForUser, ResolveFn, UnpackagedForUser } from './types'

interface Node<Output> {
  id: string
  type: string
  output: Output
  subscription: Subscription
}

type RawOperatorInputFn<Args extends any[], Output> = (a: {
  args: Args
  audioContext: AudioContext
  resolve: ResolveFn
  type: string
  id: string
}) => Promise<Node<Output>>

type RawOperatorResultFn<Args extends any[], Output> = (
  ...args: Args
) => Promise<{ output: PackagedForUser<Output>; subscription: Subscription }>

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

export const createRawOperatorFactory = (audioContext: AudioContext) => <
  Args extends any[],
  Output
>(
  config: Config<Args, Output>,
): RawOperatorResultFn<Args, Output> => {
  const { type, fn } = config
  return async (...args: Args) => {
    const id = `${Math.random().toString(36).substring(7)}-${count++}`
    const { output, subscription } = await fn({
      type,
      id,
      args,
      audioContext,
      resolve: resolveFn,
    })

    return {
      type,
      id,
      output,
      subscription,
    }
  }
}
