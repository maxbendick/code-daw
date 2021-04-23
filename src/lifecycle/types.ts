import { EditorT, MonacoT } from '../editor/types'
import { VfsActor } from '../virtual-file-system/vfs-machine'

export type LifecycleEvent =
  | { type: 'REACT_MOUNTED' }
  | { type: 'EDITOR_CREATED'; editor: EditorT }
  | { type: 'RESET_CODE' }
  | { type: '__nil'; data: any }

export interface LifecycleStateSchema {
  states: {
    preMount: {}
    loadingMonaco: {}
    monacoSetup: {}
    creatingEditor: {}
    editing: {}
    lightRuntime: {
      states: {
        running: {}
        shuttingDown: {}
        destroyed: {}
      }
    }
    failure: {}
  }
}

export interface LifecycleContext {
  monaco?: MonacoT
  editor?: EditorT
  vfsActor?: VfsActor
  runtimeProcess?: { shutdown: () => Promise<any> }
}

export type LifecycleServices = {
  loadMonaco: () => Promise<MonacoT>
  monacoSetup: (context: LifecycleContext) => Promise<void>
  startLightRuntime: (context: LifecycleContext) => Promise<void>
}
