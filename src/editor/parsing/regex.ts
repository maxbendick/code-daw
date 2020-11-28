export const tokens = [
  'dial',
  'mixer',
  'polySine',
  'switcher',
  'toggle',
] as const

const varNameGroup = `(\\w+)`

const lookBehindConstAssignment = `(?<=(const ${varNameGroup} = ))`

const lookBehindVarAssignment = `(?<=(var ${varNameGroup} = ))`

const tokenGroup = `(${tokens.map(t => `(${t})`).join('|')})`

const lookAheadFnCall = `(?=\\()`

export const constTokenAssignmentRegex = new RegExp(
  `${lookBehindConstAssignment}${tokenGroup}${lookAheadFnCall}`,
  'g',
)

export const varTokenAssignmentRegex = new RegExp(
  `${lookBehindVarAssignment}${tokenGroup}${lookAheadFnCall}`,
  'g',
)
