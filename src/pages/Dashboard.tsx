// components/Dashboard.tsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  FiHome,
  FiFolder,
  FiFile,
  FiUsers,
  FiSettings,
  FiLogOut,
  FiUpload,
  FiPlus,
  FiDownload,
  FiKey,
  FiMenu,
  FiX,
  FiChevronDown,
  FiChevronRight,
  FiSearch,
  FiShare2,
  FiBell,
  FiUser,
  FiGrid,
  FiStar,
  FiTrash2,
} from "react-icons/fi";
import FolderTree from "../components/FolderTree";
import FileList from "../components/FileList";
import UploadModal from "../components/UploadModal";
import PermissionModal from "../components/PermissionModal";
import UserManagement from "../components/UserManagement";
import { useFolderTree, useCreateFolder } from "../hooks/useFolders";
import { useFiles } from "../hooks/useFiles";
import type { User } from "../types";

const Dashboard: React.FC = () => {
  const [selectedFolderId, setSelectedFolderId] = useState<number | null>(null);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isPermissionModalOpen, setIsPermissionModalOpen] = useState(false);
  const [isUserManagementOpen, setIsUserManagementOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeView, setActiveView] = useState("dashboard");
  const [permissionResource, setPermissionResource] = useState<{
    id: number;
    type: "folder" | "file";
  } | null>(null);

  const { data: folders, isLoading: foldersLoading } = useFolderTree();
  const { data: files, isLoading: filesLoading } = useFiles(selectedFolderId);
  const createFolder = useCreateFolder();
  const navigate = useNavigate();

  const user: User = JSON.parse(localStorage.getItem("user") || "{}");

  const handleCreateFolder = () => {
    const name = prompt("Enter folder name");
    if (name) {
      createFolder.mutate(
        { name, parent_id: selectedFolderId },
        {
          onSuccess: () => {
            // Refetch folders
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

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const filteredFiles =
    files?.filter((file) =>
      file.name.toLowerCase().includes(searchQuery.toLowerCase())
    ) || [];

  const navigationItems = [
    {
      id: "dashboard",
      name: "Dashboard",
      icon: FiHome,
      color: "text-blue-600",
    },
    { id: "files", name: "My Files", icon: FiFile, color: "text-green-600" },
    { id: "shared", name: "Shared", icon: FiShare2, color: "text-purple-600" },

    {
      id: "favorites",
      name: "Favorites",
      icon: FiStar,
      color: "text-yellow-600",
    },
    { id: "trash", name: "Trash", icon: FiTrash2, color: "text-red-600" },
  ];

  if (user.role === "super_admin") {
    navigationItems.push({
      id: "admin",
      name: "Administration",
      icon: FiSettings,
      color: "text-gray-600",
    });
  }

  return (
    <div className="flex h-screen bg-gradient-to-br from-gray-50 to-blue-50/30">
      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0  bg-white/95 backdrop-blur-xl shadow-2xl transform transition-all duration-300 ease-in-out lg:static lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0 w-80" : "-translate-x-full"
        } ${
          mobileSidebarOpen ? "translate-x-0 w-80" : "-translate-x-full"
        } lg:block border-r border-gray-200/60`}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200/60">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-lg">R</span>
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
                  Revive Medical
                </h1>
                <p className="text-xs text-gray-500">File Management</p>
              </div>
            </div>
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="hidden lg:flex p-2 hover:bg-gray-100 rounded-xl transition-colors"
            >
              <FiX size={18} className="text-gray-500" />
            </button>
            <button
              onClick={() => setMobileSidebarOpen(false)}
              className="lg:hidden p-2 hover:bg-gray-100 rounded-xl transition-colors"
            >
              <FiX size={18} className="text-gray-500" />
            </button>
          </div>

          {/* Search */}
          <div className="p-6">
            <div className="relative">
              <FiSearch
                className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400"
                size={18}
              />
              <input
                type="text"
                placeholder="Search files..."
                className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {/* Navigation */}
          <div className="flex-1 px-3">
            <nav className="space-y-1">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveView(item.id)}
                    className={`flex items-center w-full px-4 py-3 rounded-xl transition-all ${
                      activeView === item.id
                        ? "bg-blue-50 text-blue-700 border border-blue-200"
                        : "text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    <Icon
                      size={20}
                      className={`mr-3 ${
                        activeView === item.id ? "text-blue-600" : item.color
                      }`}
                    />
                    <span className="font-medium">{item.name}</span>
                  </button>
                );
              })}
            </nav>

            {/* Folders Section */}
            <div className="mt-8 px-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">
                  Folders
                </h3>
                <button
                  onClick={handleCreateFolder}
                  className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors text-gray-500 hover:text-gray-700"
                  title="New Folder"
                >
                  <FiPlus size={16} />
                </button>
              </div>

              {foldersLoading ? (
                <div className="flex justify-center py-4">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                </div>
              ) : (
                <div className="bg-gray-50/50 rounded-xl p-3 border border-gray-200/60">
                  <FolderTree
                    folders={folders || []}
                    onSelect={setSelectedFolderId}
                  />
                </div>
              )}
            </div>
          </div>

          {/* User Section */}
          <div className="p-6 border-t border-gray-200/60">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-white font-semibold text-sm">
                  {user.username ? user.username.charAt(0).toUpperCase() : "U"}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 truncate">
                  {user.username}
                </p>
                <p className="text-xs text-gray-500 capitalize">{user.role}</p>
              </div>
              <button className="p-2 hover:bg-gray-100 rounded-xl transition-colors relative">
                <FiBell size={18} className="text-gray-500" />
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white"></span>
              </button>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center w-full px-4 py-3 text-gray-600 hover:bg-gray-50 rounded-xl transition-colors"
            >
              <FiLogOut className="mr-3" size={18} />
              <span className="font-medium">Logout</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col lg:ml-0 min-w-0">
        {/* Header */}
        <header className="bg-white/80 backdrop-blur-xl border-b border-gray-200/60 ">
          <div className="flex items-center justify-between p-6">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setMobileSidebarOpen(true)}
                className="lg:hidden p-2 hover:bg-gray-100 rounded-xl transition-colors"
              >
                <FiMenu size={24} className="text-gray-600" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {activeView === "dashboard" && "Dashboard"}
                  {activeView === "files" && "My Files"}
                  {activeView === "shared" && "Shared Files"}
                  {activeView === "favorites" && "Favorites"}
                  {activeView === "trash" && "Trash"}
                  {activeView === "admin" && "Administration"}
                </h1>
                <p className="text-gray-500">
                  {selectedFolderId
                    ? `Folder: ${selectedFolderId}`
                    : "All your files in one place"}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              {user.role === "super_admin" && (
                <button
                  onClick={() => setIsUserManagementOpen(true)}
                  className="flex items-center space-x-2 px-4 py-2.5 bg-white border border-gray-300 rounded-xl shadow-sm text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-all hover:shadow-md"
                >
                  <FiUsers size={18} />
                  <span>Manage Users</span>
                </button>
              )}
              <button
                onClick={() => setIsUploadModalOpen(true)}
                className="flex items-center space-x-2 px-6 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 border border-transparent rounded-xl shadow-lg text-sm font-semibold text-white hover:from-blue-700 hover:to-blue-800 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all transform hover:scale-105"
              >
                <FiUpload size={18} />
                <span>Upload</span>
              </button>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 flex overflow-hidden">
          {/* File Content Area */}
          <div className="flex-1 overflow-y-auto p-6">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-200/60 p-6">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">
                    {selectedFolderId ? `Folder Contents` : "All Files"}
                  </h2>
                  <p className="text-gray-500 mt-1">
                    {filteredFiles.length} files •{" "}
                    {filteredFiles
                      .reduce((acc, file) => acc + (file.size || 0), 0)
                      .toLocaleString()}{" "}
                    bytes
                  </p>
                </div>

                <div className="flex space-x-3">
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
                </div>
              </div>

              {filesLoading ? (
                <div className="flex justify-center py-16">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                </div>
              ) : (
                <FileList
                  files={filteredFiles}
                  onAssignPermission={handleAssignPermission}
                  userRole={user.role}
                />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <UploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        folderId={selectedFolderId}
      />

      {permissionResource && (
        <PermissionModal
          isOpen={isPermissionModalOpen}
          onClose={() => setIsPermissionModalOpen(false)}
          resourceId={permissionResource.id}
          resourceType={permissionResource.type}
        />
      )}

      <UserManagement
        isOpen={isUserManagementOpen}
        onClose={() => setIsUserManagementOpen(false)}
      />

      {/* Mobile sidebar overlay */}
      {mobileSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setMobileSidebarOpen(false)}
        ></div>
      )}
    </div>
  );
};

export default Dashboard;
