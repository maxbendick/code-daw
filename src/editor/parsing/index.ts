import {
  createSystem,
  createVirtualTypeScriptEnvironment,
} from '@typescript/vfs'
import ts from 'typescript'

const doWhatever = () => {
  const fsMap = new Map<string, string>()
  const system = createSystem(fsMap)

  const compilerOpts = {}
  const env = createVirtualTypeScriptEnvironment(
    system,
    ['index.ts'],
    ts,
    compilerOpts,
  )

  // You can then interact with the languageService to introspect the code
  env.languageService.getDocumentHighlights('index.ts', 0, ['index.ts'])
}
