import React, { useState } from "react";
import { Button } from "antd";
import { Editor } from "@tinymce/tinymce-react";
import "./writercreatechapters.css";
import WriterCreate from "../writercreate/writercreate";

const WriterCreateChapters = () => {
  const [content, setContent] = useState("");

  const handleSubmit = () => {
  };

  return (
    <div className="writercreatechapters-page">
      <div className="writercreatechapters-editor-container">
        <Editor
          apiKey="no-api-key"
          value={content}
          onEditorChange={setContent}
          init={{
            height: 320,
            menubar: false,
            plugins: [
              "advlist autolink lists link image charmap preview anchor",
              "searchreplace visualblocks code fullscreen",
              "insertdatetime media table code help wordcount",
            ],
            toolbar:
              "undo redo | formatselect | bold italic underline | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | link image | code",
          }}
        />
        <Button type="primary" onClick={handleSubmit} style={{ marginTop: 24 }}>
          Submit
        </Button>
      </div>
    </div>
  );
};

export default WriterCreateChapters;