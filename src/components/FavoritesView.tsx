// components/FavoritesView.tsx
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
} from "react-icons/fi";
import FileList from "./FileList";
import { useFavouriteFiles } from "../hooks/useFiles";
import { useFavouriteFolders, useToggleFolderFavourite } from "../hooks/useFolders";
import { useUserPermissions } from "../hooks/usePermissions";
import type { User, Folder } from "../types";

interface FavoritesViewProps {
  user: User;
  onFolderSelect: (folderId: number | null) => void;
  onAssignPermission: (resourceId: number, resourceType: "folder" | "file") => void;
}

const FavoritesView: React.FC<FavoritesViewProps> = ({
  user,
  onFolderSelect,
  onAssignPermission,
}) => {
  const { data: favouriteFiles, isLoading: filesLoading } = useFavouriteFiles();
  const { data: favouriteFolders, isLoading: foldersLoading } = useFavouriteFolders();
  const toggleFolderFavourite = useToggleFolderFavourite();
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

  const handleToggleFavourite = (folderId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    toggleFolderFavourite.mutate(folderId);
    setOpenDropdownId(null);
  };

  const handleDropdownToggle = (folderId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setOpenDropdownId(openDropdownId === folderId ? null : folderId);
  };

  const isLoading = filesLoading || foldersLoading;
  const totalItems = (favouriteFiles?.length || 0) + (favouriteFolders?.length || 0);

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-200/60 p-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-xl font-bold text-gray-900 flex items-center">
            <FiHeart className="text-red-500 mr-2" size={24} />
            Favorites
          </h2>
          <p className="text-gray-500 mt-1">
            {totalItems} favorite items
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Favourite Folders Section */}
          {favouriteFolders && favouriteFolders.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Favorite Folders
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {favouriteFolders.map((folder) => (
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
                    
                    {/* Heart icon - always red for favorites */}
                    <button
                      onClick={(e) => handleToggleFavourite(folder.id, e)}
                      className="p-2 text-red-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors mr-2"
                      title="Remove from favorites"
                    >
                      <FiHeart size={16} fill="currentColor" />
                    </button>
                    
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
          {favouriteFiles && favouriteFiles.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                {favouriteFolders && favouriteFolders.length > 0 ? "Favorite Files" : "All Favorites"}
              </h3>
              <FileList
                files={favouriteFiles}
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
                No favorites yet
              </h3>
              <p className="text-gray-500 mb-6 max-w-md mx-auto">
                Start adding items to your favorites by clicking the heart icon on files and folders.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default FavoritesView;
