import { Subject } from 'rxjs'
import { take } from 'rxjs/operators'
import { SourceMapConsumer } from 'source-map'
import { JsxEmit, ModuleKind, ScriptTarget, transpile } from 'typescript'
import { LifecycleContext } from '../lifecycle/types'
import { VfsContext } from '../virtual-file-system/vfs-machine'
import { AudioContextManager } from './audio-context-manager'
import { bundle } from './bundler'
import { Zone } from './zone'

const encodeToUrl = (code: string) => {
  return 'data:text/javascript;base64,' + btoa(code)
}

const extremelyDangerousImport = (url: string): Promise<any> => {
  // eslint-disable-next-line no-eval
  return window.eval(`import('${url}')`)
}

const interactableSymbol = 'interactable-symbol'

interface Interactable {
  [interactableSymbol]: {
    domNode: HTMLElement
    onDestroy: () => void
  }
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

const transpileFile = (source: string) =>
  transpile(
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

const objectValues = <A>(o: { [k: string]: A }): A[] =>
  Object.entries(o).map(([k, v]) => v)

const mapValues = <A, B>(
  o: { [k: string]: A },
  f: (originalValue: A, index: number, key: string) => B,
) => {
  Object.entries(o).reduce((result, [key, originalValue], index) => {
    result[key] = f(originalValue, index, key)
    return result
  }, {} as { [k: string]: B })
}

export const startLightRuntime = async (
  context: LifecycleContext,
  stopSignal: Promise<void>,
) => {
  const vfsContext = context.vfsActor?.state.context as VfsContext

  const runnableJs = await bundle(
    objectValues(vfsContext.pathToFile).map(file => ({
      ...file,
      content: transpileFile(file.content),
    })),
  )

  const editor = context?.editor
  if (!editor) {
    throw new Error('Light runtime needs editor')
  }
  editor.updateOptions({ readOnly: true })

  let source = editor.getValue()

  if (!(window as any).codeDaw) {
    ;(window as any).codeDaw = {}
  }

  const audioContextManager = new AudioContextManager()

  ;(window as any).codeDaw.interactableSymbol = interactableSymbol
  ;(window as any).codeDaw.publicUrl = process.env.PUBLIC_URL

  // let transpiled = transpileFile(source)
  let transpiled = runnableJs

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

  console.log('exports', processedExports)

  const zones = processedExports
    .filter(exportt => {
      return exportt.exportValue[interactableSymbol]
    })
    .map(exportt => {
      const parentElement = document.createElement('div')
      parentElement.style.width = '500px'
      const interactableConfig = (exportt.exportValue as Interactable)[
        interactableSymbol
      ]
      const element = interactableConfig.domNode

      // TODO some way to make exportValue a Promise<Interactable>?

      parentElement.appendChild(element)

      return new Zone(
        context.monaco!,
        context.editor!,
        exportt.lineNumber,
        3,
        parentElement,
        interactableConfig.onDestroy,
      )
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

  audioContextManager.attachUserOutput(userMadeModule.default)

  console.log('user-made module', userMadeModule)
  ;(window as any).userMadeModule = userMadeModule

  await stopSignal

  await audioContextManager.destroy()

  zones.forEach(zone => {
    zone.destroy()
  })

  editor.updateOptions({ readOnly: false })
}

interface Runtime {
  shutdown: () => Promise<any>
}

const wrapRuntime = <A>(
  context: A,
  runtimePromiseFn: (context: A, stopSignal: Promise<any>) => Promise<any>,
): Runtime => {
  const shutdown$ = new Subject()
  const runtimePromise = runtimePromiseFn(
    context,
    shutdown$.pipe(take(1)).toPromise(),
  )

  console.warn('runtime startinngggg!')

  return {
    shutdown: async () => {
      shutdown$.next(true)
      console.warn('runtime shut down!')
      await runtimePromise
    },
  }
}

export const createLightRuntime = (context: LifecycleContext) =>
  wrapRuntime(context, startLightRuntime)
