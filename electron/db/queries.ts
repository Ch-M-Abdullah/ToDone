import db from "./config";


// CREATE Functions
export function createProject(name: string, description: string) {
    try {

        const query = db.prepare(`
            INSERT INTO projects(name, description) VALUES(?, ?);
        `);
        query.run([name, description])
        console.log("Project Creation Query Ran Successfully...");
    } catch (err) {
        console.error("Query Could Not Ran Successfully...");
        console.error("Error: ", err);

    }

}

export function createTodo(description: string, project_id: number) {
    const query = db.prepare(`
        INSERT INTO todos(description, project_id) VALUES(?, ?);
    `);
    query.run([description, project_id]);
    console.log("Todo Created: ", { project_id, description });
}
export function createSubTodo(description: string, project_id: number, todo_id: number) {
    createTodo(description, project_id);

    const query = db.prepare(`
        INSERT INTO sub_todos (sub_todo_id, todo_id) 
        SELECT id, ? FROM todos ORDER BY id DESC LIMIT 1;
    `);
    query.run([todo_id])
    toggleTodoCompletion(todo_id, false)
}


// READ Functions
export function getProjects() {
    const query = db.prepare(`
        SELECT * FROM projects;
    `);
    const items = query.all();
    return items;
}

export function getTodos(project_id: number) {
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
export function getSubTodos(todo_id: number) {
    const query = db.prepare(`
        SELECT * FROM sub_todos
        JOIN todos ON sub_todos.sub_todo_id = todos.id
        WHERE sub_todos.todo_id = ?;
    `);
    const items = query.all([todo_id]);
    console.log(`Sub Todos Fetched For Todo#${todo_id}: `, items);
    return items;
}
export function getLastAddedTodoId() {
    const query = db.prepare(`
        SELECT id FROM todos
        ORDER BY id DESC
        LIMIT 1;
    `);
    const { id } = query.get();
    return id;
}


// UPDATE Functions
export function updateProject(id: number, name: string, description: string) {
    const query = db.prepare(`
        UPDATE projects
        SET name = ?, description = ?
        WHERE id = ?;
    `);
    query.run([name, description, id])
}

export function updateTodo(id: number, description: string, completed: boolean = false) {
    const complete = completed ? 1 : 0; //Converting `complete` from `boolean` to `int` as boolean is not supported by SQLite.
    const query = db.prepare(`
        UPDATE todos
        SET description = ?, completed = ?
        WHERE id = ?;
    `);
    query.run([description, complete, id])
    // console.log(`Updated Todo with ID#${id} and Completed: ${completed} with description: ${description}`);
}
export function toggleTodoCompletion(id: number, complete: boolean) {
    const completed = complete ? "1" : "0";
    const query = db.prepare(`
        UPDATE todos
        SET completed = ?
        WHERE id = ?
    `);
    query.run([completed, id]);
}
// export function updateSubTodo(id: number, description: string){
//     const query = db.prepare(`
//         UPDATE sub_todos
//         SET description = ?
//         WHERE id = ?;
//     `);
//     query.run( [description, id])
// }


// export function toggleTodoCompleted(id: number) {
//     const query = db.prepare(`
//         UPDATE todos
//         SET completed = NOT completed
//         WHERE id = ?
//     `);
//     query.run([id]);
// }
// export function toggleSubTodoCompleted(id: number){
//     const query = db.prepare(`
//         UPDATE sub_todos
//         SET completed = NOT completed
//         WHERE id = ?
//     `);
//     query.run([id]);
// }


// DELETE Functions
export function deleteProject(id: number) {
    const query = db.prepare(`
        DELETE FROM projects
        WHERE id = ?;
    `);
    query.run([id]);
}

export function deleteTodo(id: number) {
    const query = db.prepare(`
        DELETE FROM todos
        WHERE id = ?;
    `);
    query.run([id]);
}
// export function deleteSubTodo(id: number){
//     const query = db.prepare(`
//         DELETE FROM sub_todos
//         WHERE id = ?;
//     `);
//     query.run([id]);
// }