import { BehaviorSubject } from 'rxjs'

export type Signal<A> = BehaviorSubject<A>
export type Audio = AudioNode

export type AudioInput = Signal<number> | Audio

export type ResolveFn = <Packaged>(
  value: Packaged,
) => Promise<UnpackagedForUser<Packaged>>

export type PackagedForUser<A> = A

export type UnpackagedForUser<A> = A
