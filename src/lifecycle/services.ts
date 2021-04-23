import { monaco as monacoReact } from '@monaco-editor/react'
import { setCompilerAndDiagnosticOptions } from '../editor/set-compiler-and-diagnostic-options'
import { startLightRuntime } from '../light-runtime/light-runtime'
import { LifecycleServices } from './types'
import { waitForShiftEnter } from './util'


export const lifecycleServices: LifecycleServices = {
  loadMonaco: () => monacoReact.init(),
  monacoSetup: async (context) => {
    return setCompilerAndDiagnosticOptions(context.monaco!)
  },
  startLightRuntime: async context => {
    await startLightRuntime(context, waitForShiftEnter())
  },
}
