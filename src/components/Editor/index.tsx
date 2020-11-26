import MonacoEditor, { monaco as monacoReact } from '@monaco-editor/react'
import * as React from 'react'
import * as Config from '../../config'
import { CoolZone } from '../../editor/cool-zone'
import { setAllInstances } from '../../editor/instances'
import { EditorT, MonacoT } from '../../editor/types'
import { code2 } from './code'
import './Editor.css'
import { PlaceholderZoneContent } from './PlaceholderZoneContent'
import { TextZone } from './TextZone'

const setupEditor = async (editor: EditorT) => {
  const monaco: MonacoT = await monacoReact.init()
  setAllInstances({ editor, monaco })

  const coolZone = new CoolZone(6, 3, <PlaceholderZoneContent />)
  const coolZone2 = new CoolZone(2, 3, <TextZone label={'My text'} />)
  ;(window as any).coolZone = coolZone
  ;(window as any).coolZone2 = coolZone2
}

export const Editor: React.FC = () => {
  const handleEditorDidMount = (_: any, editor: EditorT) => {
    setupEditor(editor)
  }

  return (
    <MonacoEditor
      height="calc(100vh - 330px)"
      language="typescript"
      theme="dark"
      options={{ fontSize: Config.fontSize, lineHeight: Config.lineHeight }}
      value={code2}
      editorDidMount={handleEditorDidMount}
    />
  )
}
