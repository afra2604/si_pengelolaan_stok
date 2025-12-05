import React from "react";
import { Layout, Menu } from "antd";
import {
  UserOutlined,
  AppstoreOutlined,
  ArrowDownOutlined,
  ArrowUpOutlined,
  BookOutlined,
} from "@ant-design/icons";
import { Outlet, useNavigate } from "react-router-dom";

const { Sider, Content } = Layout;

export default function MainLayout() {
  const navigate = useNavigate(); 

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Sider width={220} collapsible style={{ background: "#fff" }}>
        <div
          style={{
            height: 64,
            fontSize: 20,
            textAlign: "center",
            paddingTop: 15,
            fontWeight: "bold",
            color: "#fff",
            background: "#001529",
            marginBottom: 10,
          }}
        >
          Sistem Stok
        </div>

        <Menu
          defaultSelectedKeys={["dashboard"]}
          mode="inline"
          // Fungsi ini menggabungkan '/' dengan key menu untuk navigasi
          onClick={({ key }) => navigate(`/${key}`)}  
          items={[
            { key: "dashboard", icon: <UserOutlined />, label: "Home" },
            { key: "barang", icon: <AppstoreOutlined />, label: "Barang" },
            {
              key: "transactions_masuk", // Sesuai dengan route di App.jsx
              icon: <ArrowDownOutlined />,
              label: "transactions Masuk",
            },
            {
              key: "transactions_keluar",
              icon: <ArrowUpOutlined />,
              label: "transactions Keluar",
            },
            {
              key: "catatan_utang",
              icon: <BookOutlined />,
              label: "Catatan Utang",
            },
          ]}
        />
      </Sider>

      <Layout style={{ padding: "24px" }}>
        <Content
          style={{
            background: "#fff",
            padding: 24,
            minHeight: "calc(100vh - 100px)",
            borderRadius: 8,
          }}
        >
          <Outlet /> {/* Area ini akan menampilkan halaman Dashboard, Barang, atau transactionsMasuk */}
        </Content>
      </Layout>
    </Layout>
  );
}