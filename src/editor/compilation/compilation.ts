import { transpile } from 'typescript'
import { addBusesToWindow } from '../../connection/bus'
import { evalCompiledUserCode } from '../../connection/imports'
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
      return `var exports = {};\n${code}`
    })
    .then(code => {
      // add vars to window
      //
      // replace "var myVar = dial("
      // with    "var myVar = window.codeDawVars.myVar = dial("

      // use https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/replace

      // function replacer(match, p1, p2, p3, offset, string) {
      //   // p1 is nondigits, p2 digits, and p3 non-alphanumerics
      //   return [p1, p2, p3].join(' - ');
      // }
      // let newString = 'abc12345#$*%'.replace(/([^\d]*)(\d*)([^\w]*)/, replacer);
      // console.log(newString);  // abc - 12345 - #$*%

      // or use replaceall?

      chain()
        .then(() => code.split('\n'))
        .then(lines => {
          const regexp = new RegExp('asdf', 'g') // TODO import

          const replacer = (
            match: string,
            p1: string,
            p2: string,
            p3: string,
            offset: string,
            fullString: string,
          ) => {
            //   // p1 is nondigits, p2 digits, and p3 non-alphanumerics
            //   return [p1, p2, p3].join(' - ');
            // }
            return match
          }

          return lines.map(line => {
            line.replace(regexp, replacer)
          })
        })

      return code
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
