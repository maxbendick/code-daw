import { monaco as monacoReact } from '@monaco-editor/react'
import { TextZoneLoading, TextZoneZooone } from '../components/Editor/TextZone'
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
import { CoolZone } from '../editor/cool-zone'
import {
  loadFiles,
  setCompilerAndDiagnosticOptions,
} from '../editor/load-files'
import { getAllTokens, TokenPlaces } from '../editor/parsing/ts-parser'
import { EditorT, MonacoT } from '../editor/types'
import { LifecycleContext } from './machine'

export const preEditorSetup = async (getTokens: () => TokenPlaces) => {
  const monaco: MonacoT = await monacoReact.init()
  setCompilerAndDiagnosticOptions(monaco)
  addHighlighting(monaco, getTokens)
  await loadFiles(monaco)
  registerAllExports()

  return { monaco }
}

export const postEditorSetup = async (
  monaco: MonacoT,
  editor: EditorT,
  tokens: TokenPlaces,
) => {
  addHighlightingToEditor(editor)

  chain()
    .then(() => {
      return tokens
        .map((token, index) => {
          const prevLine = index > 0 ? tokens[index - 1].line : -1

          if (token.line === prevLine) {
            return undefined
          }

          return new CoolZone(
            monaco,
            editor,
            token,
            3,
            TextZoneZooone,
            TextZoneLoading,
          )
        })
        .filter(a => a)
    })
    .tap(result => console.log('big tap', result))
}

export const compileAndEval = async (editor: EditorT, tokens: TokenPlaces) => {
  return await _compileAndEval(editor, tokens)
}

export const evalCompiledUserCode = async (code: string) => {
  return _evalCompiledUserCode(code)
}

const getTokensFromEditor = (editor: EditorT) => {
  const lines = editor.getModel()?.getLinesContent()!
  return getAllTokens(lines)
}

export const lifecycleServices = {
  preEditorSetup: (context: LifecycleContext) =>
    preEditorSetup(() => context.tokens!),
  postEditorSetup: (context: LifecycleContext) =>
    postEditorSetup(context.monaco!, context.editor!, context.tokens!),
  compileCode: (context: LifecycleContext) =>
    compileAndEval(context.editor!, context.tokens!),
  evalCompiledUserCode: (context: LifecycleContext) =>
    evalCompiledUserCode(context.compiledCode!),
  parseTokens: async (context: LifecycleContext) => {
    return getTokensFromEditor(context.editor!)
  },
}
