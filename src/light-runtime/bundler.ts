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
        throw new Error(
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
    throw new Error('tried to get path for bad path ' + path)
  }
  return file
}

const translateImports = (files: BundlerFile[]): string => {
  const translatedImports: { [originalImport: string]: string } = {}

  const translateImportsRec = (file: BundlerFile) => {
    return _mapImports(file.content, (originalImport: string) => {
      const fromMem = translatedImports[originalImport]
      if (fromMem) {
        return fromMem
      }
      const translatedImport = originalImport.startsWith('./')
        ? _urlEncodeJavaScript(getByPath(files, originalImport).content)
        : originalImport

      translatedImports[originalImport] = translatedImport

      return translatedImport
    })
  }

  return translateImportsRec(getByPath(files, '/index.tsx'))
}
