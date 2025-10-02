// components/Dashboard.tsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  FiHome,
  FiFile,
  FiUsers,
  FiSettings,
  FiLogOut,
  FiUserPlus,
  FiUpload,
  FiKey,
  FiMenu,
  FiX,
  FiSearch,
  FiShare2,
  FiStar,
  FiTrash2,
  FiEdit2,
  FiTrash2 as FiDelete,
  FiRefreshCw,
} from "react-icons/fi";
import FolderTree from "../components/FolderTree";
import FileList from "../components/FileList";
import UploadModal from "../components/UploadModal";
import PermissionModal from "../components/PermissionModal";
import UserManagement from "../components/UserManagement";
import { useFolderTree, useCreateFolder } from "../hooks/useFolders";
import { useUsers, useDeleteUser } from "../hooks/useAuth";
import type { User } from "../types";
import { useFiles } from "../hooks/useFiles";

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
  const { data: files, isLoading: filesLoading } = useFiles(selectedFolderId);
  const {
    data: users = [],
    isLoading: usersLoading,
    refetch: refetchUsers,
  } = useUsers();
  const deleteUser = useDeleteUser();
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

  const handleDeleteUser = (userId: number, username: string) => {
    if (window.confirm(`Are you sure you want to delete user "${username}"?`)) {
      deleteUser.mutate(userId, {
        onSuccess: () => {
          refetchUsers();
        },
      });
    }
  };

  const handleEditUser = (userItem: User) => {
    setEditingUser(userItem);
    setIsUserManagementOpen(true);
  };

  const handleUserManagementClose = () => {
    setIsUserManagementOpen(false);
    setEditingUser(null);
  };

  const handleUserCreated = () => {
    refetchUsers();

    // If the current user updated their own details, update localStorage
    if (editingUser && editingUser.id === user.id) {
      const updatedUsers = Array.isArray(users) ? users : [];
      const updatedCurrentUser = updatedUsers.find((u) => u.id === user.id);
      if (updatedCurrentUser) {
        localStorage.setItem("user", JSON.stringify(updatedCurrentUser));
        // Force a re-render by updating state
        window.dispatchEvent(new Event("storage"));
      }
    }

    setEditingUser(null);
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

  // Add Users section only for super_admin
  if (user.role === "super_admin") {
    navigationItems.splice(3, 0, {
      id: "users",
      name: "Users",
      icon: FiUsers,
      color: "text-indigo-600",
    });

    navigationItems.push({
      id: "admin",
      name: "Administration",
      icon: FiSettings,
      color: "text-gray-600",
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
    }
  };

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
              {user.role === "super_admin" && activeView !== "users" && (
                <button
                  onClick={() => setIsUserManagementOpen(true)}
                  className="flex items-center space-x-2 px-4 py-2.5 bg-white border border-gray-300 rounded-xl shadow-sm text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-all hover:shadow-md"
                >
                  <FiUsers size={18} />
                  <span>Manage Users</span>
                </button>
              )}
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
              {activeView !== "users" && (
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
          {/* File Content Area */}
          <div className="flex-1 overflow-y-auto p-6">
            {activeView === "users" ? (
              // Users Management View
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-200/60 p-6">
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">
                      User Management
                    </h2>
                    <p className="text-gray-500 mt-1">
                      Manage system users and permissions
                    </p>
                  </div>
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={() => refetchUsers()}
                      className="flex items-center space-x-2 px-4 py-2.5 bg-white border border-gray-300 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-all hover:shadow-md"
                    >
                      <FiRefreshCw size={16} />
                      <span>Refresh</span>
                    </button>
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
                  </div>
                </div>

                {/* Users List */}
                {usersLoading ? (
                  <div className="flex justify-center py-16">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                  </div>
                ) : (
                  <div className="grid gap-4">
                    {users.length === 0 ? (
                      <div className="text-center py-12">
                        <FiUsers
                          className="mx-auto text-gray-400 mb-4"
                          size={48}
                        />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                          No Users Found
                        </h3>
                        <p className="text-gray-500 mb-6">
                          Get started by creating your first user
                        </p>
                        <button
                          onClick={() => {
                            setEditingUser(null);
                            setIsUserManagementOpen(true);
                          }}
                          className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all font-medium"
                        >
                          Add New User
                        </button>
                      </div>
                    ) : (
                      users.map((userItem) => (
                        <div
                          key={userItem.id}
                          className="flex items-center justify-between p-6 bg-gray-50 rounded-xl border border-gray-200 hover:shadow-md transition-all"
                        >
                          <div className="flex items-center space-x-4">
                            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                              <span className="text-white font-semibold text-lg">
                                {userItem.username?.charAt(0).toUpperCase() ||
                                  "U"}
                              </span>
                            </div>
                            <div>
                              <h3 className="font-semibold text-gray-900 text-lg">
                                {userItem.username}
                                {userItem.id === user.id && (
                                  <span className="ml-2 text-sm text-blue-600 bg-blue-100 px-2 py-1 rounded-lg">
                                    You
                                  </span>
                                )}
                              </h3>
                              <p
                                className={`text-sm capitalize ${
                                  userItem.role === "super_admin"
                                    ? "text-purple-600 font-medium"
                                    : "text-gray-500"
                                }`}
                              >
                                {userItem.role}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => handleEditUser(userItem)}
                              className="p-3 text-blue-600 hover:bg-blue-50 rounded-xl transition-colors"
                              title="Edit User"
                            >
                              <FiEdit2 size={18} />
                            </button>
                            {userItem.id !== user.id && (
                              <button
                                onClick={() =>
                                  handleDeleteUser(
                                    userItem.id,
                                    userItem.username
                                  )
                                }
                                className="p-3 text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                                title="Delete User"
                                disabled={deleteUser.isPending}
                              >
                                <FiDelete size={18} />
                              </button>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            ) : (
              // Default File Management View
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
            )}
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
        onClose={handleUserManagementClose}
        onUserCreated={handleUserCreated}
        editingUser={editingUser}
        currentUser={user} // Add this line
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
