import { Signal } from './signal';
import { _Subscription } from './_subscription';

export const SignalTransport = {
  curr: 0 as number,
  onSignalTick: (t: number): _Subscription => {
    // TODO
    return null as any;
  },
  tick: (null as any) as Signal<number>,
};
