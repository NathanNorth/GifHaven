import { app, BrowserWindow, ipcMain, ipcRenderer } from 'electron'
import * as path from 'path'

//create a new default window
const createWindow = () => {
    const win = new BrowserWindow({
        width: 600,
        height: 1000,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js')
        }
    })

   win.loadFile('../../index.html')
}
//called once electron has loaded all components of the app
app.whenReady().then(() =>{
    createWindow()
})
//called when all windows are closed
app.on('window-all-closed', () => {
    app.quit()
})
//register this first
ipcMain.on('get-path', (event, arg) => {
    event.returnValue = app.getPath('appData')
})