const { app, BrowserWindow, screen  } = require("electron")
const path = require("path");

let mainWindow;

const APP_NAME = "executejs"

function getAngularMainIndexHtmlUrl() {
  const distPath = path.resolve(__dirname, '..', '..', 'dist', APP_NAME);
  const filePath = path.join(distPath, 'index.html');
  const fileUrl = new URL(`file://${filePath}`).toString();
  return fileUrl;
}

function createWindow () {
  const { width, height } = screen.getPrimaryDisplay().workAreaSize;

  const windowWidth = Math.floor(width * 0.6); //60% of screen width
  const windowHeight = Math.floor(height * 0.5); //50%  of screen height

  mainWindow = new BrowserWindow({
    width: windowWidth,
    height: windowHeight,
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
