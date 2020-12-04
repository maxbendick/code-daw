// where am I???
// import from a honeypot?

import { alertFinishedLoadingListeners } from '../editor/finished-loading-listeners'
import { makePublicFunction } from '../lib2/priv/make-public-function'
import { SuperDef } from '../lib2/priv/no-sig-types/super-def'
import { superDialDef } from '../lib2/priv/nodes/interactables/dial'
import { superMasterOutDef } from '../lib2/priv/nodes/io/master-out'
import { superSineDef } from '../lib2/priv/nodes/oscillators/sine'
import { globalSignalGraph } from '../lib2/priv/signal-graph'

export const evalCompiledUserCode = (code: string) => {
  ;(window as any).codeDawInEval = true
  eval(code)
  ;(window as any).codeDawInEval = false

  console.log(
    'from window!',
    (window as any).codeDawVars.firstDial._interactable,
  )

  alertFinishedLoadingListeners()
}

interface RegisterArgs {
  packageName: `code-daw/${string}`
  content: any
}

const registerExports = ({ packageName, content }: RegisterArgs) => {
  if ((window as any).codeDawInEval) {
    return
  }

  const w = window as any
  if (!w.codeDawPackages) {
    w.codeDawPackages = {}
  }

  // bad for dev server:
  // if (w.codeDawPackages[packageName]) {
  //   throw new Error(`tried to re-inject package: ${packageName}`)
  // }

  w.codeDawPackages[packageName] = content
}

const registerSuperDef = (superDef: SuperDef) => {
  registerExports({
    packageName: superDef.packageName as any,
    content: {
      [superDef.publicName]: makePublicFunction(superDef, globalSignalGraph),
    },
  })
}

export const registerAllExports = () => {
  registerSuperDef(superDialDef)
  registerSuperDef(superSineDef)
  registerSuperDef(superMasterOutDef)
}

// `require` in compiled user code becomes `codeDawRequire`
export const codeDawRequire = (packageName: string): any => {
  if (!packageName.startsWith('code-daw/')) {
    throw new Error(`Evil bad require for package: ${packageName}`)
  }
  return (window as any).codeDawPackages[packageName]
}
