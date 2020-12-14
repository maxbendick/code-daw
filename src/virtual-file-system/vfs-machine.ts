import { assign, Machine, spawn } from 'xstate'
import { makeLocalStorageVfs, VirtualFileSystem } from '.'

type FileStatus = 'loading' | 'saving' | 'present'

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

type VfsEvent =
  | { type: 'GET'; path: string }
  | { type: 'SET'; path: string; content: string }
  | { type: 'SET_ACTIVE'; path: string }

export interface VfsStateSchema {
  states: {
    setup: {}
    present: {}
  }
}

// onDone: {
//   target: 'compilingCode',
//   actions: assign({
//     tokens: (context, event) => {
//       makeJsonStringifySafe(event.data)
//       return event.data
//     },
//   }),
// },
// onError: 'failure',

let nextId = 1

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
              return await makeLocalStorageVfs(storage, fetchFn)
            },
            onDone: {
              target: 'present',
              actions: assign({
                vfs: (context, event) => event.data as VirtualFileSystem,
              }),
            },
          },
        },
        present: {
          on: {
            GET: {
              // could make simpler by extracting from machine
              // TODO look for 'done.invoke.<ID>' event for result
              actions: assign({
                requestRefs: (context, event) => {
                  // const name =
                  return [
                    ...context.requestRefs,
                    spawn(context.vfs?.get(event.path)!, `get-${nextId++}`),
                  ]
                },
              }),
            },
            SET: {
              actions: assign({
                // id: '',
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
                activePath: (context, event) => (event as any).path,
              }),
            },
            '*': {
              actions: assign({
                requestRefs: (context, event) => {
                  if (!event.type.startsWith('done.invoke.')) {
                    return context.requestRefs
                  }
                  return context.requestRefs.filter(
                    ref => !event.type.endsWith(ref.id),
                  )
                },
                pathToContent: (context, event) => {
                  if (event.type.startsWith('done.invoke.get-')) {
                    return {
                      ...context.pathToContent,
                      [(event as any).data.path]: (event as any).data.content,
                    }
                  }
                  if (event.type.startsWith('done.invoke.set-')) {
                    console.log('its a set fn!')
                    return {
                      ...context.pathToContent,
                      [(event as any).data.path]: (event as any).data.content,
                    }
                  }
                  return context.pathToContent
                },
                activePath: (context, event) => {
                  if (event.type.startsWith('done.invoke.get-')) {
                    console.log('its a get fn!')
                  }
                  if (event.type.startsWith('done.invoke.set-')) {
                    console.log('its a set fn!')
                  }

                  console.log('refs', context.requestRefs)
                  console.log('wildcard event', event)
                  return context.activePath
                },
              }),
            },
          },
        },
      },
    },
    {
      activities: {
        get: () => {},
      },
    },
  )
