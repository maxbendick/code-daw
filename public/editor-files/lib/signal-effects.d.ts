import { SignalEffect } from './signal';
import { Number_ } from './utility-types';
export declare const map: <A, B>(f: (a: A) => B) => SignalEffect<A, B>;
export declare const mult: (a: Number_) => SignalEffect<number, number>;
