import { app, BrowserWindow } from 'electron'

function createWindow () {
  const window = new BrowserWindow({
    width: 800,
    height: 600
  })
  window.loadURL('https://google.com')
}

app.on('ready', createWindow)
