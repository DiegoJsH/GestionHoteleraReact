import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  FaTachometerAlt,
  FaBed,
  FaCalendarAlt,
  FaUsers,
  FaChartBar,
  FaBars,
  FaSignOutAlt,
  FaUser,
} from "react-icons/fa";

export default function AdminMenu() {
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();

  const menuItems = [
    { path: "/dashboard", icon: <FaTachometerAlt />, text: "Dashboard" },
    { path: "/habitaciones", icon: <FaBed />, text: "Habitaciones" },
    { path: "/huespedes", icon: <FaUser />, text: "Huespedes" },
    { path: "/reservas", icon: <FaCalendarAlt />, text: "Reservas" },
    { path: "/empleados", icon: <FaUsers />, text: "Empleados" },
    { path: "/reportes", icon: <FaChartBar />, text: "Reportes" },
  ];

  return (
    <>
      {/* Botón hamburguesa */}
      <button
        className="menu-toggle"
        onClick={() => setMenuOpen(!menuOpen)}
        aria-label="Toggle menu"
      >
        {!menuOpen && <FaBars size={24} />}
      </button>

      {/* Overlay para móviles */}
      {menuOpen && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100 bg-dark opacity-50 d-lg-none"
          style={{ zIndex: 1030 }}
          onClick={() => setMenuOpen(false)}
        />
      )}

      {/* Menú lateral */}
      <nav className={`admin-menu ${menuOpen ? "show" : ""}`}>
        <div className="p-4">
          <h3 className="text-white text-center mb-4">Panel Admin</h3>

          <div className="nav flex-column">
            {menuItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`menu-link ${
                  location.pathname === item.path ? "active" : ""
                }`}
                onClick={() => setMenuOpen(false)}
              >
                <span className="menu-icon">{item.icon}</span>
                {item.text}
              </Link>
            ))}
          </div>

          <Link
            to="/login"
            className="menu-link mt-4 border-top"
            onClick={() => setMenuOpen(false)}
          >
            <span className="menu-icon">
              <FaSignOutAlt />
            </span>
            Cerrar Sesión
          </Link>
        </div>
      </nav>
    </>
  );
}
