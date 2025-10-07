// hooks/useFolders.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { toast } from "react-toastify";
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

// Favourites and Trash functions
// const toggleFolderFavourite = async (
//   id: number
// ): Promise<{ id: number; is_faviourite: boolean }> => {
//   const response = await axios.post(
//     `${API_BASE_URL}/folders/${id}/favourite/toggle`,
//     {},
//     {
//       headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
//     }
//   );
//   return response.data as { id: number; is_faviourite: boolean };
// };

// const fetchFavouriteFolders = async (): Promise<Folder[]> => {
//   const response = await axios.get(`${API_BASE_URL}/folders/favourites`, {
//     headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
//   });
//   return response.data.folders as Folder[];
// };

const fetchTrashFolders = async (): Promise<Folder[]> => {
  const response = await axios.get(`${API_BASE_URL}/folders/trash`, {
    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
  });
  return response.data.folders as Folder[];
};

const fetchTrashFoldersByParent = async (
  parentId: number | null = null
): Promise<Folder[]> => {
  const url = parentId
    ? `${API_BASE_URL}/folders/trash?parent_id=${parentId}`
    : `${API_BASE_URL}/folders/trash`;

  console.log(
    `🔍 Frontend fetchTrashFoldersByParent called - parentId: ${parentId}, url: ${url}`
  );

  const response = await axios.get(url, {
    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
  });

  console.log(
    `📁 Frontend received ${response.data.folders.length} trash folders:`,
    response.data.folders.map((f: any) => ({
      id: f.id,
      name: f.name,
      parent_id: f.parent_id,
    }))
  );

  return response.data.folders as Folder[];
};

// Favourites navigation functions
// const fetchFavouriteFoldersNavigation = async (
//   parentId: number | null = null
// ): Promise<Folder[]> => {
//   const url = parentId
//     ? `${API_BASE_URL}/folders/favourites/navigate?parent_id=${parentId}`
//     : `${API_BASE_URL}/folders/favourites/navigate`;

//   console.log(
//     `🔍 Frontend fetchFavouriteFoldersNavigation called - parentId: ${parentId}, url: ${url}`
//   );

//   const response = await axios.get(url, {
//     headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
//   });

//   console.log(
//     `📁 Frontend received ${response.data.folders.length} favourite folders:`,
//     response.data.folders.map((f) => ({
//       id: f.id,
//       name: f.name,
//       parent_id: f.parent_id,
//     }))
//   );

//   return response.data.folders as Folder[];
// };

// Restore and permanent delete functions
const restoreFolder = async (id: number): Promise<{ message: string }> => {
  const response = await axios.post(
    `${API_BASE_URL}/folders/${id}/restore`,
    {},
    {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    }
  );
  return response.data as { message: string };
};

const permanentDeleteFolder = async (
  id: number
): Promise<{ message: string }> => {
  const response = await axios.delete(
    `${API_BASE_URL}/folders/${id}/permanent`,
    {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    }
  );
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
  const response = await axios.get(`${API_BASE_URL}/folders/root`, {
    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
  });

  return response.data.folders as Folder[];
};

const fetchFoldersByParent = async (parentId: number): Promise<Folder[]> => {
  const response = await axios.get(
    `${API_BASE_URL}/folders?parent_id=${parentId}`,
    {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    }
  );
  return response.data.folders as Folder[];
};

// Add this hook
export const useRootFolders = () =>
  useQuery({
    queryKey: ["rootFolders"],
    queryFn: fetchRootFolders,
    enabled: !!localStorage.getItem("token"),
  });

export const useFoldersByParent = (parentId: number | null) =>
  useQuery({
    queryKey: ["folders", parentId],
    queryFn: () => fetchFoldersByParent(parentId!),
    enabled: !!parentId && !!localStorage.getItem("token"),
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
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["folders"] });
      queryClient.invalidateQueries({ queryKey: ["rootFolders"] });
      queryClient.invalidateQueries({ queryKey: ["folderTree"] });

      // Invalidate folders for the parent folder
      if (variables.parent_id) {
        queryClient.invalidateQueries({
          queryKey: ["folders", variables.parent_id],
        });
        queryClient.invalidateQueries({
          queryKey: ["files", variables.parent_id],
        });
      } else {
        // If it's a root folder, invalidate root files
        queryClient.invalidateQueries({ queryKey: ["rootFiles"] });
      }

      toast.success(`Folder "${variables.name}" created successfully!`);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to create folder");
    },
  });
};

export const useUpdateFolder = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateFolder,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["folders"] });
      queryClient.invalidateQueries({ queryKey: ["folderTree"] });
      toast.success(`Folder renamed to "${data.name}" successfully!`);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to update folder");
    },
  });
};

export const useDeleteFolder = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteFolder,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["folders"] });
      queryClient.invalidateQueries({ queryKey: ["rootFolders"] });
      queryClient.invalidateQueries({ queryKey: ["folderTree"] });
      // Invalidate all folder queries to ensure UI updates
      queryClient.invalidateQueries({ queryKey: ["folders", undefined] });
      toast.success("Folder moved to trash successfully!");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to delete folder");
    },
  });
};

// ✅ New hook: Upload folder with files
export const useUploadFolder = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: uploadFolder,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["folders"] });
      queryClient.invalidateQueries({ queryKey: ["folderTree"] });
      toast.success(
        `Folder uploaded successfully! ${data.files.length} files added.`
      );
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to upload folder");
    },
  });
};

// New hooks for favourites and trash
// export const useToggleFolderFavourite = () => {
//   const queryClient = useQueryClient();
//   return useMutation({
//     mutationFn: toggleFolderFavourite,
//     onSuccess: (data) => {
//       queryClient.invalidateQueries({ queryKey: ["folders"] });
//       queryClient.invalidateQueries({ queryKey: ["rootFolders"] });
//       queryClient.invalidateQueries({ queryKey: ["favouriteFolders"] });
//       queryClient.invalidateQueries({ queryKey: ["trashFolders"] });

//       if (data.is_faviourite) {
//         toast.success("Folder added to favorites!");
//       } else {
//         toast.success("Folder removed from favorites!");
//       }
//     },
//     onError: (error: any) => {
//       toast.error(
//         error.response?.data?.message || "Failed to update folder favorites"
//       );
//     },
//   });
// };

// export const useFavouriteFolders = () =>
//   useQuery({
//     queryKey: ["favouriteFolders"],
//     queryFn: fetchFavouriteFolders,
//     enabled: !!localStorage.getItem("token"),
//   });

export const useTrashFolders = () =>
  useQuery({
    queryKey: ["trashFolders"],
    queryFn: fetchTrashFolders,
    enabled: !!localStorage.getItem("token"),
  });

export const useTrashFoldersByParent = (parentId: number | null) =>
  useQuery({
    queryKey: ["trashFolders", parentId],
    queryFn: () => fetchTrashFoldersByParent(parentId),
    enabled: !!localStorage.getItem("token"),
  });

// New hooks for favourites navigation
// export const useFavouriteFoldersNavigation = (parentId: number | null = null) =>
//   useQuery({
//     queryKey: ["favouriteFoldersNavigation", parentId],
//     queryFn: () => fetchFavouriteFoldersNavigation(parentId),
//     enabled: !!localStorage.getItem("token"),
//   });

// New hooks for restore and permanent delete
export const useRestoreFolder = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: restoreFolder,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["folders"] });
      queryClient.invalidateQueries({ queryKey: ["rootFolders"] });
      queryClient.invalidateQueries({ queryKey: ["favouriteFolders"] });
      queryClient.invalidateQueries({ queryKey: ["trashFolders"] });
      toast.success("Folder restored successfully!");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to restore folder");
    },
  });
};

export const usePermanentDeleteFolder = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: permanentDeleteFolder,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["folders"] });
      queryClient.invalidateQueries({ queryKey: ["rootFolders"] });
      queryClient.invalidateQueries({ queryKey: ["favouriteFolders"] });
      queryClient.invalidateQueries({ queryKey: ["trashFolders"] });
      toast.success("Folder permanently deleted!");
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.message || "Failed to delete folder permanently"
      );
    },
  });
};
