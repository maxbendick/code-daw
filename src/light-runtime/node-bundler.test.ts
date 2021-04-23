import '@testing-library/jest-dom'
import fs from 'fs'
import path from 'path'

const tempBundlerDirPath = path.join(process.cwd(), '/temp-test')

const createTempBundlerDir = () => fs.promises.mkdir(tempBundlerDirPath)

const deleteTempBundlerDir = () =>
  fs.promises.rmdir(tempBundlerDirPath, { recursive: true })

const isAlreadyExistsError = (e: Error) =>
  e.message.includes('file already exists')

const resetTempBundlerDir = async () => {
  try {
    await createTempBundlerDir()
  } catch (e) {
    if (isAlreadyExistsError(e)) {
      await deleteTempBundlerDir()
      await createTempBundlerDir()
    } else {
      throw e
    }
  }
}

const ignoreAlreadyExistsErrors = async (p: Promise<any>) => {
  try {
    return await p
  } catch (e) {
    if (!isAlreadyExistsError(e)) {
      throw e
    }
  }
}

test('(test-test) resetTempBundlerDir create new', async () => {

  await ignoreAlreadyExistsErrors(deleteTempBundlerDir())

  resetTempBundlerDir()
  const stats = await fs.promises.stat(tempBundlerDirPath)
  expect(stats.birthtimeMs).toBeCloseTo(new Date().getTime(), -2)
})

test('(test-test) resetTempBundlerDir overwrite', async () => {
  const someFilePath = path.join(tempBundlerDirPath, 'something.txt')
  ignoreAlreadyExistsErrors(createTempBundlerDir())
  await fs.promises.writeFile(someFilePath, 'some content')
  await resetTempBundlerDir()
  const stats = await fs.promises.stat(tempBundlerDirPath)
  expect(stats.birthtimeMs).toBeCloseTo(new Date().getTime(), -2)

  const someFileStatP = fs.promises.stat(someFilePath)
  expect(someFileStatP).rejects.toMatchObject({
    errno: -2,
    code: 'ENOENT',
    syscall: 'stat',
    path: someFilePath,
  })
})

test('node bundler', async () => {
  await resetTempBundlerDir()

  const randomNumber = Math.random()

  const fileName = 'my-file.mjs'
  const fileContent = `
    export const something = 'this is an esm file';

    export const randomNumber = ${randomNumber};
  `
  const filePath = path.join(tempBundlerDirPath, fileName)
  await fs.promises.writeFile(filePath, fileContent)

  const importedModule = await import(filePath)

  expect(importedModule).toEqual({
    something: 'this is an esm file',
    randomNumber,
  })
})
