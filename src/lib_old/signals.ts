import { Signal } from './signal'
import { Number_, SignalLike } from './utility-types'

const _sine = (freq: number, phase: number, t: number): number => 0
const _square = (freq: number, phase: number, t: number): number => 0
const _triangle = (freq: number, phase: number, t: number): number => 0

export const of = <A>(a: A): Signal<A> => new Signal(set => set(a))

export const from = <A>(a: SignalLike<A>): Signal<A> =>
  ((a as any) as Signal<A>)._signal
    ? ((a as any) as Signal<A>)
    : (of(a) as Signal<A>)

export const add = (a: Number_, b: Number_): Signal<number> =>
  combineMap((x, y) => x + y, from(a), from(b))

export const mult = (a: Number_, b: Number_): Signal<number> =>
  combineMap((x, y) => x * y, from(a), from(b))
// static periodic = (f: (freq: number, phase: number, t: number) => number) => (
//   freqHz: Hz_,
//   phase?: Phase_
// ): Signal<number> => {
//   const safeHz = Signals.from(freqHz);
//   const safePhase = Signals.from(phase ?? 0);
//   return Signals.combine3(
//     (freq, phase, tick) => f(freq, phase, tick),
//     safeHz,
//     safePhase,
//     SignalTransport.tick
//   );
// };

export const periodic = (...args: any) => (...args: any) => of(1)

export const sine = (...args: any) => of(1) // Signals.periodic(sine);

export const triangle = periodic(_triangle)

export const square = periodic(_square)

export const map = <A, B>(f: (a: A) => B, a: Signal<A>) =>
  new Signal<B>(set => a._subscribe(() => set(f(a._curr))))

export const combineMap = <A, B, C>(
  f: (a: A, b: B) => C,
  a: Signal<A>,
  b: Signal<B>
): Signal<C> => {
  return new Signal(set => {
    const setForCurrentVals = () => set(f(a._curr, b._curr))
    const subA = a._stealthSubscribe(setForCurrentVals)
    const subB = b._stealthSubscribe(setForCurrentVals)
    setForCurrentVals()
    return subA.combine(subB)
  })
}

export const combine3 = <A, B, C, D>(
  f: (a: A, b: B, c: C) => D,
  a: Signal<A>,
  b: Signal<B>,
  c: Signal<C>
): Signal<D> => {
  return null as any
}

export const pair = <A, B>(a: Signal<A>, b: Signal<B>): Signal<[A, B]> => {
  return combineMap((a, b) => [a, b], a, b)
}
