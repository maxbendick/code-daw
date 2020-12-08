// where am I???
// import from a honeypot?

import { es6Eval } from '../editor/compilation/es6-eval'
import { alertFinishedLoadingListeners } from '../editor/finished-loading-listeners'
import { registeredSuperDefs } from '../lib2/priv/all-nodes'
import { makePublicFunction } from '../lib2/priv/make-public-function'
import { SuperDef } from '../lib2/priv/no-sig-types/super-def'
import { SignalGraph } from '../lib2/priv/signal-graph'

export const evalCompiledUserCode = async (code: string) => {
  ;(window as any).codeDawInEval = true
  const { codeDawVars } = await es6Eval(code)
  // await new Promise(resolve => setTimeout(resolve, 2000))

  // eval(code)
  ;(window as any).codeDawInEval = false

  alertFinishedLoadingListeners()
  return { codeDawVars }
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

const getPublicName = (superDef: SuperDef) => {
  const publicName = superDef.nodeType.split('/')[1]
  if (!publicName) {
    throw new Error('could not get publicName')
  }
  return publicName
}

const getPackageName = (superDef: SuperDef) => {
  const split = superDef.nodeType.split('/')
  // THIS LINE WILL BREAK TYPESCRIPT
  // const result = `code-daw/${split[0]}` as const
  const result = `code-daw/${split[0]}`
  if (!result) {
    throw new Error('could not get publicName')
  }
  return result
}

const registerSuperDef = (superDef: SuperDef, signalGraph: SignalGraph) => {
  registerExports({
    packageName: getPackageName(superDef) as any,
    content: {
      [getPublicName(superDef)]: makePublicFunction(superDef, signalGraph),
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
