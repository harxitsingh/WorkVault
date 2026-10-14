import React, { useCallback, useRef } from 'react';
import { Upload, X, FileText } from 'lucide-react';

export default function FileUpload({
  onFilesSelected,
  maxFiles = 5,
  accept,
  maxSize = 10485760, // 10MB
  files = [],
  onRemoveFile
}) {
  const fileInputRef = useRef(null);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(Array.from(e.dataTransfer.files));
    }
  }, [onFilesSelected]);

  const handleFileInput = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(Array.from(e.target.files));
    }
  };

  const handleFiles = (newFiles) => {
    // Filter out files that exceed max size
    const validFiles = newFiles.filter(file => file.size <= maxSize);
    const availableSlots = maxFiles - files.length;
    const filesToAdd = validFiles.slice(0, availableSlots);
    
    if (filesToAdd.length > 0 && onFilesSelected) {
      onFilesSelected(filesToAdd);
    }
  };

  const formatSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="w-full">
      <div 
        className="mt-2 flex justify-center rounded-lg border border-dashed border-gray-900/25 px-6 py-10 hover:bg-gray-50 transition-colors cursor-pointer"
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <div className="text-center">
          <Upload className="mx-auto h-12 w-12 text-gray-300" aria-hidden="true" />
          <div className="mt-4 flex text-sm leading-6 text-gray-600 justify-center">
            <span className="relative cursor-pointer rounded-md bg-white font-semibold text-indigo-600 focus-within:outline-none focus-within:ring-2 focus-within:ring-indigo-600 focus-within:ring-offset-2 hover:text-indigo-500">
              Upload a file
            </span>
            <p className="pl-1">or drag and drop</p>
          </div>
          <p className="text-xs leading-5 text-gray-600">
            {accept ? accept : 'Any file'} up to {formatSize(maxSize)}
          </p>
        </div>
        <input
          type="file"
          className="hidden"
          ref={fileInputRef}
          onChange={handleFileInput}
          multiple={maxFiles > 1}
          accept={accept}
        />
      </div>

      {files.length > 0 && (
        <ul className="mt-4 space-y-3">
          {files.map((file, index) => (
            <li key={`${file.name}-${index}`} className="flex items-center justify-between rounded-lg border border-gray-200 p-3 shadow-sm bg-white">
              <div className="flex items-center space-x-3 truncate">
                <div className="flex-shrink-0">
                  <FileText className="h-5 w-5 text-gray-400" />
                </div>
                <div className="truncate">
                  <p className="truncate text-sm font-medium text-gray-900">{file.name}</p>
                  <p className="text-xs text-gray-500">{formatSize(file.size)}</p>
                </div>
              </div>
              {/* Fake progress bar can be added here if needed, but for now just showing file */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  if (onRemoveFile) onRemoveFile(index);
                }}
                className="ml-4 flex-shrink-0 rounded-md bg-white text-gray-400 hover:text-red-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              >
                <span className="sr-only">Remove file</span>
                <X className="h-5 w-5" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
