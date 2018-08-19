export default interface IService {
  readonly service: string,
  init: (ipc: Electron.IpcRenderer) => void
}