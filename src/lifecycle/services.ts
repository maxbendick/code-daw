import { monaco as monacoReact } from '@monaco-editor/react'
import {
  evalCompiledUserCode as _evalCompiledUserCode,
  registerAllExports,
} from '../connection/imports'
import {
  // addHighlighting,
  addHighlightingToEditor,
} from '../editor/add-highlighting'
import { compileAndEval as _compileAndEval } from '../editor/compilation/compilation'
import { makeCoolZoneFactory } from '../editor/cool-zone'
import {
  // loadFiles,
  setCompilerAndDiagnosticOptions,
} from '../editor/load-files'
import { getAllTokens, TokenPlaces } from '../editor/parsing/ts-parser'
import { EditorT, MonacoT } from '../editor/types'
import { getSuperDef } from '../lib2/priv/all-nodes'
import { SignalGraph } from '../lib2/priv/signal-graph'
import { startLightRuntime } from '../light-runtime/light-runtime'
import { startRuntime } from '../runtime/runtime'
import { LifecycleServices } from './types'
import { waitForShiftEnter } from './util'

export const monacoSetup = async (
  monaco: MonacoT,
  getTokens: () => TokenPlaces,
) => {
  // const monaco: MonacoT = await monacoReact.init()
  setCompilerAndDiagnosticOptions(monaco)
  // addHighlighting(monaco, getTokens)
  // await loadFiles(monaco)
  // return { monaco }
}

// rename to attach cool zones
export const attachCoolZones = async (
  monaco: MonacoT,
  editor: EditorT,
  tokens: TokenPlaces,
  codeDawVars: any,
) => {
  addHighlightingToEditor(editor)

  const coolZoneFactory = makeCoolZoneFactory(monaco, editor, codeDawVars)

  return tokens
    .filter((token, index) => {
      const prevLine = index > 0 ? tokens[index - 1].line : -1
      return token.line !== prevLine
    })
    .map(token => {
      const codeDawVar = codeDawVars?.[token.varName]
      if (!codeDawVar) {
        throw new Error('no code daw var!!!')
      }
      const superDef = getSuperDef(codeDawVar.type)
      return coolZoneFactory(
        token,
        3,
        superDef.zoneComponent!,
        superDef.zoneLoadingComponent!,
      )
    })
}

export const compileAndEval = async (
  signalGraph: SignalGraph,
  editor: EditorT,
  tokens: TokenPlaces,
) => {
  registerAllExports(signalGraph)
  return await _compileAndEval(editor, tokens)
}

export const evalCompiledUserCode = async (code: string) => {
  const result = await _evalCompiledUserCode(code)
  const { codeDawVars } = result
  console.log('eval compiled user code', result)
  // const codeDawVars = (window as any).codeDawVars
  // const codeDawExports = (window as any).codeDawExports
  // console.log('codeDawExports', codeDawExports)
  return { codeDawVars }
}

const getTokensFromEditor = (editor: EditorT) => {
  const lines = editor.getModel()?.getLinesContent()!
  return getAllTokens(lines)
}

export const lifecycleServices: LifecycleServices = {
  loadMonaco: () => monacoReact.init(),
  monacoSetup: (context, ...args) => {
    console.log('preeditor setup args', context, ...args)
    return monacoSetup(context.monaco!, () => context.tokens!)
  },
  startLightRuntime: async context => {
    await startLightRuntime(context, waitForShiftEnter())
  },

  compileCode: context =>
    compileAndEval(context.signalGraph!, context.editor!, context.tokens!),
  evalCompiledUserCode: context => evalCompiledUserCode(context.compiledCode!),
  attachCoolZones: context =>
    attachCoolZones(
      context.monaco!,
      context.editor!,
      context.tokens!,
      context.codeDawVars!,
    ),
  parseTokens: async context => {
    return getTokensFromEditor(context.editor!)
  },
  doRuntime: async context => {
    const { destroy } = startRuntime(context)
    await waitForShiftEnter()
    await destroy()
    return
  },
}
