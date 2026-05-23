import { app, BrowserWindow, ipcMain, IpcMainInvokeEvent } from 'electron'
import * as path from 'path'
import { readServers, writeServers, startServer, stopServer, getServerStatus, Server, ExecResult } from './serverService'

let mainWindow: BrowserWindow | null = null

/**
 * Creates the main Electron browser window.
 */
function createWindow () {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, '../preload.js'),
      contextIsolation: true
    }
  })

  mainWindow.loadFile(path.join(__dirname, '../index.html'))

  // Auto-start servers on app ready
  mainWindow.webContents.on('did-finish-load', () => {
    const servers = readServers()
    servers.forEach((server: Server) => {
      if (server.autostart) {
        startServer(server.script)
      }
    })
  })
}

// IPC Handlers

/**
 * IPC handler to read servers list.
 * @param _event Electron IPC event (unused)
 * @returns Array of Server objects
 */
ipcMain.handle('read-servers', async (_event: IpcMainInvokeEvent) => readServers())

/**
 * IPC handler to write servers list.
 * @param _event Electron IPC event (unused)
 * @param servers Array of Server objects to save
 * @returns True if successful
 */
ipcMain.handle('write-servers', async (_event: IpcMainInvokeEvent, servers: Server[]) => writeServers(servers))

/**
 * IPC handler to start a server.
 * @param _event Electron IPC event (unused)
 * @param script Path to server script
 * @returns Execution result
 */
ipcMain.handle('start-server', async (_event: IpcMainInvokeEvent, script: string) => startServer(script))

/**
 * IPC handler to stop a server.
 * @param _event Electron IPC event (unused)
 * @param script Path to server script
 * @returns Execution result
 */
ipcMain.handle('stop-server', async (_event: IpcMainInvokeEvent, script: string) => stopServer(script))

/**
 * IPC handler to get server status.
 * @param _event Electron IPC event (unused)
 * @param script Path to server script
 * @returns Status object
 */
ipcMain.handle('get-server-status', async (_event: IpcMainInvokeEvent, script: string) => getServerStatus(script))

app.whenReady().then(() => {
  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})