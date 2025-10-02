// hooks/useAuth.ts
import { useMutation, useQuery } from "@tanstack/react-query";
import axios from "axios";
import type { User, LoginResponse, ApiResponse } from "../types";

const API_BASE_URL = "http://localhost:3000/api";

// Auth functions
const login = async (credentials: { username: string; password: string }) => {
  const response = await axios.post(`${API_BASE_URL}/auth/login`, credentials);
  return response.data as LoginResponse;
};

const createUser = async (userData: {
  username: string;
  password: string;
  role: string;
}) => {
  const response = await axios.post(`${API_BASE_URL}/auth/register`, userData, {
    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
  });
  return response.data as User;
};

const fetchUsers = async () => {
  const response = await axios.get(`${API_BASE_URL}/auth/users`, {
    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
  });
  return response.data as User[];
};

// Hooks
export const useLogin = () =>
  useMutation({
    mutationFn: login,
  });

export const useCreateUser = () =>
  useMutation({
    mutationFn: createUser,
  });

export const useUsers = () =>
  useQuery({
    queryKey: ["users"],
    queryFn: fetchUsers,
    enabled: !!localStorage.getItem("token"),
  });
