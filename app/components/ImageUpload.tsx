// app/components/ImageUpload.tsx
'use client';

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';

interface ImageUploadProps {
  onUpload: (file: File) => void;
  loading: boolean;
}

export default function ImageUpload({ onUpload, loading }: ImageUploadProps) {
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const onDrop = useCallback((acceptedFiles: File[], fileRejections: FileRejection[]) => {
    setError(null);
    
    // Handle file rejections
    if (fileRejections.length > 0) {
      const rejection = fileRejections[0];
      if (rejection.errors[0]?.code === 'file-too-large') {
        setError('File is too large. Maximum size is 5MB.');
      } else if (rejection.errors[0]?.code === 'file-invalid-type') {
        setError('Invalid file type. Please upload PNG, JPG, or JPEG files only.');
      } else {
        setError('File upload failed. Please try again.');
      }
      return;
    }

    const file = acceptedFiles[0];
    if (file) {
      // Create preview
      const reader = new FileReader();
      reader.onload = () => setPreview(reader.result as string);
      reader.readAsDataURL(file);
      
      // Send to parent component
      onUpload(file);
    }
  }, [onUpload]);


  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg']
    },
    maxSize: 5 * 1024 * 1024, // 5MB
    multiple: false,
    disabled: loading
  });

  const clearPreview = () => {
    setPreview(null);
    setError(null);
  };

  return (
    <div className="w-full max-w-3xl mx-auto mb-8">
      <div className="mb-4">
        <h2 className="text-xl font-semibold text-gray-800 mb-2">Upload Trading Chart</h2>
        <p className="text-gray-600 text-sm">
          Upload a clear screenshot of your trading chart for AI analysis
        </p>
      </div>

      <div
        {...getRootProps()}
        className={`
          border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all duration-200
          ${isDragActive 
            ? 'border-blue-500 bg-blue-50 scale-[1.02]' 
            : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
          }
          ${loading ? 'pointer-events-none opacity-50' : ''}
          ${error ? 'border-red-300 bg-red-50' : ''}
        `}
      >
        <input {...getInputProps()} />
        
        <div className="space-y-4">
          {/* Upload Icon */}
          <div className="mx-auto w-12 h-12 text-gray-400">
            <svg fill="none" stroke="currentColor" viewBox="0 0 48 48" aria-hidden="true">
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" 
              />
            </svg>
          </div>

          {/* Upload Text */}
          {loading ? (
            <div>
              <p className="text-gray-600 font-medium">Analyzing your chart...</p>
              <div className="mt-2 w-8 h-8 mx-auto">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              </div>
            </div>
          ) : error ? (
            <div>
              <p className="text-red-600 font-medium">Upload Failed</p>
              <p className="text-red-500 text-sm">{error}</p>
              <p className="text-gray-500 text-xs mt-2">Click to try again</p>
            </div>
          ) : isDragActive ? (
            <div>
              <p className="text-blue-600 font-medium">Drop your chart here!</p>
              <p className="text-blue-500 text-sm">Release to upload</p>
            </div>
          ) : (
            <div>
              <p className="text-gray-700 font-medium mb-1">
                Drag & drop your trading chart here
              </p>
              <p className="text-gray-500 text-sm mb-3">or click to browse files</p>
              <div className="text-xs text-gray-400 space-y-1">
                <p>Supported: PNG, JPG, JPEG</p>
                <p>Maximum size: 5MB</p>
                <p>Best results: Clear charts with visible price levels</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Image Preview */}
      {preview && !loading && (
        <div className="mt-6 bg-white border rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-medium text-gray-700">Chart Preview</h3>
            <button
              onClick={clearPreview}
              className="text-gray-400 hover:text-gray-600 text-sm"
            >
              Remove
            </button>
          </div>
          <div className="relative">
            <img 
              src={preview} 
              alt="Chart preview" 
              className="max-h-64 w-full object-contain rounded border bg-gray-50"
            />
          </div>
          <p className="text-xs text-gray-500 mt-2 text-center">
            Chart uploaded successfully - analysis will appear below
          </p>
        </div>
      )}

      {/* Upload Tips */}
      <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-medium text-blue-800 mb-2">💡 Tips for Best Results</h4>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• Use clear, high-resolution screenshots</li>
          <li>• Include price levels, timeframes, and chart patterns</li>
          <li>• Avoid cluttered charts with too many indicators</li>
          <li>• Candlestick or line charts work best</li>
        </ul>
      </div>
    </div>
  );
}