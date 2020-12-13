import { SourceMapConsumer } from 'source-map'
import { JsxEmit, ModuleKind, ScriptTarget, transpile } from 'typescript'
import { LifecycleContext } from '../lifecycle/types'
import { Zone } from './zone'

const encodeToUrl = (code: string) => {
  return 'data:text/javascript;base64,' + btoa(code)
}

const extremelyDangerousImport = (url: string): Promise<any> => {
  return window.eval(`import('${url}')`)
}

const interactableSymbol = 'interactable-symbol' // Symbol('interactable')

interface Interactable {
  [interactableSymbol]: true
  domNode: HTMLElement
  onDestroy: () => void
}

const getExports = (source: string) => {
  const exportLines = source
    .split('\n')
    .map((line, lineIndex) => {
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

      return {
        lineNumber: lineIndex + 1,
        exportName: exportName,
      }
    })
    .filter(({ exportName }) => exportName)

  return exportLines
}

export const startLightRuntime = async (
  context: LifecycleContext,
  stopSignal: Promise<void>,
) => {
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
  ;(window as any).codeDaw.interactableSymbol = interactableSymbol

  // replace internal import
  const internalPackage = encodeToUrl(`
    export const getAudioContext = () => window.codeDaw.audioContext;
    export const interactable = (configPromise) => {
      configPromise[window.codeDaw.interactableSymbol] = true;
      return configPromise;
    };
  `)
  source = source.replace(`from "!internal"`, `from '${internalPackage}'`)
  source = source.replace(`from '!internal'`, `from '${internalPackage}'`)

  let transpiled = transpile(
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

  const sourceMapPreceding = '//# sourceMappingURL='
  const sourceMapStart =
    transpiled.indexOf(sourceMapPreceding) + sourceMapPreceding.length

  const sourceMapUrl = transpiled.substring(sourceMapStart)

  const sourceMapJson = await (await fetch(sourceMapUrl)).json()
  ;(SourceMapConsumer as any).initialize({
    'lib/mappings.wasm': process.env.PUBLIC_URL + '/mappings.wasm',
  })

  const transpiledExportLines = await SourceMapConsumer.with(
    sourceMapJson,
    null,
    consumer => {
      return getExports(transpiled).map(transpiledLine => ({
        ...transpiledLine,
        originalPosition: consumer.originalPositionFor({
          line: transpiledLine.lineNumber,
          column: 0,
        }),
      }))
    },
  )

  const userMadeModule = await extremelyDangerousImport(
    encodeToUrl(transpiled + `\nconst randommmmm = ${Math.random()}`),
  )

  let processedExports: {
    exportName: string
    exportValue: any
    lineNumber: number
  }[] = []
  for (const [exportName, exportValue] of Object.entries(userMadeModule)) {
    for (const transpiledExportLine of transpiledExportLines) {
      if (exportName === transpiledExportLine.exportName) {
        processedExports.push({
          exportName: exportName,
          exportValue: exportValue,
          lineNumber: transpiledExportLine.originalPosition.line!,
        })
      }
    }
  }

  console.log('processedExports', processedExports)

  for (const exportt of processedExports) {
    if (exportt.exportValue[interactableSymbol]) {
      console.log('interactable!!', exportt)
    }
  }

  const zones = processedExports
    .filter(exportt => {
      return exportt.exportValue[interactableSymbol]
    })
    .map(exportt => {
      console.log('asdlkjfalkserhjlksaehrr')
      const parentElement = document.createElement('div')
      parentElement.style.width = '500px'
      // element.innerHTML = 'hello from the grabe'
      // const element =;
      const interactableConfig = exportt.exportValue as Interactable
      const element = interactableConfig.domNode

      // TODO make exportValue a Promise<Interactable>

      parentElement.appendChild(element)

      console.log('element donm', element)
      return new Zone(
        context.monaco!,
        context.editor!,
        exportt.lineNumber,
        3,
        parentElement,
        interactableConfig.onDestroy,
      )
    })

  zones.forEach(zone => {
    console.log('zone!', zone)
  })

  // monaco: MonacoT,
  // editor: EditorT,
  // exportName: string,
  // exportValue: any,
  // lineNumber: number,
  // initialNumLines: number,

  // todo tomorrow - cross reference parsed line numbers (fed through sourcemap) with module export names
  // todo attach cool zones, attach audionode default exports to audiocontext.destination

  if (!(userMadeModule.default instanceof AudioNode)) {
    throw new Error('user-made module default export not instance of AudioNode')
  }

  console.log('user-made module', userMadeModule)
  ;(window as any).userMadeModule = userMadeModule

  await stopSignal
  ;(window as any).codeDaw.audioContext.close()
  ;(window as any).codeDaw = undefined

  zones.forEach(zone => {
    zone.destroy()
  })

  editor.updateOptions({ readOnly: false })
}
