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

// TODO brittle
const varTokenAssignmentRegex = new RegExp(
  `${lookBehindVarAssignment}(interactables_1\\.)${tokenGroup}${lookAheadFnCall}`,
  'g',
)

// export const compiledTokenVarNameRegex = new RegExp(
//   `(?<=(var ))\\w+(?=( = (interactables_1\\.)))`,
//   'g',
// )

// TODO brittle
export const compiledTokenVarNameRegex = new RegExp(
  `(?<=(var ))\\w+(?=( = (interactables_1\\.${tokenGroup}\\()))`,
  'g',
)

// (?<=(\nvar ))(\w+)(?=( = interactables_1.))
