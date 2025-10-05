import React, { useState, useEffect } from 'react';
import { Button, Modal } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { Editor } from '@tinymce/tinymce-react';
import './writereditcontent.css';
import WriterNavbar from '../../components/writer/writernavbar/writernavbar';
import { useNavigate, useParams } from 'react-router-dom';

const DEFAULT_CONTENT = `<h2>Edit your chapter</h2><p>This is the default content. You can modify it as needed.</p>`;

const WriterEditContent = () => {
  const { id } = useParams();
  const [content, setContent] = useState(DEFAULT_CONTENT);
  const navigate = useNavigate();
  const [saveModal, setSaveModal] = useState(false);

  useEffect(() => {
  }, [id]);

  const handleSave = () => {
    setSaveModal(true);
  };

  const handleSaveConfirm = () => {
    setSaveModal(false);
    // handle save logic here
  };

  const handleSaveCancel = () => {
    setSaveModal(false);
  };

  return (
    <div className="writereditcontent-page">
      <WriterNavbar />
      <div className="writereditcontent-header">
        <Button
          type="text"
          icon={<ArrowLeftOutlined />}
          className="writereditcontent-back-btn"
          onClick={() => navigate(-1)}
        />
        <Button type="primary" className="writereditcontent-save-btn" onClick={handleSave}>
          √ SAVE
        </Button>
      </div>
      <div className="writereditcontent-editor-container">
        <Editor
          apiKey="zds03d1k6akrwouyyro25otbx4v25hd4yc1p83a0lecjfwwj"
          value={content}
          onEditorChange={setContent}
          init={{
            height: 600,
            menubar: false,
            plugins: [
              'advlist autolink lists link image charmap preview anchor',
              'searchreplace visualblocks code fullscreen',
              'insertdatetime media table code help wordcount',
            ],
            toolbar:
              'undo redo | formatselect | bold italic underline | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | link image | code',
          }}
        />
      </div>
      <Modal
        open={saveModal}
        title="Confirm to save changes?"
        onCancel={handleSaveCancel}
        footer={[
          <Button key="cancel" onClick={handleSaveCancel}>
            Cancel
          </Button>,
          <Button key="save" type="primary" onClick={handleSaveConfirm}>
            Save
          </Button>,
        ]}
        centered
      ></Modal>
    </div>
  );
};

export default WriterEditContent;
