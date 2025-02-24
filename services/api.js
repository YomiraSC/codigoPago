import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

const axiosInstance = axios.create({
  baseURL: API_URL + "/api", // 🔹 Apunta a las rutas de API internas de Next.js
  headers: { "Content-Type": "application/json" },
});

// 🔹 Interceptor para adjuntar el token a cada request
axiosInstance.interceptors.request.use(
  (config) => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("token");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("❌ Error en la API:", error.response?.data || error.message);

    if (error.response?.status === 401) {
      // 🔹 Si el token expira, cerrar sesión automáticamente
      if (typeof window !== "undefined") {
        localStorage.removeItem("token");
        window.location.href = "/login"; // 🔄 Redirige al login
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
