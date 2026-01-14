import { useContext } from 'react';
import { AuthContext } from '../contexts/auth.context';

/**
 * Hook personalizado para acceder al contexto de autenticación
 * @returns {Object} Objeto con datos y funciones del contexto de autenticación
 */
export const useAuth = () => useContext(AuthContext);

