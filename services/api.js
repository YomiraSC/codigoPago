import axios from "axios";
import { getSession } from "next-auth/react";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

const axiosInstance = axios.create({
  baseURL: API_URL,
  headers: { "Content-Type": "application/json" },
});

axiosInstance.interceptors.request.use(async (config) => {
  const session = await getSession();
  console.log("Sesión en axiosInstance:", session);

  if (session?.user?.token) {
    config.headers.Authorization = `Bearer ${session.user.token}`;
  } else {
    console.log("No hay token disponible en la sesión.");
  }

  return config;
}, (error) => Promise.reject(error));

export default axiosInstance;
