// components/FileList.tsx
import React from "react";
import type { File } from "../types";
import { useDownloadFile, useDeleteFile } from "../hooks/useFiles";
import { useUserPermissions } from "../hooks/usePermissions";
import {
  FiDownload,
  FiKey,
  FiFile,
  FiImage,
  FiVideo,
  FiMusic,
  FiArchive,
  FiFileText,
  FiMoreVertical,
  FiTrash2,
} from "react-icons/fi";

interface FileListProps {
  files: File[];
  onAssignPermission: (resourceId: number, resourceType: "file") => void;
  userRole: string;
  userId?: number;
}

const FileList: React.FC<FileListProps> = ({
  files,
  onAssignPermission,
  userRole,
  userId,
}) => {
  const downloadFile = useDownloadFile();
  const deleteFile = useDeleteFile();
  const { data: userPermissions } = useUserPermissions();
  

  // Check if user has download permission for a file
  const hasDownloadPermission = (fileId: number) => {
    if (!userPermissions) return false;
    
    // Check if file is owned by user (owners have all permissions)
    const file = files.find(f => f.id === fileId);
    if (file && userId && file.created_by === userId) {
      return true;
    }
    
    // Check direct permission for this file
    const directPermission = userPermissions.find(
      (perm) => perm.resource_id === fileId && perm.resource_type === "file"
    );
    
    if (directPermission) {
      return directPermission.can_download || false;
    }
    
    // Check inherited permission from parent folder
    if (file && file.folder_id) {
      const folderPermission = userPermissions.find(
        (perm) => perm.resource_id === file.folder_id && perm.resource_type === "folder"
      );
      
      if (folderPermission) {
        return folderPermission.can_download || false;
      }
    }
    
    return false;
  };

  const handleDownload = (fileId: number) => {
    downloadFile.mutate(fileId);
  };

  const handleDelete = (fileId: number, fileName: string) => {
    if (window.confirm(`Are you sure you want to delete "${fileName}"?`)) {
      deleteFile.mutate(fileId);
    }
  };

  const handleFileClick = (file: File) => {
    // Open file in new tab
    const fileUrl = `http://localhost:3000/api/files/download/${file.id}`;
    window.open(fileUrl, '_blank');
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const getFileIcon = (mimeType: string) => {
    if (mimeType.startsWith("image/")) return FiImage;
    if (mimeType.startsWith("video/")) return FiVideo;
    if (mimeType.startsWith("audio/")) return FiMusic;
    if (mimeType.includes("pdf")) return FiFileText;
    if (mimeType.includes("zip") || mimeType.includes("compressed"))
      return FiArchive;
    if (mimeType.includes("text") || mimeType.includes("document"))
      return FiFileText;
    return FiFile;
  };

  const getFileColor = (mimeType: string) => {
    if (mimeType.startsWith("image/")) return "text-green-600 bg-green-50";
    if (mimeType.startsWith("video/")) return "text-purple-600 bg-purple-50";
    if (mimeType.startsWith("audio/")) return "text-yellow-600 bg-yellow-50";
    if (mimeType.includes("pdf")) return "text-red-600 bg-red-50";
    if (mimeType.includes("zip")) return "text-orange-600 bg-orange-50";
    return "text-blue-600 bg-blue-50";
  };

  return (
    <div className="space-y-4">
      {files.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-24 h-24 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <FiFile className="h-12 w-12 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No files found
          </h3>
          <p className="text-gray-500 max-w-sm mx-auto">
            {files.length === 0
              ? "Get started by uploading your first file."
              : "No files match your search."}
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {files.map((file) => {
            const FileIcon = getFileIcon(file.mime_type);
            const fileColor = getFileColor(file.mime_type);

            return (
              <div
                key={file.id}
                onClick={() => handleFileClick(file)}
                className="flex items-center space-x-4 p-4 bg-white rounded-xl border border-gray-200 hover:shadow-md transition-all duration-200 cursor-pointer"
              >
                <div className={`p-3 rounded-xl ${fileColor}`}>
                  <FileIcon size={24} />
                </div>

                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-gray-900 truncate">
                    {file.name}
                  </h4>
                  <div className="flex items-center space-x-4 mt-1 text-sm text-gray-500">
                    <span>{formatFileSize(file.size || 0)}</span>
                    <span>•</span>
                    <span>
                      {new Date(file.created_at).toLocaleDateString()}
                    </span>
                    {file.mime_type && (
                      <>
                        <span>•</span>
                        <span className="capitalize">
                          {file.mime_type.split("/")[1] || file.mime_type}
                        </span>
                      </>
                    )}
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  {hasDownloadPermission(file.id) && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDownload(file.id);
                      }}
                      className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-colors"
                      title="Download"
                    >
                      <FiDownload size={18} />
                    </button>
                  )}

      {userRole === "super_admin" && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onAssignPermission(file.id, "file");
          }}
          className="p-2 text-gray-500 hover:text-green-600 hover:bg-green-50 rounded-xl transition-colors"
          title="Set Permissions"
        >
          <FiKey size={18} />
        </button>
      )}

      {userRole === "super_admin" && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleDelete(file.id, file.name);
          }}
          className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
          title="Delete"
        >
          <FiTrash2 size={18} />
        </button>
      )}

                  <button 
                    onClick={(e) => e.stopPropagation()}
                    className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded-xl transition-colors"
                  >
                    <FiMoreVertical size={18} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default FileList;
           