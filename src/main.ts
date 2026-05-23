import { app, BrowserWindow, ipcMain, IpcMainInvokeEvent } from 'electron'
import * as path from 'path'
import * as fs from 'fs'
import * as yaml from 'js-yaml'

let mainWindow: BrowserWindow | null = null

interface Server {
  name: string
  script: string
  autostart?: boolean
}

interface ExecResult {
  stdout: string
  stderr: string
}

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

function readServers () {
  try {
    const filePath = path.join(__dirname, '../servers.yml')
    const data = fs.readFileSync(filePath, 'utf8')
    const parsed = yaml.load(data)
    // Check if parsed is an object and has a servers property
    if (parsed && typeof parsed === 'object' && 'servers' in parsed) {
      return parsed.servers as Server[]
    }
    return [] as Server[]
  } catch (error) {
    console.error('Error reading servers.yml:', error)
    return [] as Server[]
  }
}

function writeServers (servers: Server[]) {
  try {
    const filePath = path.join(__dirname, '../servers.yml')
    const data = yaml.dump({ servers })
    fs.writeFileSync(filePath, data, 'utf8')
    return true
  } catch (error) {
    console.error('Error writing servers.yml:', error)
    return false
  }
}

function startServer (script: string): Promise<ExecResult> {
  const { exec } = require('child_process')
  return new Promise((resolve, reject) => {
    exec(`${script} start`, (error: Error | null, stdout: string, stderr: string) => {
      // If the script reports already running, treat as success
      if (error && typeof (error as { code?: number | string }).code === 'number' && (error as { code?: number | string }).code === 1 && !stderr && stdout.includes('Server is already running')) {
        resolve({ stdout, stderr })
      } else if (error) {
        reject({ error: error.message, stderr })
      } else {
        resolve({ stdout, stderr })
      }
    })
  })
}

function stopServer (script: string): Promise<ExecResult> {
  const { exec } = require('child_process')
  return new Promise((resolve, reject) => {
    exec(`${script} stop`, (error: Error | null, stdout: string, stderr: string) => {
      // If the script reports not running (no PID file), treat as success
      if (error && typeof (error as { code?: number | string }).code === 'number' && (error as { code?: number | string }).code === 1 && !stderr && stdout.includes('Server is not running')) {
        resolve({ stdout, stderr })
      } else if (error) {
        reject({ error: error.message, stderr })
      } else {
        resolve({ stdout, stderr })
      }
    })
  })
}

function getServerStatus (script: string): Promise<{ stdout: string; stderr: string; code: number }> {
  const { exec } = require('child_process')
  return new Promise((resolve, reject) => {
    exec(`${script} status`, (error: Error | null, stdout: string, stderr: string) => {
      // Some scripts might return non-zero for status but still provide output
      if (error && !stdout && !stderr) {
        reject({ error: error.message })
      } else {
        const code = (error as { code?: number | string })?.code ?? 0
        resolve({ stdout, stderr, code: typeof code === 'number' ? code : 0 })
      }
    })
  })
}

// IPC Handlers
ipcMain.handle('read-servers', async (_event: IpcMainInvokeEvent) => readServers())
ipcMain.handle('write-servers', async (_event: IpcMainInvokeEvent, servers: Server[]) => writeServers(servers))
ipcMain.handle('start-server', async (_event: IpcMainInvokeEvent, script: string) => startServer(script))
ipcMain.handle('stop-server', async (_event: IpcMainInvokeEvent, script: string) => stopServer(script))
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