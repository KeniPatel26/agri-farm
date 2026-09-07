import { useState, useRef } from 'react';
import api from '../api/axiosInstance';
import { Upload, X, Image as ImageIcon, Loader2 } from 'lucide-react';
import { toast } from 'react-hot-toast';

const ImageUploader = ({ onUploadSuccess, label = "Upload Image" }) => {
  const [dragActive, setDragActive] = useState(false);
  const [previewUrl, setPreviewUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef(null);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const processFile = async (file) => {
    if (!file) return;

    // Check size limit (5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size exceeds the 5MB limit.');
      return;
    }

    // Check file type
    if (!file.type.startsWith('image/')) {
      toast.error('Only image files are allowed.');
      return;
    }

    // Live preview local image
    const localUrl = URL.createObjectURL(file);
    setPreviewUrl(localUrl);

    // Prepare upload payload
    const formData = new FormData();
    formData.append('image', file);

    setLoading(true);
    try {
      const res = await api.post('/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      toast.success('Image uploaded successfully!');
      if (onUploadSuccess) {
        onUploadSuccess(res.data.imageUrl);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error uploading image');
      setPreviewUrl('');
    } finally {
      setLoading(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const removePreview = () => {
    setPreviewUrl('');
    if (onUploadSuccess) {
      onUploadSuccess('');
    }
  };

  const onButtonClick = () => {
    fileInputRef.current.click();
  };

  return (
    <div style={{ marginBottom: '20px' }}>
      <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: 'var(--text-dark)' }}>
        {label}
      </label>
      
      <input
        ref={fileInputRef}
        type="file"
        style={{ display: 'none' }}
        accept="image/*"
        onChange={handleChange}
        disabled={loading}
      />

      {previewUrl ? (
        <div style={{ 
          position: 'relative', 
          borderRadius: '12px', 
          border: '1px solid var(--primary-light)', 
          overflow: 'hidden', 
          height: '180px',
          background: '#fafafa',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center'
        }}>
          <img 
            src={previewUrl} 
            alt="Preview" 
            style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain' }} 
          />
          {!loading && (
            <button
              type="button"
              onClick={removePreview}
              style={{
                position: 'absolute',
                top: '10px',
                right: '10px',
                background: 'rgba(0,0,0,0.6)',
                color: 'white',
                border: 'none',
                borderRadius: '50%',
                width: '28px',
                height: '28px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
              title="Remove image"
            >
              <X size={16} />
            </button>
          )}
          {loading && (
            <div style={{
              position: 'absolute',
              top: 0, left: 0, right: 0, bottom: 0,
              background: 'rgba(255,255,255,0.7)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              gap: '10px'
            }}>
              <Loader2 size={24} className="spin" color="var(--primary-color)" />
              <span style={{ fontSize: '13px', color: 'var(--primary-dark)', fontWeight: '500' }}>Uploading to server...</span>
            </div>
          )}
        </div>
      ) : (
        <div
          onDragEnter={handleDrag}
          onDragOver={handleDrag}
          onDragLeave={handleDrag}
          onDrop={handleDrop}
          onClick={onButtonClick}
          style={{
            border: `2px dashed ${dragActive ? 'var(--primary-color)' : 'var(--primary-light)'}`,
            background: dragActive ? '#f0fdf4' : '#fafafa',
            borderRadius: '12px',
            padding: '30px 20px',
            textAlign: 'center',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            height: '180px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            gap: '10px'
          }}
        >
          <div style={{ 
            width: '46px', height: '46px', borderRadius: '50%', 
            background: 'var(--primary-light)', color: 'var(--primary-dark)',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <Upload size={20} />
          </div>
          <div>
            <span style={{ fontWeight: '600', color: 'var(--primary-dark)' }}>Drag &amp; Drop image here</span>
            <span style={{ color: '#64748b', fontSize: '13px', display: 'block', marginTop: '2px' }}>or browse from computer</span>
          </div>
          <span style={{ color: '#94a3b8', fontSize: '11px' }}>Supports JPG, PNG, WEBP (Max 5MB)</span>
        </div>
      )}
    </div>
  );
};

export default ImageUploader;
