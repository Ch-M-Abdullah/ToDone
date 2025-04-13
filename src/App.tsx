import { BrowserRouter, Route, Routes } from 'react-router-dom';
import './App.css'
import logo from "./assets/logo.png";
import TodoList from './pages/TodoList';
import Projects from './pages/Projects';
import CreateProject from './pages/CreateProject';
import SubTodoList from './pages/SubTodoList';
import { useState } from 'react';


function App() {
  const [shrinked, setShrinked] = useState(false);

  document.onmouseleave = () => {
    window.ipcRenderer.send("mouse-left");
    setShrinked(true);
  }

  document.onmouseenter = () => {
    setShrinked(false);
    window.ipcRenderer.send("mouse-entered");
  }


  return (
    <>
      <div onClick={() => window.close()} className='close-btn' >x</div>
      <img src={logo} alt="logo" style={{ height: "100vw", width: "100vw", display: !shrinked ? "none" : "block", position: "absolute", top: "0px", left: "0px" }} />
      <BrowserRouter>
        <Routes location={location} key={location.pathname}>
          <Route path='/' element={<Projects />} />
          <Route path='todo/:project_id/:project_title' element={<TodoList />} />
          <Route path='subTodo/:project_id/:todo_id/:todo_description' element={<SubTodoList />} />
          <Route path='createProject' element={<CreateProject />} />
        </Routes>
      </BrowserRouter>
    </>
  )
}

export default App
