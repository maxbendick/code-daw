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
import { getAllTokens } from '../editor/parsing/ts-parser'
import { EditorT, MonacoT } from '../editor/types'
import { LifecycleContext } from './machine'

export const preEditorSetup = async () => {
  const monaco: MonacoT = await monacoReact.init()
  setCompilerAndDiagnosticOptions(monaco)
  addHighlighting(monaco)
  await loadFiles(monaco)
  registerAllExports()

  return { monaco }
}

export const postEditorSetup = async (monaco: MonacoT, editor: EditorT) => {
  addHighlightingToEditor(editor)

  chain()
    .then(() => editor.getModel()?.getLinesContent()!)
    .then(getAllTokens)
    .then(tokens => {
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

export const compileAndEval = async (editor: EditorT) => {
  return await _compileAndEval(editor)
}

export const evalCompiledUserCode = async (code: string) => {
  return _evalCompiledUserCode(code)
}

export const lifecycleServices = {
  preEditorSetup: () => preEditorSetup(),
  postEditorSetup: (context: LifecycleContext) =>
    postEditorSetup(context.monaco!, context.editor!),
  compileCode: (context: LifecycleContext) => compileAndEval(context.editor!),
  evalCompiledUserCode: (context: LifecycleContext) =>
    evalCompiledUserCode(context.compiledCode!),
}
