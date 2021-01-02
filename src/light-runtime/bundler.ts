interface BundlerFile {
  path: string
  content: string
}

export const bundle = async (files: BundlerFile[]) => {
  for (const { path } of files) {
    if (path.startsWith('../') || path.startsWith('./../')) {
      throw new Error(`cant support ../ in bundler yet --- ${path}`)
    }
    if (path.startsWith('./') && path.substring(2).includes('/')) {
      throw new Error(`cant support changing directory yet ---- ${path}`)
    }
  }

  return translateImports(files)
}

export const _mapImports = (
  source: string,
  f: (originalImport: string) => string,
): string => {
  const NEWLINE_SPACER = '}{{}NEWLINE_SPACER{}}{'

  const newLines = source
    .replaceAll('\n', '\n' + NEWLINE_SPACER)
    .split('\n')
    .map(line => {
      const isDoubleQuote = line.includes('from "')
      const isSingleQuote = line.includes("from '")
      if (!isDoubleQuote && !isSingleQuote) {
        return line
      }
      if (
        line.substring(line.indexOf('from') + 'from'.length).includes('from ')
      ) {
        console.warn(
          'Two froms in an import statement - looks like somethings wrong',
        )
      }

      const fromStart = line.indexOf('from ')
      const importStart = fromStart + 'from "'.length
      const afterImportStart = line.substring(importStart)
      const importEnd = isSingleQuote
        ? afterImportStart.indexOf("'") + importStart
        : afterImportStart.indexOf('"') + importStart

      if (!importEnd || importEnd < 0) {
        throw new Error('couldnt find import end')
      }

      const originalImport = line.substring(importStart, importEnd)

      return line.replace(originalImport, f(originalImport))
    })

  return newLines.join('').replaceAll(NEWLINE_SPACER, '\n')
}

export const _urlEncodeJavaScript = (source: string): string => {
  return 'data:text/javascript;base64,' + btoa(source)
}

export const _urlDecodeJavaScript = (encoded: string): string => {
  return atob(encoded.split('data:text/javascript;base64,')[1])
}

const getByPath = (files: BundlerFile[], path: string): BundlerFile => {
  const pathWithRelativeResolution = path.startsWith('./')
    ? path.substring(1)
    : path

  const safePath =
    !path.endsWith('.ts') && !pathWithRelativeResolution.endsWith('.tsx')
      ? pathWithRelativeResolution.concat('.tsx')
      : pathWithRelativeResolution

  const file = files.find(f => f.path === safePath)
  if (!file) {
    throw new Error(
      `tried to get path for bad path - ${path} - ${safePath} - ${files}`,
    )
  }
  return file
}

const skypackModules = new Set([
  'react',
  'react-dom',
  'rxjs',
  'styled-components',
  'react-use-gesture',
  'observable-hooks',
])

const isSkypackModule = (originalImport: string) => {
  for (const skypackModule of skypackModules) {
    if (
      originalImport === skypackModule ||
      originalImport.startsWith(skypackModule + '/')
    ) {
      return true
    }
  }
  return false
}

export const _getSkypackModule = (originalImport: string) => {
  if (isSkypackModule(originalImport)) {
    return `https://cdn.skypack.dev/${originalImport}`
  }
  throw new Error(`not a supported external module: ${originalImport}`)
}

const translateImports = (files: BundlerFile[]): string => {
  const translatedImports: { [originalImport: string]: string } = {}
  const recCalledOn = new Set<any>()

  const translateImportsRec = (file: BundlerFile): string => {
    return _mapImports(file.content, (originalImport: string) => {
      const fromMem = translatedImports[originalImport]
      if (fromMem) {
        return fromMem
      }

      if (recCalledOn.has(originalImport)) {
        throw new Error('Circular reference!')
      }
      recCalledOn.add(originalImport)

      if (isSkypackModule(originalImport)) {
        const result = _getSkypackModule(originalImport)
        translatedImports[originalImport] = result
        return result
      }

      const translatedImport = originalImport.startsWith('./')
        ? _urlEncodeJavaScript(
            translateImportsRec(getByPath(files, originalImport)),
          )
        : originalImport

      translatedImports[originalImport] = translatedImport

      return translatedImport
    })
  }

  const result = translateImportsRec(getByPath(files, '/index.tsx'))
  return result
}

export const addCacheBreaker = (code: string) => {
  return `${code}\n\nexport const randommmmm = ${Math.random()}; console.log('import.meta', import.meta);`
}

export const importEsmFile = (esmCode: string) => {
  return import(
    /* webpackIgnore: true */ addCacheBreaker(_urlEncodeJavaScript(esmCode))
  )
}
