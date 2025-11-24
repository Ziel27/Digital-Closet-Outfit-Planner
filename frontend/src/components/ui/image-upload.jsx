import { useState, useRef } from 'react';
import { Button } from './button';
import { FiUpload, FiX, FiImage } from 'react-icons/fi';
import axios, { getCsrfToken } from '../../utils/api.js'; // Use API utility with CSRF support

const ImageUpload = ({ value, onChange, className = '' }) => {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState(value || '');
  const fileInputRef = useRef(null);

  const handleFileSelect = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    // Validate file size (10MB - Cloudinary supports up to 10MB)
    if (file.size > 10 * 1024 * 1024) {
      alert('Image size must be less than 10MB');
      return;
    }

    // Show preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result);
    };
    reader.readAsDataURL(file);

    // Upload file
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('image', file);

      // Get CSRF token first to ensure session is established
      // This also ensures the session cookie is set
      // Force refresh to ensure we have the latest token for the current session
      const token = await getCsrfToken(true);
      if (!token) {
        throw new Error('Failed to get CSRF token. Please refresh the page and try again.');
      }
      
      // Note: Authorization and CSRF tokens are automatically added by axios interceptor
      // Don't set Content-Type - axios will set it automatically for FormData
      const response = await axios.post('/api/upload/clothing', formData);

      // Cloudinary returns the full URL directly
      const imageUrl = response.data.url;
      setPreview(imageUrl);
      onChange(imageUrl);
    } catch (error) {
      console.error('Upload error:', error);
      let errorMessage = 'Failed to upload image. Please try again.';
      
      if (error.response) {
        // Server responded with error
        if (error.response.status === 401) {
          errorMessage = 'Please log in to upload images.';
        } else if (error.response.status === 400) {
          errorMessage = error.response.data?.message || 'Invalid file. Please check file type and size.';
        } else if (error.response.status === 500) {
          errorMessage = error.response.data?.message || 'Server error. Please try again later.';
        } else {
          errorMessage = error.response.data?.message || errorMessage;
        }
      } else if (error.request) {
        // Request made but no response
        errorMessage = 'Unable to connect to server. Please check your connection.';
      }
      
      alert(errorMessage);
      setPreview('');
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = () => {
    setPreview('');
    onChange('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleUrlInput = (e) => {
    const url = e.target.value;
    setPreview(url);
    onChange(url);
  };

  return (
    <div className={`space-y-2 ${className}`}>
      <label className="text-sm font-medium block">Image *</label>
      
      {/* Preview */}
      {preview && (
        <div className="relative w-full h-48 border rounded-lg overflow-hidden bg-muted">
          <img
            src={preview}
            alt="Preview"
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.src = 'https://via.placeholder.com/400x300?text=Invalid+Image';
            }}
          />
          <Button
            type="button"
            variant="destructive"
            size="icon"
            className="absolute top-2 right-2"
            onClick={handleRemove}
          >
            <FiX className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* Upload Button */}
      {!preview && (
        <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
          <FiImage className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
            id="image-upload"
            disabled={uploading}
          />
          <Button
            type="button"
            variant="outline"
            className="cursor-pointer"
            disabled={uploading}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              if (fileInputRef.current && !uploading) {
                fileInputRef.current.click();
              }
            }}
          >
            <FiUpload className="h-4 w-4 mr-2" />
            {uploading ? 'Uploading...' : 'Upload Image'}
          </Button>
          <p className="text-xs text-muted-foreground mt-2">
            PNG, JPG, GIF, WEBP up to 10MB
          </p>
        </div>
      )}

      {/* URL Input (Alternative) */}
      <div>
        <input
          type="url"
          placeholder="Or enter image URL"
          value={preview && preview.startsWith('http') ? preview : ''}
          onChange={handleUrlInput}
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
        />
        <p className="text-xs text-muted-foreground mt-1">
          You can upload an image or paste an image URL
        </p>
      </div>
    </div>
  );
};

export default ImageUpload;

