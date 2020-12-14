// interface VirtualFile {
//   path: string;
//   content: Promise<string>;
// }

// interface VirtualFileSystem {

// }

const vfsFileLocalStoragePrefix = 'code-daw/vfs/files'
const pathToLocalStorageKey = (path: string) =>
  `${vfsFileLocalStoragePrefix}${path}`

const defaultFilesDirectoryUrl = `${process.env.PUBLIC_URL}/default-files`
const pathlistUrl = `${defaultFilesDirectoryUrl}/pathlist.json`

const getDefaultPathlist = async (
  fetchFn: typeof window.fetch,
): Promise<string[]> => {
  const response = await fetchFn(pathlistUrl)

  const responseBody = await response.text()

  const result = JSON.parse(responseBody) as string[]

  console.log('get default pathlist result', result)

  return result
}

const getDefaultFile = async (
  fetchFn: typeof window.fetch,
  path: string,
): Promise<string> => {
  if (!path.startsWith('/')) {
    throw new Error(`path must start with / - ${path}`)
  }
  const response = await fetchFn(`${defaultFilesDirectoryUrl}${path}`)
  return await response.text()
}

export const makeLocalStorageVfs = async (
  storage: Storage = window.localStorage,
  fetchFn: typeof window.fetch = window.fetch,
) => {
  const vfs = new LocalStorageVfs(storage, fetchFn)
  await vfs.init()
  return vfs
}

interface VfsFile {
  path: string
  content: string
}

export interface VirtualFileSystem {
  get: (path: string) => Promise<VfsFile>
  set: (path: string, content: string) => Promise<VfsFile>
  getAllPaths: () => Promise<string[]>
}

class LocalStorageVfs implements VirtualFileSystem {
  constructor(private storage: Storage, private fetchFn: typeof window.fetch) {}

  init = async () => {
    const paths = await this.getAllPaths()
    if (paths.length) {
      return
    }

    const pathlist = await getDefaultPathlist(this.fetchFn)

    for (const path of pathlist) {
      const fileContent = await getDefaultFile(this.fetchFn, path)
      await this.setNoPropogate(path, fileContent)
    }
  }

  get = async (path: string): Promise<VfsFile> => {
    if (!path.startsWith('/')) {
      throw new Error(`path must start with / - ${path}`)
    }
    const result = this.storage.getItem(pathToLocalStorageKey(path))!
    if (!result) {
      throw new Error(`couldnt find localstorage item for path ${path}`)
    }
    return {
      path,
      content: result,
    }
  }

  set = async (path: string, content: string): Promise<VfsFile> => {
    if (!path.startsWith('/')) {
      throw new Error(`path must start with / - ${path}`)
    }

    // make sure present - this may throw!!!
    await this.get(path)

    this.storage.setItem(pathToLocalStorageKey(path), content)
    return { path, content }
  }

  setNoPropogate = async (path: string, content: string): Promise<VfsFile> => {
    if (!path.startsWith('/')) {
      throw new Error(`path must start with / - ${path}`)
    }

    this.storage.setItem(pathToLocalStorageKey(path), content)
    return { path, content }
  }

  getAllPaths = async (): Promise<string[]> => {
    return Object.entries(this.storage)
      .map(([key, v]) => key)
      .filter(key => key.startsWith(vfsFileLocalStoragePrefix))
      .map(key => key.substring(vfsFileLocalStoragePrefix.length))
      .sort()
  }
}
