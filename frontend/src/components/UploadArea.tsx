import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { PhotoIcon, XMarkIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { ImageFile } from '../types';
import { validateFileType, validateFileSize, formatFileSize, createImagePreview, generateId } from '../utils';
import { UPLOAD_CONFIG } from '../constants';
import toast from 'react-hot-toast';

interface UploadAreaProps {
  files: ImageFile[];
  onFilesChange: (files: ImageFile[]) => void;
  maxFiles?: number;
  disabled?: boolean;
}

const UploadArea = ({
  files,
  onFilesChange,
  maxFiles = UPLOAD_CONFIG.maxFiles,
  disabled = false
}: UploadAreaProps) => {
  const [dragActive, setDragActive] = useState(false);

  const onDrop = useCallback(async (acceptedFiles: File[], rejectedFiles: any[]) => {
    setDragActive(false);

    // Handle rejected files
    rejectedFiles.forEach((rejection) => {
      const { file, errors } = rejection;
      errors.forEach((error: any) => {
        if (error.code === 'file-too-large') {
          toast.error(`${file.name} is too large. Maximum size is ${formatFileSize(UPLOAD_CONFIG.maxFileSize)}`);
        } else if (error.code === 'file-invalid-type') {
          toast.error(`${file.name} is not a supported image format`);
        } else if (error.code === 'too-many-files') {
          toast.error(`Too many files. Maximum is ${maxFiles} files`);
        }
      });
    });

    // Process accepted files
    const newFiles: ImageFile[] = [];

    for (const file of acceptedFiles) {
      if (files.length + newFiles.length >= maxFiles) {
        toast.error(`Maximum ${maxFiles} files allowed`);
        break;
      }

      try {
        const preview = await createImagePreview(file);
        const imageFile: ImageFile = {
          id: generateId(),
          file,
          preview,
          status: 'uploading',
        };
        newFiles.push(imageFile);
      } catch (error) {
        toast.error(`Failed to process ${file.name}`);
      }
    }

    if (newFiles.length > 0) {
      onFilesChange([...files, ...newFiles]);
    }
  }, [files, onFilesChange, maxFiles]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': UPLOAD_CONFIG.acceptedExtensions,
    },
    maxSize: UPLOAD_CONFIG.maxFileSize,
    maxFiles: maxFiles - files.length,
    disabled,
    onDragEnter: () => setDragActive(true),
    onDragLeave: () => setDragActive(false),
  });

  const removeFile = (fileId: string) => {
    const updatedFiles = files.filter(f => f.id !== fileId);
    onFilesChange(updatedFiles);
  };

  const canUploadMore = files.length < maxFiles && !disabled;

  return (
    <div className="space-y-4">
      {/* Drop Zone */}
      {canUploadMore && (
        <div
          {...getRootProps()}
          className={`relative border-2 border-dashed rounded-lg p-6 transition-colors cursor-pointer ${
            isDragActive || dragActive
              ? 'border-blue-400 bg-blue-50 dark:bg-blue-900/20'
              : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
          } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <input {...getInputProps()} />
          <div className="text-center">
            <PhotoIcon className="mx-auto h-12 w-12 text-gray-400" />
            <div className="mt-4">
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                {isDragActive || dragActive
                  ? 'Drop images here...'
                  : 'Drag & drop images here, or click to select'}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Supports JPG, PNG, WebP up to {formatFileSize(UPLOAD_CONFIG.maxFileSize)} each
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Maximum {maxFiles} files ({files.length}/{maxFiles} uploaded)
              </p>
            </div>
          </div>
        </div>
      )}

      {/* File List */}
      {files.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-gray-900 dark:text-white">
            Uploaded Images ({files.length})
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {files.map((file) => (
              <div
                key={file.id}
                className="relative group bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden"
              >
                {/* Image Preview */}
                <div className="aspect-square relative">
                  <img
                    src={file.preview}
                    alt={file.file.name}
                    className="w-full h-full object-cover"
                  />

                  {/* Status Overlay */}
                  {file.status === 'uploading' && (
                    <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                      <div className="text-white text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-2"></div>
                        <p className="text-sm">Uploading...</p>
                      </div>
                    </div>
                  )}

                  {file.status === 'error' && (
                    <div className="absolute inset-0 bg-red-500 bg-opacity-75 flex items-center justify-center">
                      <div className="text-white text-center">
                        <ExclamationTriangleIcon className="h-8 w-8 mx-auto mb-2" />
                        <p className="text-sm">Upload Failed</p>
                      </div>
                    </div>
                  )}

                  {/* Remove Button */}
                  <button
                    onClick={() => removeFile(file.id)}
                    className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                    aria-label="Remove image"
                  >
                    <XMarkIcon className="h-4 w-4" />
                  </button>
                </div>

                {/* File Info */}
                <div className="p-3">
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                    {file.file.name}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {formatFileSize(file.file.size)}
                  </p>

                  {/* Quality Control Status */}
                  {file.qcResults && (
                    <div className="mt-2">
                      <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        file.qcResults.isAcceptable
                          ? file.qcResults.warnings.length > 0
                            ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                            : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                          : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                      }`}>
                        QC: {file.qcResults.isAcceptable
                          ? file.qcResults.warnings.length > 0 ? 'Fair' : 'Good'
                          : 'Poor'
                        }
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Upload Limits Info */}
      {files.length >= maxFiles && (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-md p-4">
          <div className="flex">
            <ExclamationTriangleIcon className="h-5 w-5 text-yellow-400" />
            <div className="ml-3">
              <p className="text-sm text-yellow-800 dark:text-yellow-200">
                Maximum file limit reached ({maxFiles} files). Remove some files to upload more.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UploadArea;
