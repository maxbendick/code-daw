import { assign, Machine, sendUpdate } from 'xstate'
import { EditorT } from '../editor/types'

// for shits and giggles until it makes sense to use anything here

const machine = Machine({
  initial: 'intro',
  states: {
    intro: {},
    groove1: {},
    breakdown1: {},
    groove2: {},
    build: {},
    outro: {},
  },
})

interface Refs {
  editor?: EditorT
}

const refs: Refs = {}

interface Context {
  editorRef?: string
  content?: string
  zones?: FakeZone[]
}

interface StateSchema {
  states: {
    setup: {}
    running: {
      states: {
        editing: {}
        locked: {}
      }
    }
  }
}
type Event =
  | { type: 'EDITOR_GOT_EDITOR'; editor: EditorT }
  | { type: 'EDITOR_LOAD_CONTENT'; content: string }
  | { type: 'EDITOR_GET_CONTENT' }
  | { type: 'EDITOR_LOCK' }
  | { type: 'EDITOR_UNLOCK' }
  | { type: 'EDITOR_ADD_ZONES'; zones: FakeZone[] }

const getEditor = (context: Context): EditorT => {
  if (!context.editorRef) {
    throw new Error('no editor ref, cant load content')
  }
  const editor = refs[context.editorRef as 'editor']
  if (!editor) {
    throw new Error('no editor, cant load content')
  }
  return editor
}

type FakeZone = {}

const addZones = (editor: EditorT, zones: FakeZone[]) => {
  return zones
}
const removeZones = (zones: FakeZone[]) => {}

const editorMachine = Machine<Context, StateSchema, Event>({
  initial: 'setup',
  context: {},
  states: {
    setup: {
      on: {
        EDITOR_GOT_EDITOR: {
          actions: assign({
            editorRef: (context, event) => {
              const refId = 'editor' as const
              refs[refId] = event.editor
              return refId
            },
          }),
        },
      },
    },
    running: {
      initial: 'editing',
      states: {
        editing: {
          on: {
            EDITOR_LOCK: {
              target: 'locked',
              actions: (context, event) => {
                getEditor(context).updateOptions({ readOnly: true })
              },
            },
          },
        },
        locked: {
          on: {
            EDITOR_UNLOCK: {
              target: 'editing',
              actions: [
                (context, event) => {
                  if (context.zones?.length) {
                    removeZones(context.zones)
                  }
                },
                (context, event) => {
                  getEditor(context).updateOptions({ readOnly: false })
                },
              ],
            },
            EDITOR_ADD_ZONES: {
              // add zones to the editor somehow
              actions: [
                assign({
                  zones: (context, event) => {
                    return event.zones
                  },
                }),
                (context, event) => {
                  addZones(getEditor(context), event.zones)
                },
              ],
            },
          },
        },
      },
      on: {
        EDITOR_LOAD_CONTENT: {
          actions: (context, event) => {
            getEditor(context).setValue(event.content)
          },
        },
        EDITOR_GET_CONTENT: {
          actions: [
            assign({
              content: (context, event) => {
                return getEditor(context).getValue()
              },
            }),
            sendUpdate(),
          ],
        },
      },
    },
  },
})
