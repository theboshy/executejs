const { app, BrowserWindow } = require("electron")
const path = require("path");

let mainWindow;

const APP_NAME = "executejs"

function getAngularMainIndexHtmlUrl() {
  const filePath = path.join(__dirname, 'dist', APP_NAME, 'index.html');
  const fileUrl = new URL(`file://${filePath}`).toString();
  return fileUrl;
}
function createWindow () {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
      preload: path.join(__dirname, 'preload.js')
    }
  })

  mainWindow.loadURL(
    getAngularMainIndexHtmlUrl()
  );
  // Open the DevTools.
  mainWindow.webContents.openDevTools()

  mainWindow.on('closed', function () {
    mainWindow = null
  })
}

app.on('ready', createWindow)

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit()
})

app.on('activate', function () {
  if (mainWindow === null) createWindow()
})
