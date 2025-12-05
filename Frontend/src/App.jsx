import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login"; 
import Dashboard from "./pages/Dashboard"; 
import Barang from "./pages/Barang"; 
import TransactionsMasuk from "./pages/transactions_masuk"; 
import MainLayout from "./layout/MainLayout"; 
import ProtectedRoute from "./components/ProtectedRoute"; 
import { AuthProvider } from "./components/AuthContext"; 

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Rute Login: Tidak dilindungi */}
          <Route path="/login" element={<Login />} />

          <Route 
            path="/" 
            element={
              <ProtectedRoute>
                <MainLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Dashboard />} /> 
            <Route path="dashboard" element={<Dashboard />} /> 
            <Route path="barang" element={<Barang isDashboard={false} />} />
            
            {/* KOREKSI: Path diubah dari "transactions_masuk" menjadi "transactions_masuk" 
               agar sesuai dengan key yang digunakan di MainLayout.jsx. */}
            <Route path="transactions_masuk" element={<TransactionsMasuk isTransactions_masuk={false} />} />
            
          </Route>
          
          <Route path="*" element={
            <div className="flex justify-center items-center h-screen text-2xl font-bold">
              404 | Halaman Tidak Ditemukan
            </div>
          } />

        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;