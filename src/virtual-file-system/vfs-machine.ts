import { Actor, assign, Interpreter, Machine, send, spawn, State } from 'xstate'
import { makeLocalStorageVfs, VfsFile, VirtualFileSystem } from '.'
import { EditorT } from '../editor/types'

export type VfsActor = Actor<
  State<
    VfsContext,
    VfsEvent,
    any,
    {
      value: any
      context: VfsContext
    }
  >,
  VfsEvent
>

interface VfsContext {
  vfs?: VirtualFileSystem
  activePath?: string | null
  requestRefs: any[]
  pathToContent: { [path: string]: string }
}

// getActiveFileContentFromContext = (context: VfsContext) => string | null
// getActiveFilePathFromContext = (context: VfsContext) => string | null

// activeFileContent$ = vfsService => Observable<string | null>
// activeFilePath$ = vfsService => Observable<string | null>

type VfsActorEvent =
  | { type: `done.invoke.get-${string}`; data: VfsFile }
  | { type: `done.invoke.set-${string}`; data: VfsFile }

const isVfsActorEvent = (event: VfsEvent): event is VfsActorEvent => {
  return (
    event.type.startsWith('done.invoke.vfs-get-') ||
    event.type.startsWith('done.invoke.vfs-set-')
  )
}

export type VfsEvent =
  | { type: 'VFS_GET'; path: string }
  | { type: 'VFS_SET'; path: string; content: string }
  | { type: 'VFS_SET_ACTIVE'; path: string }
  | { type: 'VFS_LOAD_ALL' }
  | { type: 'VFS_SET_EDITOR'; editor: EditorT }
  | { type: 'VFS_DO_SETUP' }
  | VfsActorEvent

export interface VfsStateSchema {
  states: {
    preSetup: {}
    setup: {}
    ready: {}
  }
}

let nextId = 1

export type VfsService = Interpreter<
  VfsContext,
  VfsStateSchema,
  VfsEvent,
  {
    value: any
    context: VfsContext
  }
>

export const makeVfsMachine = (
  storage: Storage = window.localStorage,
  fetchFn: typeof window.fetch = window.fetch,
) => {
  console.error('makin mahcine')
  const machine = Machine<VfsContext, VfsStateSchema, VfsEvent>({
    id: 'vfs',
    initial: 'preSetup',
    context: { requestRefs: [], pathToContent: {} },
    states: {
      preSetup: {
        entry: send('VFS_DO_SETUP'),
        on: {
          VFS_DO_SETUP: 'setup',
        },
      },
      setup: {
        invoke: {
          src: async (context, event) => {
            console.error('in vfs setup')
            const vfs = await makeLocalStorageVfs(storage, fetchFn)
            console.error('got vfs client', vfs)
            const paths = await vfs.getAllPaths()
            console.error('got all paths', paths)
            const pathToContent: { [path: string]: VfsFile } = {}
            for (const path of paths) {
              pathToContent[path] = await vfs.get(path)
            }

            console.log('in vfs setup at end of vfs')
            return { vfs, pathToContent }
          },
          onDone: {
            target: 'ready' as const,
            actions: [
              assign({
                vfs: (context, event) => event.data.vfs as VirtualFileSystem,
                pathToContent: (context, event) => event.data.pathToContent,
              }),
            ],
          },
        },
      },
      ready: {
        on: {
          VFS_GET: {
            actions: assign({
              requestRefs: (context, event) => {
                return [
                  ...context.requestRefs,
                  spawn(context.vfs?.get(event.path)!, `vfs-get-${nextId++}`),
                ]
              },
            }),
          },
          VFS_SET: {
            actions: assign({
              requestRefs: (context, event) => {
                return [
                  ...context.requestRefs,
                  spawn(
                    context.vfs?.set(event.path, event.content)!,
                    `vfs-set-${nextId++}`,
                  ),
                ]
              },
            }),
          },
          VFS_SET_ACTIVE: {
            actions: assign({
              activePath: (context, event) => event.path,
            }),
          },
          '*': {
            actions: assign({
              requestRefs: (context, event) => {
                if (!isVfsActorEvent(event)) {
                  return context.requestRefs
                }
                return context.requestRefs.filter(
                  ref => !event.type.endsWith(ref.id),
                )
              },
              pathToContent: (context, event) => {
                if (isVfsActorEvent(event)) {
                  return {
                    ...context.pathToContent,
                    [event.data.path]: event.data.content,
                  }
                }
                return context.pathToContent
              },
            }),
          },
        },
      },
    },
  })

  return machine
}
