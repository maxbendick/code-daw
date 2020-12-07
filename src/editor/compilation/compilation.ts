import { transpile } from 'typescript'
import { chain } from '../chain'
import { compiledTokenVarNameRegex } from '../parsing/regex'
import { TokenPlaces } from '../parsing/ts-parser'
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

export const compileAndEval = async (
  editor: EditorT,
  tokens: TokenPlaces,
): Promise<string> => {
  ;(window as any).codeDawRegisterLineNumber = registerLineNumber

  const result = chain()
    .then(() => editor.getModel()?.getLinesContent().join('\n')!)
    .then(code =>
      transpile(
        code, // input code
        {
          // module: 5,
        }, // compilerOptions
        'filename.ts',
        [], // diagnostics
        'module-name',
      ),
    )
    .then(code => code.replaceAll('require(', 'codeDawRequire('))
    .then(code => {
      const exports = `var exports = {}; window.codeDawExports = exports;`
      const codeDawVars = `window.codeDawVars = {};`

      // TODO convert es imports to use code-daw window stuff

      // could replace like so:
      //
      // encodedCode = "export const xxx = 'triple x is my favorite vinnie d movie'".encode()
      //
      // import { sine, saw } from '${encodedCode}'
      //
      //

      return `${exports}\n${codeDawVars}\n${code}`
      // return `${codeDawVars}\n${code}`
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
    // TODO are buses necessary at all?
    // .tap(code => {
    //   addBusesToWindow(tokens)
    // })
    .value()

  return result
}
