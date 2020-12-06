import { Observable } from 'rxjs'
import { ZoneComponent, ZoneLoadingComponent } from '../zone-component'
import { EdgeType } from './edge-types'

/*
TODOs

Maybe later: can have a function that takes in audio 
context, args, and a resolver fn that recurses in graph
to find or create the input. Each node would resolve 
the inputs it wants. 

Example: resolve(args[0].frequency, EdgeType.Signal): AudioNode | Observable<number>

*/
export interface SuperDef {
  nodeType: string
  inputs: { [k: string]: EdgeType }
  output: EdgeType
  interactable: boolean
  makeOutput: (
    audioContext: AudioContext,
    config: any,
    inputs: any,
    send$?: Observable<any>,
  ) => any
  argsToInputs: (...args: any[]) => any
  argsToConfig: (...args: any[]) => any
  zoneComponent?: ZoneComponent<any>
  zoneLoadingComponent?: ZoneLoadingComponent
}

export class ConfigValidationError extends Error {
  constructor(nodeType: string, config: any) {
    console.error('config', config)
    super(`${nodeType} config validation error`)
  }
}
