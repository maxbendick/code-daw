export const tokens = [
  'dial',
  'mixer',
  'polySine',
  'switcher',
  'toggle',
] as const

type ValuesOf<T extends readonly any[]> = T[number]
export type Token = ValuesOf<typeof tokens>
