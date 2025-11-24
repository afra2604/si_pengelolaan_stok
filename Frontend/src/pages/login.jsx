import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Form, Input, Button, Card, Avatar } from "antd";
import { UserOutlined, LockOutlined } from "@ant-design/icons";
import API from "../services/api";

export default function Login() {
  const [nama, setNama] = useState("");
  const [password, setPassword] = useState("");

  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      const res = await API.post("/login", {
        nama,
        password,
      });

      console.log("Login berhasil:", res.data);

      localStorage.setItem("user", JSON.stringify(res.data.user));

      navigate("/");
    } catch (err) {
      console.error("Login gagal:", err);
      alert("Login gagal!");
    }
  };

  return (
    <div    style={{
    height: "100vh",
    width: "100vw",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    background: "#2f2f2f"
  }}
>
      <div style={{ textAlign: "center" }}>
    <Avatar
      size={64}
      src="https://t4.ftcdn.net/jpg/02/37/83/65/500_F_237836548_QZ5lcLl0Le4fhjal2MlgOPK3dyDMBbfR.jpg"
      style={{ margin: "0 auto 20px", display: "block" }}
    />

      <Card
        bordered={false}
        style={{
          textAlign: "center",
          width: 400,
          margin: "0 auto",
          boxShadow: "0 3px 6px rgba(0,0,0,0.16)",
        }}
      >
        <Form onFinish={handleLogin} className="login-form">
          <h1 style={{ marginBottom: 25 }}>Login</h1>

          <Form.Item
            name="nama"
            rules={[{ required: true, message: "Nama wajib diisi" }]}
          >
            <Input
              prefix={<UserOutlined />}
              placeholder="Nama"
              onChange={(e) => setNama(e.target.value)}
            />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[{ required: true, message: "Password wajib diisi" }]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="Password"
              onChange={(e) => setPassword(e.target.value)}
            />
          </Form.Item>

          <Button
            type="primary"
            htmlType="submit"
            block
            style={{ marginBottom: 15 }}
          >
            Log in
          </Button>
        </Form>
      </Card>
      </div>
    </div>
  );
}
