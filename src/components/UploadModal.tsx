"use client";

import React, { useState, useRef, useEffect } from "react";
import { Dialog } from "@headlessui/react";
import { useUploadFile } from "../hooks/useFiles";
import { FiUpload, FiX, FiFile, FiFolder, FiCloud } from "react-icons/fi";

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  folderId: number | null;
}

const UploadModal: React.FC<UploadModalProps> = ({
  isOpen,
  onClose,
  folderId,
}) => {
  const [uploadType, setUploadType] = useState<"file" | "folder">("file");
  const [files, setFiles] = useState<FileList | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const uploadFileMutation = useUploadFile(); // handles both single & multiple

  // ✅ Reset state when modal opens or closes
  useEffect(() => {
    if (isOpen) {
      setFiles(null);
      setUploadType("file");
      setIsDragging(false);
      if (fileInputRef.current) fileInputRef.current.value = ""; // reset input
    }
  }, [isOpen]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFiles(e.target.files);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    setFiles(e.dataTransfer.files);
  };

  const handleSubmit = async () => {
    if (!files) return;

    try {
      const formData = new FormData();

      Array.from(files).forEach((file) => {
        formData.append("files", file);
      });

      if (folderId) formData.append("folder_id", folderId.toString());

      await uploadFileMutation.mutateAsync(formData);

      // ✅ Reset after successful upload
      setFiles(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      onClose();
    } catch (error) {
      console.error("Upload failed:", error);
    }
  };

  const selectedFile = files && files.length > 0 ? files[0] : null;

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm"
        aria-hidden="true"
      />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="bg-white rounded-2xl shadow-2xl max-w-md w-full transform transition-all">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-100">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <FiUpload className="text-blue-600" size={20} />
              </div>
              <div>
                <Dialog.Title className="text-xl font-bold text-gray-900">
                  Upload {uploadType === "file" ? "File(s)" : "Folder"}
                </Dialog.Title>
                <p className="text-sm text-gray-500">
                  Add new content to your storage
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <FiX size={20} />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Upload Type */}
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setUploadType("file")}
                className={`p-4 border-2 rounded-xl text-center transition-all ${
                  uploadType === "file"
                    ? "border-blue-500 bg-blue-50 text-blue-700"
                    : "border-gray-200 hover:border-gray-300 text-gray-600"
                }`}
              >
                <FiFile size={24} className="mx-auto mb-2" />
                <div className="font-medium">File(s)</div>
              </button>
              <button
                onClick={() => setUploadType("folder")}
                className={`p-4 border-2 rounded-xl text-center transition-all ${
                  uploadType === "folder"
                    ? "border-blue-500 bg-blue-50 text-blue-700"
                    : "border-gray-200 hover:border-gray-300 text-gray-600"
                }`}
              >
                <FiFolder size={24} className="mx-auto mb-2" />
                <div className="font-medium">Folder</div>
              </button>
            </div>

            {/* Drop Zone */}
            <div
              className={`border-2 border-dashed rounded-xl p-8 text-center transition-all ${
                isDragging
                  ? "border-blue-500 bg-blue-50"
                  : "border-gray-300 hover:border-gray-400"
              }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                ref={fileInputRef}
                type="file"
                multiple
                {...(uploadType === "folder"
                  ? { webkitdirectory: "true" }
                  : {})}
                onChange={handleFileChange}
                className="hidden"
              />

              <FiCloud className="mx-auto h-12 w-12 text-gray-400 mb-4" />

              {selectedFile ? (
                <div>
                  <p className="font-medium text-gray-900">
                    {uploadType === "folder"
                      ? `${files?.length} files selected`
                      : `${files?.length} file(s) selected`}
                  </p>
                </div>
              ) : (
                <div>
                  <p className="font-medium text-gray-900">
                    Drag and drop your{" "}
                    {uploadType === "file" ? "file(s)" : "folder"} here
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    or click to browse
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-end space-x-3 p-6 border-t border-gray-100">
            <button
              onClick={onClose}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={!files || uploadFileMutation.isPending}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {uploadFileMutation.isPending ? (
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Uploading...</span>
                </div>
              ) : (
                `Upload`
              )}
            </button>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
};

export default UploadModal;
