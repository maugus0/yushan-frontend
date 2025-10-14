import React, { useEffect, useState } from 'react';
import { Button, Modal } from 'antd';
import { ArrowLeftOutlined, UploadOutlined } from '@ant-design/icons';
import { Editor } from '@tinymce/tinymce-react';
import './writercreatechapters.css';
import WriterNavbar from '../../components/writer/writernavbar/writernavbar';
import { useNavigate } from 'react-router-dom';
import chapterService from '../../services/chapter';

const WriterCreateChapters = () => {
  const [content, setContent] = useState('');
  const [chapterNumber, setChapterNumber] = useState('');
  const [chapterName, setChapterName] = useState('');
  const [errorModal, setErrorModal] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const navigate = useNavigate();
  const [publishModal, setPublishModal] = useState(false);

  const location = window.location;
  const searchParams = new URLSearchParams(location.search);
  const novelId = searchParams.get('novelid') || searchParams.get('id');
  const chapterId = searchParams.get('chapterid');

  useEffect(() => {
    if (chapterId) {
      const getChapterDetails = async () => {
        const chapterData = await chapterService.getChapterByChapterId(chapterId);
        setChapterNumber(String(chapterData.data.chapterNumber));
        setChapterName(chapterData.data.title || '');
        setContent(chapterData.data.content || '');
      };
      getChapterDetails();
    } else {
      const getNextChapterId = async () => {
        const chapterData = await chapterService.getNextChapterNumber(novelId);
        setChapterNumber(String(chapterData.data));
      };
      getNextChapterId();
      setContent('');
    }
  }, [novelId, chapterId]);

  const handleSubmit = () => {
    setPublishModal(true);
  };

  const handlePublishConfirm = () => {
    if (!chapterName.trim()) {
      setErrorMsg('Please enter a chapter name.');
      setPublishModal(false);
      setErrorModal(true);
      return;
    }
    if (chapterId) {
      const editChapterAsync = async () => {
        const chapterData = {
          title: chapterName.trim(),
          content,
          uuid: chapterId,
        };
        await chapterService.editChapters(chapterData);
      };
      editChapterAsync();
    } else {
      const createChapterAsync = async () => {
        const chapterData = {
          novelId: Number(novelId),
          chapterNumber: Number(chapterNumber),
          title: chapterName.trim(),
          content,
        };
        await chapterService.createChapters(chapterData);
      };
      createChapterAsync();
    }
    navigate(-1);
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
        <Button
          type="primary"
          className="writercreatechapters-create-btn"
          onClick={handleSubmit}
          icon={<UploadOutlined />}
        >
          PUBLISH
        </Button>
      </div>

      <div className="writercreatechapters-editor-container">
        <div style={{ marginBottom: 24 }}>
          <label style={{ fontWeight: 500, color: '#515fa0', marginRight: 12 }}>
            Chapter Number
          </label>
          <input
            type="text"
            value={chapterNumber}
            readOnly
            disabled
            style={{
              width: 180,
              padding: '6px 12px',
              borderRadius: 6,
              border: '1px solid #e1e6f5',
              fontSize: 15,
              background: '#f1f3fa',
              marginRight: 24,
              color: '#888',
            }}
          />
          <label style={{ fontWeight: 500, color: '#515fa0', marginRight: 12, marginLeft: 12 }}>
            Chapter Name
          </label>
          <input
            type="text"
            value={chapterName}
            onChange={(e) => setChapterName(e.target.value)}
            placeholder="Enter chapter name"
            style={{
              width: 260,
              padding: '6px 12px',
              borderRadius: 6,
              border: '1px solid #e1e6f5',
              fontSize: 15,
              background: '#f1f3fa',
            }}
          />
        </div>

        <Editor
          apiKey="zds03d1k6akrwouyyro25otbx4v25hd4yc1p83a0lecjfwwj"
          value={content}
          onEditorChange={setContent}
          init={{
            height: 600,
            menubar: false,
            plugins: [
              'advlist',
              'autolink',
              'lists',
              'link',
              'image',
              'charmap',
              'preview',
              'anchor',
              'searchreplace',
              'visualblocks',
              'code',
              'fullscreen',
              'insertdatetime',
              'media',
              'table',
              'help',
              'wordcount',
            ],
            toolbar:
              'undo redo | formatselect | bold italic underline | ' +
              'alignleft aligncenter alignright alignjustify | ' +
              'bullist numlist outdent indent | link image | code',
            content_style: 'body { font-family:Helvetica,Arial,sans-serif; font-size:14px }',
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
      />

      <Modal
        open={errorModal}
        title="Invalid Input"
        onCancel={() => setErrorModal(false)}
        footer={[
          <Button key="ok" type="primary" onClick={() => setErrorModal(false)}>
            OK
          </Button>,
        ]}
        centered
      >
        <div>
          {errorMsg || 'Please enter a valid chapter number (digits only) and chapter name.'}
        </div>
      </Modal>
    </div>
  );
};

export default WriterCreateChapters;
