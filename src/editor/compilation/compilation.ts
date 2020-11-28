import { transpile } from 'typescript'
import { chain } from '../chain'
import { EditorT } from '../types'

const testCode = `
import { Test } from './test'

const myTest: Test<number> = { x: 1 }

const mycoolerSIG = pipe(
  () => Signals.sine(100),
  (a: any) => Signals.pair(a, Signals.sine(10)),
  SignalEffects.map(([fast, slow]: [any, any]) => (fast + slow) / 2),
)(null)

`

export const doCompile = (editor: EditorT) => {
  // const codeFromEditor = editor.getModel()?.getLinesContent().join('\n')!

  const code = chain()
    .then(() => editor.getModel()?.getLinesContent().join('\n')!)
    .then(code =>
      transpile(
        code, // input code
        {}, // compilerOptions
        'filename.ts',
        [], // diagnostics
        'module-name',
      ),
    )
    .then(code => code.replaceAll('require(', 'codeDawRequire('))
    .tap(code => console.log('compile result', code))
    .value()
}
