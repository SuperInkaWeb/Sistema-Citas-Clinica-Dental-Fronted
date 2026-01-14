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
        console.log('Enviando petición POST a /api/citas con:', citaData);
        const response = await apiClient.post("/citas", citaData);
        console.log('Respuesta exitosa:', response.data);
        return response.data;
    } catch (error) {
        console.error('Error en createCita:', error);
        console.error('Error completo:', {
            message: error.message,
            status: error.response?.status,
            statusText: error.response?.statusText,
            data: error.response?.data,
            headers: error.response?.headers
        });
        throw error;
    }
};

//Obtener citas del usuario autenticado
export const getMisCitas = async (orden = 'asc') => {
    try {
        const response = await apiClient.get(`/citas/mis-citas?orden=${orden}`);
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
};

// Funciones para admin
export const getCitasAdmin = async ({ page = 0, size = 10, estado } = {}) => {
    const params = new URLSearchParams();
    params.append('page', page);
    params.append('size', size);
    if (estado && estado !== 'TODOS') params.append('estado', estado);
    try {
        const response = await apiClient.get(`/citas/admin?${params.toString()}`);
        return response.data; // Page<Cita>
    } catch (error) {
        console.error('Error en getCitasAdmin:', error);
        throw error;
    }
};

export const adminCambiarEstado = async (citaId, nuevoEstado) => {
    try {
        const response = await apiClient.patch(`/citas/admin/${citaId}/estado`, nuevoEstado);
        return response.data;
    } catch (error) {
        console.error('Error en adminCambiarEstado:', error);
        throw error;
    }
};

export const buscarCitasAdmin = async (params = {}) => {
  const qs = new URLSearchParams();
  const { page=0, size=10, estado, q, servicioId, desde, hasta } = params;
  qs.append('page', page); qs.append('size', size);
  if (estado && estado !== 'TODOS') qs.append('estado', estado);
  if (q) qs.append('q', q);
  if (servicioId) qs.append('servicioId', servicioId);
  if (desde) qs.append('desde', desde);
  if (hasta) qs.append('hasta', hasta);
  try {
    const res = await apiClient.get(`/citas/admin?${qs.toString()}`);
    return res.data;
  } catch (e) { console.error('Error buscarCitasAdmin', e); throw e; }
};

export const editarCitaAdmin = async (citaId, payload) => {
  try {
    const res = await apiClient.put(`/citas/admin/${citaId}`, payload);
    return res.data; // devuelve DTO
  } catch (e) { console.error('Error editarCitaAdmin', e); throw e; }
};

// Obtener lista de usuarios/pacientes para el admin
export const obtenerPacientes = async () => {
  try {
    const res = await apiClient.get('/usuarios/pacientes');
    return res.data;
  } catch (e) { console.error('Error obtenerPacientes', e); throw e; }
};

// Admin agenda cita para un usuario específico
export const agendarCitaParaUsuario = async (citaData) => {
  try {
    const res = await apiClient.post('/citas/admin/agendar', citaData);
    return res.data;
  } catch (e) { console.error('Error agendarCitaParaUsuario', e); throw e; }
};

