// hooks/usePermissions.ts
import { useMutation, useQuery } from "@tanstack/react-query";
import axios from "axios";
import { toast } from "react-toastify";
import type { Permission, PermissionsResponse, ApiResponse } from "../types";

const API_BASE_URL = "http://13.233.6.224:3100/api";

// Permission functions
const assignPermission = async (
  data: Omit<Permission, "id" | "created_at" | "updated_at">
) => {
  const response = await axios.post(
    `${API_BASE_URL}/permissions/assign`,
    data,
    {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    }
  );
  return response.data as { id: number; message: string };
};

const getResourcePermissions = async (
  resource_id: number,
  resource_type: "file" | "folder"
) => {
  const response = await axios.get(
    `${API_BASE_URL}/permissions/resource?resource_id=${resource_id}&resource_type=${resource_type}`,
    {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    }
  );
  return response.data.permissions as Permission[];
};

const removePermission = async (permission_id: number) => {
  const response = await axios.delete(`${API_BASE_URL}/permissions/remove`, {
    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    data: { permission_id },
  });
  return response.data as { message: string };
};

const getUserPermissions = async () => {
  const response = await axios.get(`${API_BASE_URL}/permissions/user`, {
    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
  });
  return response.data.permissions as Permission[];
};

// Hooks
export const useAssignPermission = () =>
  useMutation({
    mutationFn: assignPermission,
    onSuccess: (data) => {
      toast.success(data.message || "Permission assigned successfully");
    },
    onError: () => {
      toast.error("Failed to assign permission");
    },
  });

export const useResourcePermissions = (
  resource_id: number,
  resource_type: "file" | "folder"
) =>
  useQuery({
    queryKey: ["permissions", resource_id, resource_type],
    queryFn: () => getResourcePermissions(resource_id, resource_type),
    enabled: !!resource_id && !!localStorage.getItem("token"),
  });

export const useUserPermissions = () =>
  useQuery({
    queryKey: ["userPermissions"],
    queryFn: getUserPermissions,
    enabled: !!localStorage.getItem("token"),
  });

export const useRemovePermission = () =>
  useMutation({
    mutationFn: removePermission,
    onSuccess: (data) => {
      toast.success(data.message || "Permission removed successfully");
    },
    onError: () => {
      toast.error("Failed to remove permission");
    },
  });
