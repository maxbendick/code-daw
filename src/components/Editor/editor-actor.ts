// maybe later
// import { EditorT } from '../../editor/types'

// type EditorActorRequestEvent =
//   | { type: 'LOAD_CONTENT'; content: string }
//   | { type: 'GET_CONTENT' }

// type EditorActorResponseEvent = {
//   type: 'GET_CONTENT_RESPONSE'
//   content: string
// }

// export const createEditorActor = (editor: EditorT) => (
//   send: (e: EditorActorResponseEvent) => void,
//   receive: (f: (e: EditorActorRequestEvent) => void) => void,
// ) => {
//   receive(event => {
//     if (event.type === 'GET_CONTENT') {
//       send({ type: 'GET_CONTENT_RESPONSE', content: editor.getValue() })
//     }
//     if (event.type === 'LOAD_CONTENT') {
//       // editor.setValue(event.content)
//       console.warn('fake editor setValue')
//     }
//   })

//   return () => {}
// }
export {}
