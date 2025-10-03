// components/UserManagementView.tsx
import React from "react";
import {
  FiUsers,
  FiUserPlus,
  FiRefreshCw,
  FiEdit2,
  FiTrash2,
} from "react-icons/fi";
import UserManagement from "./UserManagement";
import { useUsers, useDeleteUser } from "../hooks/useAuth";
import type { User } from "../types";

interface UserManagementViewProps {
  user: User;
  isUserManagementOpen: boolean;
  setIsUserManagementOpen: (open: boolean) => void;
  editingUser: User | null;
  setEditingUser: (user: User | null) => void;
  onUserCreated: () => void;
  onUserManagementClose: () => void;
}

const UserManagementView: React.FC<UserManagementViewProps> = ({
  user,
  isUserManagementOpen,
  setIsUserManagementOpen,
  editingUser,
  setEditingUser,
  onUserCreated,
  onUserManagementClose,
}) => {
  const {
    data: users = [],
    isLoading: usersLoading,
    refetch: refetchUsers,
  } = useUsers();
  const deleteUser = useDeleteUser();

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

  return (
    <>
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-200/60 p-6">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-xl font-bold text-gray-900">User Management</h2>
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
                <FiUsers className="mx-auto text-gray-400 mb-4" size={48} />
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
                        {userItem.username?.charAt(0).toUpperCase() || "U"}
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
                          handleDeleteUser(userItem.id, userItem.username)
                        }
                        className="p-3 text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                        title="Delete User"
                        disabled={deleteUser.isPending}
                      >
                        <FiTrash2 size={18} />
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* User Management Modal */}
      <UserManagement
        isOpen={isUserManagementOpen}
        onClose={onUserManagementClose}
        onUserCreated={onUserCreated}
        editingUser={editingUser}
        currentUser={user}
      />
    </>
  );
};

export default UserManagementView;
