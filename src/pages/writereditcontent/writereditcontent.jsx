import React, { useState, useEffect } from 'react';
import { Button, Modal } from 'antd';
import { ArrowLeftOutlined, UploadOutlined } from '@ant-design/icons';
import { Editor } from '@tinymce/tinymce-react';
import './writereditcontent.css';
import WriterNavbar from '../../components/writer/writernavbar/writernavbar';
import { useNavigate, useLocation } from 'react-router-dom';
import chapterService from '../../services/chapter';

const DEFAULT_CONTENT = `<h2>Edit your chapter</h2><p>This is the default content. You can modify it as needed.</p>`;

const WriterEditContent = () => {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const novelId = searchParams.get('novelid');
  const chapterId = searchParams.get('chapterid');
  const [content, setContent] = useState(DEFAULT_CONTENT);
  const navigate = useNavigate();
  const [publishModal, setPublishModal] = useState(false);

  useEffect(() => {
    const getInitialChapter = async () => {
      const res = await chapterService.getChapterByChapterId(chapterId);
      console.log("res: ", res);
      setContent(res.data.content || DEFAULT_CONTENT);
    };
    getInitialChapter();
  }, [novelId, chapterId]);

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
        <Button
          type="primary"
          className="writereditcontent-publish-btn"
          onClick={handlePublish}
          icon={<UploadOutlined />}
        >
          PUBLISH
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
