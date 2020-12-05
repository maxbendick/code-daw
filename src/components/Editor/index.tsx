import MonacoEditor from '@monaco-editor/react'
import { useService } from '@xstate/react'
import { Interpreter } from 'xstate'
import * as Config from '../../config'
import { EditorT } from '../../editor/types'
import {
  LifecycleContext,
  LifecycleEvent,
  LifecycleStateSchema,
} from '../../lifecycle/types'
import { code4 } from './code'
import './Editor.css'

interface Props {
  lifecycleService: Interpreter<
    LifecycleContext,
    LifecycleStateSchema,
    LifecycleEvent,
    {
      value: any
      context: LifecycleContext
    }
  >
}

export const Editor: React.FC<Props> = ({ lifecycleService }) => {
  const [state, send] = useService(lifecycleService)

  const handleEditorDidMount = (_: any, editor: EditorT) => {
    send({
      type: 'EDITOR_CREATED',
      editor: editor,
    })
  }

  return (
    <MonacoEditor
      height="calc(100vh - 100px)"
      language="typescript"
      theme="dark"
      options={{
        fontSize: Config.fontSize,
        lineHeight: Config.lineHeight,
        ['semanticHighlighting.enabled' as any]: true,
      }}
      value={code4}
      editorDidMount={handleEditorDidMount}
    />
  )
}
