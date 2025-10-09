// hooks/useSharedResources.ts
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import type { SharedResource } from "../types";

const API_BASE_URL = "https://rmtfms.duckdns.org/api";

// Shared resource functions
const createSharedResource = async (
  data: Omit<SharedResource, "id" | "created_at" | "updated_at">
) => {
  const response = await axios.post(`${API_BASE_URL}/shared`, data, {
    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
  });
  return response.data as { id: number; share_token: string; message: string };
};

const getSharedWithMe = async (): Promise<SharedResource[]> => {
  const response = await axios.get(`${API_BASE_URL}/shared/with-me`, {
    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
  });
  return response.data as SharedResource[];
};

const getSharedByMe = async (): Promise<SharedResource[]> => {
  const response = await axios.get(`${API_BASE_URL}/shared/by-me`, {
    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
  });
  return response.data as SharedResource[];
};

const getSharedResourceByToken = async (
  token: string
): Promise<SharedResource> => {
  const response = await axios.get(`${API_BASE_URL}/shared/token/${token}`);
  return response.data as SharedResource;
};

const updateSharedResource = async ({
  shareId,
  data,
}: {
  shareId: number;
  data: Partial<SharedResource>;
}): Promise<{ message: string }> => {
  const response = await axios.put(`${API_BASE_URL}/shared/${shareId}`, data, {
    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
  });
  return response.data as { message: string };
};

const deleteSharedResource = async (
  shareId: number
): Promise<{ message: string }> => {
  const response = await axios.delete(`${API_BASE_URL}/shared/${shareId}`, {
    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
  });
  return response.data as { message: string };
};

const downloadSharedFile = async (token: string): Promise<void> => {
  const response = await axios.get(`${API_BASE_URL}/shared/download/${token}`, {
    responseType: "blob",
  });

  // Create blob and download
  const blob = new Blob([response.data]);
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;

  // Get filename from content-disposition header
  const contentDisposition = response.headers["content-disposition"];
  let filename = `shared-file-${token}`;
  if (contentDisposition) {
    const filenameMatch = contentDisposition.match(/filename="?(.+)"?/);
    if (filenameMatch) filename = filenameMatch[1];
  }

  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
};

// Hooks
export const useCreateSharedResource = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createSharedResource,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sharedByMe"] });
    },
  });
};

export const useSharedWithMe = () =>
  useQuery({
    queryKey: ["sharedWithMe"],
    queryFn: getSharedWithMe,
    enabled: !!localStorage.getItem("token"),
  });

export const useSharedByMe = () =>
  useQuery({
    queryKey: ["sharedByMe"],
    queryFn: getSharedByMe,
    enabled: !!localStorage.getItem("token"),
  });

export const useSharedResourceByToken = (token: string) =>
  useQuery({
    queryKey: ["sharedResource", token],
    queryFn: () => getSharedResourceByToken(token),
    enabled: !!token,
  });

export const useUpdateSharedResource = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateSharedResource,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sharedByMe"] });
      queryClient.invalidateQueries({ queryKey: ["sharedWithMe"] });
    },
  });
};

export const useDeleteSharedResource = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteSharedResource,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sharedByMe"] });
      queryClient.invalidateQueries({ queryKey: ["sharedWithMe"] });
    },
  });
};

export const useDownloadSharedFile = () =>
  useMutation({
    mutationFn: downloadSharedFile,
  });
