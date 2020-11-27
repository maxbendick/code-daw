import { EditorT, MonacoT } from './types'

export const addHighlighting = (monaco: MonacoT) => {
  monaco.languages.registerDocumentSemanticTokensProvider('typescript', {
    getLegend: () => {
      return {
        tokenModifiers: [],
        tokenTypes: ['keyword'],
      }
    },

    provideDocumentSemanticTokens: model => {
      const lines = model.getLinesContent()
      const data: any = []

      let prevLine = 0
      // let prevChar = 0

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i]

        const startIndex = line.indexOf('dial(')

        if (startIndex > -1) {
          let type = 0
          let modifier = 2

          data.push(
            // translate line to deltaLine
            i - prevLine,
            // for the same line, translate start to deltaStart
            startIndex, // prevLine === i ? match.index - prevChar : match.index,
            'dial'.length, // match[0].length,
            type,
            modifier,
          )

          prevLine = i
        }
      }
      return {
        data: new Uint32Array(data),
        resultId: null,
      } as any
    },

    releaseDocumentSemanticTokens: () => {},
  })
}

export const addHighlightingToEditor = (editor: EditorT) => {
  const t = (editor as any)._themeService._theme
  t.getTokenStyleMetadata = (type: string, modifiers: any) => {
    if (type === 'keyword') {
      return {
        foreground: 12, // 23, // 19, // 12, // 4, // color id 13
        bold: false,
        underline: true,
        italic: false,
      }
    }
  }
}
