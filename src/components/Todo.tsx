import React, { useCallback, useEffect, useRef, useState } from "react"
// import { motion } from "framer-motion"
import { Todo as todo } from "../pages/TodoList";
import trashIcon from "../assets/trash.png";
import "./Todo.css"
import { useNavigate } from "react-router-dom";

type props = {
  id?: number,
  isSubTodo?: boolean,
  todo_id?: string,
  project_id?: number,
  description: string,
  checked: boolean,
  completed?: boolean,
  index: number,
  setItems: (value: React.SetStateAction<todo[]>) => void,
}


export default function Todo({ id, isSubTodo, todo_id, project_id, description, checked, index, setItems }: props) {
  const [desc, setDesc] = useState(description || "");
  const [completed, setCompleted] = useState(checked);
  const initialRender = useRef<boolean>(true);
  const inputRef = useRef(null);
  const navigate = useNavigate();


  const deleteTodo = useCallback(() => {
    window.ipcRenderer.send('delete-todo', id);
  }, [id]);


  const handleShortcuts = useCallback((event: KeyboardEvent) => {
    if (event.key === "Delete") {
      if (inputRef.current === document.activeElement) { //If current Todo is focused
        event.preventDefault(); // Prevent the default action (e.g., opening a new window)
        deleteTodo();
      }
    }
    else if (event.altKey && event.key.toLowerCase() === "arrowright" && inputRef.current === document.activeElement) {
      navigate(`../subTodo/${project_id}/${id}/${description}`);
    }
  }, [deleteTodo, navigate, project_id, id, description]);


  const saveTodo = useCallback(() => {
    if (desc === null || desc === "") { //Delete the todo if it is emtpy
      deleteTodo();
    }
    else { //Save The Todo if it is not empty
      console.log(`Saved Todo. \nID is ${id} \nProject ID is ${project_id} \nDescription is ${desc}`);
      setDesc(desc => desc.trim()); //Trimming Before Saving

      if (isSubTodo) {
        window.ipcRenderer.send("save-sub-todo", !id ? { project_id, description: desc.trim(), todo_id } : { id, description: desc.trim(), completed });
      }
      else {
        window.ipcRenderer.send("save-todo", !id ? { project_id, description: desc.trim(), completed } : { id, description: desc.trim(), completed });
      }

      setItems((items: todo[]) => { //Copying the changes to `TodoList` component
        const newItems = [...items]; //Performing Deep Copy
        newItems[index] = {
          ...newItems[index],
          description: desc.trim(),
          completed: completed
        };
        return newItems;
      })
    }
  }, [project_id, id, desc, completed, deleteTodo, index, setItems, isSubTodo, todo_id]);


  const toggleCompletion = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCompleted(e.target.checked);
  };
  useEffect(() => { //This is only used to save the Todo when `completed` is toggled. useEffect is used because of stale closure Problem.
    if (!initialRender.current) {
      saveTodo();
    }
    else {
      initialRender.current = false;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [completed]);


  useEffect(() => { //This is only being used for debugging and should be removed in production
    if (!id) {
      console.log(`New Todo Has Been Created With Description: ${description}`);
    }
  }, [description, id]);

  useEffect(() => {
    document.addEventListener("keydown", handleShortcuts);
    return () => {
      document.removeEventListener("keydown", handleShortcuts)
    }
  })

  const goToSubTodo = (e: React.MouseEvent) => {
    e.preventDefault();
    if (id) { //If The Current Todo does not have an id i.e. if the current Todo has not been saved yet
      navigate(`../subTodo/${project_id}/${id}/${description}`, { relative: "route" });
    }
  }


  return (
    <div onDoubleClick={goToSubTodo} className="container">
      <input type={"checkbox"} checked={completed} onChange={(e) => toggleCompletion(e)} className="todo-checkbox" ></input>
      <textarea ref={inputRef} style={{ textDecoration: completed ? "line-through #A9A9A9 1px" : "none" }} value={desc} onChange={(e) => setDesc(e.target.value)} onBlur={saveTodo} autoFocus={description ? false : true /*Focus if the description is empty aka the entry os just created*/} />
      <div className="delete-button" onClick={deleteTodo}>
        <img className="trash-icon" src={trashIcon} alt="delete" />
      </div>
    </div>
  )
}
