const { app, BrowserWindow, ipcMain } = require('electron')
const path = require('path')
const fs = require('fs')
const yaml = require('js-yaml')

interface Server {
  name: string
  script: string
  autostart: boolean
}

let mainWindow

function createWindow () {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      enableRemoteModule: false
    }
  })

  mainWindow.loadFile('index.html')

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

function readServers(): Server[] {
  try {
    const filePath = path.join(__dirname, 'servers.yml')
    const data = fs.readFileSync(filePath, 'utf8')
    const parsed = yaml.load(data)
    return parsed && parsed.servers ? parsed.servers : []
  } catch (error) {
    console.error('Error reading servers.yml:', error)
    return []
  }
}

function writeServers(servers: Server[]): boolean {
  try {
    const filePath = path.join(__dirname, 'servers.yml')
    const data = yaml.dump({ servers })
    fs.writeFileSync(filePath, data, 'utf8')
    return true
  } catch (error) {
    console.error('Error writing servers.yml:', error)
    return false
  }
}

function startServer(script: string): Promise<{ stdout: string; stderr: string }> {
  const { exec } = require('child_process')
  return new Promise((resolve, reject) => {
    exec(`${script} start`, (error: any, stdout: string, stderr: string) => {
      // If the script reports already running, treat as success
      if (error && error.code === 1 && !stderr && stdout.includes('Server is already running')) {
        resolve({ stdout, stderr })
      } else if (error) {
        reject({ error: error.message, stderr })
      } else {
        resolve({ stdout, stderr })
      }
    })
  })
}

function stopServer(script: string): Promise<{ stdout: string; stderr: string }> {
  const { exec } = require('child_process')
  return new Promise((resolve, reject) => {
    exec(`${script} stop`, (error: any, stdout: string, stderr: string) => {
      // If the script reports not running (no PID file), treat as success
      if (error && error.code === 1 && !stderr && stdout.includes('Server is not running')) {
        resolve({ stdout, stderr })
      } else if (error) {
        reject({ error: error.message, stderr })
      } else {
        resolve({ stdout, stderr })
      }
    })
  })
}

function getServerStatus(script: string): Promise<{ stdout: string; stderr: string; code: number }> {
  const { exec } = require('child_process')
  return new Promise((resolve, reject) => {
    exec(`${script} status`, (error: any, stdout: string, stderr: string) => {
      // Some scripts might return non-zero for status but still provide output
      if (error && !stdout && !stderr) {
        reject({ error: error.message })
      } else {
        resolve({ stdout, stderr, code: error ? error.code : 0 })
      }
    })
  })
}

// IPC Handlers
ipcMain.handle('read-servers', () => readServers())
ipcMain.handle('write-servers', (event: any, servers: Server[]) => writeServers(servers))
ipcMain.handle('start-server', (event: any, script: string) => startServer(script))
ipcMain.handle('stop-server', (event: any, script: string) => stopServer(script))
ipcMain.handle('get-server-status', (event: any, script: string) => getServerStatus(script))

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