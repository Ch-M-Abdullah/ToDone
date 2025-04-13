import { app, BrowserWindow, ipcMain, screen } from 'electron'
import { fileURLToPath } from 'node:url'
import path from 'node:path';

import * as query from './db/queries';


console.log("App started")

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
process.env.APP_ROOT = path.join(__dirname, '..')

// 🚧 Use ['ENV_NAME'] avoid vite:define plugin - Vite@2.x
export const VITE_DEV_SERVER_URL = process.env['VITE_DEV_SERVER_URL']
export const MAIN_DIST = path.join(process.env.APP_ROOT, 'dist-electron')
export const RENDERER_DIST = path.join(process.env.APP_ROOT, 'dist')

process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL ? path.join(process.env.APP_ROOT, 'public') : RENDERER_DIST

let win: BrowserWindow | null

function createWindow() {
  win = new BrowserWindow({
    frame: false,
    icon: path.join(process.env.VITE_PUBLIC, 'electron-vite.svg'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.mjs'),
      contextIsolation: true,
      nodeIntegration: false,
    },
    alwaysOnTop: true,
    title: "To Done",
  });
  // win.webContents.openDevTools();

  // Test active push message to Renderer-process.
  win.webContents.on('did-finish-load', () => {
    win?.webContents.send('main-process-message', (new Date).toLocaleString())
  })

  if (VITE_DEV_SERVER_URL) {
    win.loadURL(VITE_DEV_SERVER_URL)
  } else {
    // win.loadFile('dist/index.html')
    win.loadFile(path.join(RENDERER_DIST, 'index.html'))
  }
  return win;
}

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
    win = null
  }
})

app.on('activate', () => { //Starting The App
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})

let screenWidth: number;
let previousSize: number[] | undefined;
let previousPosition: number[] | undefined;

function repositionWindow() {
  previousPosition = win?.getPosition();
  win?.setPosition(screenWidth - win.getContentSize()[0], win?.getPosition()[1], true);
}

function shrinkWindow() {
  previousSize = win?.getSize();
  win?.setSize(60, 60);
  repositionWindow();
}

function setIpcEvents() { //This Function sets all the events that the frontend can send to the backend. All of them are placed inside this function just for cleanliness
  ipcMain.on('create-project', (_, arg) => {

    const { name, description } = arg;
    query.createProject(name, description);
    console.log("Create-Project Was Successful...");

  });

  ipcMain.on('get-projects', (event) => {
    const projects = query.getProjects();
    event.reply('all-projects', projects);
  });

  ipcMain.on('update-project', (_, args) => {
    const { id, name, description } = args;
    query.updateProject(id, name, description);
  });

  ipcMain.on('delete-project', (_, id) => {
    query.deleteProject(id);
  });


  ipcMain.on('save-todo', (event, args) => {
    const { id, project_id, description, completed } = args;
    if (project_id && !id) { // If project_id is provided, it means that todo is being created
      query.createTodo(description, project_id);
      const newId = query.getLastAddedTodoId();
      event.reply("todo-created", { id: newId, description });
    }
    else if (id && !project_id) { // If id is provided, it means that todo is being updated
      query.updateTodo(id, description, completed);
      console.log(`Updated Todo with ID#${id} and Completed: ${completed} with description: ${description}`);
    }
    else { // if both are provided or none are provided, error is logged.
      console.error("Error in app.whenReady().then() > ipcMain.on('create-todo'): Either project_id and id are both missing or both are provided. Ambiguity in whether to create a todo or update it.");
      console.error(`Provided TodoID is ${id} and it's ProjectID is ${project_id}`);
    }
  });

  ipcMain.on('save-sub-todo', (event, args) => {
    const { id, project_id, description, todo_id, completed } = args;
    if (project_id && !id) { // If project_id is provided, it means that todo is being created
      console.log("Sub Todo Created...");
      query.createSubTodo(description, project_id, todo_id);
      const newId = query.getLastAddedTodoId();
      event.reply("todo-created", { id: newId, description });
    }
    else if (id && !project_id) { // If id is provided, it means that todo is being updated
      console.error("Sub Todo Saved...");
      query.updateTodo(id, description, completed);
    }
    else { // if both are provided or none are provided, error is logged.
      console.error("Error in app.whenReady().then() > ipcMain.on('create-sub-todo'): Either project_id and id are both missing or both are provided. Ambiguity in whether to create a todo or update it.");
    }
  });

  ipcMain.on('get-todos', (event, project_id) => {
    const todos = query.getTodos(project_id);
    event.reply('all-todos', todos)
  });
  ipcMain.on('get-sub-todos', (event, todo_id) => {
    const subTodos = query.getSubTodos(todo_id);
    event.reply('all-sub-todos', subTodos)
  });

  ipcMain.on('delete-todo', (event, id) => {
    query.deleteTodo(id);
    event.reply('todo-deleted', id);
  });


  //Window Events
  ipcMain.on('mouse-left', () => {
    shrinkWindow();
  });

  ipcMain.on("mouse-entered", () => {
    if (previousSize && previousPosition) {
      win?.setPosition(previousPosition[0], previousPosition[1], false)
      win?.setSize(previousSize[0], previousSize[1], false);
    }
  })
}


app.whenReady().then(async () => {
  try {
    setIpcEvents();


  } catch (error) {
    console.log("err: ", error);
  }

  createWindow();

  screenWidth = screen.getPrimaryDisplay().workAreaSize["width"];

  win?.setPosition(screenWidth - win.getContentSize()[0], win?.getPosition()[1], true)

  win?.on("moved", () => {
    win?.setPosition(screenWidth - win.getContentSize()[0], win?.getPosition()[1], true);
  })
  win?.on("resized", () => {
    win?.setPosition(screenWidth - win.getContentSize()[0], win?.getPosition()[1], true);
  })
}).catch((err) => console.log(err))
