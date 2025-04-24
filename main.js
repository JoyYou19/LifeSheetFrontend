const { app, BrowserWindow } = require("electron");
const path = require("path");

// Create a new browser window
function createWindow() {
  const win = new BrowserWindow({
    width: 1600, // Set the width of the window
    height: 900, // Set the height of the window
    webPreferences: {
      preload: path.join(__dirname, "preload.js"), // Optional: add preload script
      nodeIntegration: true, // Allow Node.js APIs in the frontend
      contextIsolation: false, // Required for Electron v12+
    },
  });

  win.setMenuBarVisibility(false);
  // Load your React app during development
  win.loadURL("http://localhost:3000"); // Points to the React dev server

  // Uncomment this line to open DevTools automatically:
  // win.webContents.openDevTools();
}

// Initialize the Electron app
app.whenReady().then(() => {
  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

// Quit the app when all windows are closed
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});
