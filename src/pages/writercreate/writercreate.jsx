import { useState, useCallback, useEffect } from 'react';
import { Button, Input, Upload, Select, Form, Modal, Slider, Spin } from 'antd';
import { ArrowLeftOutlined, PlusOutlined, BookOutlined } from '@ant-design/icons';
import WriterNavbar from '../../components/writer/writernavbar/writernavbar';
import './writercreate.css';
import { useNavigate, useLocation } from 'react-router-dom';
import Cropper from 'react-easy-crop';
import novelService from '../../services/novel';
import categoriesService from '../../services/categories';

const WriterCreate = () => {
  const [coverUrl, setCoverUrl] = useState('');
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const location = useLocation();
  const [cropModalVisible, setCropModalVisible] = useState(false);
  const [cropImage, setCropImage] = useState('');
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [successModal, setSuccessModal] = useState(false);
  const [typeOptions, setTypeOptions] = useState([]);
  const [alertVisible, setAlertVisible] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(true);

  const searchParams = new URLSearchParams(location.search);
  const incomingId = searchParams.get('id');

  useEffect(() => {
    const getTypeOptions = async () => {
      setLoading(true);
      try {
        const categories = await categoriesService.getCategories();
        if (categories) {
          const opts = categories.map((category) => ({
            label: category.name,
            value: category.id,
          }));
          setTypeOptions(opts);
        }
      } catch (error) {
        setErrorMsg('Failed to load categories.');
        setAlertVisible(true);
      } finally {
        setLoading(false);
      }
    };
    getTypeOptions();
  }, []);

  useEffect(() => {
    const getInitialNovel = async () => {
      if (incomingId && typeOptions.length > 0) {
        setLoading(true);
        try {
          const initialNovel = await novelService.getNovelById(incomingId);
          form.setFieldsValue({
            bookname: initialNovel.title,
            synopsis: initialNovel.synopsis,
            types: initialNovel.categoryId,
          });
          setCoverUrl(initialNovel.coverImgUrl);
        } catch (error) {
          setErrorMsg('Failed to load novel details.');
          setAlertVisible(true);
        } finally {
          setLoading(false);
        }
      }
    };
    getInitialNovel();
  }, [incomingId, typeOptions, form]);

  const handleCoverChange = (info) => {
    const file = info.file?.originFileObj || info.file;
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setCropImage(e.target.result);
        setCropModalVisible(true);
      };
      reader.readAsDataURL(file);
    }
  };

  const onCropComplete = useCallback((croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleCropFinish = async () => {
    if (cropImage && croppedAreaPixels) {
      const image = new window.Image();
      image.src = cropImage;
      await new Promise((res) => (image.onload = res));
      const canvas = document.createElement('canvas');
      canvas.width = 120;
      canvas.height = 160;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(
        image,
        croppedAreaPixels.x,
        croppedAreaPixels.y,
        croppedAreaPixels.width,
        croppedAreaPixels.height,
        0,
        0,
        120,
        160
      );
      setCoverUrl(canvas.toDataURL('image/jpeg'));
      setCropModalVisible(false);
      setCropImage('');
    }
  };

  const handleSubmit = async (values) => {
    if (!coverUrl) {
      setErrorMsg('Please upload a book cover before submitting.');
      setAlertVisible(true);
      return;
    }
    setErrorMsg('');
    setAlertVisible(false);
    const novelData = {
      title: values.bookname,
      coverImgBase64: coverUrl,
      synopsis: values.synopsis,
      categoryId: values.types,
      isCompleted: false,
    };
    try {
      let res;
      if (incomingId) {
        res = await novelService.changeNovelDetailById(incomingId, novelData);
      } else {
        res = await novelService.createNovel(novelData);
      }
      await novelService.submitNovelForReview(res.id);
      setSuccessModal(true);
    } catch (error) {
      setErrorMsg(error.message || 'Failed to submit novel.');
      setAlertVisible(true);
    }
  };

  return (
    <div className="writercreate-page">
      <WriterNavbar />
      <div className="writercreate-content">
        <div className="writercreate-header">
          <Button
            type="text"
            icon={<ArrowLeftOutlined />}
            className="writercreate-back-btn"
            onClick={() => navigate('/writerworkspace')}
          />
          <span className="writercreate-header-title">Create Story</span>
        </div>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '80px 0' }}>
            <Spin size="large" tip="Loading..." />
          </div>
        ) : (
          <div className="writercreate-form-container">
            <Form
              form={form}
              layout="vertical"
              className="writercreate-form"
              onFinish={handleSubmit}
            >
              <div className="writercreate-form-title">
                <BookOutlined />
                <span>NOVEL INFORMATION</span>
              </div>
              <Form.Item
                label="BOOK NAME"
                name="bookname"
                rules={[
                  { required: true, message: 'Book name is required' },
                  { max: 70, message: 'Max 70 characters' },
                ]}
              >
                <Input maxLength={70} placeholder="Enter book name" />
              </Form.Item>
              <Form.Item label="BOOK COVER" required>
                <Upload
                  listType="picture-card"
                  className="writercreate-cover-uploader"
                  showUploadList={false}
                  beforeUpload={() => false}
                  onChange={handleCoverChange}
                  accept="image/*"
                >
                  {coverUrl ? (
                    <img src={coverUrl} alt="cover" style={{ width: '100%' }} />
                  ) : (
                    <div>
                      <PlusOutlined />
                      <div style={{ marginTop: 8 }}>Upload</div>
                    </div>
                  )}
                </Upload>
              </Form.Item>
              <Form.Item
                label="CATEGORY"
                name="types"
                rules={[{ required: true, message: 'Please select a category.' }]}
              >
                <Select placeholder="Select a category" options={typeOptions} />
              </Form.Item>
              <Form.Item
                label="SYNOPSIS"
                name="synopsis"
                rules={[
                  { required: true, message: 'Synopsis is required' },
                  { max: 1000, message: 'Max 1000 characters' },
                ]}
              >
                <Input.TextArea
                  rows={4}
                  placeholder="A great synopsis attracts more readers"
                  maxLength={1000}
                />
              </Form.Item>
              <Form.Item>
                <Button type="primary" htmlType="submit" className="writercreate-submit-btn">
                  UPLOAD FOR REVIEW
                </Button>
              </Form.Item>
            </Form>
          </div>
        )}
        <Modal /* Cropper Modal */
          open={cropModalVisible}
          title="Crop Book Cover"
          onCancel={() => setCropModalVisible(false)}
          onOk={handleCropFinish}
          okText="Crop"
          cancelText="Cancel"
          width={400}
        >
          {cropImage && (
            <div className="cropper-container">
              <Cropper
                image={cropImage}
                crop={crop}
                zoom={zoom}
                aspect={120 / 160}
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onCropComplete={onCropComplete}
              />
              <div className="cropper-controls">
                <span>Adjust and crop to 120x160 cover.</span>
                <Slider min={1} max={3} step={0.01} value={zoom} onChange={setZoom} />
              </div>
            </div>
          )}
        </Modal>
        <Modal /* Success Modal */ open={successModal} footer={null} closable={false} centered>
          <div className="success-modal-content">
            <h2>Success!</h2>
            <p>Your novel has been submitted for review.</p>
            <Button
              type="primary"
              onClick={() => {
                setSuccessModal(false);
                navigate('/writerworkspace');
              }}
            >
              Confirm
            </Button>
          </div>
        </Modal>
        <Modal /* Error Modal */
          open={alertVisible}
          onCancel={() => setAlertVisible(false)}
          footer={null}
          centered
          closable={false}
        >
          <div className="error-modal-content">
            <div className="error-message-box">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="12" fill="#ff4d4f" />
                <path d="M12 7v5" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
                <circle cx="12" cy="16" r="1.2" fill="#fff" />
              </svg>
              {errorMsg}
            </div>
            <Button type="primary" onClick={() => setAlertVisible(false)}>
              OK
            </Button>
          </div>
        </Modal>
      </div>
    </div>
  );
};

export default WriterCreate;
