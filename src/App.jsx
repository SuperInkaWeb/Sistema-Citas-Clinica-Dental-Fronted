import {Routes, Route} from 'react-router-dom';
import './App.css'

import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import AgendarCitaPage from './pages/AgendarCitaPage';
import MisCitasPage from './pages/MisCitasPage';
import ProtectedRoute from "./components/ProtectedRoute.jsx";

const NotFound = () => (
    <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
    }}>
        <div style={{
            background: 'white',
            borderRadius: '12px',
            padding: '3rem',
            textAlign: 'center',
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
            maxWidth: '500px'
        }}>
            <h1 style={{fontSize: '3rem', margin: '0 0 1rem 0', color: '#ef4444'}}>404</h1>
            <h2 style={{fontSize: '1.5rem', margin: '0 0 1rem 0', color: '#111827'}}>Página no encontrada</h2>
            <p style={{color: '#6b7280', marginBottom: '2rem'}}>La página que buscas no existe o ha sido movida.</p>
            <a href="/" style={{
                display: 'inline-block',
                background: '#2563eb',
                color: 'white',
                padding: '0.75rem 1.5rem',
                borderRadius: '8px',
                textDecoration: 'none',
                fontWeight: '600',
                transition: 'background 0.2s ease'
            }} onMouseOver={(e) => e.target.style.background = '#1e40af'} onMouseOut={(e) => e.target.style.background = '#2563eb'}>
                Volver al inicio
            </a>
        </div>
    </div>
);

function App() {
    return (
    <Routes>
        {/* Rutas públicas */}
        <Route path="/" element={<LoginPage />}/>
        <Route path="/login" element={<LoginPage />}/>
        <Route path="/register" element={<RegisterPage />}/>

        {/*Rutas protegidas */}
        <Route
            path="/agendar"
            element={
            <ProtectedRoute allowedRoles="ADMIN, PACIENTE"> {/*Ambos roles pueden agendar*/}
                <AgendarCitaPage />
            </ProtectedRoute>
            }
        />
        <Route
            path="/mis-citas"
            element={
            <ProtectedRoute allowedRoles="ADMIN, PACIENTE">
                <MisCitasPage />
            </ProtectedRoute>
            }
        />

        {/*Rutas 404*/}
        <Route path="*" element={<NotFound />} />
    </Routes>
    );
}
export default App;
