// components/FavoritesNavigationView.tsx
import React from "react";
import {
  FiFolder,
  FiFile,
  FiHeart,
  FiMoreVertical,
  FiDownload,
  FiEdit3,
  FiTrash2,
  FiKey,
  FiArrowLeft,
} from "react-icons/fi";
import FileList from "./FileList";
import { useFavouriteFilesNavigation } from "../hooks/useFiles";
import { useFavouriteFoldersNavigation } from "../hooks/useFolders";
import { useUserPermissions } from "../hooks/usePermissions";
import type { User, Folder } from "../types";

interface FavoritesNavigationViewProps {
  user: User;
  selectedFolderId: number | null;
  onFolderSelect: (folderId: number | null) => void;
  onBackNavigation?: () => void;
  onAssignPermission: (resourceId: number, resourceType: "folder" | "file") => void;
}

const FavoritesNavigationView: React.FC<FavoritesNavigationViewProps> = ({
  user,
  selectedFolderId,
  onFolderSelect,
  onBackNavigation,
  onAssignPermission,
}) => {
  const { data: files, isLoading: filesLoading } = useFavouriteFilesNavigation(selectedFolderId);
  const { data: folders, isLoading: foldersLoading } = useFavouriteFoldersNavigation(selectedFolderId);
  const { data: userPermissions } = useUserPermissions();

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
    console.log("📁 Favourite folder clicked:", folder.name, "ID:", folder.id);
    onFolderSelect(folder.id);
  };

  const handleBackClick = () => {
    console.log("🔙 Going back to previous folder");
    if (onBackNavigation) {
      onBackNavigation();
    } else {
      onFolderSelect(null);
    }
  };

  const handleDropdownToggle = (folderId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setOpenDropdownId(openDropdownId === folderId ? null : folderId);
  };

  const isLoading = filesLoading || foldersLoading;
  const totalItems = (files?.length || 0) + (folders?.length || 0);

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-200/60 p-6">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-4">
          {selectedFolderId && (
            <button
              onClick={handleBackClick}
              className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <FiArrowLeft size={18} />
              <span>Back</span>
            </button>
          )}
          <div>
            <h2 className="text-xl font-bold text-gray-900 flex items-center">
              <FiHeart className="text-red-500 mr-2" size={24} />
              Favorites
              {selectedFolderId && (
                <span className="ml-2 text-sm font-normal text-gray-500">
                  - Folder Contents
                </span>
              )}
            </h2>
            <p className="text-gray-500 mt-1">
              {totalItems} items in this view
            </p>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Favourite Folders Section */}
          {folders && folders.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Folders
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {folders.map((folder) => (
                  <div
                    key={folder.id}
                    onClick={() => handleFolderClick(folder)}
                    className="flex items-center p-4 bg-gray-50 rounded-xl border border-gray-200 hover:shadow-md transition-all cursor-pointer group relative"
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
                            {user.role === "super_admin" && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onAssignPermission(folder.id, "folder");
                                  setOpenDropdownId(null);
                                }}
                                className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                              >
                                <FiKey className="mr-3" size={16} />
                                Permissions
                              </button>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Favourite Files Section */}
          {files && files.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                {folders && folders.length > 0 ? "Files" : "All Items"}
              </h3>
              <FileList
                files={files}
                onAssignPermission={onAssignPermission}
                userRole={user.role}
                userId={user.id}
                showFavouriteToggle={true}
              />
            </div>
          )}

          {/* Empty State */}
          {totalItems === 0 && !isLoading && (
            <div className="text-center py-16">
              <div className="w-24 h-24 bg-gradient-to-br from-red-200 to-red-300 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <FiHeart className="text-red-400" size={32} />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {selectedFolderId ? "No items in this folder" : "No favorites yet"}
              </h3>
              <p className="text-gray-500 mb-6 max-w-md mx-auto">
                {selectedFolderId 
                  ? "This folder doesn't contain any favorite items."
                  : "Start adding items to your favorites by clicking the heart icon on files and folders."
                }
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default FavoritesNavigationView;
