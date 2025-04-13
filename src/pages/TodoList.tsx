import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Todo from "../components/Todo";
import "./TodoList.css";


export type Todo = {
  id?: number,
  project_id?: number,
  description: string,
  completed: boolean,
}


export default function TodoList() {
  const { project_id, project_title } = useParams();
  const navigate = useNavigate();

  const [items, setItems] = useState<Todo[]>([]);


  const createNewTodo = useCallback((description: string = "") => {

    // console.error('Creating a new Todo with Description: ', description);
    const newItem: Todo = { project_id: project_id as unknown as number, description, completed: false }; //The `as unknown as number` is just to bypass typescript's type checking
    setItems((items) => {
      const newState = [...items, newItem];
      console.log("Length of Items is now: ", newState.length);
      return newState;
    });
  }, [project_id, setItems]);


  const handleNewTodoShortcut = useCallback((event: KeyboardEvent) => {
    if (event.ctrlKey && event.key.toLowerCase() === "n") {
      // event.preventDefault(); // Prevent the default action (e.g., opening a new window)
      console.log("Ctrl + N was pressed!");
      createNewTodo("");
    }
    else if (event.altKey && event.key.toLowerCase() === "arrowleft") {
      navigate(-1); //Go Back
    }
    // else if (event.ctrlKey && event.key.toLowerCase() === "l") { //To be removed in production
    //   event.preventDefault(); // Prevent the default action (e.g., opening a new window)
    //   setItems((items) => {
    //     items.map((item) => {
    //       console.log(`ID: ${item.id} \nDescription: ${item.description} \nStatus: ${item.completed}`);
    //     })
    //     return items;
    //   })
    // }
  }, [createNewTodo, navigate]);


  useEffect(() => {
    console.log("Opened Project With ID: ", project_id);

    window.ipcRenderer.on('all-todos', (_, todos) => {
      setItems(todos);
    });

    window.ipcRenderer.on("todo-created", (_, { id, description }) => {
      setItems((items) => { //Setting the id of newly created Todo
        let changed = false; //This will be used as a flag so the following `map` function will only apply the changes to only one item, as intended.
        const newItems = items.map((todo) => {
          if (!changed && (!todo["id"] || todo["id"] === 0)) {
            changed = true;
            return { ...todo, id, description };
          }
          else {
            return todo;
          }
        });
        console.log(`ID for newly created TODO has been set to ${id}`);
        return newItems;
      });
    });

    window.ipcRenderer.on('todo-deleted', (_, id) => {
      setItems((items) => {
        return items.filter(item => item.id !== id);
      });
    });

    window.ipcRenderer.send('get-todos', project_id);

    document.addEventListener("keydown", handleNewTodoShortcut);

    return () => {
      window.ipcRenderer.removeAllListeners('all-todos');
      window.ipcRenderer.removeAllListeners('todo-created');
      window.ipcRenderer.removeAllListeners('todo-deleted');
      document.removeEventListener("keydown", handleNewTodoShortcut);
    }
  }, [project_id, handleNewTodoShortcut]);



  return (
    <div>
      <div style={{ display: "flex" }}>
        <p onClick={() => navigate(-1)} className="title">{project_title}</p>
      </div>

      <div className="list-container">
        {items.map((item, index) =>
          <Todo id={item["id"]} project_id={item["project_id"]} description={item['description']} checked={item["completed"]} setItems={setItems} index={index} key={item["id"] ? `todo${item["id"]}` : `temp-${index}`} />
        )}
      </div>
    </div>
  )
}
