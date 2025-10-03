import React from "react";
import WriterNavbar from "../../components/writer/writernavbar/writernavbar";

const WriterDashboard = () => {
  return (
    <div style={{ display: "flex", height: "100vh" }}>
      <WriterNavbar />
      <div style={{ flex: 1, padding: 24 }}>
        {/* Main workspace content goes here */}
        <h1>Welcome to the Writer Dashboard</h1>
      </div>
    </div>
  );
}

export default WriterDashboard;