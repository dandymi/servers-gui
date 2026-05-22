const { app, BrowserWindow, ipcMain } = require('electron')
const path = require('path')
const fs = require('fs')
const yaml = require('js-yaml')

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
    servers.forEach(server => {
      if (server.autostart) {
        startServer(server.script)
      }
    })
  })
}

function readServers() {
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

function writeServers(servers) {
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

function startServer(script) {
  const { exec } = require('child_process')
  return new Promise((resolve, reject) => {
    exec(`${script} start`, (error, stdout, stderr) => {
      if (error) {
        reject({ error: error.message, stderr })
      } else {
        resolve({ stdout, stderr })
      }
    })
  })
}

function stopServer(script) {
  const { exec } = require('child_process')
  return new Promise((resolve, reject) => {
    exec(`${script} stop`, (error, stdout, stderr) => {
      if (error) {
        reject({ error: error.message, stderr })
      } else {
        resolve({ stdout, stderr })
      }
    })
  })
}

function getServerStatus(script) {
  const { exec } = require('child_process')
  return new Promise((resolve, reject) => {
    exec(`${script} status`, (error, stdout, stderr) => {
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
ipcMain.handle('write-servers', (event, servers) => writeServers(servers))
ipcMain.handle('start-server', (event, script) => startServer(script))
ipcMain.handle('stop-server', (event, script) => stopServer(script))
ipcMain.handle('get-server-status', (event, script) => getServerStatus(script))

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