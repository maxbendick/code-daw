// interface VirtualFile {
//   path: string;
//   content: Promise<string>;
// }

import { defaultFilesPath } from '../config'

// interface VirtualFileSystem {

// }

const vfsFileLocalStoragePrefix = 'code-daw/vfs/files'
const pathToLocalStorageKey = (path: string) =>
  `${vfsFileLocalStoragePrefix}${path}`

const pathlistUrl = `${defaultFilesPath}/pathlist.json`

const getDefaultPathlist = async (): Promise<string[]> => {
  const response = await fetch(pathlistUrl)
  const responseBody = await response.text()
  return JSON.parse(responseBody) as string[]
}

const getDefaultFile = async (path: string): Promise<string> => {
  if (!path.startsWith('/')) {
    throw new Error(`path must start with / - ${path}`)
  }
  const response = await fetch(`${defaultFilesPath}${path}`)
  return await response.text()
}

interface SimpleStorage {
  getItem: typeof localStorage.getItem
  setItem: typeof localStorage.setItem
}

export interface LocalStorageVfsConfig {
  storage: SimpleStorage
}

export const makeLocalStorageVfs = async (config: LocalStorageVfsConfig) => {
  const vfs = new LocalStorageVfs(config)
  await vfs.init()
  return vfs
}

export interface VfsFile {
  path: string
  content: string
}

export interface VirtualFileSystem {
  get: (path: string) => Promise<VfsFile>
  set: (path: string, content: string) => Promise<VfsFile>
  // getAllPaths: () => Promise<string[]>
}

class LocalStorageVfs implements VirtualFileSystem {
  _storage: LocalStorageVfsConfig['storage']
  paths?: string[]

  constructor(config: LocalStorageVfsConfig) {
    this._storage = config.storage
  }

  init = async () => {
    const paths = await this.getAllPaths()
    if (paths.length) {
      this.paths = paths
      return
    }

    const pathlist = await getDefaultPathlist()
    this.paths = pathlist

    for (const path of pathlist) {
      const fileContent = await getDefaultFile(path)
      await this.setNoPropogate(path, fileContent)
    }
  }

  get = async (path: string): Promise<VfsFile> => {
    return {
      path,
      content: this.storageGet(path),
    }
  }

  set = async (path: string, content: string): Promise<VfsFile> => {
    if (!this.paths) {
      throw new Error('tried to set without paths')
    }
    if (!this.paths.includes(path)) {
      throw new Error(
        'cant save to a path not in paths ' + JSON.stringify(this.paths),
      )
    }
    this.storageSet(path, content)
    return { path, content }
  }

  setNoPropogate = this.set

  private getAllPaths = async (): Promise<string[]> => {
    return Object.entries(this._storage)
      .map(([key, v]) => key)
      .filter(key => key.startsWith(vfsFileLocalStoragePrefix))
      .map(key => key.substring(vfsFileLocalStoragePrefix.length))
      .sort()
  }

  private storageGet = (path: string): string => {
    if (!path.startsWith('/')) {
      throw new Error(`bad path ${path}`)
    }
    const result = this._storage.getItem(pathToLocalStorageKey(path))
    if (!result) {
      throw new Error(`no item in storage: ${path}`)
    }
    return result
  }

  private storageSet = (path: string, content: string) => {
    if (!path.startsWith('/')) {
      throw new Error(`bad path ${path}`)
    }
    // try {
    //   this.storageGet(path)
    // } catch (e) {
    //   throw new Error(
    //     `storageSet can only be called on existing storage items - ${path}`,
    //   )
    // }

    this._storage.setItem(pathToLocalStorageKey(path), content)
  }
}
