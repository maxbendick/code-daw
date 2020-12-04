import { makePublicFunction } from '../priv/make-public-function'
import { superMasterOutDef } from '../priv/nodes/io/master-out'
import { globalSignalGraph } from '../priv/signal-graph'

export const masterOut = makePublicFunction(
  superMasterOutDef,
  globalSignalGraph,
)
