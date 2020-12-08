import { chain } from '../chain'
import { parserExperiment } from './parser-experiment'
import { constTokenAssignmentRegex } from './regex'
import { Token } from './tokens'

export type TokenPlace = {
  token: Token
  line: number
  column: number
  deltaLine: number
  deltaColumn: number
  lineContent: string
  varName: string
}

export type TokenPlaces = TokenPlace[]

type GlobalMatchArray = [
  token: Token,
  a1: undefined,
  varName: string,
  a3: undefined,
  a4: Token,
  a5: undefined,
] & { index: number; input: string; groups: undefined }

const prettyMatch = (line: number, m: GlobalMatchArray) => {
  return {
    line: line,
    token: m[0] as Token,
    column: m.index,
    input: m.input,
    lineContent: m.input,
    varName: m[2],
  }
}

type TokenMatch = ReturnType<typeof prettyMatch>

interface ReducerState {
  result: TokenPlace[]
  prev: {
    line: number
    column: number
    token: string
  }
}

const tokenMatchesToTokenPlaces = (tokenMatches: TokenMatch[]): TokenPlaces => {
  return tokenMatches.reduce(
    ({ result, prev }: ReducerState, tokenMatch: TokenMatch): ReducerState => {
      const { token, line, column, lineContent, varName } = tokenMatch

      if (line == prev.line) {
        console.error('received token on same line as previous token')
      }
      if (!lineContent.startsWith('export const ')) {
        console.error('token decl doesnt start with "export const"', tokenMatch)
      }
      const currTokenPlace: TokenPlace = {
        token,
        line,
        column,
        deltaLine: line - prev.line,
        deltaColumn: line === prev.line ? column - prev.column : column,
        lineContent,
        varName,
      }

      return {
        result: [...result, currTokenPlace],
        prev: currTokenPlace,
      }
    },
    { result: [], prev: { line: 0, column: 0, token: '' } },
  ).result
}

// eval(`

// import(
//   'data:text/javascript;charset=utf-8;base64,ZXhwb3J0IGNvbnN0IG51bWJlciA9IDQyOwpleHBvcnQgY29uc3QgZm4gPSAoKSA9PiAiSGVsbG8gd29ybGQiOw=='
// ).then(a => {
//   console.log('base64 import 2', a)
// })

// `)

// const module = await eval(`
// import(
//   'data:text/javascript;charset=utf-8;base64,ZXhwb3J0IGNvbnN0IG51bWJlciA9IDQyOwpleHBvcnQgY29uc3QgZm4gPSAoKSA9PiAiSGVsbG8gd29ybGQiOw=='
// )
// `)

// const doImport3 = () => {
//   import(
//     'data:text/javascript;charset=utf-8;base64,ZXhwb3J0IGNvbnN0IG51bWJlciA9IDQyOwpleHBvcnQgY29uc3QgZm4gPSAoKSA9PiAiSGVsbG8gd29ybGQiOw=='
//   ).then(a => {
//     console.log('base64 import 3', a)
//   })
// }

export const getAllTokens = (lines: string[]): TokenPlaces => {
  let allTokenMatches: TokenMatch[] = []

  parserExperiment(lines.join('\n'))
  // console.log('-------doin---import-------')

  // const doImport2 = async () => {
  //   const extremelyDangerousImport = (url: string): Promise<any> => {
  //     return window.eval(`import('${url}')`)
  //   }

  //   const source = `
  //     export const sickk = 5;
  //   `
  //   // const url =
  //   //   'data:text/javascript;charset=utf-8;base64,ZXhwb3J0IGNvbnN0IG51bWJlciA9IDQyOwpleHBvcnQgY29uc3QgZm4gPSAoKSA9PiAiSGVsbG8gd29ybGQiOw=='

  //   const url = 'data:text/javascript;base64,' + btoa(source)

  //   const module = await extremelyDangerousImport(url)

  //   console.log('base64 import awaited', module)
  // }
  // doImport2()

  console.log('-------doin---import-------')

  for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
    const line = lines[lineIndex]

    const matches = line.matchAll(constTokenAssignmentRegex)
    for (const _match of matches as any) {
      const match = prettyMatch(lineIndex, _match)
      allTokenMatches.push(match)
    }
  }

  return tokenMatchesToTokenPlaces(allTokenMatches)
}

export interface SemanticToken {
  deltaLine: number
  deltaColumn: number
  tokenLength: number
  type: 0
  modifier: 2
}

export const semanticTokensToData = (
  semanticTokens: SemanticToken[],
): number[] =>
  semanticTokens.flatMap(
    ({
      deltaLine,
      deltaColumn,
      tokenLength,
      type,
      modifier,
    }: SemanticToken): number[] => [
      deltaLine,
      deltaColumn,
      tokenLength,
      type,
      modifier,
    ],
  )

const tokenPlacesToSemanticTokens = (
  tokenPlaces: TokenPlaces,
): SemanticToken[] => {
  return tokenPlaces.map(
    (tokenPlace: TokenPlace): SemanticToken => {
      return {
        deltaLine: tokenPlace.deltaLine,
        deltaColumn: tokenPlace.deltaColumn,
        tokenLength: tokenPlace.token.length,
        type: 0,
        modifier: 2,
      }
    },
  )
}

export const tokenPlacesToRawSemanticTokensData = (
  tokenPlaces: TokenPlaces,
): Uint32Array =>
  chain()
    .then(() => tokenPlaces)
    .then(tokenPlacesToSemanticTokens)
    .then(semanticTokensToData)
    .then(data => new Uint32Array(data))
    .value()
