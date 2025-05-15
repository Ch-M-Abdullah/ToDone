import { useState } from "react"
import "./AddressBar.css"
import { Link } from "react-router-dom";

export default function AddressBar() {
    const [project, setProject] = useState<string>("");
    const [todo, setTodo] = useState<string>("");
    const [subTodos, setSubTodos] = useState<string[]>([]);

    return (
        <div>
            {project && <>
                <Link to={`/${project}`}></Link>
                {" > "}
            </>}

            {todo && <>
                <Link to={`todo/${todo}`}></Link>
            </>}

            {subTodos && subTodos.map(subTodo => <>
                {" > "}
                <Link to={`subTodo/${subTodo}`}></Link>
            </>)}

        </div>
    )
}
