import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";

import AdminMenu from "./components/AdminMenu";
import Footer from "./components/Footer";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Habitaciones from "./pages/Habitaciones";
import Reservas from "./pages/Reservas";
import Empleados from "./pages/Empleados";
import Huespedes from "./pages/Huespedes";
import Reportes from "./pages/Reportes";

function LayoutWrapper({ children }) {
  const location = useLocation();
  const isLogin = location.pathname === "/login";

  if (isLogin) return children;

  return (
    <div className="d-flex flex-column min-vh-100">
      <div className="d-flex flex-grow-1">
        <AdminMenu />
        <div className="flex-grow-1 d-flex flex-column main-content">
          <main className="flex-grow-1">
            {children}
          </main>
          <Footer />
        </div>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <LayoutWrapper>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/habitaciones" element={<Habitaciones />} />
          <Route path="/huespedes" element={<Huespedes />} />
          <Route path="/reservas" element={<Reservas />} />
          <Route path="/empleados" element={<Empleados />} />
          <Route path="/reportes" element={<Reportes />} />
          <Route path="/" element={<Navigate to="/login" />} />
        </Routes>
      </LayoutWrapper>
    </Router>
  );
}
