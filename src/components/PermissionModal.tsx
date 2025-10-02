// components/PermissionModal.tsx
import React, { useState } from "react";
import { Dialog } from "@headlessui/react";
import { useUsers } from "../hooks/useAuth";
import { useAssignPermission } from "../hooks/usePermissions";
import type { User } from "../types";
import {
  FiKey,
  FiX,
  FiUser,
  FiEye,
  FiEdit,
  FiDownload,
  FiFolder,
  FiFile,
} from "react-icons/fi";

interface PermissionModalProps {
  isOpen: boolean;
  onClose: () => void;
  resourceId: number;
  resourceType: "folder" | "file";
}

const PermissionModal: React.FC<PermissionModalProps> = ({
  isOpen,
  onClose,
  resourceId,
  resourceType,
}) => {
  const { data: users } = useUsers();
  const assignPermission = useAssignPermission();
  const [selectedUser, setSelectedUser] = useState<number | null>(null);
  const [permissions, setPermissions] = useState({
    can_read: true,
    can_create: false,
    can_edit: false,
    can_download: true,
    inherit: true,
  });

  const handleSubmit = () => {
    if (selectedUser) {
      assignPermission.mutate(
        {
          user_id: selectedUser,
          resource_id: resourceId,
          resource_type: resourceType,
          ...permissions,
        },
        {
          onSuccess: () => onClose(),
        }
      );
    }
  };

  const permissionOptions = [
    {
      key: "can_read",
      label: "View",
      icon: FiEye,
      description: "Can view this resource",
    },
    {
      key: "can_edit",
      label: "Edit",
      icon: FiEdit,
      description: "Can modify this resource",
    },
    {
      key: "can_download",
      label: "Download",
      icon: FiDownload,
      description: "Can download this resource",
    },
    {
      key: "can_create",
      label: "Create",
      icon: FiFolder,
      description: "Can create new items",
    },
    {
      key: "inherit",
      label: "Inherit",
      icon: FiKey,
      description: "Apply to subfolders",
    },
  ];

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm"
        aria-hidden="true"
      />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="bg-white rounded-2xl shadow-2xl max-w-md w-full transform transition-all">
          <div className="flex items-center justify-between p-6 border-b border-gray-100">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <FiKey className="text-purple-600" size={20} />
              </div>
              <div>
                <Dialog.Title className="text-xl font-bold text-gray-900">
                  Assign Permissions
                </Dialog.Title>
                <p className="text-sm text-gray-500">
                  Set permissions for {resourceType}
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

          <div className="p-6 space-y-6">
            {/* User Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Select User
              </label>
              <div className="relative">
                <FiUser
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  size={18}
                />
                <select
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 appearance-none bg-white"
                  onChange={(e) => setSelectedUser(Number(e.target.value))}
                >
                  <option value="">Choose a user...</option>
                  {users?.map((user: User) => (
                    <option key={user.id} value={user.id}>
                      {user.username} ({user.role})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Permissions */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Permissions
              </label>
              <div className="space-y-3">
                {permissionOptions.map(
                  ({ key, label, icon: Icon, description }) => (
                    <label
                      key={key}
                      className="flex items-start space-x-3 p-3 rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={permissions[key as keyof typeof permissions]}
                        onChange={(e) =>
                          setPermissions({
                            ...permissions,
                            [key]: e.target.checked,
                          })
                        }
                        className="mt-1 text-purple-600 focus:ring-purple-500 rounded"
                      />
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <Icon size={16} className="text-gray-600" />
                          <span className="font-medium text-gray-900">
                            {label}
                          </span>
                        </div>
                        <p className="text-sm text-gray-500 mt-1">
                          {description}
                        </p>
                      </div>
                    </label>
                  )
                )}
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-3 p-6 border-t border-gray-100">
            <button
              onClick={onClose}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={!selectedUser || assignPermission.isPending}
              className="px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-xl hover:from-purple-700 hover:to-purple-800 focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {assignPermission.isPending ? (
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Saving...</span>
                </div>
              ) : (
                "Save Permissions"
              )}
            </button>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
};

export default PermissionModal;
