// where am I???
// import from a honeypot?

import { _interactables_exports } from '../lib/interactables'

export const evalCompiledUserCode = (code: string) => {
  ;(window as any).codeDawInEval = true
  eval(code)
  ;(window as any).codeDawInEval = false

  console.log(
    'from window!',
    (window as any).codeDawVars.firstDial._interactable,
  )
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

export const registerAllExports = () => {
  registerExports(_interactables_exports)
}

// `require` in compiled user code becomes `codeDawRequire`
export const codeDawRequire = (packageName: string): any => {
  if (!packageName.startsWith('code-daw/')) {
    throw new Error(`Evil bad require for package: ${packageName}`)
  }
  return (window as any).codeDawPackages[packageName]
}
