import React, { useState, useCallback, useEffect } from 'react';
import { Button, Input, Upload, Select, Form, Modal, Slider } from 'antd';
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

  const searchParams = new URLSearchParams(location.search);
  const incomingId = searchParams.get('id');
  const getInitialNovel = async () => {
    if (incomingId && typeOptions.length > 0) {
      const initialNovel = await novelService.getNovelById(incomingId);
      console.log(initialNovel);
      form.setFieldsValue({
        bookname: initialNovel.title,
        synopsis: initialNovel.synopsis,
        types: initialNovel.categoryId,
      });
      setCoverUrl(initialNovel.coverImgUrl);
    }
  };

  useEffect(() => {
    const getTypeOptions = async () => {
      const categories = await categoriesService.getCategories();
      if (categories) {
        const opts = categories.map((category) => ({
          label: category.name,
          value: category.id,
        }));
        setTypeOptions(opts);
      }
    };
    getTypeOptions();
  }, []);

  useEffect(() => {
    getInitialNovel();
  }, [typeOptions]);

  const handleCoverChange = (info) => {
    let file;
    if (info.file && info.file.originFileObj) {
      file = info.file.originFileObj;
    } else if (info.file && info.file instanceof File) {
      file = info.file;
    } else if (info.fileList && info.fileList[0] && info.fileList[0].originFileObj) {
      file = info.fileList[0].originFileObj;
    }
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
    if (!values.bookname || !values.synopsis || !values.types || !coverUrl) {
      setAlertVisible(true);
      return;
    }
    setAlertVisible(false);
    let novelData = {
      title: values.bookname,
      coverImgBase64: coverUrl,
      synopsis: values.synopsis,
      categoryId: values.types,
      isCompleted: false,
    };
    let res = null;
    if (incomingId) {
      res = await novelService.changeNovelDetailById(incomingId, novelData);
    } else {
      res = await novelService.createNovel(novelData);
    }
    await novelService.submitNovelForReview(res.id);
    setSuccessModal(true);
    form.resetFields();
    setCoverUrl('');
  };

  return (
    <div className="writercreate-page">
      <WriterNavbar />
      <div className="writercreate-content">
        <div className="writercreate-header-row">
          <Button
            type="text"
            icon={<ArrowLeftOutlined />}
            className="writercreate-back-btn"
            onClick={() => navigate('/writerworkspace')}
          />
          <span className="writercreate-header-title">Stories</span>
        </div>
        <Form form={form} layout="vertical" className="writercreate-form" onFinish={handleSubmit}>
          <div className="writercreate-form-title">
            <BookOutlined style={{ fontSize: 16, color: '#515fa0', marginRight: 8 }} />
            <span>NOVEL INFORMATION</span>
          </div>
          <Form.Item
            label="BOOKNAME"
            name="bookname"
            rules={[
              { required: true, message: 'Book name is required' },
              { max: 70, message: 'Within 70 characters' },
            ]}
          >
            <Input maxLength={70} placeholder="Enter book name (within 70 characters)" />
          </Form.Item>
          <Form.Item label="BOOK COVER" required>
            <div className="writercreate-cover-upload">
              <Upload
                showUploadList={false}
                beforeUpload={() => false}
                onChange={handleCoverChange}
                accept="image/*"
              >
                <div className="writercreate-cover-box">
                  {coverUrl ? (
                    <img src={coverUrl} alt="cover" className="writercreate-cover-img" />
                  ) : (
                    <PlusOutlined className="writercreate-cover-plus" />
                  )}
                </div>
              </Upload>
            </div>
          </Form.Item>
          <Form.Item
            label="TYPE"
            name="types"
            rules={[
              {
                required: true,
                message: 'Please select a type.',
              },
            ]}
          >
            <Select placeholder="Select type" options={typeOptions} style={{ width: '100%' }} />
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
              placeholder="Type something seriously, wonderful synopsis can attract more readers"
              maxLength={1000}
            />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" className="writercreate-submit-btn">
              UPLOAD
            </Button>
          </Form.Item>
        </Form>
        <Modal
          open={alertVisible}
          onCancel={() => setAlertVisible(false)}
          footer={[
            <Button
              key="confirm"
              type="primary"
              style={{
                borderRadius: 8,
                fontWeight: 600,
                background: '#515fa0',
                border: 'none',
                minWidth: 100,
              }}
              onClick={() => setAlertVisible(false)}
            >
              Confirm
            </Button>,
          ]}
          centered
          maskClosable={false}
          closable={false}
          bodyStyle={{
            padding: '32px 24px 24px 24px',
            textAlign: 'center',
            borderRadius: 12,
            background: '#fff',
          }}
        >
          <div
            style={{
              color: '#cf1322',
              background: '#fff2f0',
              border: '1px solid #ffccc7',
              borderRadius: 8,
              padding: '18px 16px',
              fontSize: 17,
              fontWeight: 600,
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
            Please fill in all required information and upload a book cover before submitting.
          </div>
        </Modal>
        {/* Cropper Modal */}
        <Modal
          open={cropModalVisible}
          title="Crop Book Cover"
          onCancel={() => setCropModalVisible(false)}
          onOk={handleCropFinish}
          okText="Crop"
          cancelText="Cancel"
          width={400}
        >
          {cropImage && (
            <div style={{ position: 'relative', width: '100%', height: 320 }}>
              <Cropper
                image={cropImage}
                crop={crop}
                zoom={zoom}
                aspect={120 / 160}
                cropShape="rect"
                showGrid={true}
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onCropComplete={onCropComplete}
              />
              <div style={{ marginTop: 16 }}>
                <span style={{ fontSize: 13, color: '#888' }}>
                  Adjust and crop to 120x160 cover.
                </span>
                <Slider
                  min={1}
                  max={3}
                  step={0.01}
                  value={zoom}
                  onChange={setZoom}
                  style={{ marginTop: 8 }}
                />
              </div>
            </div>
          )}
        </Modal>
        <Modal open={successModal} footer={null} closable={false} centered>
          <div style={{ textAlign: 'center', padding: '24px 0' }}>
            <h2 style={{ color: '#52c41a', marginBottom: 12 }}>Successfully!</h2>
            <div style={{ fontSize: 16, color: '#283157', marginBottom: 24 }}>
              Please wait for approve of admin!
            </div>
            <Button
              type="primary"
              style={{ width: 120 }}
              onClick={() => {
                setSuccessModal(false);
                navigate('/writerworkspace');
              }}
            >
              Confirm
            </Button>
          </div>
        </Modal>
      </div>
    </div>
  );
};

export default WriterCreate;
