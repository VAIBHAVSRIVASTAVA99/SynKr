import axios from "axios";

const baseURL = import.meta.env.VITE_API_URL || "http://localhost:5001";

export const axiosInstance = axios.create({
  baseURL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

