import { transpile } from 'typescript'
import { addBusesToWindow } from '../../connection/bus'
import { evalCompiledUserCode } from '../../connection/imports'
import { chain } from '../chain'
import { compiledTokenVarNameRegex } from '../parsing/regex'
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

export const compileAndEval = (editor: EditorT) => {
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
    // .tap(code => console.log('compile result', code))
    .then(code => {
      return `var exports = {};\nwindow.codeDawVars = {};\n${code}`
    })
    .then(code => {
      // add vars to window
      // replace "var myVar = interactables_1.dial("
      // with    "var myVar = window.codeDawVars.myVar = interactables_1.dial("
      return chain()
        .then(() => code.split('\n'))
        .then(lines => {
          console.log('in var replacer!')
          const replacer = (...args: any[]) => {
            console.log('replacer args:', args)
            const varName = args[0] as string
            console.log('var name', varName)
            return `${varName} = window.codeDawVars.${varName}`
          }

          return lines.map(line => {
            const replaced = line.replace(compiledTokenVarNameRegex, replacer)
            if (line !== replaced) {
              console.log('updated line', replaced)
            }
            return replaced
          })
        })
        .then(lines => lines.join('\n'))
        .value()
    })
    .tap(code => {
      addBusesToWindow(editor)
    })
    .then(code => {
      console.log('code to eval', code)
      try {
        evalCompiledUserCode(code)
      } catch (e) {
        console.warn('from eval', e)
      }
    })
    .value()
}
