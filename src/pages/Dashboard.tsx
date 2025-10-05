// components/Dashboard.tsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FiHome,
  FiFile,
  FiUsers,
  FiLogOut,
  FiUserPlus,
  FiUpload,
  FiMenu,
  FiX,
  FiSearch,
  FiStar,
  FiTrash2,
} from "react-icons/fi";
import FolderTree from "../components/FolderTree";
import FileManagement from "../components/FileManagement";
import UserManagementView from "../components/UserManagementView";
import FavoritesView from "../components/FavoritesView";
import FavoritesNavigationView from "../components/FavoritesNavigationView";
import TrashView from "../components/TrashView";
import { useFolderTree } from "../hooks/useFolders";
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
  const [editingUser, setEditingUser] = useState<User | null>(null);

  const { data: folders, isLoading: foldersLoading } = useFolderTree();
  const navigate = useNavigate();

  const user: User = JSON.parse(localStorage.getItem("user") || "{}");

  const handleEditUser = (userItem: User) => {
    setEditingUser(userItem);
    setIsUserManagementOpen(true);
  };

  const handleUserManagementClose = () => {
    setIsUserManagementOpen(false);
    setEditingUser(null);
  };

  const handleUserCreated = () => {
    setEditingUser(null);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const navigationItems = [
    {
      id: "dashboard",
      name: "Dashboard",
      icon: FiHome,
      color: "text-blue-600",
    },
    {
      id: "favorites",
      name: "Favorites",
      icon: FiStar,
      color: "text-yellow-600",
    },
  ];

  // Add Trash and Users sections only for super_admin
  if (user.role === "super_admin") {
    navigationItems.push({ id: "trash", name: "Trash", icon: FiTrash2, color: "text-red-600" });
    navigationItems.push({
      id: "users",
      name: "Users",
      icon: FiUsers,
      color: "text-indigo-600",
    });
  }

  // Add Logout to navigation items
  navigationItems.push({
    id: "logout",
    name: "Logout",
    icon: FiLogOut,
    color: "text-red-600",
  });

  const handleNavigationClick = (itemId: string) => {
    if (itemId === "logout") {
      handleLogout();
    } else {
      setActiveView(itemId);
      // Reset selected folder when switching views
      setSelectedFolderId(null);
    }
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-gray-50 to-blue-50/30">
      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 bg-white/95 backdrop-blur-xl shadow-2xl transform transition-all duration-300 ease-in-out lg:static lg:translate-x-0 ${
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

       
          {/* Navigation */}
          <div className="flex-1 px-3">
            <nav className="space-y-1">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleNavigationClick(item.id)}
                    className={`flex items-center w-full px-4 py-3 rounded-xl transition-all ${
                      activeView === item.id && item.id !== "logout"
                        ? "bg-blue-50 text-blue-700 border border-blue-200"
                        : item.id === "logout"
                        ? "text-red-600 hover:bg-red-50"
                        : "text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    <Icon
                      size={20}
                      className={`mr-3 ${
                        activeView === item.id && item.id !== "logout"
                          ? "text-blue-600"
                          : item.color
                      }`}
                    />
                    <span className="font-medium">{item.name}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* User Section */}
          <div className="p-6 border-t border-gray-200/60">
            <div className="flex items-center space-x-3">
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
                <button
                  onClick={() => handleEditUser(user)}
                  className="text-xs text-blue-600 hover:text-blue-700 mt-1"
                >
                  Edit my details
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col lg:ml-0 min-w-0">
        {/* Header */}
        <header className="bg-white/80 backdrop-blur-xl border-b border-gray-200/60">
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
                  {activeView === "favorites" && "Favorites"}
                  {activeView === "trash" && "Trash"}
                  {activeView === "users" && "User Management"}
                </h1>
                <p className="text-gray-500">
                  {selectedFolderId
                    ? `Folder: ${selectedFolderId}`
                    : "All your files in one place"}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              {activeView === "users" && (
                <button
                  onClick={() => {
                    setEditingUser(null);
                    setIsUserManagementOpen(true);
                  }}
                  className="flex items-center space-x-2 px-6 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 border border-transparent rounded-xl shadow-lg text-sm font-semibold text-white hover:from-blue-700 hover:to-blue-800 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all transform hover:scale-105"
                >
                  <FiUserPlus size={18} />
                  <span>Add User</span>
                </button>
              )}
              {activeView !== "users" && activeView !== "trash" && activeView !== "favorites" && (
                <button
                  onClick={() => setIsUploadModalOpen(true)}
                  className="flex items-center space-x-2 px-6 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 border border-transparent rounded-xl shadow-lg text-sm font-semibold text-white hover:from-blue-700 hover:to-blue-800 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all transform hover:scale-105"
                >
                  <FiUpload size={18} />
                  <span>Upload</span>
                </button>
              )}
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 flex overflow-hidden">
          <div className="flex-1 overflow-y-auto p-6">
            {activeView === "users" ? (
              <UserManagementView
                user={user}
                isUserManagementOpen={isUserManagementOpen}
                setIsUserManagementOpen={setIsUserManagementOpen}
                editingUser={editingUser}
                setEditingUser={setEditingUser}
                onUserCreated={handleUserCreated}
                onUserManagementClose={handleUserManagementClose}
              />
            ) : activeView === "favorites" ? (
              selectedFolderId ? (
                <FavoritesNavigationView
                  user={user}
                  selectedFolderId={selectedFolderId}
                  onFolderSelect={setSelectedFolderId}
                  onAssignPermission={(resourceId, resourceType) => {
                    setPermissionResource({ id: resourceId, type: resourceType });
                    setIsPermissionModalOpen(true);
                  }}
                />
              ) : (
                <FavoritesView
                  user={user}
                  onFolderSelect={setSelectedFolderId}
                  onAssignPermission={(resourceId, resourceType) => {
                    setPermissionResource({ id: resourceId, type: resourceType });
                    setIsPermissionModalOpen(true);
                  }}
                />
              )
            ) : activeView === "trash" ? (
              <TrashView
                user={user}
                selectedFolderId={selectedFolderId}
                onFolderSelect={setSelectedFolderId}
                onAssignPermission={(resourceId, resourceType) => {
                  setPermissionResource({ id: resourceId, type: resourceType });
                  setIsPermissionModalOpen(true);
                }}
              />
            ) : (
              <FileManagement
                selectedFolderId={selectedFolderId}
                searchQuery={searchQuery}
                user={user}
                isUploadModalOpen={isUploadModalOpen}
                setIsUploadModalOpen={setIsUploadModalOpen}
                isPermissionModalOpen={isPermissionModalOpen}
                setIsPermissionModalOpen={setIsPermissionModalOpen}
                permissionResource={permissionResource}
                setPermissionResource={setPermissionResource}
                onFolderSelect={setSelectedFolderId} // Add this line
              />
            )}
          </div>
        </div>
      </div>

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
