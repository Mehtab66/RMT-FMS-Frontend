// components/TrashView.tsx
import React from "react";
import {
  FiFolder,
  FiFile,
  FiTrash2,
  FiMoreVertical,
  FiDownload,
  FiKey,
  FiRotateCcw,
} from "react-icons/fi";
import FileList from "./FileList";
import { useTrashFiles, useRestoreFile, usePermanentDeleteFile } from "../hooks/useFiles";
import { useTrashFolders, useRestoreFolder, usePermanentDeleteFolder } from "../hooks/useFolders";
import { useUserPermissions } from "../hooks/usePermissions";
import type { User, Folder } from "../types";

interface TrashViewProps {
  user: User;
  onFolderSelect: (folderId: number | null) => void;
  onAssignPermission: (resourceId: number, resourceType: "folder" | "file") => void;
}

const TrashView: React.FC<TrashViewProps> = ({
  user,
  onFolderSelect,
  onAssignPermission,
}) => {
  const { data: trashFiles, isLoading: filesLoading } = useTrashFiles();
  const { data: trashFolders, isLoading: foldersLoading } = useTrashFolders();
  const { data: userPermissions } = useUserPermissions();
  
  // Mutation hooks for restore and permanent delete
  const restoreFile = useRestoreFile();
  const permanentDeleteFile = usePermanentDeleteFile();
  const restoreFolder = useRestoreFolder();
  const permanentDeleteFolder = usePermanentDeleteFolder();

  // State for dropdown management
  const [openDropdownId, setOpenDropdownId] = React.useState<number | null>(null);

  // Close dropdown when clicking outside
  React.useEffect(() => {
    const handleClickOutside = () => {
      setOpenDropdownId(null);
    };
    
    if (openDropdownId) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [openDropdownId]);

  const handleFolderClick = (folder: Folder) => {
    console.log("📁 Trash folder clicked:", folder.name, "ID:", folder.id);
    onFolderSelect(folder.id);
  };

  const handleDropdownToggle = (folderId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setOpenDropdownId(openDropdownId === folderId ? null : folderId);
  };

  const handleRestoreFolder = (folderId: number, folderName: string) => {
    if (window.confirm(`Are you sure you want to restore "${folderName}"?`)) {
      restoreFolder.mutate(folderId, {
        onSuccess: () => {
          console.log("✅ Folder restored successfully");
        },
        onError: (error: any) => {
          console.error("❌ Failed to restore folder:", error);
          alert("Failed to restore folder. Please try again.");
        },
      });
    }
    setOpenDropdownId(null);
  };

  const handlePermanentDeleteFolder = (folderId: number, folderName: string) => {
    if (window.confirm(`Are you sure you want to permanently delete "${folderName}"? This action cannot be undone.`)) {
      permanentDeleteFolder.mutate(folderId, {
        onSuccess: () => {
          console.log("✅ Folder permanently deleted");
        },
        onError: (error: any) => {
          console.error("❌ Failed to permanently delete folder:", error);
          alert("Failed to permanently delete folder. Please try again.");
        },
      });
    }
    setOpenDropdownId(null);
  };

  const isLoading = filesLoading || foldersLoading;
  const totalItems = (trashFiles?.length || 0) + (trashFolders?.length || 0);

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-200/60 p-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-xl font-bold text-gray-900 flex items-center">
            <FiTrash2 className="text-red-500 mr-2" size={24} />
            Trash
          </h2>
          <p className="text-gray-500 mt-1">
            {totalItems} deleted items
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Trash Folders Section */}
          {trashFolders && trashFolders.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Deleted Folders
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {trashFolders.map((folder) => (
                  <div
                    key={folder.id}
                    onClick={() => handleFolderClick(folder)}
                    className="flex items-center p-4 bg-gray-50 rounded-xl border border-gray-200 hover:shadow-md transition-all cursor-pointer group relative opacity-75"
                  >
                    <div className="w-12 h-12 bg-gradient-to-br from-gray-400 to-gray-500 rounded-lg flex items-center justify-center shadow-lg mr-4">
                      <FiFolder className="text-white" size={20} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-gray-900 truncate group-hover:text-blue-600">
                        {folder.name}
                      </h4>
                      <p className="text-sm text-gray-500">Deleted Folder</p>
                    </div>
                    
                    {/* 3-dot dropdown menu */}
                    <div className="relative">
                      <button
                        onClick={(e) => handleDropdownToggle(folder.id, e)}
                        className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-200 rounded-lg transition-colors"
                        title="More options"
                      >
                        <FiMoreVertical size={16} />
                      </button>
                      
                      {openDropdownId === folder.id && (
                        <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
                          <div className="py-1">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleRestoreFolder(folder.id, folder.name);
                              }}
                              className="flex items-center w-full px-4 py-2 text-sm text-green-600 hover:bg-green-50"
                            >
                              <FiRotateCcw className="mr-3" size={16} />
                              Restore
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handlePermanentDeleteFolder(folder.id, folder.name);
                              }}
                              className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                            >
                              <FiTrash2 className="mr-3" size={16} />
                              Delete Forever
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Trash Files Section */}
          {trashFiles && trashFiles.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                {trashFolders && trashFolders.length > 0 ? "Deleted Files" : "All Deleted Items"}
              </h3>
              <FileList
                files={trashFiles}
                onAssignPermission={onAssignPermission}
                userRole={user.role}
                userId={user.id}
                showFavouriteToggle={false}
                isTrashView={true}
              />
            </div>
          )}

          {/* Empty State */}
          {totalItems === 0 && !isLoading && (
            <div className="text-center py-16">
              <div className="w-24 h-24 bg-gradient-to-br from-gray-200 to-gray-300 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <FiTrash2 className="text-gray-400" size={32} />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Trash is empty
              </h3>
              <p className="text-gray-500 mb-6 max-w-md mx-auto">
                Deleted files and folders will appear here. You can restore them or delete them permanently.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default TrashView;
