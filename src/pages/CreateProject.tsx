import { useState } from "react"
import { useNavigate } from "react-router-dom";


export default function CreateProject() {
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const navigate = useNavigate();

    const onSaveBtnPress = () => {
        if(name.trim() === "" || description.trim() === "" ){ //Guard Clause
            return;
        }
        window.ipcRenderer.send("create-project", { name, description });
        navigate("/");
    }

    const onCancelBtnPress = () => {
        navigate("/");
    }

    return (
        <div style={{ padding: "10%" }}>
            <h1>Create Project</h1>
            <div style={{ padding: "10%", border: "1px solid white", borderRadius: "5%/10%" }}>
                <input style={{ padding: "2%", width: "100%", marginBlock: "2%" }} placeholder="Name" type="text" value={name} onChange={(e) => setName(e.target.value)} />
                <br />
                <input style={{ padding: "2%", width: "100%", marginBlock: "2%" }} placeholder="Description" type="text" value={description} onChange={(e) => setDescription(e.target.value)} />
                <br />
                <button onClick={onCancelBtnPress} style={{ padding: "2%", margin: "2%" }}>Cancel</button>
                <button onClick={onSaveBtnPress} style={{ padding: "2%" }}>Save</button>
            </div>
        </div>
    )
}
