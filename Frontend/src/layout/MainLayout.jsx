import React from "react";
import { Layout, Menu } from "antd";
import {
  UserOutlined,
  AppstoreOutlined,
  WarningOutlined,
} from "@ant-design/icons";
import { Outlet } from "react-router-dom";

const { Header, Sider, Content } = Layout;

export default function MainLayout() {
  return (
    <Layout style={{ minHeight: "100vh" }}>
      {/* SIDEBAR */}
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
            marginBottom: 10
          }}
        >
          Sistem Stok
        </div>
        <Menu
          defaultSelectedKeys={["dashboard"]}
          mode="inline"
          items={[
            {
              key: "dashboard",
              icon: <UserOutlined />,
              label: "Dashboard",
            },
            {
              key: "barang",
              icon: <AppstoreOutlined />,
              label: "Barang",
            },
            {
              key: "peringatan",
              icon: <WarningOutlined />,
              label: "Peringatan",
            },
          ]}
        />
      </Sider>

      {/* MAIN CONTENT */}
      <Layout style={{ padding: "24px" }}>
        <Content
          style={{
            background: "#fff",
            padding: 24,
            minHeight: "calc(100vh - 100px)",
            borderRadius: 8,
          }}
        >
          <Outlet />
        </Content>
      </Layout>

    </Layout>
  );
}
