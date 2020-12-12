import { SourceMapConsumer } from 'source-map'
import { JsxEmit, ModuleKind, ScriptTarget, transpile } from 'typescript'
import { LifecycleContext } from '../lifecycle/types'

const encodeToUrl = (code: string) => {
  return 'data:text/javascript;base64,' + btoa(code)
}

const extremelyDangerousImport = (url: string): Promise<any> => {
  return window.eval(`import('${url}')`)
}

export const startLightRuntime = async (
  context: LifecycleContext,
  stopSignal: Promise<void>,
) => {
  console.log('in lightRuntime!')

  const editor = context?.editor
  if (!editor) {
    throw new Error('Light runtime needs editor')
  }
  editor.updateOptions({ readOnly: true })

  let source = editor.getValue()

  if (!(window as any).codeDaw) {
    ;(window as any).codeDaw = {}
  }

  ;(window as any).codeDaw.audioContext = new AudioContext()
  ;(window as any).codeDaw.interactableSymbol = Symbol('interactable')
  const interactableSymbol = (window as any).codeDaw.interactableSymbol

  // replace internal import
  const internalPackage = encodeToUrl(`
    export const getAudioContext = () => window.codeDaw.audioContext;
    export const interactable = (value) => {
      return { value: value, [window.codeDaw.interactableSymbol]: true };
    };
  `)
  source = source.replace(`from "!internal"`, `from '${internalPackage}'`)
  source = source.replace(`from '!internal'`, `from '${internalPackage}'`)

  const transpiled = transpile(
    source,
    {
      target: ScriptTarget.ES2020,
      module: ModuleKind.ES2020,
      jsx: JsxEmit.React,
      jsxFactory: 'React.createElement',
      sourceMap: true,
      inlineSourceMap: true,
    },
    'filename.tsx',
    [],
    'filename',
  )

  console.log(transpiled)

  const sourceMapPreceding = '//# sourceMappingURL='
  const sourceMapStart =
    transpiled.indexOf(sourceMapPreceding) + sourceMapPreceding.length
  // console.log(transpiled.indexOf(sourceMapPreceding))

  // console.log('sub', transpiled.substring(sourceMapStart))

  const sourceMapUrl = transpiled.substring(sourceMapStart)

  const json = await (await fetch(sourceMapUrl)).json()
  console.log('source map json', json)
  ;(SourceMapConsumer as any).initialize({
    'lib/mappings.wasm': process.env.PUBLIC_URL + '/mappings.wasm',
  })

  const whatever = await SourceMapConsumer.with(json, null, consumer => {
    // consumer

    console.log(consumer.sources)
    // [ 'http://example.com/www/js/one.js',
    //   'http://example.com/www/js/two.js' ]

    const lines = transpiled
      .split('\n')
      .map((line, i) => {
        return {
          index: i,
          match: line.match(/(export ((var)|(const)|(let)))+/g),
        }
      })
      .filter(({ match }) => match)
      .forEach(({ index, match }) => {
        console.log('line match', index, match)
      })
    // for (let i = 0; i < lines.length; i++) {
    //   const line = lines[i]
    //   console.log('line match', line.match(/(export ((var)|(const)|(let)))+/g))
    // }

    const matches = transpiled.matchAll(/(export ((var)|(const)))+/g)
    // [...str.matchAll(regexp)];
    console.log('matches!', [...matches])

    console.log(
      'originalPositionFor',
      consumer.originalPositionFor({
        line: 2,
        column: 28,
      }),
    )
    // { source: 'http://example.com/www/js/two.js',
    //   line: 2,
    //   column: 10,
    //   name: 'n' }

    // console.log(
    //   consumer.generatedPositionFor({
    //     source: 'http://example.com/www/js/two.js',
    //     line: 2,
    //     column: 10,
    //   }),
    // )
    // // { line: 2, column: 28 }

    consumer.eachMapping(function (m) {
      // ...
    })

    // return computeWhatever();
  })

  const userMadeModule = await extremelyDangerousImport(encodeToUrl(transpiled))

  for (const [k, v] of Object.entries(userMadeModule)) {
    console.log({ k, v })
    if ((v as any)[interactableSymbol]) {
      console.log('interactalbe!', k, v)
    }
  }

  // todo tomorrow - cross reference parsed line numbers (fed through sourcemap) with module export names
  // todo attach cool zones, attach audionode default exports to audiocontext.destination

  if (!(userMadeModule.default instanceof AudioNode)) {
    throw new Error('user-made module default export not instance of AudioNode')
  }

  console.log('user-made module', userMadeModule)
  ;(window as any).userMadeModule = userMadeModule

  // await new Promise(resolve => setTimeout(resolve, 1000))
  await stopSignal
  ;(window as any).codeDaw.audioContext.close()
  ;(window as any).codeDaw = undefined

  editor.updateOptions({ readOnly: false })
}
