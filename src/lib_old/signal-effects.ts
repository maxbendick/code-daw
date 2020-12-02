import { Signal, SignalEffect } from './signal'
import * as Signals from './signals'
import { Number_ } from './utility-types'

export const map = <A, B>(f: (a: A) => B): SignalEffect<A, B> => {
  return (source: Signal<A>) => Signals.map(f, source)
}
export const mult = (a: Number_): SignalEffect<number, number> => source =>
  Signals.mult(a, source)
