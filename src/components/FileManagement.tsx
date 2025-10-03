// components/FileManagement.tsx
import React from "react";
import {
  FiUpload,
  FiFolderPlus,
  FiKey,
  FiFolder,
  FiFile,
} from "react-icons/fi";
import FileList from "./FileList";
import UploadModal from "./UploadModal";
import PermissionModal from "./PermissionModal";
import { useCreateFolder, useRootFolders } from "../hooks/useFolders";
import { useFiles, useRootFiles } from "../hooks/useFiles";
import type { User, Folder, File as FileType } from "../types";

interface FileManagementProps {
  selectedFolderId: number | null;
  searchQuery: string;
  user: User;
  isUploadModalOpen: boolean;
  setIsUploadModalOpen: (open: boolean) => void;
  isPermissionModalOpen: boolean;
  setIsPermissionModalOpen: (open: boolean) => void;
  permissionResource: { id: number; type: "folder" | "file" } | null;
  setPermissionResource: (
    resource: { id: number; type: "folder" | "file" } | null
  ) => void;
  onFolderSelect: (folderId: number | null) => void;
}

const FileManagement: React.FC<FileManagementProps> = ({
  selectedFolderId,
  searchQuery,
  user,
  isUploadModalOpen,
  setIsUploadModalOpen,
  isPermissionModalOpen,
  setIsPermissionModalOpen,
  permissionResource,
  setPermissionResource,
  onFolderSelect,
}) => {
  const { data: files, isLoading: filesLoading } = useFiles(selectedFolderId);
  const { data: rootFiles, isLoading: rootFilesLoading } = useRootFiles();
  const { data: rootFolders, isLoading: rootFoldersLoading } = useRootFolders();
  const createFolder = useCreateFolder();

  const handleCreateFolder = () => {
    const name = prompt("Enter folder name");
    if (name) {
      createFolder.mutate(
        { name, parent_id: selectedFolderId },
        {
          onSuccess: () => {
            // Folder created successfully
          },
        }
      );
    }
  };

  const handleAssignPermission = (
    resourceId: number,
    resourceType: "folder" | "file"
  ) => {
    setPermissionResource({ id: resourceId, type: resourceType });
    setIsPermissionModalOpen(true);
  };

  // Get the items to display based on whether we're in root or a specific folder
  const displayFiles = selectedFolderId ? files : rootFiles;
  const displayFolders = selectedFolderId ? [] : rootFolders; // Only show folders at root level
  const isLoading = selectedFolderId
    ? filesLoading
    : rootFilesLoading || rootFoldersLoading;

  const filteredFiles =
    displayFiles?.filter((file) =>
      file.name.toLowerCase().includes(searchQuery.toLowerCase())
    ) || [];

  const filteredFolders =
    displayFolders?.filter((folder) =>
      folder.name.toLowerCase().includes(searchQuery.toLowerCase())
    ) || [];

  // Calculate total size for display
  const totalSize = filteredFiles.reduce(
    (acc, file) => acc + (file.size || 0),
    0
  );
  const totalItems = filteredFiles.length + filteredFolders.length;

  const handleFolderClick = (folder: Folder) => {
    onFolderSelect(folder.id);
  };

  const handleBackToRoot = () => {
    onFolderSelect(null);
  };

  return (
    <>
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-200/60 p-6">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              {selectedFolderId
                ? `Folder Contents`
                : "Dashboard - All Files & Folders"}
            </h2>
            <p className="text-gray-500 mt-1">
              {totalItems} items • {totalSize.toLocaleString()} bytes
              {selectedFolderId && (
                <button
                  onClick={handleBackToRoot}
                  className="ml-4 text-blue-600 hover:text-blue-700 text-sm font-medium"
                >
                  ← Back to Dashboard
                </button>
              )}
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={handleCreateFolder}
              className="flex items-center space-x-2 px-4 py-2.5 bg-white border border-gray-300 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-all hover:shadow-md"
            >
              <FiFolderPlus size={16} />
              <span>New Folder</span>
            </button>

            {user.role === "super_admin" && selectedFolderId && (
              <button
                onClick={() =>
                  handleAssignPermission(selectedFolderId, "folder")
                }
                className="flex items-center space-x-2 px-4 py-2.5 bg-white border border-gray-300 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-all hover:shadow-md"
              >
                <FiKey size={16} />
                <span>Permissions</span>
              </button>
            )}

            <button
              onClick={() => setIsUploadModalOpen(true)}
              className="flex items-center space-x-2 px-6 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 border border-transparent rounded-xl shadow-lg text-sm font-semibold text-white hover:from-blue-700 hover:to-blue-800 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all transform hover:scale-105"
            >
              <FiUpload size={18} />
              <span>Upload File</span>
            </button>
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-16">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Folders Section */}
            {filteredFolders.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Folders
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {filteredFolders.map((folder) => (
                    <div
                      key={folder.id}
                      onClick={() => handleFolderClick(folder)}
                      className="flex items-center p-4 bg-gray-50 rounded-xl border border-gray-200 hover:shadow-md transition-all cursor-pointer group"
                    >
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center shadow-lg mr-4">
                        <FiFolder className="text-white" size={20} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-gray-900 truncate group-hover:text-blue-600">
                          {folder.name}
                        </h4>
                        <p className="text-sm text-gray-500">Folder</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Files Section */}
            {filteredFiles.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  {filteredFolders.length > 0 ? "Files" : "All Items"}
                </h3>
                <FileList
                  files={filteredFiles}
                  onAssignPermission={handleAssignPermission}
                  userRole={user.role}
                />
              </div>
            )}

            {/* Empty State */}
            {totalItems === 0 && !isLoading && (
              <div className="text-center py-16">
                <div className="w-24 h-24 bg-gradient-to-br from-gray-200 to-gray-300 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <FiFile className="text-gray-400" size={32} />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {selectedFolderId
                    ? "This folder is empty"
                    : "No files or folders yet"}
                </h3>
                <p className="text-gray-500 mb-6 max-w-md mx-auto">
                  {selectedFolderId
                    ? "Upload files to this folder or create subfolders to organize your content."
                    : "Get started by uploading your first file or creating a new folder."}
                </p>
                <div className="flex justify-center space-x-4">
                  <button
                    onClick={handleCreateFolder}
                    className="px-6 py-3 bg-white border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all font-medium"
                  >
                    Create Folder
                  </button>
                  <button
                    onClick={() => setIsUploadModalOpen(true)}
                    className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all font-medium"
                  >
                    Upload File
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Upload Modal */}
      <UploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        folderId={selectedFolderId}
      />

      {/* Permission Modal */}
      {permissionResource && (
        <PermissionModal
          isOpen={isPermissionModalOpen}
          onClose={() => setIsPermissionModalOpen(false)}
          resourceId={permissionResource.id}
          resourceType={permissionResource.type}
        />
      )}
    </>
  );
};

export default FileManagement;
