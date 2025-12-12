import React from "react";
import { Layout, Menu, Dropdown, Space, Avatar } from "antd"; // Import Dropdown, Space, Avatar
import {
    UserOutlined,
    AppstoreOutlined,
    ArrowDownOutlined,
    ArrowUpOutlined,
    BookOutlined,
    LogoutOutlined, // Import ikon Logout
    DownOutlined, // Ikon untuk dropdown
} from "@ant-design/icons";
import { Outlet, useNavigate } from "react-router-dom";

import LogoImage from '../assets/logo.png';
const { Sider, Content, Header } = Layout; 

export default function MainLayout() {
    const navigate = useNavigate(); 
    // Asumsi: Nama user diambil dari localStorage
    const userString = localStorage.getItem('user');
    const user = userString ? JSON.parse(userString) : { nama: "Guest" };
    const userName = user.nama || "Guest";
    // --- LOGIKA LOGOUT ---
    const handleLogout = () => {
        // Hapus token atau data user dari penyimpanan lokal
        localStorage.removeItem('user'); 
        // Arahkan kembali ke halaman login (atau root)
        navigate('/login'); 
    };

    // --- MENU ITEM UNTUK DROPDOWN PROFILE ---
    const profileMenu = (
        <Menu
            onClick={({ key }) => {
                if (key === 'logout') {
                    handleLogout();
                } else if (key === 'profile') {
                }
            }}
            items={[
                {
                    key: 'profile',
                    label: `Halo, ${userName}`,
                    icon: <UserOutlined />,
                    disabled: true, // Non-aktifkan item ini agar hanya sebagai label
                },
                {
                    type: 'divider',
                },
                {
                    key: 'logout',
                    label: 'Logout',
                    icon: <LogoutOutlined />,
                    danger: true,
                },
            ]}
        />
    );
    return (
        <Layout style={{ minHeight: "100vh" }}>
            {/* Sider (Sidebar, tetap di Kiri) */}
            <Sider width={220} collapsible style={{ background: "#fff" }}>
          {/* --- LOGO AREA BARU --- */}
                <div
                    style={{
                        height: 64,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: "#001529",
                        padding: '10px 15px', // Tambahkan padding untuk logo
                        marginBottom: 10,
                    }}
                >
                    <img 
                        src={LogoImage} // Menggunakan import logo
                        alt="Sistem Stok Logo"
                        style={{ 
                            height: '100%', // Sesuaikan tinggi agar pas di dalam div 64px
                            maxHeight: '40px', // Batasi tinggi
                            objectFit: 'contain'
                        }}
                    />
                </div>
                <Menu
                    defaultSelectedKeys={["dashboard"]}
                    mode="inline"
                    onClick={({ key }) => navigate(`/${key}`)}  
                    items={[
                        { key: "dashboard", icon: <UserOutlined />, label: "Home" },
                        { key: "barang", icon: <AppstoreOutlined />, label: "Barang" },
                        {
                            key: "transactions_masuk", 
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

            <Layout>
                {/* --- HEADER (NAVBAR) DITAMBAHKAN DI SINI --- */}
                <Header
               style={{
                        padding: '0 24px', // Tambah padding kiri dan kanan
                        background: '#fff',
                        height: 64,
                        display: 'flex',
                        justifyContent: 'space-between', // Atur agar konten dipecah ke kiri dan kanan
                        alignItems: 'center',
                        boxShadow: '0 1px 4px rgba(0,21,41,.08)'
                    }}
                >
                    {/* 1. JUDUL SISTEM PENGELOLAAN STOCK (KIRI) */}
                    <div style={{ fontSize: 18, fontWeight: 'bold', color: '#001529' }}>
                        Sistem Pengelolaan Stock
                    </div>
                    {/* DROP DOWN PROFILE */}
                    <Dropdown overlay={profileMenu} trigger={['click']}>
                        <a 
                            onClick={(e) => e.preventDefault()}
                            style={{ color: '#000', cursor: 'pointer' }}
                        >
                            <Space>
                                <Avatar size="default" icon={<UserOutlined />} style={{ marginRight: 8 }} />
                                {userName}
                                <DownOutlined style={{ fontSize: '10px' }}/>
                            </Space>
                        </a>
                    </Dropdown>
                </Header>
                {/* ------------------------------------------- */}

                <Content style={{ padding: "24px" }}>
                    <div
                        style={{
                            background: "#fff",
                            padding: 24,
                            minHeight: "calc(100vh - 112px)", // Disesuaikan karena ada Header
                            borderRadius: 8,
                        }}
                    >
                        <Outlet /> {/* Area konten utama */}
                    </div>
                </Content>
            </Layout>
        </Layout>
    );
}