import { makePublicFunction } from '../priv/make-public-function'
import { superSineDef } from '../priv/nodes/oscillators/sine'
import { globalSignalGraph } from '../priv/signal-graph'

export const sine = makePublicFunction(superSineDef, globalSignalGraph)
