import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const Database = require('better-sqlite3');



const db = new Database('./todone.db');


db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

process.on('exit', () => db.close()); // Closing The Connection When the app is closed


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
                FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
        )`);

db.exec(`
        CREATE TABLE IF NOT EXISTS sub_todos(
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            sub_todo_id INTEGER,
            todo_id INTEGER,
            FOREIGN KEY (sub_todo_id) REFERENCES todos(id) ON DELETE CASCADE,
            FOREIGN KEY (todo_id) REFERENCES todos(id) ON DELETE CASCADE
    )`);




export default db;