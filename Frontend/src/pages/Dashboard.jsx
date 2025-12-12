import React, { useEffect, useState } from "react";
import axios from "axios";
import WelcomeUser from "../components/WelcomeUser";

const Dashboard = () => {

  return (
    <div className="space-y-6 p-6">
      <div style={{ marginBottom: "24px" }}>
        <WelcomeUser />
      </div>
       <div style={{ marginBottom: "24px" }}>
      </div>
    </div>
  );
};

export default Dashboard;
