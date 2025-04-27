import axios from "axios";

const baseURL = import.meta.env.VITE_API_URL || "https://synkr-o8iz.onrender.com";

export const axiosInstance = axios.create({
  baseURL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

