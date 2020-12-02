import { Signal } from './signal'

export type SignalLike<A> = A | Signal<A>
export type Number_ = SignalLike<number>
export type Hz = number
export type Hz_ = SignalLike<Hz>
export type Radians = number
export type Phase_ = SignalLike<Radians>
export type Percent = number
export type Percent_ = SignalLike<Percent>
