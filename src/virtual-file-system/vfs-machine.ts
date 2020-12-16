import { Actor, assign, Interpreter, Machine, spawn, State } from 'xstate'
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
            console.error('in vfs setup')
            const vfs = await makeLocalStorageVfs(storage, fetchFn)
            console.error('got vfs client', vfs)
            const paths = await vfs.getAllPaths()
            console.error('got all paths', paths)
            const pathToFile: { [path: string]: VfsFile } = {}
            for (const path of paths) {
              pathToFile[path] = await vfs.get(path)
            }

            console.log('in vfs setup at end of vfs')
            return { vfs, pathToFile: pathToFile }
          },
          onDone: {
            target: 'ready' as const,
            actions: [
              assign({
                vfs: (context, event) => event.data.vfs as VirtualFileSystem,
                pathToFile: (context, event) => event.data.pathToFile,
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
            actions: [
              assign({
                requestRefs: (context, event) => {
                  console.log('saving!!!')
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
                console.log('saving!!!')
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
                console.log('set active!', event)
                // const { path, content } = event
                // const content = context.pathToFile[path]
                console.warn('loading', { event, context })
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
