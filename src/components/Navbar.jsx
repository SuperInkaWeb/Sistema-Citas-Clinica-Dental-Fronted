import React from "react";
import { useAuth } from "../hooks/useAuth";
import { useNavigate, Link } from "react-router-dom";
import "./Navbar.css";

const Navbar = () => {
    const { logout, user } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        if (window.confirm("¿Estás seguro de que deseas cerrar sesión?")) {
            logout();
            navigate("/login");
        }
    };

    const isAdmin = user?.rol === 'ADMIN';

    return (
        <nav className="navbar">
            <div className="navbar-container">
                <div className="navbar-brand">
                    <Link to={isAdmin ? '/admin' : '/mis-citas'} className="navbar-logo">
                        🏥 Clínica Gallegos
                    </Link>
                </div>

                <div className="navbar-menu">
                    <div className="navbar-items">
                        {isAdmin ? (
                            <>
                                <Link to="/admin" className="navbar-link">
                                    🔧 Panel Admin
                                </Link>
                            </>
                        ) : (
                            <>
                                <Link to="/mis-citas" className="navbar-link">
                                    📋 Mis Citas
                                </Link>
                                <Link to="/agendar" className="navbar-link">
                                    ➕ Agendar Cita
                                </Link>
                            </>
                        )}
                    </div>

                    <div className="navbar-user">
                        <span className="user-info">
                            {isAdmin ? '👨‍💼 Admin' : '👤'} {user?.email}
                        </span>
                        <button className="logout-btn" onClick={handleLogout}>
                            🚪 Cerrar Sesión
                        </button>
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
