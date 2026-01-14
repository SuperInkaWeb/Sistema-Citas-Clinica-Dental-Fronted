import apiClient from "./apiClient.js";

//Obtener todos los servicios disponibles
export const getServicios = async () => {
    try {
        const response = await apiClient.get("/servicios");
        return response.data;
    } catch (error) {
        console.error('Error en getServicios:', error);
        throw error;
    }
};

//Agendar nueva cita
export const createCita = async (citaData) => {
    try {
        const response = await apiClient.post("/citas", citaData);
        return response.data;
    } catch (error) {
        console.error('Error en createCita:', error);
        throw error;
    }
};

//Obtener citas del usuario autenticado
export const getMisCitas = async () => {
    try {
        const response = await apiClient.get("/citas/paciente");
        return response.data;
    } catch (error) {
        console.error('Error en getMisCitas:', error);
        throw error;
    }
};

//Cancelar una cita
export const cancelarCita = async (citaId) => {
    try {
        const response = await apiClient.put(`/citas/${citaId}/cancelar`);
        return response.data;
    } catch (error) {
        console.error('Error en cancelarCita:', error);
        throw error;
    }
}