// where am I???
// import from a honeypot?

import { alertFinishedLoadingListeners } from '../editor/finished-loading-listeners'
import { registeredSuperDefs } from '../lib2/priv/all-nodes'
import { makePublicFunction } from '../lib2/priv/make-public-function'
import { SuperDef } from '../lib2/priv/no-sig-types/super-def'
import { SignalGraph } from '../lib2/priv/signal-graph'

export const evalCompiledUserCode = (code: string) => {
  ;(window as any).codeDawInEval = true
  eval(code)
  ;(window as any).codeDawInEval = false

  alertFinishedLoadingListeners()
}

interface RegisterArgs {
  packageName: `code-daw/${string}`
  content: any
}

// TODO could check for reinjection, but need to
// handle dev server?
// TODO try destroying in lifecycle?
const registerExports = ({ packageName, content }: RegisterArgs) => {
  if ((window as any).codeDawInEval) {
    return
  }

  const w = window as any
  if (!w.codeDawPackages) {
    w.codeDawPackages = {}
  }
  if (!w.codeDawPackages[packageName]) {
    w.codeDawPackages[packageName] = {}
  }
  w.codeDawPackages[packageName] = {
    ...w.codeDawPackages[packageName],
    ...content,
  }
}

const registerSuperDef = (superDef: SuperDef, signalGraph: SignalGraph) => {
  registerExports({
    packageName: superDef.packageName as any,
    content: {
      [superDef.publicName]: makePublicFunction(superDef, signalGraph),
    },
  })
}

export const registerAllExports = (signalGraph: SignalGraph) => {
  for (const def of registeredSuperDefs) {
    registerSuperDef(def, signalGraph)
  }
}

// `require` in compiled user code becomes `codeDawRequire`
export const codeDawRequire = (packageName: string): any => {
  if (!packageName.startsWith('code-daw/')) {
    throw new Error(`Evil bad require for package: ${packageName}`)
  }
  return (window as any).codeDawPackages[packageName]
}
