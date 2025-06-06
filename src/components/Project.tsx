import { Link } from "react-router-dom"
import "./Project.css"
import editIcon from "../assets/pencil.png";
import trashIcon from "../assets/trash.png"
import React from "react";




export type project = {
  id: number,
  name: string,
  description: string,
}




export default function Project({ id, name, description }: project) {

  const deleteProject = (e: React.MouseEvent) => {
    e.preventDefault();
    window.ipcRenderer.send("delete-project", id);
    window.ipcRenderer.send("get-projects");
  }


  return (
    <>
      <Link to={`todo/${id}/${name}`} className="project-container">
        <p className="project-name" style={{ fontSize: "1.3rem" }}>{name}</p>
        <p className="project-description">{description}</p>

        <span className="icon-container edit-icon-container" style={{ top: "1%" }} onClick={(e) => { e.preventDefault(); console.log("Edit Pressed") }}>
          <img src={editIcon} alt="edit" className="icon" />
        </span>
        <span className="icon-container delete-icon-container" style={{ bottom: "1%" }} onClick={deleteProject}>
          <img src={trashIcon} alt="delete" className="icon" />
        </span>

      </Link>
    </>
  )
}
