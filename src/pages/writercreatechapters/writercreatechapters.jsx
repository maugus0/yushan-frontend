import { useState } from 'react';
import { Button, Modal } from 'antd';

import { ArrowLeftOutlined } from '@ant-design/icons';
import { Editor } from '@tinymce/tinymce-react';
import './writercreatechapters.css';
import WriterNavbar from '../../components/writer/writernavbar/writernavbar';
import { useNavigate } from 'react-router-dom';

const WriterCreateChapters = () => {
  const [content, setContent] = useState('');
  const navigate = useNavigate();
  const [publishModal, setPublishModal] = useState(false);

  const handleSubmit = () => {
    setPublishModal(true);
  };

  const handlePublishConfirm = () => {
    setPublishModal(false);
  };

  const handlePublishCancel = () => {
    setPublishModal(false);
  };

  return (
    <div className="writercreatechapters-page">
      <WriterNavbar />
      <div className="writercreatechapters-header">
        <Button
          type="text"
          icon={<ArrowLeftOutlined />}
          className="writercreatechapters-back-btn"
          onClick={() => navigate(-1)}
        />
        <Button type="primary" className="writercreatechapters-create-btn" onClick={handleSubmit}>
          √ PUBLISH
        </Button>
      </div>
      <div className="writercreatechapters-editor-container">
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

export default WriterCreateChapters;
