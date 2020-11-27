import { chain } from './chain'
import {
  getAllTokens,
  tokenPlacesToRawSemanticTokensData,
} from './parsing/tokens'
import { EditorT, MonacoT } from './types'

export const addHighlighting = (monaco: MonacoT) => {
  monaco.languages.registerDocumentSemanticTokensProvider('typescript', {
    getLegend: () => {
      return {
        tokenModifiers: [],
        tokenTypes: ['keyword'],
      }
    },

    provideDocumentSemanticTokens: model =>
      chain()
        .then(() => model.getLinesContent())
        .then(getAllTokens)
        .then(tokenPlacesToRawSemanticTokensData)
        .then(data => ({
          data,
          resultId: null,
        }))
        .value() as any,

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
