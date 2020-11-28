const tokens = ['dial', 'mixer', 'polySine', 'switcher', 'toggle'] as const

type ValuesOf<T extends readonly any[]> = T[number]
type Token = ValuesOf<typeof tokens>

const chain = <A>(value: A) => {
  return {
    value,
    then: <B>(f: (a: A) => B) => chain(f(value)),
  }
}

type TokenPlace = {
  token: Token
  line: number
  column: number
  deltaLine: number
  deltaColumn: number
}

type TokenPlaces = TokenPlace[]

type GlobalMatchArray = [
  token: Token,
  a1: undefined,
  a2: undefined,
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

const tokenGroup = `(${tokens.map(t => `(${t})`).join('|')})`

const regexp = new RegExp(`${tokenGroup}(?=\\()`, 'g')

const tokenMatchesToTokenPlaces = (tokenMatches: TokenMatch[]): TokenPlaces => {
  return tokenMatches.reduce(
    (
      { result, prev }: ReducerState,
      { token, line, column }: TokenMatch,
    ): ReducerState => {
      if (line == prev.line) {
        console.log('SSAME LINEEE', { prevColumn: prev.column, column: column })
      }
      const currTokenPlace = {
        token,
        line,
        column,
        deltaLine: line - prev.line,
        deltaColumn: line === prev.line ? column - prev.column : column,
      }

      return {
        result: [...result, currTokenPlace],
        prev: currTokenPlace,
      }
    },
    { result: [], prev: { line: 0, column: 0, token: '' } },
  ).result
}

export const getAllTokens = (lines: string[]): TokenPlaces => {
  let allTokenMatches: TokenMatch[] = []

  for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
    const line = lines[lineIndex]

    const matches = line.matchAll(regexp)
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
  chain(tokenPlaces)
    .then(tokenPlacesToSemanticTokens)
    .then(semanticTokensToData)
    .then(data => new Uint32Array(data)).value
