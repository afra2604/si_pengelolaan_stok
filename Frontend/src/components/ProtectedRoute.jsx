import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from './AuthContext'; // Path diperbaiki menjadi relatif ke folder contexts

// Komponen untuk melindungi rute tertentu
export default function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuth();
  
  // Jika belum terautentikasi, arahkan ke halaman login
  if (!isAuthenticated) {
    // Gunakan '/login' sebagai rute yang dituju
    return <Navigate to="/login" replace />; 
  }

  // Jika sudah terautentikasi, tampilkan children (halaman Dashboard/Layout)
  return children;
}