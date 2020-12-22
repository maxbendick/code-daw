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
import { VfsActor } from '../../virtual-file-system/vfs-machine'
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
  vfsActor: VfsActor
}

export const Editor: React.FC<Props> = ({ lifecycleService, vfsActor }) => {
  const [state, send] = useService(lifecycleService)

  const handleEditorDidMount = (_: any, editor: EditorT) => {
    const monaco = state.context.monaco
    if (!monaco) {
      throw new Error('expected monaco')
    }
    const newModel = monaco.editor.createModel(
      '',
      'typescript',
      monaco.Uri.file('/placer-file.tsx'),
    )
    editor.setModel(newModel)
    send({
      type: 'EDITOR_CREATED',
      editor: editor,
    })
  }

  return (
    <MonacoEditor
      height="calc(100vh - 150px)"
      language="typescript"
      theme="dark"
      options={{
        fontSize: Config.fontSize,
        lineHeight: Config.lineHeight,
        ['semanticHighlighting.enabled' as any]: true,
      }}
      value={''}
      editorDidMount={handleEditorDidMount}
    />
  )
}
