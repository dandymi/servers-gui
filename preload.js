// Preload script for exposing IPC functions to the renderer
const { contextBridge, ipcRenderer } = require('electron')

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  readServers: () => ipcRenderer.invoke('read-servers'),
  writeServers: (servers) => ipcRenderer.invoke('write-servers', servers),
  startServer: (script) => ipcRenderer.invoke('start-server', script),
  stopServer: (script) => ipcRenderer.invoke('stop-server', script),
  getServerStatus: (script) => ipcRenderer.invoke('get-server-status', script)
})