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

const registerLineNumber = (e: Error) => {
  const stack = new Error().stack!
  // find first: <anonymous>:6:22)
  //             <anonymous>:${lineNumber}:22)

  const anonymousStr = '<anonymous>:'
  const anonymousStart = stack.indexOf(anonymousStr)
  const startingAtAnonymous = stack.substring(
    anonymousStart,
    anonymousStart + 100,
  )
  const lineNumberStr = startingAtAnonymous.split(':')[1]
  const lineNumber = Number.parseInt(lineNumberStr)

  ;(window as any).codeDawCurrentLineNumber = lineNumber
}

export const compileAndEval = (editor: EditorT) => {
  ;(window as any).codeDawRegisterLineNumber = registerLineNumber

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
    .then(code => {
      const exports = `var exports = {};`
      const codeDawVars = `window.codeDawVars = {};`

      return `${exports}\n${codeDawVars}\n${code}`
    })
    .then(code => {
      // add vars to window
      // replace "var myVar = interactables_1.dial("
      // with    "var myVar = window.codeDawVars.myVar = interactables_1.dial("
      return chain()
        .then(() => code.split('\n'))
        .then(lines => {
          const replacer = (onReplace: () => void) => (...args: any[]) => {
            const varName = args[0] as string
            onReplace()
            return `${varName} = window.codeDawVars.${varName}`
          }

          return lines.map(line => {
            let didReplace = false

            const onReplace = () => {
              didReplace = true
            }
            let replaced = line.replace(
              compiledTokenVarNameRegex,
              replacer(onReplace),
            )

            if (didReplace) {
              // register line numbers
              const registerStatement = `codeDawRegisterLineNumber(new Error()); `
              replaced = `${registerStatement} ${replaced}`
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
