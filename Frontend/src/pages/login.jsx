import { useState } from "react";
import { useNavigate } from "react-router-dom";
// import { Avatar } from "antd";
import API from "../services/api";
import {Avatar} from "antd";

export default function Login() {
    const { nama, setNama } = useState("");
    const { password, setPassword } = useState("");
    const navigate = useNavigate();
    const handleLogin = async () => {
        try {
            const res = await API.post("/login", {
                nama,
                password
            });
            console.log("Login berhasil:" , res.data);
            localStorage.setItem("user", JSON.stringify(res.data.user));
            navigate("/");
        } catch (err) {
            console.error("Login gagal:", err);
            alert("Login gagal")
        }

    };
    
    return(
        <div className= 'continer'>
        <h1>Login</h1>

        <input type="text" placeholder="Nama" onChange={(e) => setNama(e.target.value)}/>
        <input type="passwoord" placeholder="Password" onChange={(e) => setPassword(e.target.value)}/>
        <button onClick={handleLogin}>Login</button>

        </div>
    );
} 

