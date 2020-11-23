import './Editor.css'
import { EditorT, Monaco } from './types'

export const addDecorations = (
  monaco: Monaco,
  editor: EditorT,
  initialAfterLineNumber: number,
) => {
  const makeDecorations = (afterLineNumber: number) => {
    return [
      {
        range: new monaco.Range(afterLineNumber, 1, afterLineNumber, 1),
        options: {
          isWholeLine: true,
          className: 'myContentClass',
          glyphMarginClassName: 'myGlyphMarginClass',
        },
      },
    ]
  }

  let decorations = [] as any[]

  const update = (lineNumber: number) => {
    decorations = editor.deltaDecorations(
      decorations,
      makeDecorations(lineNumber),
    )
  }

  update(initialAfterLineNumber)

  return {
    moveDecoration: (afterLineNumber: number) => {
      update(afterLineNumber)
    },
  }
}
