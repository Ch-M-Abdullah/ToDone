import { app, BrowserWindow, screen, ipcMain } from "electron";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { createRequire } from "node:module";
const require2 = createRequire(import.meta.url);
const Database = require2("better-sqlite3");
const db = new Database("./todone.db");
db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");
process.on("exit", () => db.close());
db.exec(`
            CREATE TABLE IF NOT EXISTS projects(
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                description TEXT NOT NULL
        )`);
db.exec(`
            CREATE TABLE IF NOT EXISTS todos(
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                description TEXT,
                completed INTEGER NOT NULL DEFAULT 0,
                project_id INTEGER,
                FOREIGN KEY (project_id) REFERENCES projects(id)
        )`);
db.exec(`
        CREATE TABLE IF NOT EXISTS sub_todos(
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            sub_todo_id INTEGER,
            todo_id INTEGER,
            FOREIGN KEY (sub_todo_id) REFERENCES todos(id) ON DELETE CASCADE,
            FOREIGN KEY (todo_id) REFERENCES todos(id) ON DELETE CASCADE
    )`);
function createProject(name, description) {
  try {
    const query = db.prepare(`
            INSERT INTO projects(name, description) VALUES(?, ?);
        `);
    query.run([name, description]);
    console.log("Project Creation Query Ran Successfully...");
  } catch (err) {
    console.error("Query Could Not Ran Successfully...");
    console.error("Error: ", err);
  }
}
function createTodo(description, project_id) {
  const query = db.prepare(`
        INSERT INTO todos(description, project_id) VALUES(?, ?);
    `);
  query.run([description, project_id]);
  console.log("Todo Created: ", { project_id, description });
}
function createSubTodo(description, project_id, todo_id) {
  createTodo(description, project_id);
  const query = db.prepare(`
        INSERT INTO sub_todos (sub_todo_id, todo_id) 
        SELECT id, ? FROM todos ORDER BY id DESC LIMIT 1;
    `);
  query.run([todo_id]);
  toggleTodoCompletion(todo_id);
}
function getProjects() {
  const query = db.prepare(`
        SELECT * FROM projects;
    `);
  const items = query.all();
  return items;
}
function getTodos(project_id) {
  const query = db.prepare(`
        SELECT * 
        FROM todos t
        WHERE t.project_id = ? 
        AND NOT EXISTS (
        SELECT 1 FROM sub_todos s WHERE s.sub_todo_id = t.id
        ); --This Query Returns all Todos that are not in the sub_todos table
    `);
  const items = query.all([project_id]);
  console.log("Todos Fetched For Project#", project_id);
  console.log("Todos Fetched: ", items);
  return items;
}
function getSubTodos(todo_id) {
  const query = db.prepare(`
        SELECT * FROM sub_todos
        JOIN todos ON sub_todos.sub_todo_id = todos.id
        WHERE sub_todos.todo_id = ?;
    `);
  const items = query.all([todo_id]);
  console.log(`Sub Todos Fetched For Todo#${todo_id}: `, items);
  return items;
}
function getLastAddedTodoId() {
  const query = db.prepare(`
        SELECT id FROM todos
        ORDER BY id DESC
        LIMIT 1;
    `);
  const { id } = query.get();
  return id;
}
function updateProject(id, name, description) {
  const query = db.prepare(`
        UPDATE projects
        SET name = ?, description = ?
        WHERE id = ?;
    `);
  query.run([name, description, id]);
}
function updateTodo(id, description, completed = false) {
  const complete = completed ? 1 : 0;
  const query = db.prepare(`
        UPDATE todos
        SET description = ?, completed = ?
        WHERE id = ?;
    `);
  query.run([description, complete, id]);
}
function toggleTodoCompletion(id, complete) {
  const completed = "0";
  const query = db.prepare(`
        UPDATE todos
        SET completed = ?
        WHERE id = ?
    `);
  query.run([completed, id]);
}
function deleteProject(id) {
  const query = db.prepare(`
        DELETE FROM projects
        WHERE id = ?;
    `);
  query.run([id]);
}
function deleteTodo(id) {
  const query = db.prepare(`
        DELETE FROM todos
        WHERE id = ?;
    `);
  query.run([id]);
}
console.log("App started");
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
process.env.APP_ROOT = path.join(__dirname, "..");
const VITE_DEV_SERVER_URL = process.env["VITE_DEV_SERVER_URL"];
const MAIN_DIST = path.join(process.env.APP_ROOT, "dist-electron");
const RENDERER_DIST = path.join(process.env.APP_ROOT, "dist");
process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL ? path.join(process.env.APP_ROOT, "public") : RENDERER_DIST;
let win;
function createWindow() {
  win = new BrowserWindow({
    frame: false,
    icon: path.join(process.env.VITE_PUBLIC, "electron-vite.svg"),
    webPreferences: {
      preload: path.join(__dirname, "preload.mjs"),
      contextIsolation: true,
      nodeIntegration: false
    },
    alwaysOnTop: true,
    title: "To Done"
  });
  win.webContents.on("did-finish-load", () => {
    win == null ? void 0 : win.webContents.send("main-process-message", (/* @__PURE__ */ new Date()).toLocaleString());
  });
  if (VITE_DEV_SERVER_URL) {
    win.loadURL(VITE_DEV_SERVER_URL);
  } else {
    win.loadFile(path.join(RENDERER_DIST, "index.html"));
  }
  return win;
}
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
    win = null;
  }
});
app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
let screenWidth;
let previousSize;
let previousPosition;
function repositionWindow() {
  previousPosition = win == null ? void 0 : win.getPosition();
  win == null ? void 0 : win.setPosition(screenWidth - win.getContentSize()[0], win == null ? void 0 : win.getPosition()[1], true);
}
function shrinkWindow() {
  previousSize = win == null ? void 0 : win.getSize();
  win == null ? void 0 : win.setSize(60, 60);
  repositionWindow();
}
function setIpcEvents() {
  ipcMain.on("create-project", (_, arg) => {
    const { name, description } = arg;
    createProject(name, description);
    console.log("Create-Project Was Successful...");
  });
  ipcMain.on("get-projects", (event) => {
    const projects = getProjects();
    event.reply("all-projects", projects);
  });
  ipcMain.on("update-project", (_, args) => {
    const { id, name, description } = args;
    updateProject(id, name, description);
  });
  ipcMain.on("delete-project", (_, id) => {
    deleteProject(id);
  });
  ipcMain.on("save-todo", (event, args) => {
    const { id, project_id, description, completed } = args;
    if (project_id && !id) {
      createTodo(description, project_id);
      const newId = getLastAddedTodoId();
      event.reply("todo-created", { id: newId, description });
    } else if (id && !project_id) {
      updateTodo(id, description, completed);
      console.log(`Updated Todo with ID#${id} and Completed: ${completed} with description: ${description}`);
    } else {
      console.error("Error in app.whenReady().then() > ipcMain.on('create-todo'): Either project_id and id are both missing or both are provided. Ambiguity in whether to create a todo or update it.");
      console.error(`Provided TodoID is ${id} and it's ProjectID is ${project_id}`);
    }
  });
  ipcMain.on("save-sub-todo", (event, args) => {
    const { id, project_id, description, todo_id, completed } = args;
    if (project_id && !id) {
      console.log("Sub Todo Created...");
      createSubTodo(description, project_id, todo_id);
      const newId = getLastAddedTodoId();
      event.reply("todo-created", { id: newId, description });
    } else if (id && !project_id) {
      console.error("Sub Todo Saved...");
      updateTodo(id, description, completed);
    } else {
      console.error("Error in app.whenReady().then() > ipcMain.on('create-sub-todo'): Either project_id and id are both missing or both are provided. Ambiguity in whether to create a todo or update it.");
    }
  });
  ipcMain.on("get-todos", (event, project_id) => {
    const todos = getTodos(project_id);
    event.reply("all-todos", todos);
  });
  ipcMain.on("get-sub-todos", (event, todo_id) => {
    const subTodos = getSubTodos(todo_id);
    event.reply("all-sub-todos", subTodos);
  });
  ipcMain.on("delete-todo", (event, id) => {
    deleteTodo(id);
    event.reply("todo-deleted", id);
  });
  ipcMain.on("mouse-left", () => {
    shrinkWindow();
  });
  ipcMain.on("mouse-entered", () => {
    if (previousSize && previousPosition) {
      win == null ? void 0 : win.setPosition(previousPosition[0], previousPosition[1], false);
      win == null ? void 0 : win.setSize(previousSize[0], previousSize[1], false);
    }
  });
}
app.whenReady().then(async () => {
  try {
    setIpcEvents();
  } catch (error) {
    console.log("err: ", error);
  }
  createWindow();
  screenWidth = screen.getPrimaryDisplay().workAreaSize["width"];
  win == null ? void 0 : win.setPosition(screenWidth - win.getContentSize()[0], win == null ? void 0 : win.getPosition()[1], true);
  win == null ? void 0 : win.on("moved", () => {
    win == null ? void 0 : win.setPosition(screenWidth - win.getContentSize()[0], win == null ? void 0 : win.getPosition()[1], true);
  });
  win == null ? void 0 : win.on("resized", () => {
    win == null ? void 0 : win.setPosition(screenWidth - win.getContentSize()[0], win == null ? void 0 : win.getPosition()[1], true);
  });
}).catch((err) => console.log(err));
export {
  MAIN_DIST,
  RENDERER_DIST,
  VITE_DEV_SERVER_URL
};
