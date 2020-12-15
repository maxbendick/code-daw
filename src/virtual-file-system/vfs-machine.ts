import { assign, Interpreter, Machine, spawn } from 'xstate'
import { makeLocalStorageVfs, VfsFile, VirtualFileSystem } from '.'

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
    event.type.startsWith('done.invoke.get-') ||
    event.type.startsWith('done.invoke.set-')
  )
}

type VfsEvent =
  | { type: 'GET'; path: string }
  | { type: 'SET'; path: string; content: string }
  | { type: 'SET_ACTIVE'; path: string }
  | { type: 'LOAD_ALL' }
  | VfsActorEvent

export interface VfsStateSchema {
  states: {
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
) =>
  Machine<VfsContext, VfsStateSchema, VfsEvent>(
    {
      id: 'vfs',
      initial: 'setup',
      context: { requestRefs: [], pathToContent: {} },
      states: {
        setup: {
          invoke: {
            src: async (context, event) => {
              const vfs = await makeLocalStorageVfs(storage, fetchFn)
              const paths = await vfs.getAllPaths()
              const pathToContent: { [path: string]: VfsFile } = {}
              for (const path of paths) {
                pathToContent[path] = await vfs.get(path)
              }

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
            GET: {
              actions: assign({
                requestRefs: (context, event) => {
                  return [
                    ...context.requestRefs,
                    spawn(context.vfs?.get(event.path)!, `get-${nextId++}`),
                  ]
                },
              }),
            },
            SET: {
              actions: assign({
                requestRefs: (context, event) => {
                  return [
                    ...context.requestRefs,
                    spawn(
                      context.vfs?.set(event.path, event.content)!,
                      `set-${nextId++}`,
                    ),
                  ]
                },
              }),
            },
            SET_ACTIVE: {
              actions: assign({
                activePath: (context, event) => event.path,
              }),
            },
            '*': {
              actions: assign({
                requestRefs: (context, _event) => {
                  const event = _event as VfsActorEvent
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
    },
    // {
    //   activities: {
    //     get: () => {},
    //   },
    // },
  )
