import { useEffect, useState } from 'react';
import { Button, Modal, Spin } from 'antd';
import { ArrowLeftOutlined, SendOutlined } from '@ant-design/icons';
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
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const [publishModal, setPublishModal] = useState(false);

  const location = window.location;
  const searchParams = new URLSearchParams(location.search);
  const novelId = searchParams.get('novelid') || searchParams.get('id');
  const chapterId = searchParams.get('chapterid');

  useEffect(() => {
    setLoading(true);
    if (chapterId) {
      const getChapterDetails = async () => {
        try {
          const chapterData = await chapterService.getChapterByChapterId(chapterId);
          setChapterNumber(String(chapterData.data.chapterNumber));
          setChapterName(chapterData.data.title || '');
          setContent(chapterData.data.content || '');
        } catch (error) {
          setErrorMsg(error.message || 'Failed to load chapter details.');
          setErrorModal(true);
        } finally {
          setLoading(false);
        }
      };
      getChapterDetails();
    } else {
      const getNextChapterId = async () => {
        try {
          const chapterData = await chapterService.getNextChapterNumber(novelId);
          setChapterNumber(String(chapterData.data));
        } catch (error) {
          setErrorMsg(error.message || 'Failed to get next chapter number.');
          setErrorModal(true);
        } finally {
          setLoading(false);
        }
      };
      getNextChapterId();
      setContent('');
    }
  }, [novelId, chapterId]);

  const handleSubmit = () => {
    setPublishModal(true);
  };

  const handlePublishConfirm = async () => {
    if (!chapterName.trim()) {
      setErrorMsg('Please enter a chapter name.');
      setPublishModal(false);
      setErrorModal(true);
      return;
    }
    try {
      if (chapterId) {
        const chapterData = {
          title: chapterName.trim(),
          content,
          uuid: chapterId,
        };
        await chapterService.editChapters(chapterData);
      } else {
        const chapterData = {
          novelId: Number(novelId),
          chapterNumber: Number(chapterNumber),
          title: chapterName.trim(),
          content,
        };
        await chapterService.createChapters(chapterData);
      }
      navigate(-1);
      setPublishModal(false);
    } catch (error) {
      setErrorMsg(error.message || 'Failed to save chapter.');
      setPublishModal(false);
      setErrorModal(true);
    }
  };

  const handlePublishCancel = () => {
    setPublishModal(false);
  };

  return (
    <div className="writercreatechapters-page">
      <WriterNavbar />
      <div className="writercreatechapters-content">
        <div className="writercreatechapters-header">
          <Button
            type="text"
            icon={<ArrowLeftOutlined />}
            className="writercreatechapters-back-btn"
            onClick={() => navigate(-1)}
          />
          <Button
            type="primary"
            className="writercreatechapters-publish-btn"
            onClick={handleSubmit}
            icon={<SendOutlined />}
          >
            <span>PUBLISH</span>
          </Button>
        </div>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '80px 0' }}>
            <Spin size="large" tip="Loading..."/>
          </div>
        ) : (
          <div className="writercreatechapters-editor-area">
            <div className="chapter-meta-container">
              <div className="input-group">
                <label className="meta-label">Chapter Number</label>
                <input
                  type="text"
                  value={chapterNumber}
                  readOnly
                  disabled
                  className="meta-input readonly"
                />
              </div>
              <div className="input-group">
                <label className="meta-label">Chapter Name</label>
                <input
                  type="text"
                  value={chapterName}
                  onChange={(e) => setChapterName(e.target.value)}
                  placeholder="Enter chapter name"
                  className="meta-input"
                />
              </div>
            </div>

            <Editor
              apiKey="zds03d1k6akrwouyyro25otbx4v25hd4yc1p83a0lecjfwwj"
              value={content}
              onEditorChange={setContent}
              init={{
                height: 600,
                menubar: false,
                plugins:
                  'advlist autolink lists link image charmap preview anchor searchreplace visualblocks code fullscreen insertdatetime media table help wordcount',
                toolbar:
                  'undo redo | formatselect | bold italic underline | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | link image | code',
                content_style:
                  'body { font-family:Helvetica,Arial,sans-serif; font-size:16px; line-height: 1.6; }',
              }}
            />
          </div>
        )}
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
          title="Error"
          onCancel={() => setErrorModal(false)}
          footer={[
            <Button key="ok" type="primary" onClick={() => setErrorModal(false)}>
              OK
            </Button>,
          ]}
          centered
          maskClosable={false}
          closable={false}
          style={{ textAlign: 'center', borderRadius: 12, background: '#fff' }}
        >
          <div
            style={{
              color: '#cf1322',
              background: '#fff2f0',
              border: '1px solid #ffccc7',
              borderRadius: 8,
              padding: '18px 16px',
              fontSize: 16,
              fontWeight: 500,
              marginBottom: 12,
              boxShadow: '0 2px 12px rgba(255,77,79,0.08)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 10,
            }}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="12" fill="#ff4d4f" />
              <path d="M12 7v5" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
              <circle cx="12" cy="16" r="1.2" fill="#fff" />
            </svg>
            {errorMsg || 'An unexpected error occurred.'}
          </div>
        </Modal>
      </div>
    </div>
  );
};

export default WriterCreateChapters;
