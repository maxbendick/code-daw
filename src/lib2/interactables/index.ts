import { makePublicFunction } from '../priv/make-public-function'
import { superDialDef } from '../priv/nodes/interactables/dial'
import { globalSignalGraph } from '../priv/signal-graph'

export const dial = makePublicFunction(superDialDef, globalSignalGraph)
