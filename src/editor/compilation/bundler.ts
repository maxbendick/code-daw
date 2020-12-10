interface SomeFileSystem {
  getAll: () => Promise<{ [path: string]: string }>
}

const removeExtension = (path: string) => {
  if (!path.endsWith('.js')) {
    throw new Error('Can only send js files to path')
  }
  const result = path.slice(0, -3)
  if (path.endsWith('.')) {
    throw new Error(`cant handle double-extensions! ${path}`)
  }
  return result
}

let cacheDestroyer = 0

// Compiles and bundles code into an ES module, with index.js as the entrypoint
export const bundleFileSystem = async (fs: SomeFileSystem): Promise<any> => {
  const files = await fs.getAll()

  // for a start, encode everything but index.js to a url
  // then, do, for example:
  // indexJs.replaceAll(import 'code-daw/interactables', import encode(files['code-daw/interactables']))
  const indexJs = files['index.js']

  if (!indexJs) {
    throw new Error('no index.js!')
  }

  const entriesWithoutIndex = Object.entries(files).filter(
    ([k, v]) => k !== 'index.js',
  )

  let resultFile = indexJs

  for (const [packagePath, packageSource] of entriesWithoutIndex) {
    if (!packagePath.endsWith('.js')) {
      throw new Error(
        `Tried to encode non-js file!: ${JSON.stringify(packagePath)}`,
      )
    }
    const encodedPackage = encodeToUrl(
      packageSource.concat(`\nconst cacheDestroyer = ${cacheDestroyer++};`),
    )
    const packagePathWithoutJs = removeExtension(packagePath)
    resultFile = resultFile.replaceAll(
      `from "${packagePathWithoutJs}";`,
      `from "${encodedPackage}";`,
    )
    resultFile = resultFile.replaceAll(
      `from '${packagePathWithoutJs}';`,
      `from "${encodedPackage}";`,
    )
  }

  if (resultFile === indexJs) {
    console.error('index.js', indexJs)
    throw new Error('bundle result and index.js are equal')
  }

  return extremelyDangerousImport(resultFile)
}

const encodeToUrl = (code: string) => {
  return 'data:text/javascript;base64,' + btoa(code)
}

const extremelyDangerousImport = (url: string): Promise<any> => {
  return window.eval(`import('${url}')`)
}
