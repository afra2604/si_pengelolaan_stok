import { useEffect, useState } from "react";
import axios from "axios";

export default function Users () {

    const [data, setData] = useState([]);

useEffect(() => {
    axios.get("http://127.0.0.1:5000/api/users")
    .then(res => setData(res.data));
}, []);
return (
    <div>
        <h2>Data Users</h2>
        <ul>
            {data.map((u, i) => (
                <li key={i}>(u.nama)</li>
            ))}
        </ul>
    </div>
);
}