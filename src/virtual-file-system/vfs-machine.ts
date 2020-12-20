import { Actor, assign, Interpreter, Machine, spawn, State } from 'xstate'
import { makeLocalStorageVfs, VfsFile, VirtualFileSystem } from '.'
import { EditorT } from '../editor/types'

export type VfsActor = Actor<
  State<
    VfsContext,
    VfsEvent,
    VfsStateSchema,
    {
      value: any
      context: VfsContext
    }
  >,
  VfsEvent
>

export interface VfsContext {
  vfs?: VirtualFileSystem
  activePath: string
  requestRefs: any[]
  pathToFile: { [path: string]: VfsFile }
  editor?: EditorT
}

// getActiveFileContentFromContext = (context: VfsContext) => string | null
// getActiveFilePathFromContext = (context: VfsContext) => string | null

// activeFileContent$ = vfsService => Observable<string | null>
// activeFilePath$ = vfsService => Observable<string | null>

type VfsActorEvent =
  | { type: `done.invoke.get-${string}`; data: VfsFile }
  | { type: `done.invoke.set-${string}`; data: VfsFile }

const isVfsSaveEvent = (
  event: VfsEvent,
): event is { type: 'VFS_SET'; path: string; content: string } => {
  return event.type.startsWith('done.invoke.vfs-set-')
}

const isVfsActorEvent = (event: VfsEvent): event is VfsActorEvent => {
  return event.type.startsWith('done.invoke.vfs-get-') || isVfsSaveEvent(event)
}

export type VfsEvent =
  | { type: 'VFS_GET'; path: string }
  | { type: 'VFS_SET'; path: string; content: string }
  | { type: 'VFS_SET_ACTIVE'; path: string }
  | { type: 'VFS_LOAD_ALL' }
  | { type: 'VFS_SET_EDITOR'; editor: EditorT }
  | { type: 'VFS_DO_SETUP' }
  | { type: 'VFS_SAVE_ACTIVE' }
  | { type: 'VFS_GET_ALL'; id: string | number }
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
  const machine = Machine<VfsContext, VfsStateSchema, VfsEvent>({
    id: 'vfs',
    initial: 'preSetup',
    context: { activePath: '/index.tsx', requestRefs: [], pathToFile: {} },
    states: {
      preSetup: {
        on: {
          VFS_SET_EDITOR: {
            target: 'setup',
            actions: assign({
              editor: (context, event) => event.editor,
            }),
          },
        },
      },
      setup: {
        invoke: {
          src: async (context, event) => {
            const vfs = await makeLocalStorageVfs(storage, fetchFn)
            const paths = await vfs.getAllPaths()
            const pathToFile: { [path: string]: VfsFile } = {}
            for (const path of paths) {
              pathToFile[path] = await vfs.get(path)
            }

            return { vfs, pathToFile: pathToFile }
          },
          onDone: {
            target: 'ready' as const,
            actions: [
              assign({
                vfs: (context, event) => event.data.vfs as VirtualFileSystem,
                pathToFile: (context, event) => event.data.pathToFile,
              }),
              (context, event) => {
                context.editor?.setValue(
                  context.pathToFile[context.activePath].content,
                )
              },
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
            actions: [
              assign({
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
            ],
          },
          VFS_SAVE_ACTIVE: {
            actions: assign({
              requestRefs: (context, event) => {
                const path = context.activePath
                const content = context.editor?.getValue()

                if (!content) {
                  console.error(context, event)
                  throw new Error('no content to save')
                }

                return [
                  ...context.requestRefs,
                  spawn(
                    context.vfs?.set(path, content)!,
                    `vfs-set-${nextId++}`,
                  ),
                ]
              },
            }),
          },
          VFS_SET_ACTIVE: {
            actions: [
              assign({
                activePath: (context, event) => event.path,
              }),
              (context, event) => {
                const { content } = context.pathToFile[event.path]
                context.editor?.setValue(content)
              },
            ],
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
              pathToFile: (context, event) => {
                if (isVfsActorEvent(event)) {
                  return {
                    ...context.pathToFile,
                    [event.data.path]: {
                      path: event.data.path,
                      content: event.data.content,
                    },
                  }
                }
                return context.pathToFile
              },
            }),
          },
        },
      },
    },
  })

  return machine
}
