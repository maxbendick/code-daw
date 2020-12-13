import { SourceMapConsumer } from 'source-map'
import { JsxEmit, ModuleKind, ScriptTarget, transpile } from 'typescript'
import { LifecycleContext } from '../lifecycle/types'

const encodeToUrl = (code: string) => {
  return 'data:text/javascript;base64,' + btoa(code)
}

const extremelyDangerousImport = (url: string): Promise<any> => {
  return window.eval(`import('${url}')`)
}

const getExports = (source: string) => {
  const exportLines = source
    .split('\n')
    .map((line, lineIndex) => {
      // console.log('line', i, line)
      const exportStatements = ['export var ', 'export const ', 'expoort let ']

      let exportName: string | null = null
      for (const exportStatement of exportStatements) {
        if (line.startsWith(exportStatement)) {
          exportName = line.split(' ')[2]
        }
      }

      if (line.startsWith('export default')) {
        exportName = 'default'
      }

      const result = {
        lineNumber: lineIndex + 1,
        exportName: exportName,
      }

      console.log('getExports returning', result)

      return result
    })
    .filter(({ exportName }) => exportName)

  return exportLines
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

  // console.log('sourcee', source)
  // source.split('\n').forEach((line, i) => {
  //   console.log('source line', i, line)
  // })

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

  const transpiledExportLines = await SourceMapConsumer.with(
    json,
    null,
    consumer => {
      console.log('consumer.sources', consumer.sources)

      return getExports(transpiled)
        .map(l => {
          console.log('current l', l)
          return l
        })
        .map(transpiledLine => ({
          ...transpiledLine,
          originalPosition: consumer.originalPositionFor({
            line: transpiledLine.lineNumber,
            column: 0,
          }),
        }))
    },
  )

  console.error('winkkkk', transpiledExportLines)

  const userMadeModule = await extremelyDangerousImport(encodeToUrl(transpiled))

  // for (const [k, v] of Object.entries(userMadeModule)) {
  //   console.log({ k, v })
  //   if ((v as any)[interactableSymbol]) {
  //     console.log('interactalbe!', k, v)
  //   }
  // }

  let processedExports: {
    exportName: string
    exportValue: any
    lineNumber: number
  }[] = []
  for (const [exportName, exportValue] of Object.entries(userMadeModule)) {
    for (const transpiledExportLine of transpiledExportLines) {
      if (exportName === transpiledExportLine.exportName) {
        console.log('MATCH', exportName, transpiledExportLine)
        processedExports.push({
          exportName: exportName,
          exportValue: exportValue,
          lineNumber: transpiledExportLine.originalPosition.line!,
        })
      }
    }
  }

  console.log('originaldss', processedExports)

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
