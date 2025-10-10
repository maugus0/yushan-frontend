import React, { useState, useEffect } from 'react';
import { Button, Modal } from 'antd';
import { ArrowLeftOutlined, SaveOutlined, UploadOutlined } from '@ant-design/icons';
import { Editor } from '@tinymce/tinymce-react';
import './writereditcontent.css';
import WriterNavbar from '../../components/writer/writernavbar/writernavbar';
import { useNavigate, useParams, useLocation } from 'react-router-dom';

const DEFAULT_CONTENT = `<h2>Edit your chapter</h2><p>This is the default content. You can modify it as needed.</p>`;

const WriterEditContent = () => {
  const { id } = useParams();
  const location = useLocation();
  const [content, setContent] = useState(DEFAULT_CONTENT);
  const navigate = useNavigate();
  const [saveModal, setSaveModal] = useState(false);
  const [publishModal, setPublishModal] = useState(false);


  const isDraft = new URLSearchParams(location.search).get('from') === 'draft' || new URLSearchParams(location.search).get('from') === 'hidden';

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

  const handlePublish = () => {
    setPublishModal(true);
  };

  const handlePublishConfirm = () => {
    setPublishModal(false);
    // handle publish logic here
  };

  const handlePublishCancel = () => {
    setPublishModal(false);
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
        <div>
          <Button
            type="primary"
            className="writereditcontent-save-btn"
            onClick={handleSave}
            style={{ marginRight: isDraft ? 12 : 0 }}
            icon={<SaveOutlined />}
          >
            SAVE
          </Button>
          {isDraft && (
            <Button
              type="primary"
              className="writereditcontent-publish-btn"
              onClick={handlePublish}
              icon={<UploadOutlined />}
            >
              PUBLISH
            </Button>
          )}
        </div>
      </div>
      <div className="writereditcontent-editor-container">
        <Editor
          apiKey="zds03d1k6akrwouyyro25otbx4v25hd4yc1p83a0lecjfwwj"
          // apiKey="i3g9n83wa35bb4y5x074zwjvwcmyeaw8ux5txo89x6xvv35c"
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
      <Modal
        open={publishModal}
        title="Confirm to publish?"
        onCancel={handlePublishCancel}
        footer={[
          <Button key="cancel" onClick={handlePublishCancel}>
            Cancel
          </Button>,
          <Button key="publish" type="primary" onClick={handlePublishConfirm}>
            Publish
          </Button>,
        ]}
        centered
      ></Modal>
    </div>
  );
};

export default WriterEditContent;
