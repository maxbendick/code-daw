import MonacoEditor, { monaco as monacoReact } from '@monaco-editor/react'
import * as React from 'react'
import * as Config from '../../config'
import { CoolZone } from '../../lib/editor/cool-zone'
import { setAllInstances } from '../../lib/editor/instances'
import { EditorT, MonacoT } from '../../lib/editor/types'
import { code } from './code'
import './Editor.css'
import { PlaceholderZoneContent } from './PlaceholderZoneContent'

const setupEditor = async (editor: EditorT) => {
  const monaco: MonacoT = await monacoReact.init()
  setAllInstances({ editor, monaco })

  const coolZone = new CoolZone(3, 3, <PlaceholderZoneContent />)
  const coolZone2 = new CoolZone(6, 6, <div>hello</div>)
  // const coolZone2 = new CoolZone(6, 3, <PlaceholderZoneContent />)
  ;(window as any).coolZone = coolZone
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
      value={code}
      editorDidMount={handleEditorDidMount}
    />
  )
}
