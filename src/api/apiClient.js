import axios from "axios";

const apiClient = axios.create({
    baseURL: "/api",
    headers: {
        "Content-Type": "application/json",
    },
});

apiClient.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("token");
        if(token) {
            config.headers["Authorization"] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

//Interceptor de respuesta: Manejar el token expirado
apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
        //Si recibimos un 401, muy probable el token expiró
        if (error.response && error.response.status === 401) {
            //Eliminar datos del usuario y token del almacenamiento local
        }
    }
);
export default apiClient;