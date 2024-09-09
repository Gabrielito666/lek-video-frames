const server = require('./server');

const [_, __, file] = process.argv;

if(!file)
{
    console.error("Por fabor ingrese un video en la linea de comandos");
    process.exit();
}
const { app, BrowserWindow, screen } = require('electron');

const { onServerReady, onEndServer } = server(3000, file);

let mainWindow;
function createWindow() {
    const { width, height } = screen.getPrimaryDisplay().workAreaSize;
    mainWindow = new BrowserWindow({
        width,
        height,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false
        }
    });

    mainWindow.loadURL('http://localhost:3000/editor');

    mainWindow.on('closed', function () {
        mainWindow = null;
    });
}

onServerReady(() => {
    app.whenReady().then(createWindow);

    app.on('window-all-closed', () => {
        if (process.platform !== 'darwin') {
            app.quit();
        }
    });

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
});

onEndServer(() => {
    if (mainWindow) {
        mainWindow.close();
    }
    app.quit();
    process.exit();
});
