// hooks/usePermissions.ts
import { useMutation, useQuery } from "@tanstack/react-query";
import axios from "axios";
import type { Permission, PermissionsResponse, ApiResponse } from "../types";

const API_BASE_URL = "http://localhost:3000/api";

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
  });
