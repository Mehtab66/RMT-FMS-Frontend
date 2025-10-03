// hooks/useFolders.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import type { Folder } from "../types";

const API_BASE_URL = "http://localhost:3000/api";

// -----------------------------
// Folder APIs (metadata only)
// -----------------------------
const fetchFolders = async (): Promise<Folder[]> => {
  const response = await axios.get(`${API_BASE_URL}/folders`, {
    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
  });
  return response.data.folders as Folder[];
};

const fetchFolder = async (id: number): Promise<Folder> => {
  const response = await axios.get(`${API_BASE_URL}/folders/${id}`, {
    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
  });
  return response.data as Folder;
};

const fetchFolderTree = async (): Promise<Folder[]> => {
  const response = await axios.get(`${API_BASE_URL}/folders/tree/structure`, {
    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
  });
  return response.data as Folder[];
};

const createFolder = async (data: {
  name: string;
  parent_id: number | null;
}): Promise<Folder> => {
  const response = await axios.post(`${API_BASE_URL}/folders`, data, {
    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
  });
  return response.data as Folder;
};

const updateFolder = async ({
  id,
  name,
}: {
  id: number;
  name: string;
}): Promise<Folder> => {
  const response = await axios.put(
    `${API_BASE_URL}/folders/${id}`,
    { name },
    {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    }
  );
  return response.data as Folder;
};

const deleteFolder = async (id: number): Promise<{ message: string }> => {
  const response = await axios.delete(`${API_BASE_URL}/folders/${id}`, {
    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
  });
  return response.data as { message: string };
};

// -----------------------------
// Folder Upload (with files inside)
// -----------------------------
const uploadFolder = async (formData: FormData): Promise<{ files: any[] }> => {
  const response = await axios.post(
    `${API_BASE_URL}/files/upload-folder`,
    formData,
    {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
        "Content-Type": "multipart/form-data",
      },
      timeout: 300000, // allow large uploads
    }
  );

  return response.data as { files: any[] };
};

// hooks/useFolders.ts - Add this function
// hooks/useFolders.ts - Update the fetchRootFolders function

const fetchRootFolders = async (): Promise<Folder[]> => {
  console.log("fetchRootFolders called");

  const response = await axios.get(`${API_BASE_URL}/folders/root`, {
    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
  });
  console.log("fetchRootFolders response:", response);

  return response.data.folders as Folder[];
};

// Add this hook
export const useRootFolders = () =>
  useQuery({
    queryKey: ["rootFolders"],
    queryFn: fetchRootFolders,
    enabled: !!localStorage.getItem("token"),
  });
// -----------------------------
// React Query Hooks
// -----------------------------
export const useFolders = () =>
  useQuery({
    queryKey: ["folders"],
    queryFn: fetchFolders,
    enabled: !!localStorage.getItem("token"),
  });

export const useFolder = (id: number) =>
  useQuery({
    queryKey: ["folder", id],
    queryFn: () => fetchFolder(id),
    enabled: !!id && !!localStorage.getItem("token"),
  });

export const useFolderTree = () =>
  useQuery({
    queryKey: ["folderTree"],
    queryFn: fetchFolderTree,
    enabled: !!localStorage.getItem("token"),
  });

export const useCreateFolder = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createFolder,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["folders"] });
      queryClient.invalidateQueries({ queryKey: ["rootFolders"] }); // ← ADD THIS LINE

      queryClient.invalidateQueries({ queryKey: ["folderTree"] });
    },
  });
};

export const useUpdateFolder = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateFolder,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["folders"] });
      queryClient.invalidateQueries({ queryKey: ["folderTree"] });
    },
  });
};

export const useDeleteFolder = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteFolder,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["folders"] });
      queryClient.invalidateQueries({ queryKey: ["folderTree"] });
    },
  });
};

// ✅ New hook: Upload folder with files
export const useUploadFolder = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: uploadFolder,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["folders"] });
      queryClient.invalidateQueries({ queryKey: ["folderTree"] });
    },
  });
};
