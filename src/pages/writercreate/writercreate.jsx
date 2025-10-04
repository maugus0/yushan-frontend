import React, { useState, useCallback } from 'react';
import { Button, Input, Tag, Upload, Select, Form, message, Modal, Slider } from 'antd';
import { ArrowLeftOutlined, PlusOutlined, CloseOutlined, BookOutlined } from '@ant-design/icons';
import WriterNavbar from '../../components/writer/writernavbar/writernavbar';
import './writercreate.css';
import { useNavigate } from 'react-router-dom';
import Cropper from 'react-easy-crop';

const typeOptions = [
  { label: 'City', value: 'city', color: '#1890ff' },
  { label: 'Fantasy', value: 'fantasy', color: '#faad14' },
  { label: 'Romance', value: 'romance', color: '#eb2f96' },
  { label: 'Adventure', value: 'adventure', color: '#52c41a' },
  { label: 'Sci-Fi', value: 'scifi', color: '#13c2c2' },
  { label: 'History', value: 'history', color: '#722ed1' },
];

function getCroppedImg(imageSrc, crop, zoom, aspect = 120 / 160) {
  return new Promise((resolve) => {
    const image = new window.Image();
    image.src = imageSrc;
    image.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const naturalWidth = image.naturalWidth;
      const naturalHeight = image.naturalHeight;
      const cropWidth = (naturalWidth * crop.width) / 100;
      const cropHeight = (naturalHeight * crop.height) / 100;
      canvas.width = 120;
      canvas.height = 160;
      ctx.drawImage(
        image,
        (naturalWidth * crop.x) / 100,
        (naturalHeight * crop.y) / 100,
        cropWidth,
        cropHeight,
        0,
        0,
        120,
        160
      );
      resolve(canvas.toDataURL('image/jpeg'));
    };
  });
}

const WriterCreate = () => {
  const [coverUrl, setCoverUrl] = useState('');
  const [selectedTypes, setSelectedTypes] = useState([]);
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const [cropModalVisible, setCropModalVisible] = useState(false);
  const [cropImage, setCropImage] = useState('');
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [successModal, setSuccessModal] = useState(false);

  const handleTypeSelect = (value) => {
    if (!selectedTypes.includes(value)) {
      setSelectedTypes([...selectedTypes, value]);
    }
  };

  const handleTypeRemove = (value) => {
    setSelectedTypes(selectedTypes.filter((t) => t !== value));
  };

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

  const handleSubmit = (values) => {
    if (selectedTypes.length === 0) {
      message.error('Please select at least one type.');
      return;
    }
    message.success('Book created!');
    setSuccessModal(true);
    form.resetFields();
    setCoverUrl('');
    setSelectedTypes([]);
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
            <Select
              placeholder="Select type"
              value={selectedTypes[0] || undefined}
              onChange={(value) => setSelectedTypes([value])}
              options={typeOptions.map((opt) => ({
                label: opt.label,
                value: opt.value,
              }))}
              style={{ width: '100%' }}
            />
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
              CREATE
            </Button>
          </Form.Item>
        </Form>
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
