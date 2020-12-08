// const source = `
//   export const sickk = 5;
// `
// const url =
//   'data:text/javascript;charset=utf-8;base64,ZXhwb3J0IGNvbnN0IG51bWJlciA9IDQyOwpleHBvcnQgY29uc3QgZm4gPSAoKSA9PiAiSGVsbG8gd29ybGQiOw=='

const createEncodedPackageCode = (packageName: string) => {
  // const packageContents = (window as any).codeDawRequire(
  //   packageName,
  // )
  const packageContents = (window as any).codeDawPackages[packageName]
  let code = ''
  for (const variableName of Object.keys(packageContents)) {
    console.warn('reinstate this:')
    code += `export const ${variableName} = window.codeDawPackages["${packageName}"].${variableName};\n`
    // code += `export var ${variableName} = "my sweet ${variableName}";\n`
  }
  return encodePackage(code)
}
const replaceImports = (
  code: string,
  subPackages: { name: string; content: any }[],
) => {
  let result = code
  for (const { name, content } of subPackages) {
    // this can add a single package's content multiple times,
    // but it's ok because packages are very small
    result = result.replaceAll(`from "${name}";`, `from "${content}";`)
    result = result.replaceAll(`from '${name}';`, `from "${content}";`)
  }
  return result
}
const encodePackage = (code: string) => {
  return 'data:text/javascript;base64,' + btoa(code)
}
const extremelyDangerousImport = (url: string): Promise<any> => {
  return window.eval(`import('${url}')`)
}

// const adasdfsd = async (source: string) => {
//   const extremelyDangerousImport = (url: string): Promise<any> => {
//     return window.eval(`import('${url}')`)
//   }
//   const url = 'data:text/javascript;base64,' + btoa(source)
//   const module = await extremelyDangerousImport(url)
//   console.log('base64 import awaited', module)
// }

const extremelyDangerousImportSource = async (source: string) => {
  // const url = 'data:text/javascript;base64,' + btoa(source)
  return await extremelyDangerousImport(encodePackage(source))
}

const test1 = async () => {
  console.log('wait for it 8()')
  const encodedDep = encodePackage(`
    export const sickk = 5
  `)
  const module = await extremelyDangerousImportSource(
    `
    import { sickk } from '${encodedDep}'
    export const theragunForChristians = 3333333 + sickk
    console.log('theragun')
    `,
  )
  console.log('theragun module!', module)

  // await new Promise(resolve => setTimeout(resolve, 1000))
}

// wont need "interactables_1" with this
const es6EvalWithPackages = async (
  code: string,
  codeDawRequirePackageNames: string[],
) => {
  // test1()
  // await new Promise(resolve => setTimeout(resolve, 3000))

  let compiledPackages = [] as { name: string; content: any }[]
  for (const codeDawRequirePackageName of codeDawRequirePackageNames) {
    compiledPackages.push({
      name: codeDawRequirePackageName,
      content: createEncodedPackageCode(codeDawRequirePackageName),
    })
  }

  console.log('compiled packages', compiledPackages)

  const codeWithImports = replaceImports(code, compiledPackages)
  // const encodedPackage = encodePackage(codeWithImports)
  console.log('code wit imports', codeWithImports)
  // console.log('encodedPackage', encodedPackage)
  // const geval = eval
  // // const evalExports = await eval(`import(${encodedPackage}`)
  // const evalExports = await eval(
  //   `import * from 'data:text/javascript;charset=utf-8;base64,ZXhwb3J0IGNvbnN0IG51bWJlciA9IDQyOwpleHBvcnQgY29uc3QgZm4gPSAoKSA9PiAiSGVsbG8gd29ybGQiOw==';
  //    export const asdfksdf = 5;`,
  // )
  // ;(window as any).codeDawPackages['code-daw/oscillators'] = {
  //   sine: 'some sine',
  //   saw: 'some saw',
  //   triangle: 'some triangle',
  //   square: 'some square',
  // }
  const moduleResult = await extremelyDangerousImportSource(codeWithImports)

  console.log('evalled module!!!!', moduleResult)
  console.log('Object.entries(moduleResult)', Object.entries(moduleResult))

  // await new Promise(resolve => setTimeout(resolve, 3000))

  return {
    codeDawVars: moduleResult,
  }

  // return encodePackage(codeWithImports)
  //   const cod22e = `
  //   import('data:text/javascript;charset=utf-8;base64,ZXhwb3J0IGNvbnN0IG51bWJlciA9IDQyOwpleHBvcnQgY29uc3QgZm4gPSAoKSA9PiAiSGVsbG8gd29ybGQiOw==').then(a => {
  //     console.log('base64 import', a)
  //   })
  // `

  //   const myCode = 'data:text/javascript;charset=utf-8;base64,ZXhwb3J0IGNvbnN0IG51bWJlciA9IDQyOwpleHBvcnQgY29uc3QgZm4gPSAoKSA9PiAiSGVsbG8gd29ybGQiOw==' as any
  //   console.log('myCode', myCode)
  //   const content = await import(
  //     'data:text/javascript;charset=utf-8;base64,ZXhwb3J0IGNvbnN0IG51bWJlciA9IDQyOwpleHBvcnQgY29uc3QgZm4gPSAoKSA9PiAiSGVsbG8gd29ybGQiOw=='
  //   )

  /// @ts-ignore
  // import(
  //   /// @ts-ignore
  //   'data:text/javascript;charset=utf-8;base64,ZXhwb3J0IGNvbnN0IG51bWJlciA9IDQyOwpleHBvcnQgY29uc3QgZm4gPSAoKSA9PiAiSGVsbG8gd29ybGQiOw=='
  // ).then(a => {
  //   console.log('base64 import', a)
  // })
  // doImport()

  // console.log('base64 import', content)

  console.log('DONE')
}
// const evalPackageYEAH = async (compiledPackage: any) => {
//   return await import(compiledPackage) // returns package contents
// }

export const es6Eval = (code: string) =>
  es6EvalWithPackages(code, [
    'code-daw/interactables',
    'code-daw/oscillators',
    'code-daw/io',
    'code-daw/effects',
    'code-daw/testing',
    'code-daw/sequencers',
  ])
