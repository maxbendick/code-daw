// where am I???
// import from a honeypot?

import { alertFinishedLoadingListeners } from '../editor/finished-loading-listeners'
import { superDefs } from '../lib2/priv/all-nodes'
import { BaseSuperDef } from '../lib2/priv/no-sig-types/super-def'
import { _interactables_exports } from '../lib2/priv/nodes/interactables/dial'
import { _io_exports } from '../lib2/priv/nodes/io/master-out'

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
  packageName: string // `code-daw/${string}`
  content: any
}

const registerExports = ({ packageName, content }: RegisterArgs) => {
  // Don't do in eval
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

const registerSuperDef = (superDef: BaseSuperDef) => {
  registerExports({
    packageName: superDef.packageName,
    content: {
      [superDef.publicName]: superDef.publicFunction,
    },
  })
}

export const registerAllExports = () => {
  registerExports(_interactables_exports)
  registerExports(_io_exports)

  for (const def of superDefs) {
    registerSuperDef(def)
  }
}

// `require` in compiled user code becomes `codeDawRequire`
export const codeDawRequire = (packageName: string): any => {
  if (!packageName.startsWith('code-daw/')) {
    throw new Error(`Evil bad require for package: ${packageName}`)
  }
  return (window as any).codeDawPackages[packageName]
}
