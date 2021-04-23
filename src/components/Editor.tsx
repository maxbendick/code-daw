import MonacoEditor from '@monaco-editor/react'
import { useService } from '@xstate/react'
import { Interpreter } from 'xstate'
import * as Config from '../config'
import { EditorT } from '../editor/types'
import {
  LifecycleContext,
  LifecycleEvent,
  LifecycleStateSchema
} from '../lifecycle/types'

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
    <div>
      <MonacoEditor
        height="calc(100vh - 150px)"
        language="typescript"
        theme="dark"
        options={{
          fontSize: Config.fontSize,
          lineHeight: Config.lineHeight,
          lineNumbers: () => ' ',
          ['semanticHighlighting.enabled' as any]: true,
        }}
        value={''}
        editorDidMount={handleEditorDidMount}
      />
    </div>
  )
}
  