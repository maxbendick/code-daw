import { chain } from './chain'
import {
  getAllTokens,
  TokenPlaces,
  tokenPlacesToRawSemanticTokensData,
} from './parsing/ts-parser'
import { EditorT, MonacoT } from './types'

export const addHighlighting = (
  monaco: MonacoT,
  getTokens: () => TokenPlaces,
) => {
  monaco.languages.registerDocumentSemanticTokensProvider('typescript', {
    getLegend: () => {
      return {
        tokenModifiers: [],
        tokenTypes: ['keyword'],
      }
    },

    // TODO how to do caching right here?
    provideDocumentSemanticTokens: model =>
      chain()
        .then(() => getTokens() ?? getAllTokens(model.getLinesContent()))
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
