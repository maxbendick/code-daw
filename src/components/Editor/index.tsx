import MonacoEditor, { monaco as monacoReact } from '@monaco-editor/react'
import { useEffect, useState } from 'react'
import * as Config from '../../config'
import { registerAllExports } from '../../connection/imports'
import {
  addHighlighting,
  addHighlightingToEditor,
} from '../../editor/add-highlighting'
import { chain } from '../../editor/chain'
import { compileAndEval } from '../../editor/compilation/compilation'
import { CoolZone } from '../../editor/cool-zone'
import { setAllInstances } from '../../editor/instances'
import {
  loadFiles,
  setCompilerAndDiagnosticOptions,
} from '../../editor/load-files'
import { getAllTokens } from '../../editor/parsing/tokens'
import { EditorT, MonacoT } from '../../editor/types'
import { code4 } from './code'
import './Editor.css'
import { TextZone } from './TextZone'

const setupEditor = async (editor: EditorT) => {
  const monaco: MonacoT = await monacoReact.init()
  setAllInstances({ editor, monaco })
  addHighlightingToEditor(editor)

  // const coolZone = new CoolZone(6, 3, <PlaceholderZoneContent />)
  // const coolZone2 = new CoolZone(2, 3, <TextZone label={'My text'} />)
  // ;(window as any).coolZone = coolZone
  // ;(window as any).coolZone2 = coolZone2

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
            token.line + 1,
            3,
            <TextZone label={`My ${token.token}`} />,
          )
        })
        .filter(a => a)
    })
    .tap(result => console.log('big tap', result))

  compileAndEval(editor)
}

const editorPreSetup = async () => {
  const monaco: MonacoT = await monacoReact.init()
  setCompilerAndDiagnosticOptions(monaco)
  addHighlighting(monaco)
  await loadFiles(monaco)
  registerAllExports()
}

interface InitialData {
  monaco: MonacoT
}

export const Editor: React.FC = () => {
  const [editorPreSetupFinished, setEditorPreSetupFinished] = useState<boolean>(
    false,
  )

  const handleEditorDidMount = (_: any, editor: EditorT) => {
    console.log('completing setup now')
    setupEditor(editor)
  }

  useEffect(() => {
    console.warn('use effect called!')
    ;(async () => {
      await editorPreSetup()
      setEditorPreSetupFinished(true)
    })()
  }, [])

  if (!editorPreSetupFinished) {
    return <div>loading...</div>
  }

  const extraOptions: { [k: string]: boolean } = {
    'semanticHighlighting.enabled': true,
  }

  return (
    <MonacoEditor
      height="calc(100vh - 100px)"
      language="typescript"
      theme="dark"
      options={{
        fontSize: Config.fontSize,
        lineHeight: Config.lineHeight,
        ...extraOptions,
      }}
      value={code4}
      editorDidMount={handleEditorDidMount}
    />
  )
}
