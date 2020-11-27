import { productName } from '../config'
import { MonacoT } from './types'

interface FileDefinitions {
  code: string[]
  lib: string[]
}

type FilenameToFileContent = {
  [filename: string]: string
}

const basicMonad = <A>(value: A) => {
  return {
    value,
    then: <B>(f: (a: A) => B) => basicMonad<B>(f(value)),
  }
}

const editorFilesPath = `${process.env.PUBLIC_URL}/editor-files`

const getFileDefinitions = async (): Promise<FileDefinitions> => {
  const path = `${editorFilesPath}/files.json`
  const response = await fetch(path)
  return await response.json()
}

const getLibFile = async (filename: string): Promise<string> => {
  const path = `${editorFilesPath}/lib/${filename}`
  const response = await fetch(path)
  return response.text()
}

const getTotalityFile = async (): Promise<string> => {
  const path = `${editorFilesPath}/totality.d.ts`
  const response = await fetch(path)
  return response.text()
}

const getAllLibFiles = async (): Promise<FilenameToFileContent> => {
  const fileDefinitions = await getFileDefinitions()

  const fileContentPromises = fileDefinitions.lib.map(filename =>
    getLibFile(filename),
  )

  const files = await Promise.all(fileContentPromises)

  const result: FilenameToFileContent = {}

  for (let i = 0; i < fileDefinitions.lib.length; i++) {
    const filename = fileDefinitions.lib[i]
    const fileContent = files[i]
    result[filename] = fileContent
  }

  return result
}

const addFileExample = (monaco: MonacoT) => {
  monaco.languages.typescript.typescriptDefaults.addExtraLib(
    "declare module 'test/file2' { export interface Test {} }",
    'file:///node_modules/@types/test/file2.d.ts',
  )
}

const toLines = (s: string) => s.split('\n')
const fromLines = (s: string[]) => s.join('\n')

const splitInTwo = <A>(as: A[], f: (a: A) => boolean): [A[], A[]] => {
  const trues: A[] = []
  const falses: A[] = []
  for (const a of as) {
    ;(f(a) ? trues : falses).push(a)
  }
  return [trues, falses]
}

const isImport = (line: string) => line.trim().startsWith('import ')

const wrapInDeclare = true as boolean
const absoluteImports = false as boolean

const addDtsFile = (
  monaco: MonacoT,
  declarationFilename: string,
  originalFileContent: string,
) => {
  const path = `file:///node_modules/@types/${productName}/${declarationFilename}`

  const filenameNoExt = declarationFilename.split('.')[0]

  const cleanedFileContent = basicMonad(originalFileContent)
    .then(fileContent => {
      if (!absoluteImports) {
        return fileContent
      }

      // adjust import statements
      return fileContent.replaceAll('./', 'code-daw/')
    })
    .then(fileContent => {
      if (!wrapInDeclare) {
        return fileContent
      }

      // remove declares
      return fileContent.replaceAll('declare ', '')
    })
    .then(fileContent => {
      if (!wrapInDeclare) {
        return fileContent
      }

      // wrap in declare
      const lines = fileContent.split('\n')

      const [imports, notImports] = splitInTwo(lines, isImport)

      const notImportCode = basicMonad(notImports)
        .then(lines => lines.join('\n'))
        .then(notImportCode => {
          return `declare module '${productName}/${filenameNoExt}' {\n${notImportCode}\n}`
        }).value

      return [...imports, notImportCode].join('\n')
    }).value
  // .then(() => {
  //   return `export declare function pipe(): { x: number };`
  // }).value

  console.log({
    comment: 'adding a file',
    filename: declarationFilename,
    content: cleanedFileContent,
    path,
  })
  monaco.languages.typescript.typescriptDefaults.addExtraLib(
    cleanedFileContent,
    path,
  )
}

export const loadFiles = async (monaco: MonacoT) => {
  const files = await getAllLibFiles()

  console.log('all files', files)

  const totalityFile = await getTotalityFile()

  monaco.languages.typescript.typescriptDefaults.addExtraLib(
    totalityFile.replaceAll(`"lib/`, `"code-daw/`),
    'file:///node_modules/@types/lib/lib.d.ts',
  )

  monaco.languages.typescript.typescriptDefaults.addExtraLib(
    "declare module 'test/file2' { export interface Test<A>{ x: A } }",
    'file:///node_modules/@types/test/file2.d.ts',
  )
}

export const setCompilerAndDiagnosticOptions = (monaco: MonacoT) => {
  monaco.languages.typescript.typescriptDefaults.setCompilerOptions({
    target: monaco.languages.typescript.ScriptTarget.ES2016,
    allowNonTsExtensions: true,
    moduleResolution: monaco.languages.typescript.ModuleResolutionKind.NodeJs,
    module: monaco.languages.typescript.ModuleKind.CommonJS,
    noEmit: true,
    noLib: true,
    typeRoots: ['node_modules/@types'],
  })
  // monaco.languages.typescript.typescriptDefaults.setDiagnosticsOptions({
  //   noSemanticValidation: false,
  //   noSyntaxValidation: false,
  // })
}
