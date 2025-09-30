import React from "react";
import WriterNavbar from "../../components/writer/writernavbar/writernavbar";

const WriterCreate = () => {
  return (
    <div style={{ display: "flex", height: "100vh" }}>
      <WriterNavbar />
      <div style={{ flex: 1, padding: 24, background: "#f0f2f5" }}>
        {/* Main workspace content goes here */}
        <h1>Welcome to the Writer Workspace</h1>
      </div>
    </div>
  );
}

export default WriterCreate;