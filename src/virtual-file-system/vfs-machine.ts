import { Actor, assign, Machine, spawn, State } from 'xstate'
import {
  LocalStorageVfsConfig,
  makeLocalStorageVfs,
  VfsFile,
  VirtualFileSystem
} from '.'
import { EditorT } from '../editor/types'
import { makeJsonStringifySafe } from '../utils'

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

type VfsInvokeEvent =
  | { type: `done.invoke.get-${string}`; data: VfsFile }
  | { type: `done.invoke.set-${string}`; data: VfsFile }

const isVfsActorEvent = (event: VfsEvent): event is VfsInvokeEvent => {
  return (
    event.type.startsWith('done.invoke.vfs-get-') ||
    event.type.startsWith('done.invoke.vfs-set-')
  )
}

type VfsEvent =
  | { type: 'VFS_SET_ACTIVE'; path: string }
  | { type: 'VFS_SET_EDITOR'; editor: EditorT }
  | { type: 'VFS_SAVE_ACTIVE' }
  | VfsInvokeEvent

interface VfsStateSchema {
  states: {
    preSetup: {}
    setup: {}
    ready: {}
  }
}

let nextId = 1

const stripEmptyCommentLines = (content: string) => {
  return content
    .split('\n')
    .map(line => line === '//' ? '' : line)
    .join('\n')
}

export const makeVfsMachine = ({ storage }: LocalStorageVfsConfig) => {
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
              editor: (context, event) => makeJsonStringifySafe(event.editor),
            }),
          },
        },
      },
      setup: {
        invoke: {
          src: async (context, event) => {
            const vfs = await makeLocalStorageVfs({ storage })
            const pathToFile: { [path: string]: VfsFile } = {}

            for (const path of vfs.paths!) {
              pathToFile[path] = await vfs.get(path)
            }

            return { vfs, pathToFile: pathToFile }
          },
          onDone: {
            target: 'ready' as const,
            actions: [
              assign({
                vfs: (context, event) =>
                  makeJsonStringifySafe(event.data.vfs as VirtualFileSystem),
                pathToFile: (context, event) => event.data.pathToFile,
              }),
              (context, event) => {
                context.editor?.setValue(
                  stripEmptyCommentLines(context.pathToFile[context.activePath].content),
                )
              },
            ],
          },
        },
      },
      ready: {
        on: {
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
                context.editor?.setValue(stripEmptyCommentLines(content))
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
