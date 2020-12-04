import { monaco as monacoReact } from '@monaco-editor/react'
import {
  defaultDialZoneValue,
  DialZoneLoading,
  DialZoneZooone,
} from '../components/Editor/DialZone'
import {
  evalCompiledUserCode as _evalCompiledUserCode,
  registerAllExports,
} from '../connection/imports'
import {
  addHighlighting,
  addHighlightingToEditor,
} from '../editor/add-highlighting'
import { chain } from '../editor/chain'
import { compileAndEval as _compileAndEval } from '../editor/compilation/compilation'
import { CoolZone, makeCoolZoneFactory } from '../editor/cool-zone'
import {
  loadFiles,
  setCompilerAndDiagnosticOptions,
} from '../editor/load-files'
import { getAllTokens, TokenPlaces } from '../editor/parsing/ts-parser'
import { EditorT, MonacoT } from '../editor/types'
import { SignalGraph } from '../lib2/priv/signal-graph'
import { startRuntime } from '../runtime/runtime'
import { LifecycleServices } from './types'
import { waitForShiftEnter } from './util'

export const preEditorSetup = async (getTokens: () => TokenPlaces) => {
  const monaco: MonacoT = await monacoReact.init()
  setCompilerAndDiagnosticOptions(monaco)
  addHighlighting(monaco, getTokens)
  await loadFiles(monaco)

  return { monaco }
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

  return chain()
    .then(() => {
      return tokens
        .map((token, index) => {
          const prevLine = index > 0 ? tokens[index - 1].line : -1

          if (token.line === prevLine) {
            return undefined
          }

          return coolZoneFactory(
            token,
            3,
            DialZoneZooone,
            DialZoneLoading,
            defaultDialZoneValue(codeDawVars[token.varName]),
          )
        })
        .filter(a => a) as CoolZone[]
    })
    .tap(result => console.log('big tap', result))
    .value()
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
  _evalCompiledUserCode(code)
  const codeDawVars = (window as any).codeDawVars
  return { codeDawVars }
}

const getTokensFromEditor = (editor: EditorT) => {
  const lines = editor.getModel()?.getLinesContent()!
  return getAllTokens(lines)
}

export const lifecycleServices: LifecycleServices = {
  preEditorSetup: (context, ...args) => {
    console.log('preeditor setup args', context, ...args)
    return preEditorSetup(() => context.tokens!)
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
    await startRuntime(context)
    return (waitForShiftEnter() as any) as Promise<void>
  },
}
