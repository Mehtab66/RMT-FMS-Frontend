// hooks/useFiles.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import type { File, FilesResponse, ApiResponse } from "../types";

const API_BASE_URL = "http://localhost:3000/api";

// File functions
const fetchFiles = async (folderId: number | null = null): Promise<File[]> => {
  const url = folderId
    ? `${API_BASE_URL}/files?folder_id=${folderId}`
    : `${API_BASE_URL}/files`;

  console.log(`🔍 Frontend fetchFiles called - folderId: ${folderId}, url: ${url}`);

  const response = await axios.get(url, {
    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
  });
  
  console.log(`📁 Frontend received ${response.data.files.length} files:`, response.data.files.map(f => ({ id: f.id, name: f.name, folder_id: f.folder_id })));
  
  return response.data.files as File[];
};

const uploadFile = async (data: FormData): Promise<File> => {
  console.log("🚀 Starting file upload...");

  // Debug: Log FormData contents
  console.log("📋 FormData contents:");
  for (let [key, value] of data.entries()) {
    if (value instanceof File) {
      console.log(
        `  ${key}: File - ${value.name} (${value.size} bytes, ${value.type})`
      );
    } else {
      console.log(`  ${key}: ${value}`);
    }
  }

  try {
    const response = await axios.post(`${API_BASE_URL}/files/upload`, data, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
        "Content-Type": "multipart/form-data",
      },
      timeout: 120000, // 2 minute timeout for large files
      onUploadProgress: (progressEvent) => {
        const progress = progressEvent.total
          ? Math.round((progressEvent.loaded * 100) / progressEvent.total)
          : 0;
        console.log(`📤 Upload Progress: ${progress}%`);
      },
    });

    console.log("✅ Upload successful:", response.data);
    return response.data as File;
  } catch (error: any) {
    console.error("❌ Upload failed:", error);
    if (error.response) {
      console.error("Response error:", error.response.data);
      console.error("Response status:", error.response.status);
    }
    throw error;
  }
};

const uploadFolder = async (data: FormData): Promise<{ files: File[] }> => {
  console.log("🚀 Starting folder upload...");

  // Debug: Log FormData contents
  console.log("📋 FormData contents for folder:");
  for (let [key, value] of data.entries()) {
    if (value instanceof File) {
      console.log(
        `  ${key}: File - ${value.name} (${value.size} bytes)`
      );
      console.log(`    - webkitRelativePath: ${(value as any).webkitRelativePath || 'NOT SET'}`);
    } else {
      console.log(`  ${key}: ${value}`);
    }
  }

  try {
    const response = await axios.post(
      `${API_BASE_URL}/files/upload-folder`,
      data,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "multipart/form-data",
        },
        timeout: 300000, // 5 minute timeout for folders
        onUploadProgress: (progressEvent) => {
          const progress = progressEvent.total
            ? Math.round((progressEvent.loaded * 100) / progressEvent.total)
            : 0;
          console.log(`📤 Upload Progress: ${progress}%`);
        },
      }
    );

    console.log("✅ Folder upload successful:", response.data);
    return response.data as { files: File[] };
  } catch (error: any) {
    console.error("❌ Folder upload failed:", error);
    if (error.response) {
      console.error("Response error:", error.response.data);
      console.error("Response status:", error.response.status);
    }
    throw error;
  }
};


const downloadFile = async (id: number): Promise<void> => {
  console.log(`📥 Downloading file ${id}...`);

  try {
    const response = await axios.get(`${API_BASE_URL}/files/download/${id}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      responseType: "blob",
    });

    // Check if response is valid
    if (!response.data) {
      throw new Error("No file data received");
    }

    // Create blob and download
    const blob = new Blob([response.data]);
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;

    // Get filename from content-disposition header or use ID
    const contentDisposition = response.headers["content-disposition"];
    let filename = `file-${id}`;
    if (contentDisposition) {
      const filenameMatch = contentDisposition.match(/filename="?(.+)"?/);
      if (filenameMatch) filename = filenameMatch[1];
    }

    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    
    // Clean up after a short delay
    setTimeout(() => {
      link.remove();
      window.URL.revokeObjectURL(url);
    }, 100);

    console.log("✅ Download completed:", filename);
  } catch (error: any) {
    console.error("❌ Download failed:", error);
    
    // Handle specific error cases
    if (error.response?.status === 404) {
      throw new Error("File not found");
    } else if (error.response?.status === 403) {
      throw new Error("Permission denied");
    } else if (error.response?.status === 500) {
      throw new Error("Server error occurred");
    } else {
      throw new Error(error.message || "Download failed");
    }
  }
};

const downloadFolder = async (id: number): Promise<void> => {
  console.log(`📥 Downloading folder ${id}...`);

  try {
    const response = await axios.get(`${API_BASE_URL}/folders/${id}/download`, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      responseType: "blob",
    });

    // Check if response is valid
    if (!response.data) {
      throw new Error("No folder data received");
    }

    // Create blob and download
    const blob = new Blob([response.data]);
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;

    // Get filename from content-disposition header or use ID
    const contentDisposition = response.headers["content-disposition"];
    let filename = `folder-${id}.zip`;
    if (contentDisposition) {
      const filenameMatch = contentDisposition.match(/filename="?(.+)"?/);
      if (filenameMatch) filename = filenameMatch[1];
    }

    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    
    // Clean up after a short delay
    setTimeout(() => {
      link.remove();
      window.URL.revokeObjectURL(url);
    }, 100);

    console.log("✅ Folder download completed:", filename);
  } catch (error: any) {
    console.error("❌ Folder download failed:", error);
    
    // Handle specific error cases
    if (error.response?.status === 404) {
      throw new Error("Folder not found or you don't have permission to access it");
    } else if (error.response?.status === 403) {
      throw new Error("Permission denied - you don't have download permission for this folder");
    } else if (error.response?.status === 500) {
      throw new Error("Server error occurred");
    } else {
      throw new Error(error.message || "Folder download failed");
    }
  }
};
// hooks/useFiles.ts - Add this function
const fetchRootFiles = async (): Promise<File[]> => {
  const response = await axios.get(`${API_BASE_URL}/files/root`, {
    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
  });
  return response.data.files as File[];
};

// Add this hook
export const useRootFiles = () =>
  useQuery({
    queryKey: ["rootFiles"],
    queryFn: fetchRootFiles,
    enabled: !!localStorage.getItem("token"),
  });
const updateFile = async ({
  id,
  name,
}: {
  id: number;
  name: string;
}): Promise<File> => {
  const response = await axios.put(
    `${API_BASE_URL}/files/${id}`,
    { name },
    {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    }
  );
  return response.data as File;
};

const deleteFile = async (id: number): Promise<{ message: string }> => {
  const response = await axios.delete(`${API_BASE_URL}/files/${id}`, {
    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
  });
  return response.data as { message: string };
};

// Hooks
export const useFiles = (folderId: number | null = null) =>
  useQuery({
    queryKey: ["files", folderId],
    queryFn: () => fetchFiles(folderId),
    enabled: !!localStorage.getItem("token"),
  });

export const useUploadFile = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: uploadFile,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["files"] });
      queryClient.invalidateQueries({ queryKey: ["rootFiles"] });
      // Invalidate all file queries to ensure UI updates
      queryClient.invalidateQueries({ queryKey: ["files", undefined] });
    },
    onError: (error: any) => {
      console.error("Upload mutation error:", error);
    },
  });
};

export const useUploadFolder = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: uploadFolder,
    onSuccess: (data) => {
      console.log("🎉 FOLDER UPLOAD SUCCESS:", data);
      console.log("🔄 Invalidating queries...");
      
      // Invalidate all file queries
      queryClient.invalidateQueries({ queryKey: ["files"] });
      queryClient.invalidateQueries({ queryKey: ["rootFiles"] });
      queryClient.invalidateQueries({ queryKey: ["folders"] });
      queryClient.invalidateQueries({ queryKey: ["rootFolders"] });
      
      // Invalidate specific folder queries
      queryClient.invalidateQueries({ queryKey: ["files", null] });
      queryClient.invalidateQueries({ queryKey: ["files", undefined] });
      queryClient.invalidateQueries({ queryKey: ["folders", null] });
      queryClient.invalidateQueries({ queryKey: ["folders", undefined] });
      
      // Force refetch of all data
      queryClient.refetchQueries({ queryKey: ["files"] });
      queryClient.refetchQueries({ queryKey: ["folders"] });
      
      console.log("✅ All queries invalidated and refetched");
    },
    onError: (error: any) => {
      console.error("❌ FOLDER UPLOAD ERROR:", error);
      console.error("❌ Error details:", error.message);
      console.error("❌ Error response:", error.response?.data);
      console.error("❌ Error status:", error.response?.status);
      alert(`Upload failed: ${error.message || 'Unknown error'}`);
    },
  });
};



export const useDownloadFile = () =>
  useMutation({
    mutationFn: downloadFile,
    onError: (error: any) => {
      console.error("Download mutation error:", error);
      // Show user-friendly error message
      alert("Download failed. Please try again.");
    },
  });

export const useDownloadFolder = () =>
  useMutation({
    mutationFn: downloadFolder,
    onError: (error: any) => {
      console.error("Folder download mutation error:", error);
      // Show user-friendly error message
      alert("Folder download failed. Please try again.");
    },
  });

export const useUpdateFile = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateFile,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["files"] });
      queryClient.invalidateQueries({ queryKey: ["rootFiles"] });
      // Invalidate all file queries to ensure UI updates
      queryClient.invalidateQueries({ queryKey: ["files", undefined] });
    },
  });
};

export const useDeleteFile = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteFile,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["files"] });
      queryClient.invalidateQueries({ queryKey: ["rootFiles"] });
      // Invalidate all file queries to ensure UI updates
      queryClient.invalidateQueries({ queryKey: ["files", undefined] });
    },
  });
};
