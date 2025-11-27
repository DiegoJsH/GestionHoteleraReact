import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaHotel, FaUser, FaLock } from "react-icons/fa";

export default function Login() {
  const [usuario, setUsuario] = useState("");
  const [clave, setClave] = useState("");
  const [cargando, setCargando] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setCargando(true);

    try {
      // Llamar al endpoint de login del backend
      const response = await fetch("http://localhost:5000/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          usuario: usuario,
          contraseña: clave,
        }),
      });

      const data = await response.json();

      if (data.success) {
        // Guardar datos del usuario en localStorage
        localStorage.setItem("usuario", JSON.stringify(data.usuario));

        alert(`¡Bienvenido al sistema!`);
        navigate("/dashboard");
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.error("Error en login:", error);
      alert("Error al conectar con el servidor");
    } finally {
      setCargando(false);
    }
  };

  return (
    <div
      className="d-flex align-items-center justify-content-center vh-100"
      style={{
        background: "linear-gradient(180deg, #1c275aff 0%, #1a1f2eff 100%)",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Decoración de fondo */}
      <div
        style={{
          position: "absolute",
          top: "-50%",
          right: "-20%",
          width: "600px",
          height: "600px",
          background:
            "radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)",
          borderRadius: "50%",
        }}
      ></div>
      <div
        style={{
          position: "absolute",
          bottom: "-30%",
          left: "-10%",
          width: "500px",
          height: "500px",
          background:
            "radial-gradient(circle, rgba(255,255,255,0.08) 0%, transparent 70%)",
          borderRadius: "50%",
        }}
      ></div>

      <div
        className="card shadow-lg border-0"
        style={{
          width: "420px",
          borderRadius: "20px",
          overflow: "hidden",
        }}
      >
        {/* Header del login */}
        <div
          className="text-white text-center p-4"
          style={{
            background: "linear-gradient(135deg, #0b3a81ff 0%, #104f97ff 100%)",
          }}
        >
          <FaHotel style={{ fontSize: "3.5rem", marginBottom: "0.5rem" }} />
          <h3 className="fw-bold mb-1">HotelManager</h3>
          <p className="mb-0 small opacity-75">Sistema Administrativo</p>
        </div>

        {/* Formulario */}
        <div className="card-body p-4">
          <form onSubmit={handleLogin}>
            <div className="mb-4">
              <label className="form-label fw-semibold">
                <FaUser className="me-2 text-primary" />
                Usuario
              </label>
              <input
                type="text"
                className="form-control form-control-lg"
                placeholder="Ingresa tu usuario"
                value={usuario}
                onChange={(e) => setUsuario(e.target.value)}
                required
                disabled={cargando}
                style={{
                  borderRadius: "10px",
                  border: "2px solid #e0e0e0",
                }}
              />
            </div>

            <div className="mb-4">
              <label className="form-label fw-semibold">
                <FaLock className="me-2 text-primary" />
                Contraseña
              </label>
              <input
                type="password"
                className="form-control form-control-lg"
                placeholder="Ingresa tu contraseña"
                value={clave}
                onChange={(e) => setClave(e.target.value)}
                required
                disabled={cargando}
                style={{
                  borderRadius: "10px",
                  border: "2px solid #e0e0e0",
                }}
              />
            </div>

            <button
              type="submit"
              className="btn btn-lg w-100 text-white fw-semibold"
              disabled={cargando}
              style={{
                background:
                  "linear-gradient(135deg, #0b3a81ff 0%, #104f97ff 100%)",
                borderRadius: "10px",
                padding: "0.75rem",
                border: "none",
                boxShadow: "0 4px 15px rgba(13, 71, 161, 0.4)",
                opacity: cargando ? 0.7 : 1,
              }}
            >
              {cargando ? "Iniciando sesión..." : "Iniciar Sesión"}
            </button>
          </form>

          <div className="text-center mt-4">
            <small className="text-muted">Sistema de gestión hotelera</small>
          </div>
        </div>
      </div>
    </div>
  );
}
