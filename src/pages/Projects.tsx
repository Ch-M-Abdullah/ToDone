import { useEffect, useState } from "react";
import './Projects.css';

import Project, { project } from "../components/Project";
import { Link } from "react-router-dom";



export default function Projects() {
    const [projects, setProjects] = useState<project[]>([]);

    useEffect(() => {
        window.ipcRenderer.on("all-projects", (_, args: project[]) => {
            setProjects(args);
        })

        window.ipcRenderer.send("get-projects");
    }, []);

    return (
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", maxHeight: "80vh" }}>
            <h1 style={{ width: "100%", textAlign: "start" }}>Projects</h1>
            <div className="projects-container" style={{ width: "100%", height: "100%", }}>
                {projects.map((project) =>
                    <div className="single-project" key={`project#${project.id}`}>
                        <Project id={project.id} name={project.name} description={project.description} />
                    </div>
                )}

                <Link to={"createProject"} className="add-project-div">+</Link>

                {projects.length === 0 && ( //Render Only If No Projects Have Been Created Yet
                    <div>
                        <p>No Projects Created Yet</p>
                    </div>
                )}

            </div>

        </div>
    )
}
