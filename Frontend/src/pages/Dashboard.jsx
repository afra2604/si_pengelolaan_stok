import React from "react";
import WelcomeUser from "../components/WelcomeUser";


import Barang from "./barang"; // <-- tambahkan ini!

export default function Dashboard() {
  return (
    <div>
      <div className="grid lg:grid-cols-3 grid-cols-1 gap-5 mb-5">
        <div className="lg:col-span-2 col-span-1">
          <WelcomeUser />   
        </div>
      </div>
      <Barang />  
    </div>
  );
}